import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { listOf } from '../../shared/botAuth.ts';
import { sanitizeSettings } from '../../shared/botSettings.ts';
import {
  botGuildIds,
  buildAdminGuilds,
  fetchGuildResources,
  inviteUrl,
  panelPayload,
  sendPanelMessage,
  userGuilds,
} from '../../shared/discordApi.ts';

// Discord du bot : invitation, serveurs admin de l'utilisateur connecté,
// salons/rôles d'un serveur et publication des panneaux (tickets, règlement, rôles).
const PANEL_KEYS = ['tickets', 'rules', 'roles'];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error) => (error?.status === 401 ? null : Promise.reject(error)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({} as any));
    const action = String(body?.action || '');
    const now = new Date().toISOString();

    const clientId = secrets.get('DISCORD_CLIENT_ID') || '';
    const botToken = secrets.get('DISCORD_BOT_TOKEN') || '';

    const config = listOf(
      await base44.entities.BotConfig.filter({ owner_email: user.email }, { limit: 1 }),
    )[0] || null;

    const saveConfig = async (patch: Record<string, any>) => {
      const payload = { ...patch, updated_at: now };
      if (config) return await base44.entities.BotConfig.update(config.id, payload);
      return await base44.entities.BotConfig.create({ owner_email: user.email, ...payload });
    };

    if (action === 'invite') {
      if (!clientId) return Response.json({ error: 'discord_non_configure' }, { status: 400 });
      const guildId = String(body?.guildId || '').replace(/\D/g, '');
      const url = inviteUrl(clientId, guildId);
      await saveConfig({ discord_invite_url: url });
      return Response.json({ url });
    }

    if (!config?.discord_user_id) return Response.json({ error: 'user_not_connected' }, { status: 400 });
    if (!botToken) return Response.json({ error: 'discord_non_configure' }, { status: 400 });

    const accessToken = String(config.discord_access_token || '');
    const expiresAt = Number(config.discord_token_expires_at) || 0;
    if (!accessToken || expiresAt < Date.now() + 60000) {
      return Response.json({ error: 'user_token_expired' }, { status: 400 });
    }

    const adminGuildIds = new Set(
      (Array.isArray(config.discord_guilds) ? config.discord_guilds : [])
        .filter((guild: any) => guild?.admin !== false)
        .map((guild: any) => String(guild.id)),
    );

    const canManageGuild = (guildId: string) => (
      !!guildId && (adminGuildIds.has(guildId) || (!adminGuildIds.size && config?.discord_guild_id === guildId))
    );

    if (action === 'servers') {
      const list = await userGuilds(accessToken).catch((error) => {
        throw error;
      });
      const present = await botGuildIds(botToken).catch(() => new Set<string>());
      const guilds = await buildAdminGuilds(list, botToken, present);
      await saveConfig({ discord_guilds: guilds });
      return Response.json({ guilds });
    }

    const guildId = String(body?.guildId || '').replace(/\D/g, '');
    if (!guildId) return Response.json({ error: 'guild_required' }, { status: 400 });
    if (!canManageGuild(guildId)) return Response.json({ error: 'guild_not_allowed' }, { status: 403 });

    if (action === 'resources') {
      const resources = await fetchGuildResources(guildId, botToken);
      return Response.json(resources);
    }

    if (action === 'publishPanel') {
      const panelKey = String(body?.panelKey || '');
      if (!PANEL_KEYS.includes(panelKey)) return Response.json({ error: 'panel_invalid' }, { status: 400 });

      const panel = body?.panel && typeof body.panel === 'object' ? body.panel : {};
      const channelId = String(panel?.channelId || '').replace(/\D/g, '');
      if (!channelId) return Response.json({ error: 'channel_required' }, { status: 400 });

      const storedPanels = config?.discord_panels && typeof config.discord_panels === 'object' ? config.discord_panels : {};
      const previous = storedPanels[panelKey];
      const messageId = previous && String(previous.channel_id) === channelId ? String(previous.message_id || '') : '';

      const result = await sendPanelMessage({
        token: botToken,
        channelId,
        messageId,
        payload: panelPayload(panelKey, panel),
      });

      if (result.error) {
        return Response.json({ error: result.error, detail: result.detail || '', panelKey }, { status: 400 });
      }

      const integration = listOf(
        await base44.entities.BotIntegration.filter({ owner_email: user.email, platform: 'discord' }, { limit: 1 }),
      )[0];

      if (integration) {
        const settings = sanitizeSettings({
          ...(integration.settings || {}),
          discord: {
            ...((integration.settings || {}).discord || {}),
            panels: {
              ...(((integration.settings || {}).discord || {}).panels || {}),
              [panelKey]: { ...panel, messageId: String(result.message.id) },
            },
          },
        });
        await base44.entities.BotIntegration.update(integration.id, { settings, updated_at: now });
      }

      await saveConfig({
        discord_panels: {
          ...storedPanels,
          [panelKey]: { message_id: String(result.message.id), channel_id: channelId, published_at: now },
        },
      });

      return Response.json({ messageId: String(result.message.id), channelId, panelKey });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const known = ['missing_access', 'bot_not_in_guild', 'bot_refused', 'user_token_expired', 'discord_refused'];
    return Response.json({ error: known.includes(message) ? message : 'discord_error', detail: message }, { status: 400 });
  }
}