import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { appOrigin, listOf } from '../../shared/botAuth.ts';
import { defaultSettings, sanitizeSettings } from '../../shared/botSettings.ts';

// Connexion Twitch / YouTube du bot (Authorization Code Flow).
// Le retour du fournisseur arrive sur cette fonction : GET ?code=…&state=…
// L'état est signé (HMAC avec BOT_API_KEY) pour identifier l'utilisateur sans session.

const TWITCH_OAUTH = 'https://id.twitch.tv/oauth2';
const TWITCH_SCOPES = [
  'user:read:chat',
  'user:write:chat',
  'moderator:manage:banned_users',
  'moderator:manage:chat_messages',
];
const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';
const STATE_TTL_MS = 10 * 60 * 1000;
const enc = new TextEncoder();
const dec = new TextDecoder();

function toB64url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function stateKey() {
  const secret = secrets.get('BOT_API_KEY');
  if (!secret) return null;
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function createState(payload: Record<string, any>) {
  const key = await stateKey();
  if (!key) return null;
  const data = toB64url(enc.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return `${data}.${toB64url(new Uint8Array(signature))}`;
}

async function readState(value: string) {
  const key = await stateKey();
  if (!key || typeof value !== 'string' || !value.includes('.')) return null;
  const [data, signature] = value.split('.');
  try {
    const valid = await crypto.subtle.verify('HMAC', key, fromB64url(signature), enc.encode(data));
    if (!valid) return null;
    const payload = JSON.parse(dec.decode(fromB64url(data)));
    if (!payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function redirectTo(req: Request, query: string) {
  return Response.redirect(`${appOrigin(req)}/live-bot?${query}`, 302);
}

async function saveIntegration(base44: any, owner: { id: string; email: string }, platform: string, channel: any, tokenData: any, accountMode: string) {
  const now = new Date().toISOString();
  const expiresAt = Date.now() + (Number(tokenData.expires_in) || 3600) * 1000;
  const existing = listOf(
    await base44.asServiceRole.entities.BotIntegration.filter(
      { owner_email: owner.email, platform, channel_id: channel.id },
      { limit: 1 },
    ),
  )[0];

  const fields: Record<string, any> = {
    owner_email: owner.email,
    owner_user_id: owner.id,
    platform,
    channel_id: channel.id,
    channel_name: channel.name,
    account_user_id: channel.accountId,
    account_mode: accountMode,
    enabled: true,
    status: 'connecting',
    is_live: existing?.is_live === true,
    last_error: '',
    quota_limit: platform === 'youtube' ? (existing?.quota_limit || 10000) : existing?.quota_limit,
    settings: sanitizeSettings(existing?.settings || defaultSettings()),
    updated_at: now,
  };

  const integration = existing
    ? await base44.asServiceRole.entities.BotIntegration.update(existing.id, fields)
    : await base44.asServiceRole.entities.BotIntegration.create(fields);

  const credentialFields = {
    integration_id: integration.id,
    owner_email: owner.email,
    platform,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || '',
    expires_at: expiresAt,
    updated_at: now,
  };

  const credential = listOf(
    await base44.asServiceRole.entities.BotCredential.filter({ integration_id: integration.id }, { limit: 1 }),
  )[0];

  if (credential) {
    await base44.asServiceRole.entities.BotCredential.update(credential.id, {
      ...credentialFields,
      refresh_token: credentialFields.refresh_token || credential.refresh_token || '',
    });
  } else {
    await base44.asServiceRole.entities.BotCredential.create(credentialFields);
  }

  return integration;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);

    const clientId = secrets.get('TWITCH_CLIENT_ID');
    const twitchSecret = secrets.get('TWITCH_CLIENT_SECRET');
    const googleId = secrets.get('GOOGLE_CLIENT_ID');
    const googleSecret = secrets.get('GOOGLE_CLIENT_SECRET');

    // ---------- Retour du fournisseur ----------
    const code = url.searchParams.get('code');
    const rawState = url.searchParams.get('state');

    if (url.searchParams.get('error')) {
      return redirectTo(req, `error=${encodeURIComponent(url.searchParams.get('error') || 'oauth_refused')}`);
    }

    if (code && rawState) {
      const state = await readState(rawState);
      if (!state) return redirectTo(req, 'error=state_invalide');
      const redirectUri = String(state.redirect || '');

      if (state.platform === 'twitch') {
        if (!clientId || !twitchSecret) return redirectTo(req, 'error=twitch_non_configure');
        const tokenRes = await fetch(`${TWITCH_OAUTH}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: twitchSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }).toString(),
          signal: AbortSignal.timeout(15000),
        });
        const tokenData = await tokenRes.json().catch(() => ({}));
        if (!tokenRes.ok || !tokenData.access_token) return redirectTo(req, 'error=twitch_jeton_refuse');

        const userRes = await fetch('https://api.twitch.tv/helix/users', {
          headers: { 'Client-Id': clientId, Authorization: `Bearer ${tokenData.access_token}` },
          signal: AbortSignal.timeout(15000),
        });
        const account = (await userRes.json().catch(() => ({}))).data?.[0];
        if (!account) return redirectTo(req, 'error=twitch_profil_introuvable');

        let channel = { id: account.id, name: account.display_name || account.login, accountId: account.id };
        if (state.mode === 'bot') {
          const login = String(state.target || '').trim().replace(/^@/, '');
          if (!login) return redirectTo(req, 'error=pseudo_streamer_manquant');
          const channelRes = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`, {
            headers: { 'Client-Id': clientId, Authorization: `Bearer ${tokenData.access_token}` },
            signal: AbortSignal.timeout(15000),
          });
          const streamer = (await channelRes.json().catch(() => ({}))).data?.[0];
          if (!streamer) return redirectTo(req, 'error=chaine_twitch_introuvable');
          channel = { id: streamer.id, name: streamer.display_name || streamer.login, accountId: account.id };
        }

        await saveIntegration(base44, { id: state.uid, email: state.email }, 'twitch', channel, tokenData, state.mode === 'bot' ? 'bot' : 'own');
        return redirectTo(req, 'connected=twitch');
      }

      if (state.platform === 'youtube') {
        if (!googleId || !googleSecret) return redirectTo(req, 'error=google_non_configure');
        const tokenRes = await fetch(GOOGLE_TOKEN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: googleId,
            client_secret: googleSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }).toString(),
          signal: AbortSignal.timeout(15000),
        });
        const tokenData = await tokenRes.json().catch(() => ({}));
        if (!tokenRes.ok || !tokenData.access_token) return redirectTo(req, 'error=youtube_jeton_refuse');

        const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
          signal: AbortSignal.timeout(15000),
        });
        const channelData = (await channelRes.json().catch(() => ({}))).items?.[0];
        if (!channelData) return redirectTo(req, 'error=youtube_chaine_introuvable');

        await saveIntegration(
          base44,
          { id: state.uid, email: state.email },
          'youtube',
          { id: channelData.id, name: channelData.snippet?.title || 'YouTube', accountId: channelData.id },
          tokenData,
          'own',
        );
        return redirectTo(req, 'connected=youtube');
      }

      return redirectTo(req, 'error=plateforme_inconnue');
    }

    // ---------- Démarrage de la connexion (utilisateur connecté) ----------
    const user = await base44.auth.me().catch((error) => (error?.status === 401 ? null : Promise.reject(error)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({} as any));
    const action = String(body?.action || '');
    const key = await stateKey();
    if (!key) return Response.json({ error: 'BOT_API_KEY manquant côté serveur.' }, { status: 500 });

    const redirectUri = `${appOrigin(req)}/functions/botOAuth`;
    const baseState = { uid: user.id, email: user.email, exp: Date.now() + STATE_TTL_MS, redirect: redirectUri };

    if (action === 'startTwitch') {
      if (!clientId) return Response.json({ error: 'TWITCH_CLIENT_ID manquant.' }, { status: 500 });
      const mode = body?.accountMode === 'bot' ? 'bot' : 'own';
      const target = String(body?.target || '').trim().replace(/^@/, '').slice(0, 40);
      if (mode === 'bot' && !/^[a-zA-Z0-9_]{3,25}$/.test(target)) {
        return Response.json({ error: 'pseudo_streamer_invalide' }, { status: 400 });
      }
      const state = await createState({ ...baseState, platform: 'twitch', mode, target });
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: TWITCH_SCOPES.join(' '),
        state,
        force_verify: 'true',
      });
      return Response.json({ url: `${TWITCH_OAUTH}/authorize?${params.toString()}` });
    }

    if (action === 'startYouTube') {
      if (!googleId) return Response.json({ error: 'GOOGLE_CLIENT_ID manquant.' }, { status: 500 });
      const state = await createState({ ...baseState, platform: 'youtube', mode: 'own' });
      const params = new URLSearchParams({
        client_id: googleId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: GOOGLE_SCOPE,
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'true',
        state,
      });
      return Response.json({ url: `${GOOGLE_AUTH}?${params.toString()}` });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}