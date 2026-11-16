import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { listOf } from '../../shared/botAuth.ts';
import { deepMerge, defaultSettings, sanitizeSettings, stripSecrets } from '../../shared/botSettings.ts';

// Appelée par la page /live-bot (navigateur). Chaque action vérifie côté serveur
// que l'intégration appartient bien à l'utilisateur connecté.

const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error) => (error?.status === 401 ? null : Promise.reject(error)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({} as any));
    const action = String(body?.action || '');
    const now = new Date().toISOString();

    const owned = async (id: string) => {
      if (!id) return null;
      const record = await base44.entities.BotIntegration
        .get(id)
        .catch((error) => (error?.status === 404 ? null : Promise.reject(error)));
      if (!record) return null;
      if (record.owner_email !== user.email && user.role !== 'admin') return null;
      return record;
    };

    const loadConfig = async () => listOf(
      await base44.entities.BotConfig.filter({ owner_email: user.email }, { limit: 1 }),
    )[0] || null;

    const saveConfig = async (patch: Record<string, any>) => {
      const existing = await loadConfig();
      const payload = { ...patch, owner_email: user.email, updated_at: now };
      if (existing) return await base44.entities.BotConfig.update(existing.id, payload);
      return await base44.entities.BotConfig.create(payload);
    };

    const configView = (config: any) => ({
      paused: config?.paused === true,
      testRequestedAt: config?.test_requested_at || null,
      discord: {
        inviteUrl: config?.discord_invite_url || '',
        guildId: config?.discord_guild_id || '',
        guilds: Array.isArray(config?.discord_guilds) ? config.discord_guilds : [],
      },
    });

    if (action === 'list') {
      const page = await base44.entities.BotIntegration.filter(
        { owner_email: user.email },
        { sort: '-updated_date', limit: 20 },
      );
      const config = await loadConfig();
      return Response.json({
        integrations: listOf(page).map(stripSecrets),
        config: configView(config),
        workerConfigured: true,
      });
    }

    if (action === 'state') {
      const integrations = listOf(
        await base44.entities.BotIntegration.filter({ owner_email: user.email }, { sort: '-updated_date', limit: 20 }),
      );
      const config = await loadConfig();
      const day = new Date().toISOString().slice(0, 10);
      const stats = listOf(
        await base44.entities.BotDailyStats.filter({ owner_email: user.email, day }, { limit: 50 }),
      );

      const total = (key: string) => stats.reduce((sum, row) => sum + (Number(row?.[key]) || 0), 0);
      const filterHits: Record<string, number> = {};
      for (const row of stats) {
        for (const [key, value] of Object.entries(row?.filter_hits || {})) {
          filterHits[key] = (filterHits[key] || 0) + (Number(value) || 0);
        }
      }

      const stamps = integrations.map((item) => item.last_seen_at).filter(Boolean).sort() as string[];
      const lastSync = stamps.length ? stamps[stamps.length - 1] : null;
      const fresh = !!lastSync && Date.now() - new Date(lastSync).getTime() < 3 * 60 * 1000;
      const online = fresh && integrations.some((item) => item.enabled !== false && item.status !== 'stopped');

      return Response.json({
        config: configView(config),
        online,
        lastSync,
        stats: {
          messages: total('messages'),
          commands: total('commands'),
          timeouts: total('timeouts'),
          deletions: total('deletions'),
          filterHits,
        },
        integrations: integrations.map(stripSecrets),
      });
    }

    if (action === 'setPaused') {
      const paused = body?.paused === true;
      await saveConfig({ paused });
      const integrations = listOf(
        await base44.entities.BotIntegration.filter({ owner_email: user.email }, { limit: 20 }),
      );
      for (const integration of integrations) {
        await base44.entities.BotIntegration.update(integration.id, {
          enabled: !paused,
          status: paused ? 'stopped' : 'connecting',
          ...(paused ? { is_live: false } : {}),
          updated_at: now,
        });
      }
      const config = await loadConfig();
      return Response.json({ config: configView(config), paused });
    }

    if (action === 'test') {
      const integrations = listOf(
        await base44.entities.BotIntegration.filter(
          { owner_email: user.email, platform: { $in: ['twitch', 'youtube'] } },
          { limit: 20 },
        ),
      );
      let count = 0;
      for (const integration of integrations) {
        if (integration.status === 'stopped' || integration.enabled === false) continue;
        await base44.entities.BotIntegration.update(integration.id, { test_requested_at: now, updated_at: now });
        count += 1;
      }
      await saveConfig({ test_requested_at: now });
      return Response.json({ success: true, count });
    }

    if (action === 'refreshLive') {
      const record = await owned(String(body?.id || ''));
      if (!record) return Response.json({ error: 'not_found' }, { status: 404 });
      if (record.platform !== 'youtube') return Response.json({ error: 'unsupported_platform' }, { status: 400 });

      const credential = listOf(
        await base44.asServiceRole.entities.BotCredential.filter({ integration_id: record.id }, { limit: 1 }),
      )[0];
      if (!credential?.access_token && !credential?.refresh_token) {
        return Response.json({ error: 'not_connected' }, { status: 400 });
      }

      let accessToken = credential.access_token || '';
      const expiresAt = Number(credential.expires_at) || 0;
      if ((!accessToken || expiresAt < Date.now() + 60000) && credential.refresh_token) {
        const clientId = secrets.get('GOOGLE_CLIENT_ID');
        const clientSecret = secrets.get('GOOGLE_CLIENT_SECRET');
        if (!clientId || !clientSecret) return Response.json({ error: 'google_non_configure' }, { status: 500 });
        const refreshed = await fetch(GOOGLE_TOKEN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: credential.refresh_token,
            grant_type: 'refresh_token',
          }).toString(),
          signal: AbortSignal.timeout(15000),
        }).then((res) => res.json()).catch(() => ({}));
        if (refreshed?.access_token) {
          accessToken = refreshed.access_token;
          await base44.asServiceRole.entities.BotCredential.update(credential.id, {
            access_token: refreshed.access_token,
            expires_at: Date.now() + (Number(refreshed.expires_in) || 3600) * 1000,
            updated_at: now,
          });
        }
      }

      if (!accessToken) return Response.json({ error: 'not_connected' }, { status: 400 });

      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(record.channel_id)}&eventType=live&type=video&maxResults=1`,
        { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(15000) },
      );
      const searchData = await searchRes.json().catch(() => ({}));
      if (!searchRes.ok) {
        return Response.json({ error: searchData?.error?.message || 'youtube_refused' }, { status: 502 });
      }

      const live = searchData?.items?.[0] || null;
      const videoId = live?.id?.videoId || '';
      const settings = sanitizeSettings(deepMerge(record.settings || {}, {
        youtube: videoId ? { videoId } : {},
      }));

      const saved = await base44.entities.BotIntegration.update(record.id, {
        is_live: !!live,
        live_since: live ? now : null,
        settings,
        updated_at: now,
      });

      return Response.json({
        integration: stripSecrets(saved),
        live: !!live,
        title: live?.snippet?.title || '',
        videoId,
      });
    }

    if (action === 'selectDiscordServer') {
      const guildId = String(body?.guildId || '').trim();
      if (!guildId) return Response.json({ error: 'guild_required' }, { status: 400 });
      const config = await loadConfig();
      const guilds = Array.isArray(config?.discord_guilds) ? config.discord_guilds : [];
      const guild = guilds.find((item: any) => item.id === guildId) || { id: guildId, name: String(body?.guildName || 'Serveur Discord'), icon: '', member_count: 0 };

      await saveConfig({
        discord_guild_id: guild.id,
        discord_guild_name: guild.name,
        discord_guild_icon: guild.icon || '',
        discord_member_count: Number(guild.member_count) || 0,
      });

      const existing = listOf(
        await base44.entities.BotIntegration.filter({ owner_email: user.email, platform: 'discord' }, { limit: 1 }),
      )[0];

      const fields = {
        owner_email: user.email,
        owner_user_id: user.id,
        platform: 'discord',
        channel_id: guild.id,
        channel_name: guild.name,
        channel_avatar_url: guild.icon || '',
        account_mode: 'bot',
        enabled: true,
        status: 'connected',
        settings: sanitizeSettings(existing?.settings || defaultSettings()),
        updated_at: now,
      };

      const integration = existing
        ? await base44.entities.BotIntegration.update(existing.id, fields)
        : await base44.entities.BotIntegration.create(fields);

      return Response.json({ integration: stripSecrets(integration) });
    }

    if (action === 'saveSettings') {
      const record = await owned(String(body?.id || ''));
      if (!record) return Response.json({ error: 'not_found' }, { status: 404 });
      const settings = sanitizeSettings(deepMerge(record.settings || {}, body?.patch || {}));
      const saved = await base44.entities.BotIntegration.update(record.id, { settings, updated_at: now });
      return Response.json({ integration: stripSecrets(saved) });
    }

    if (action === 'setEnabled') {
      const record = await owned(String(body?.id || ''));
      if (!record) return Response.json({ error: 'not_found' }, { status: 404 });
      const enabled = body?.enabled === true;
      const updates: Record<string, any> = {
        enabled,
        status: enabled ? (record.status === 'stopped' || record.status === 'disconnected' ? 'connecting' : record.status) : 'stopped',
        updated_at: now,
      };
      if (!enabled) updates.is_live = false;
      const saved = await base44.entities.BotIntegration.update(record.id, updates);
      return Response.json({ integration: stripSecrets(saved) });
    }

    if (action === 'disconnect') {
      const record = await owned(String(body?.id || ''));
      if (!record) return Response.json({ error: 'not_found' }, { status: 404 });
      const credentials = listOf(await base44.asServiceRole.entities.BotCredential.filter({ integration_id: record.id }, { limit: 5 }));
      for (const credential of credentials) {
        await base44.asServiceRole.entities.BotCredential.delete(credential.id);
      }
      const saved = await base44.entities.BotIntegration.update(record.id, {
        enabled: false,
        status: 'stopped',
        is_live: false,
        live_since: null,
        last_error: '',
        quota_used: 0,
        updated_at: now,
      });
      return Response.json({ integration: stripSecrets(saved) });
    }

    if (action === 'remove') {
      const record = await owned(String(body?.id || ''));
      if (!record) return Response.json({ error: 'not_found' }, { status: 404 });
      const credentials = listOf(await base44.asServiceRole.entities.BotCredential.filter({ integration_id: record.id }, { limit: 5 }));
      for (const credential of credentials) {
        await base44.asServiceRole.entities.BotCredential.delete(credential.id);
      }
      await base44.entities.BotIntegration.delete(record.id);
      return Response.json({ success: true });
    }

    if (action === 'createDiscord') {
      const name = String(body?.channel_name || '').trim().slice(0, 80);
      if (name.length < 2) return Response.json({ error: 'name_required' }, { status: 400 });
      const existing = listOf(
        await base44.entities.BotIntegration.filter({ owner_email: user.email, platform: 'discord' }, { limit: 1 }),
      )[0];
      if (existing) {
        const saved = await base44.entities.BotIntegration.update(existing.id, {
          channel_name: name,
          channel_id: String(body?.channel_id || existing.channel_id || '').trim().slice(0, 64),
          updated_at: now,
        });
        return Response.json({ integration: stripSecrets(saved) });
      }

      const created = await base44.entities.BotIntegration.create({
        owner_email: user.email,
        owner_user_id: user.id,
        platform: 'discord',
        channel_id: String(body?.channel_id || '').trim().slice(0, 64) || `discord-${Date.now()}`,
        channel_name: name,
        account_mode: 'bot',
        enabled: true,
        status: 'connected',
        settings: sanitizeSettings(defaultSettings()),
        updated_at: now,
      });
      return Response.json({ integration: stripSecrets(created) });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}