import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { isBotRequestAuthorized, listOf, unauthorized } from '../../shared/botAuth.ts';
import { sanitizeSettings } from '../../shared/botSettings.ts';

// GET /functions/botGetConfig — appelé par le worker.
// Une entrée JSON propre par chaîne connectée : réglages complets (défauts inclus),
// jetons d'accès et éventuelle demande de message de test.
export default async function (req: Request): Promise<Response> {
  try {
    if (!isBotRequestAuthorized(req)) return unauthorized();

    const base44 = createClientFromRequest(req);
    const integrations = listOf(
      await base44.asServiceRole.entities.BotIntegration.filter(
        { platform: { $in: ['twitch', 'youtube'] }, status: { $ne: 'stopped' } },
        { limit: 200 },
      ),
    );

    const ids = integrations.map((item: any) => item.id);
    const credentials = ids.length
      ? listOf(
          await base44.asServiceRole.entities.BotCredential.filter(
            { integration_id: { $in: ids } },
            { limit: 200 },
          ),
        )
      : [];

    const byIntegration = new Map<string, any>();
    for (const credential of credentials) byIntegration.set(credential.integration_id, credential);

    const channels = [];
    for (const integration of integrations) {
      const credential = byIntegration.get(integration.id);
      if (!credential?.access_token) continue;
      channels.push({
        id: integration.id,
        platform: integration.platform,
        enabled: integration.enabled !== false,
        testRequestedAt: integration.test_requested_at || null,
        channel: {
          id: integration.channel_id || '',
          name: integration.channel_name || '',
          avatarUrl: integration.channel_avatar_url || '',
        },
        account: {
          userId: integration.account_user_id || '',
          mode: integration.account_mode || 'own',
          accessToken: credential.access_token || '',
          refreshToken: credential.refresh_token || '',
          expiresAt: Number(credential.expires_at) || 0,
        },
        settings: sanitizeSettings(integration.settings || {}),
      });
    }

    // Discord : réglages par serveur + file d'actions à appliquer. Les actions
    // lues ici passent en « delivered » (le worker les a récupérées).
    const configs = listOf(await base44.asServiceRole.entities.BotConfig.list({ limit: 500 }))
      .filter((config: any) => config?.discord_guild_id);
    const discordIntegrations = listOf(
      await base44.asServiceRole.entities.BotIntegration.filter(
        { platform: 'discord', status: { $ne: 'stopped' } },
        { limit: 200 },
      ),
    );
    const byOwner = new Map<string, any>(discordIntegrations.map((item: any) => [item.owner_email, item]));
    const deliveredAt = new Date().toISOString();
    const discord = [];
    const pendingActions = [];

    for (const config of configs.slice(0, 200)) {
      const integration = byOwner.get(config.owner_email);
      const settings = sanitizeSettings(integration?.settings || {});
      const history = Array.isArray(config.pending_actions) ? config.pending_actions : [];
      const pending = history.filter((entry: any) => entry?.status === 'pending');

      if (pending.length) {
        await base44.asServiceRole.entities.BotConfig.update(config.id, {
          pending_actions: history.map((entry: any) => (
            entry?.status === 'pending' ? { ...entry, status: 'delivered', delivered_at: deliveredAt } : entry
          )),
        });
        for (const entry of pending) {
          pendingActions.push({ ...entry, ownerEmail: config.owner_email, guildId: config.discord_guild_id });
        }
      }

      discord.push({
        integrationId: integration?.id || '',
        ownerEmail: config.owner_email,
        guildId: config.discord_guild_id,
        guildName: config.discord_guild_name || '',
        paused: config.paused === true,
        enabled: integration?.enabled !== false && integration?.status !== 'stopped',
        panels: config.discord_panels && typeof config.discord_panels === 'object' ? config.discord_panels : {},
        settings: settings.discord,
      });
    }

    return Response.json({ generatedAt: new Date().toISOString(), channels, discord, pendingActions });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}