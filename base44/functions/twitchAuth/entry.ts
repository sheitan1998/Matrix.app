import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { mapUser } from '../../shared/twitch.ts';

// Twitch OAuth — Authorization Code Flow.
// Tokens (access + refresh) are stored server-side in TwitchConnection (no client access via RLS).
const TWITCH_OAUTH = 'https://id.twitch.tv/oauth2';
const CALLBACK_PATH = '/auth/twitch/callback';
const ALLOWED_ORIGINS = ['https://matrix-hub.app', 'https://www.matrix-hub.app', 'https://matrix-hub.base44.app'];
const SCOPES = [
  'user:read:email',
  'user:read:follows',
  'moderator:read:followers',
  'channel:read:subscriptions',
  'user:read:whispers',
];
const REFRESH_MARGIN_MS = 5 * 60 * 1000;
const FORM_HEADERS = { 'Content-Type': 'application/x-www-form-urlencoded' };

function validRedirectUri(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (!ALLOWED_ORIGINS.includes(url.origin) || url.pathname !== CALLBACK_PATH || url.search || url.hash) return null;
    return url.origin + CALLBACK_PATH;
  } catch {
    return null;
  }
}

async function requestToken(form) {
  const res = await fetch(`${TWITCH_OAUTH}/token`, {
    method: 'POST',
    headers: FORM_HEADERS,
    body: new URLSearchParams(form).toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    return { _error: true, status: res.status, message: data.message || `Twitch token request failed (${res.status})` };
  }
  return data;
}

async function fetchTwitchUser(accessToken, clientId) {
  const res = await fetch('https://api.twitch.tv/helix/users', {
    headers: { 'Client-Id': clientId, Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.[0] || null;
}

function tokenFields(tokenData) {
  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || '',
    expires_at: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString(),
    scopes: Array.isArray(tokenData.scope) ? tokenData.scope : [],
  };
}

function profileFields(u) {
  return {
    twitch_user_id: u.id,
    twitch_login: u.login,
    twitch_display_name: u.display_name,
    twitch_avatar: u.profile_image_url || '',
  };
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    const clientId = secrets.get('TWITCH_CLIENT_ID');
    const clientSecret = secrets.get('TWITCH_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      return Response.json({ error: 'Configuration Twitch manquante côté serveur.' }, { status: 500 });
    }

    const Conn = base44.asServiceRole.entities.TwitchConnection;
    const existing = (await Conn.filter({ user_id: user.id }))[0] || null;

    // ---- Build the Twitch authorize URL (code flow) ----
    if (action === 'getAuthUrl') {
      const redirectUri = validRedirectUri(body.redirectUri);
      const state = typeof body.state === 'string' ? body.state : '';
      if (!redirectUri) return Response.json({ error: 'URL de retour non autorisée.' }, { status: 400 });
      if (state.length < 16 || state.length > 256) return Response.json({ error: 'State invalide.' }, { status: 400 });
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: SCOPES.join(' '),
        state,
      });
      return Response.json({ url: `${TWITCH_OAUTH}/authorize?${params.toString()}` });
    }

    // ---- Exchange the authorization code, store tokens ----
    if (action === 'exchangeCode') {
      const redirectUri = validRedirectUri(body.redirectUri);
      const code = typeof body.code === 'string' ? body.code.trim() : '';
      if (!redirectUri || !code || code.length > 512) {
        return Response.json({ error: 'Paramètres de connexion invalides.' }, { status: 400 });
      }
      const tokenData = await requestToken({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      });
      if (tokenData._error) {
        console.error('[twitchAuth] code exchange failed:', tokenData.status, tokenData.message);
        return Response.json({ error: `Twitch a refusé la connexion : ${tokenData.message}` }, { status: 400 });
      }
      const twitchUser = await fetchTwitchUser(tokenData.access_token, clientId);
      if (!twitchUser) return Response.json({ error: 'Impossible de récupérer le profil Twitch.' }, { status: 502 });

      const record = { user_id: user.id, user_email: user.email, ...profileFields(twitchUser), ...tokenFields(tokenData) };
      if (existing) await Conn.update(existing.id, record);
      else await Conn.create(record);

      return Response.json({ connected: true, access_token: tokenData.access_token, user: mapUser(twitchUser) });
    }

    // ---- Return a valid session (refreshes the token when needed) ----
    if (action === 'getSession') {
      if (!existing) return Response.json({ connected: false });

      let accessToken = existing.access_token;
      let updates = {};
      const expiresSoon = !existing.expires_at
        || new Date(existing.expires_at).getTime() - Date.now() < REFRESH_MARGIN_MS;
      let twitchUser = expiresSoon ? null : await fetchTwitchUser(accessToken, clientId);

      if (!twitchUser) {
        if (!existing.refresh_token) {
          await Conn.delete(existing.id);
          return Response.json({ connected: false });
        }
        const refreshed = await requestToken({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: existing.refresh_token,
        });
        if (refreshed._error) {
          // Refresh token revoked/invalid → drop the connection; transient errors keep it
          if (refreshed.status === 400 || refreshed.status === 401) await Conn.delete(existing.id);
          return Response.json({ connected: false });
        }
        accessToken = refreshed.access_token;
        updates = { ...tokenFields(refreshed), refresh_token: refreshed.refresh_token || existing.refresh_token };
        twitchUser = await fetchTwitchUser(accessToken, clientId);
        if (!twitchUser) return Response.json({ connected: false });
      }

      await Conn.update(existing.id, { ...updates, ...profileFields(twitchUser) });
      return Response.json({ connected: true, access_token: accessToken, user: mapUser(twitchUser) });
    }

    // ---- Disconnect: revoke at Twitch + delete stored tokens ----
    if (action === 'disconnect') {
      if (existing) {
        await fetch(`${TWITCH_OAUTH}/revoke`, {
          method: 'POST',
          headers: FORM_HEADERS,
          body: new URLSearchParams({ client_id: clientId, token: existing.access_token }).toString(),
        }).catch(() => null);
        await Conn.delete(existing.id);
      }
      return Response.json({ connected: false });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}