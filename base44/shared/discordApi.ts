// Accès à l'API Discord pour la page Live · Bot.
// Le bot (DISCORD_BOT_TOKEN) lit les salons/rôles et publie les panneaux ;
// le jeton OAuth2 de l'utilisateur (identify + guilds) sert à filtrer ses serveurs admin.

export const DISCORD_API = 'https://discord.com/api/v10';
export const DISCORD_INVITE_PERMISSIONS = '1099780287510';
export const OAUTH_SCOPES = 'identify guilds';

export const isGuildAdmin = (guild: any) => {
  if (!guild) return false;
  if (guild.owner === true) return true;
  const permissions = Number(guild.permissions) || 0;
  return (permissions & 0x8) === 0x8 || (permissions & 0x20) === 0x20;
};

export const guildIconUrl = (guildId: string, icon: string) => (
  icon
    ? `https://cdn.discordapp.com/icons/${guildId}/${icon}.${String(icon).startsWith('a_') ? 'gif' : 'png'}?size=128`
    : ''
);

export const inviteUrl = (clientId: string, guildId?: string) => {
  const base = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${DISCORD_INVITE_PERMISSIONS}&scope=bot%20applications.commands`;
  return guildId ? `${base}&guild_id=${guildId}&disable_guild_select=true` : base;
};

export const sanitizeRedirect = (value: any) => {
  try {
    const url = new URL(String(value || ''));
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    if (!/^\/(live-bot|discord)\/?$/.test(url.pathname)) return '';
    return `${url.origin}${url.pathname}`;
  } catch {
    return '';
  }
};

const botHeaders = (token: string) => ({ Authorization: `Bot ${token}` });

export async function botGuildIds(token: string): Promise<Set<string>> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds?limit=200`, {
    headers: botHeaders(token),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error('bot_refused');
  return new Set((Array.isArray(data) ? data : []).map((guild: any) => String(guild.id)));
}

export async function userGuilds(accessToken: string) {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => []);
  if (res.status === 401) throw new Error('user_token_expired');
  if (!res.ok) throw new Error('discord_refused');
  return Array.isArray(data) ? data : [];
}

async function memberCount(guildId: string, token: string) {
  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}?with_counts=true`, {
      headers: botHeaders(token),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return 0;
    const detail = await res.json();
    return Number(detail?.approximate_member_count) || Number(detail?.member_count) || 0;
  } catch {
    return 0;
  }
}

// Ne garde que les serveurs dont l'utilisateur est propriétaire ou admin, croisés
// avec la présence réelle du bot. Les serveurs sans bot restent visibles (invitation).
export async function buildAdminGuilds(list: any[], botToken: string, botPresent: Set<string>) {
  const admins = (Array.isArray(list) ? list : []).filter(isGuildAdmin).slice(0, 200);
  const withCount = admins.slice(0, 8);
  const counts = new Map<string, number>();
  if (botToken) {
    await Promise.all(withCount.map(async (guild: any) => {
      const id = String(guild.id);
      counts.set(id, botPresent.has(id) ? await memberCount(id, botToken) : 0);
    }));
  }
  return admins.map((guild: any) => ({
    id: String(guild.id),
    name: guild.name || 'Serveur Discord',
    icon: guildIconUrl(guild.id, guild.icon),
    member_count: counts.get(String(guild.id)) || 0,
    bot_present: botPresent.has(String(guild.id)),
    admin: true,
  })).sort((a: any, b: any) => Number(b.bot_present) - Number(a.bot_present) || a.name.localeCompare(b.name));
}

export async function fetchGuildResources(guildId: string, botToken: string) {
  const [channelsRes, rolesRes] = await Promise.all([
    fetch(`${DISCORD_API}/guilds/${guildId}/channels`, { headers: botHeaders(botToken), signal: AbortSignal.timeout(15000) }),
    fetch(`${DISCORD_API}/guilds/${guildId}/roles`, { headers: botHeaders(botToken), signal: AbortSignal.timeout(15000) }),
  ]);
  if (channelsRes.status === 403 || rolesRes.status === 403) throw new Error('missing_access');
  if (channelsRes.status === 404 || rolesRes.status === 404) throw new Error('bot_not_in_guild');
  if (!channelsRes.ok || !rolesRes.ok) throw new Error('discord_refused');

  const channelsRaw = await channelsRes.json().catch(() => []);
  const rolesRaw = await rolesRes.json().catch(() => []);

  const categories = (Array.isArray(channelsRaw) ? channelsRaw : [])
    .filter((channel: any) => channel.type === 4)
    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    .map((channel: any) => ({ id: String(channel.id), name: channel.name || 'Catégorie' }));

  const channels = (Array.isArray(channelsRaw) ? channelsRaw : [])
    .filter((channel: any) => channel.type === 0 || channel.type === 5)
    .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    .map((channel: any) => ({
      id: String(channel.id),
      name: channel.name || 'salon',
      type: channel.type,
      parent_id: channel.parent_id ? String(channel.parent_id) : '',
    }));

  const roles = (Array.isArray(rolesRaw) ? rolesRaw : [])
    .filter((role: any) => role.id !== guildId && role.managed !== true)
    .sort((a: any, b: any) => (b.position || 0) - (a.position || 0))
    .map((role: any) => ({
      id: String(role.id),
      name: role.name || 'Rôle',
      color: role.color ? `#${Number(role.color).toString(16).padStart(6, '0')}` : '#99aab5',
    }));

  return { categories, channels, roles };
}

const clip = (value: any, max: number) => (typeof value === 'string' ? value.slice(0, max) : '');
const emojiPart = (value: any) => {
  const name = clip(String(value || '').trim(), 32);
  return name ? { emoji: { name } } : {};
};

export const PANEL_DEFAULTS: Record<string, any> = {
  tickets: { title: 'Support Matrix', description: 'Ouvre un ticket, un membre de l’équipe te répondra.', color: '#5865f2', buttonLabel: 'Ouvrir un ticket', buttonEmoji: '🎫' },
  rules: { title: 'Règlement du serveur', description: 'Merci de lire et respecter ces règles.', color: '#22c55e', buttonLabel: 'J’accepte le règlement', buttonEmoji: '✅' },
  roles: { title: 'Choisis tes rôles', description: 'Sélectionne le rôle qui te correspond.', color: '#a855f7', placeholder: 'Choisis ton rôle', options: [] },
};

export function panelPayload(panelKey: string, panel: any) {
  const base = PANEL_DEFAULTS[panelKey] || PANEL_DEFAULTS.tickets;
  const hex = String(panel?.color || base.color);
  const color = /^#[0-9a-fA-F]{6}$/.test(hex) ? parseInt(hex.slice(1), 16) : 0x5865f2;
  const embed = {
    title: clip(panel?.title, 120) || base.title,
    description: clip(panel?.description, 1800) || base.description,
    color,
  };
  const components = [];

  if (panelKey === 'roles') {
    const options = (Array.isArray(panel?.options) ? panel.options : [])
      .filter((option: any) => /^\d{5,25}$/.test(String(option?.roleId || '')))
      .slice(0, 25)
      .map((option: any) => ({
        label: clip(option?.label, 80) || 'Rôle',
        value: String(option.roleId),
        ...emojiPart(option?.emoji),
      }));
    if (options.length) {
      components.push({
        type: 1,
        components: [{
          type: 3,
          custom_id: 'panel:roles',
          placeholder: clip(panel?.placeholder, 100) || base.placeholder,
          min_values: 1,
          max_values: 1,
          options,
        }],
      });
    }
  } else {
    components.push({
      type: 1,
      components: [{
        type: 2,
        style: 1,
        label: clip(panel?.buttonLabel, 80) || base.buttonLabel,
        // Le bot Discord reconnaît l'ouverture de ticket sur ce custom_id exact.
        custom_id: panelKey === 'tickets' ? 'tk:open' : `panel:${panelKey}`,
        ...emojiPart(panel?.buttonEmoji),
      }],
    });
  }

  return { embeds: [embed], components };
}

const publishError = (status: number) => {
  if (status === 403) return 'missing_permissions';
  if (status === 404) return 'missing_access';
  if (status === 401) return 'bot_refused';
  return 'discord_error';
};

// POST crée le message la première fois, PATCH l'édite ensuite (aucun doublon).
export async function sendPanelMessage({ token, channelId, messageId, payload }: any) {
  const url = `${DISCORD_API}/channels/${channelId}/messages`;
  const call = async (method: string, target: string, body?: any) => {
    const res = await fetch(target, {
      method,
      headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  };

  if (messageId) {
    const edit = await call('PATCH', `${url}/${messageId}`, payload);
    if (edit.ok) return { message: edit.data };
    if (![404, 405].includes(edit.status)) return { error: publishError(edit.status), detail: edit.data?.message };
  }

  const created = await call('POST', url, payload);
  if (created.ok) return { message: created.data };
  return { error: publishError(created.status), detail: created.data?.message };
}