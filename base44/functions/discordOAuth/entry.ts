import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { listOf } from '../../shared/botAuth.ts';
import {
  DISCORD_API,
  OAUTH_SCOPES,
  botGuildIds,
  buildAdminGuilds,
  sanitizeRedirect,
  userGuilds,
} from '../../shared/discordApi.ts';

// OAuth2 du compte Discord (identify + guilds). Isolé de botDiscord pour que
// les salons, rôles et publications continuent de fonctionner sans ce secret.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error) => (error?.status === 401 ? null : Promise.reject(error)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({} as any));
    const action = String(body?.action || '');
    const now = new Date().toISOString();

    const clientId = secrets.get('DISCORD_CLIENT_ID') || '';
    const clientSecret = secrets.get('DISCORD_CLIENT_SECRET') || '';
    const botToken = secrets.get('DISCORD_BOT_TOKEN') || '';

    const config = listOf(
      await base44.entities.BotConfig.filter({ owner_email: user.email }, { limit: 1 }),
    )[0] || null;

    const saveConfig = async (patch: Record<string, any>) => {
      const payload = { ...patch, updated_at: now };
      if (config) return await base44.entities.BotConfig.update(config.id, payload);
      return await base44.entities.BotConfig.create({ owner_email: user.email, ...payload });
    };

    const syncGuilds = async (accessToken: string) => {
      const list = await userGuilds(accessToken);
      const present = botToken ? await botGuildIds(botToken).catch(() => new Set<string>()) : new Set<string>();
      return await buildAdminGuilds(list, botToken, present);
    };

    if (action === 'authUrl') {
      if (!clientId || !clientSecret) return Response.json({ error: 'discord_oauth_non_configure' }, { status: 400 });
      const redirectUri = sanitizeRedirect(body?.redirectUri);
      if (!redirectUri) return Response.json({ error: 'redirect_invalid' }, { status: 400 });
      const state = crypto.randomUUID();
      await saveConfig({ discord_oauth_state: state });
      const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(OAUTH_SCOPES)}&state=${state}`;
      return Response.json({ url, redirectUri });
    }

    if (action === 'callback') {
      if (!clientId || !clientSecret) return Response.json({ error: 'discord_oauth_non_configure' }, { status: 400 });
      const code = String(body?.code || '').trim();
      const redirectUri = sanitizeRedirect(body?.redirectUri);
      const state = String(body?.state || '');
      if (!code || !redirectUri) return Response.json({ error: 'code_missing' }, { status: 400 });
      if (config?.discord_oauth_state && state && config.discord_oauth_state !== state) {
        return Response.json({ error: 'state_mismatch' }, { status: 400 });
      }

      const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }).toString(),
        signal: AbortSignal.timeout(15000),
      });
      const tokenData = await tokenRes.json().catch(() => ({}));
      if (!tokenRes.ok || !tokenData?.access_token) {
        return Response.json({ error: 'discord_oauth_refused', detail: tokenData?.error_description || '' }, { status: 502 });
      }

      const profileRes = await fetch(`${DISCORD_API}/users/@me`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
        signal: AbortSignal.timeout(15000),
      });
      const profile = await profileRes.json().catch(() => ({}));
      if (!profileRes.ok) return Response.json({ error: 'discord_oauth_refused' }, { status: 502 });

      const guilds = await syncGuilds(tokenData.access_token);

      await saveConfig({
        discord_user_id: String(profile.id || ''),
        discord_user_name: profile.global_name || profile.username || 'Compte Discord',
        discord_user_avatar: profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${String(profile.avatar).startsWith('a_') ? 'gif' : 'png'}?size=128`
          : '',
        discord_access_token: tokenData.access_token,
        discord_refresh_token: tokenData.refresh_token || '',
        discord_token_expires_at: Date.now() + (Number(tokenData.expires_in) || 604800) * 1000,
        discord_oauth_state: '',
        discord_guilds: guilds,
      });

      return Response.json({
        user: { id: String(profile.id || ''), name: profile.global_name || profile.username || '' },
        guilds,
      });
    }

    if (action === 'refresh') {
      if (!config?.discord_refresh_token || !clientId || !clientSecret) {
        return Response.json({ error: 'user_token_expired' }, { status: 400 });
      }
      const refreshed = await fetch(`${DISCORD_API}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: String(config.discord_refresh_token),
        }).toString(),
        signal: AbortSignal.timeout(15000),
      }).then((res) => res.json()).catch(() => ({}));

      if (!refreshed?.access_token) {
        await saveConfig({ discord_access_token: '', discord_token_expires_at: 0 });
        return Response.json({ error: 'user_token_expired' }, { status: 400 });
      }

      await saveConfig({
        discord_access_token: refreshed.access_token,
        discord_refresh_token: refreshed.refresh_token || config.discord_refresh_token,
        discord_token_expires_at: Date.now() + (Number(refreshed.expires_in) || 604800) * 1000,
      });
      return Response.json({ refreshed: true });
    }

    if (action === 'disconnectUser') {
      await saveConfig({
        discord_user_id: '',
        discord_user_name: '',
        discord_user_avatar: '',
        discord_access_token: '',
        discord_refresh_token: '',
        discord_token_expires_at: 0,
        discord_oauth_state: '',
        discord_guilds: [],
      });
      return Response.json({ success: true });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: 'discord_error', detail: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}