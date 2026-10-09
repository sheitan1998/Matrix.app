/**
 * Nexus event engine — executes the dynamic automation rules configured in the admin panel
 * (NexusAutomationRule) according to each server's own configuration (Server.automation_configs).
 * dispatchEvent never throws: automation failures must not break the triggering action.
 */
import { rows, loadRegistry, findCustomRole, resolveExtensions, extensionOn } from './nexusAccess.ts';

const BOT = { author_email: 'system@matrix.app', author_name: 'MATRIX Bot', author_avatar: '' };
const DEDUPE_WINDOW_MS = 5 * 60 * 1000;

// An event type can only run while its feature extension is enabled for the server.
const TRIGGER_EXTENSION: Record<string, string> = {
  member_join: 'welcome_automation',
  boost_received: 'server_boosts',
};

const DEFAULT_MESSAGES: Record<string, string> = {
  member_join: 'Bienvenue {user} ! 🎉',
  member_leave: '{user} a quitté le serveur.',
  boost_received: 'Merci {user} pour le boost ! 🚀',
  role_assigned: '{user} a reçu le rôle {role}.',
};

/** Server-level config for a rule (falls back to legacy welcome_* fields). */
export function getServerRuleConfig(server: any, ruleKey: string) {
  const cfg = (server.automation_configs || []).find((c: any) => c.rule_key === ruleKey);
  if (cfg) return cfg;
  if (ruleKey === 'welcome_message' && server.welcome_enabled) {
    return { rule_key: ruleKey, enabled: true, channel_id: server.welcome_channel_id, message: server.welcome_message };
  }
  return null;
}

function fill(text: string, vars: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
}

function mergeButtons(...lists: any[][]) {
  const seen = new Set();
  const out: any[] = [];
  for (const list of lists) {
    for (const b of list || []) {
      if (!b?.label || seen.has(b.id || b.label)) continue;
      seen.add(b.id || b.label);
      out.push({ id: b.id || b.label, label: b.label, emoji: b.emoji || '' });
    }
  }
  return out;
}

async function alreadyProcessed(sdk: any, eventKey: string) {
  const cutoff = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
  const res = await sdk.asServiceRole.entities.ServerMessage.filter({ event_key: eventKey, created_date: { $gte: cutoff } }, '-created_date', 1);
  return rows(res).length > 0;
}

async function execSendMessage(sdk: any, ctx: any, rule: any, cfg: any, extraButtons: any[]) {
  const channelId = cfg.channel_id || rule.config?.channel_id;
  if (!channelId) return { status: 'skipped', reason: 'no_channel' };
  const template = (cfg.message || rule.config?.message || DEFAULT_MESSAGES[ctx.trigger] || '').trim();
  if (!template) return { status: 'skipped', reason: 'no_message' };

  const eventKey = `${rule.key}:${ctx.eventId}`;
  if (await alreadyProcessed(sdk, eventKey)) return { status: 'skipped', reason: 'duplicate' };

  let buttons: any[] = [];
  if (extensionOn(ctx.extensions, 'interactive_buttons')) {
    const base = ctx.trigger === 'member_join' && ctx.server.interactive_buttons?.length
      ? ctx.server.interactive_buttons
      : rule.config?.buttons || [];
    buttons = mergeButtons(base, extraButtons);
  }

  await sdk.asServiceRole.entities.ServerMessage.create({
    ...BOT,
    server_id: ctx.server.id,
    channel_id: channelId,
    content: fill(template, ctx.vars),
    type: 'system',
    interactive_buttons: buttons,
    event_key: eventKey,
  });
  return { status: 'done', channel_id: channelId };
}

async function execAssignRole(sdk: any, ctx: any, rule: any, cfg: any) {
  if (!ctx.member?.id) return { status: 'skipped', reason: 'no_member' };
  const target = cfg.role || rule.config?.role;
  if (!target) return { status: 'skipped', reason: 'no_role' };
  if (['member', 'moderator', 'admin'].includes(target)) {
    if (ctx.member.role === target) return { status: 'skipped', reason: 'unchanged' };
    await sdk.asServiceRole.entities.ServerMember.update(ctx.member.id, { role: target });
    return { status: 'done', role: target };
  }
  const custom = findCustomRole(ctx.server, target);
  if (!custom) return { status: 'skipped', reason: 'role_not_found' };
  await sdk.asServiceRole.entities.ServerMember.update(ctx.member.id, { custom_role: custom.name });
  return { status: 'done', role: custom.name };
}

async function execTogglePermission(sdk: any, ctx: any, rule: any, cfg: any) {
  const channelId = cfg.channel_id || rule.config?.channel_id;
  const permission = rule.config?.permission;
  if (!channelId || !permission) return { status: 'skipped', reason: 'incomplete_config' };
  const value = rule.config?.value !== false;
  const channels = (ctx.server.channels || []).map((c: any) =>
    c.id === channelId ? { ...c, settings: { ...(c.settings || {}), [permission]: value } } : c
  );
  await sdk.asServiceRole.entities.Server.update(ctx.server.id, { channels });
  ctx.server = { ...ctx.server, channels };
  return { status: 'done', permission, value };
}

async function execCreateChannel(sdk: any, ctx: any, rule: any) {
  const name = fill(String(rule.config?.name || ''), ctx.vars).trim().toLowerCase().replace(/\s+/g, '-');
  if (!name) return { status: 'skipped', reason: 'no_name' };
  const channels = ctx.server.channels || [];
  if (channels.some((c: any) => c.name === name)) return { status: 'skipped', reason: 'exists' };
  const type = ['text', 'voice', 'announce', 'forum'].includes(rule.config?.type) ? rule.config.type : 'text';
  const channel = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, type, settings: {} };
  const updated = [...channels, channel];
  await sdk.asServiceRole.entities.Server.update(ctx.server.id, { channels: updated });
  ctx.server = { ...ctx.server, channels: updated };
  return { status: 'done', channel: name };
}

/**
 * Run every rule matching `trigger` that is globally active AND enabled on this server.
 * @param opts.server   Server record
 * @param opts.trigger  member_join | member_leave | message_sent | role_assigned | boost_received | channel_created
 * @param opts.actorName Display name used for {user}
 * @param opts.member   ServerMember record concerned (optional)
 * @param opts.eventId  Unique id of the occurrence, used for idempotency
 * @param opts.vars     Extra template variables
 */
export async function dispatchEvent(sdk: any, opts: any) {
  try {
    const registry = opts.registry || await loadRegistry(sdk);
    const extensions = resolveExtensions(opts.server, registry);
    const requiredExt = TRIGGER_EXTENSION[opts.trigger];
    if (requiredExt && !extensionOn(extensions, requiredExt)) return [];

    const enabled = registry.rules
      .filter((r: any) => r.trigger_type === opts.trigger)
      .map((rule: any) => ({ rule, cfg: getServerRuleConfig(opts.server, rule.key) }))
      .filter((x: any) => x.cfg?.enabled);
    if (enabled.length === 0) return [];

    const ctx = {
      server: opts.server,
      trigger: opts.trigger,
      member: opts.member || null,
      eventId: opts.eventId,
      extensions,
      vars: { user: opts.actorName || 'Membre', server: opts.server.name || '', ...(opts.vars || {}) },
    };

    // send_message rules without any text only contribute buttons to the other messages of the event.
    // If no text rule is enabled for this event, they post on their own with the default message.
    const isSend = (x: any) => x.rule.action_type === 'send_message';
    const noText = (x: any) => isSend(x) && !x.cfg.message && !x.rule.config?.message;
    const hasTextRule = enabled.some((x: any) => isSend(x) && !noText(x));
    const isButtonOnly = (x: any) => hasTextRule && noText(x);
    const extraButtons = mergeButtons(...enabled.filter(noText).map((x: any) => x.rule.config?.buttons || []));

    const results: any[] = [];
    for (const x of enabled) {
      if (isButtonOnly(x)) continue;
      try {
        let res;
        if (x.rule.action_type === 'send_message') res = await execSendMessage(sdk, ctx, x.rule, x.cfg, extraButtons);
        else if (x.rule.action_type === 'assign_role') res = await execAssignRole(sdk, ctx, x.rule, x.cfg);
        else if (x.rule.action_type === 'toggle_permission') res = await execTogglePermission(sdk, ctx, x.rule, x.cfg);
        else if (x.rule.action_type === 'create_channel') res = await execCreateChannel(sdk, ctx, x.rule);
        else res = { status: 'skipped', reason: 'unsupported_action' };
        results.push({ rule: x.rule.key, ...res });
      } catch (err) {
        results.push({ rule: x.rule.key, status: 'error', error: (err as Error).message });
      }
    }
    console.log('[nexusEngine]', opts.trigger, opts.server.id, JSON.stringify(results));
    return results;
  } catch (err) {
    console.error('[nexusEngine] dispatch failed:', opts.trigger, (err as Error).message);
    return [];
  }
}