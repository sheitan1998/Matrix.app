/**
 * Nexus access resolver — single source of truth for permissions and extensions.
 * Reads the dynamic registry (NexusPermission, NexusAutomationRule, NexusGlobalExtension)
 * and resolves what a given user may do on a given server / channel.
 */

// Built-in fallback defaults, used when a permission is missing or deactivated in the registry.
const CORE_DEFAULTS: Record<string, boolean> = {
  view_channels: true, manage_channels: false, manage_roles: false, manage_emojis: false,
  view_logs: false, create_invite: true, change_nicknames: false, administrator: false,
  kick_members: false, accept_members: false, ban_members: false, timeout_members: false,
  send_messages: true, attach_files: true, embed_links: true, add_reactions: true,
  use_emojis: true, use_stickers: true, use_gifs: true, mention_everyone: true,
  manage_messages: false, ignore_slowmode: false, read_history: true, send_voice: true,
  create_polls: true, voice_connect: true, voice_speak: true, voice_video: false,
  voice_mute_members: false, voice_deafen_members: false, voice_move_members: false,
};

// Permissions granted on top of defaults to the "moderator" system role.
const MOD_PERMISSIONS = [
  'manage_channels', 'manage_messages', 'kick_members', 'timeout_members', 'ignore_slowmode',
  'view_logs', 'voice_mute_members', 'voice_deafen_members', 'voice_move_members', 'accept_members',
];

// Permissions removed by a text mute.
const TEXT_WRITE = ['send_messages', 'attach_files', 'add_reactions', 'send_voice', 'create_polls', 'embed_links', 'use_gifs', 'use_stickers'];

const LEVEL: Record<string, number> = { everyone: 0, mods: 1, admin: 2 };

export function rows(res: any): any[] {
  return Array.isArray(res) ? res : res?.items || [];
}

export function isActiveUntil(flag: any, until: any): boolean {
  if (!flag) return false;
  if (!until) return true;
  return new Date(until).getTime() > Date.now();
}

export function allowed(perms: Record<string, boolean>, key: string): boolean {
  return perms?.[key] === true;
}

export async function loadRegistry(sdk: any) {
  const [perms, rules, exts] = await Promise.all([
    sdk.asServiceRole.entities.NexusPermission.filter({}, 'sort_order', 500),
    sdk.asServiceRole.entities.NexusAutomationRule.filter({}, 'sort_order', 200),
    sdk.asServiceRole.entities.NexusGlobalExtension.filter({}, 'sort_order', 200),
  ]);
  return {
    permissions: rows(perms).filter((p) => p.is_active !== false),
    rules: rows(rules).filter((r) => r.is_active !== false),
    extensions: rows(exts),
  };
}

export async function getMember(sdk: any, serverId: string, email: string) {
  const res = await sdk.asServiceRole.entities.ServerMember.filter({ server_id: serverId, user_email: email }, '-created_date', 1);
  return rows(res)[0] || null;
}

export function findCustomRole(server: any, ref: any) {
  if (!ref) return null;
  return (server?.custom_roles || []).find((r: any) => r.id === ref || r.name === ref) || null;
}

/** Resolve server-wide permissions for a user: defaults → custom role → system role → mutes. */
export function resolveServerPermissions({ server, member, user, registry }: any) {
  const isOwner = server.owner_email === user.email;
  const isPlatformAdmin = user.role === 'admin';
  const isBanned = !isOwner && isActiveUntil(member?.is_banned, member?.ban_until);
  const isMember = isOwner || (!!member && !isBanned);

  const perms: Record<string, boolean> = { ...CORE_DEFAULTS };
  for (const p of registry.permissions) perms[p.key] = !!p.default_value;
  const keys = Object.keys(perms);

  const role = isOwner ? 'owner' : (member?.role || 'member');
  const customRole = findCustomRole(server, member?.custom_role);
  if (customRole) {
    for (const k of keys) {
      if (typeof customRole.permissions?.[k] === 'boolean') perms[k] = customRole.permissions[k];
    }
  }
  if (role === 'moderator') for (const k of MOD_PERMISSIONS) perms[k] = true;

  const isAdmin = isOwner || isPlatformAdmin || (isMember && (role === 'admin' || perms.administrator === true));
  if (isAdmin) for (const k of keys) perms[k] = true;

  if (!isMember && !isPlatformAdmin) {
    for (const k of keys) perms[k] = false;
    if (server.is_public && !isBanned) { perms.view_channels = true; perms.read_history = true; }
  }

  const mutedText = !isAdmin && isActiveUntil(member?.is_muted_text, member?.mute_text_until);
  const mutedVoice = !isAdmin && isActiveUntil(member?.is_muted_voice, member?.mute_voice_until);
  if (mutedText) for (const k of TEXT_WRITE) perms[k] = false;
  if (mutedVoice) perms.voice_speak = false;

  return {
    perms,
    isOwner,
    isAdmin,
    isModerator: isAdmin || role === 'moderator',
    isMember: isMember || isPlatformAdmin,
    isBanned,
    mutedText,
    mutedVoice,
    role,
    customRole: customRole?.name || null,
  };
}

/** Apply a channel's overrides (settings toggles + read/write levels) on top of server permissions. */
export function resolveChannelPermissions(channel: any, access: any) {
  const out: Record<string, boolean> = { ...access.perms };
  const settings = channel?.settings || {};
  if (!access.isAdmin) {
    for (const [k, v] of Object.entries(settings)) if (v === false) out[k] = false;
  }
  const level = access.isAdmin ? 2 : access.isModerator ? 1 : 0;
  const readLevel = LEVEL[channel?.permissions?.read] || 0;
  const writeLevel = LEVEL[channel?.permissions?.write] || 0;
  out.view = out.view_channels === true && (access.isAdmin || settings.visible !== false) && level >= readLevel;
  if (!out.view || level < writeLevel) for (const k of TEXT_WRITE) out[k] = false;
  return out;
}

/** Extensions are on by default when globally active; a server can opt out via disabled_extensions. */
export function resolveExtensions(server: any, registry: any) {
  const disabled = new Set(server?.disabled_extensions || []);
  const out: Record<string, boolean> = {};
  for (const e of registry.extensions) out[e.key] = e.is_active !== false && !disabled.has(e.key);
  return out;
}

export function extensionOn(exts: Record<string, boolean>, key: string): boolean {
  return exts?.[key] !== false;
}

export function findChannel(server: any, channelId: string) {
  return (server?.channels || []).find((c: any) => c.id === channelId) || { id: channelId, settings: {} };
}