import { secrets } from 'base44:runtime';

// Utilitaires serveur des connecteurs Matrix AI (Google Drive). Jamais importé côté client.

export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/drive.readonly',
];

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const STATE_TTL_MS = 10 * 60 * 1000;

const encoder = new TextEncoder();

export function googleConfig() {
  const clientId = secrets.get('GOOGLE_OAUTH_CLIENT_ID') || '';
  const clientSecret = secrets.get('GOOGLE_OAUTH_CLIENT_SECRET') || '';
  const redirectUri = secrets.get('GOOGLE_OAUTH_REDIRECT_URI') || '';
  const encryptionKey = secrets.get('AI_TOKEN_ENCRYPTION_KEY') || '';
  return {
    clientId,
    clientSecret,
    redirectUri,
    encryptionKey,
    configured: Boolean(clientId && clientSecret && redirectUri && encryptionKey),
    // Application Google en cours de validation : seuls les comptes de test peuvent se connecter.
    reviewPending: ['pending', 'testing'].includes(String(secrets.get('GOOGLE_OAUTH_REVIEW_STATUS') || '').toLowerCase()),
  };
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function aesKey(secret: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`aes:${secret}`));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`hmac:${secret}`));
  return crypto.subtle.importKey('raw', digest, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function encryptToken(plain: string, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(secret), encoder.encode(plain)),
  );
  const packed = new Uint8Array(iv.length + cipher.length);
  packed.set(iv);
  packed.set(cipher, iv.length);
  return toBase64(packed);
}

export async function decryptToken(packedValue: string, secret: string): Promise<string> {
  const packed = fromBase64(packedValue);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: packed.slice(0, 12) },
    await aesKey(secret),
    packed.slice(12),
  );
  return new TextDecoder().decode(plain);
}

/** État OAuth signé : lie le retour Google à l'utilisateur qui a lancé la connexion. */
export async function signState(userId: string, secret: string): Promise<string> {
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ u: userId, e: Date.now() + STATE_TTL_MS, n: crypto.randomUUID() })),
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(payload)));
  return `${payload}.${toBase64Url(sig)}`;
}

export async function verifyState(state: string, userId: string, secret: string): Promise<boolean> {
  const [payload, sig] = String(state || '').split('.');
  if (!payload || !sig) return false;
  const expected = toBase64Url(
    new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(payload))),
  );
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return false;
  try {
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const data = JSON.parse(new TextDecoder().decode(fromBase64(padded + '='.repeat((4 - (padded.length % 4)) % 4))));
    return data.u === userId && Number(data.e) > Date.now();
  } catch {
    return false;
  }
}

export function buildGoogleAuthUrl(config, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

async function tokenRequest(config, params: Record<string, string>) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, ...params }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error_description || data.error || 'Échec OAuth Google');
    (error as any).code = data.error || 'oauth_error';
    throw error;
  }
  return data;
}

export async function exchangeGoogleCode(config, code: string) {
  const tokens = await tokenRequest(config, {
    code,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri,
  });
  const profile = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  }).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  return { tokens, email: String(profile.email || '') };
}

export async function revokeGoogleToken(token: string) {
  await fetch(GOOGLE_REVOKE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }),
  }).catch(() => null);
}

/** Retourne un access token valide (rafraîchi si besoin) ou null si le connecteur doit être reconnecté. */
export async function getValidAccessToken(base44, connector, config): Promise<string | null> {
  if (!config.configured || !connector?.access_token_enc) return null;
  const expiresAt = connector.expires_at ? Date.parse(connector.expires_at) : 0;
  if (expiresAt - 60_000 > Date.now()) {
    return decryptToken(connector.access_token_enc, config.encryptionKey);
  }
  if (!connector.refresh_token_enc) return null;
  try {
    const refreshToken = await decryptToken(connector.refresh_token_enc, config.encryptionKey);
    const tokens = await tokenRequest(config, { grant_type: 'refresh_token', refresh_token: refreshToken });
    await base44.asServiceRole.entities.AiConnector.update(connector.id, {
      status: 'connected',
      access_token_enc: await encryptToken(tokens.access_token, config.encryptionKey),
      expires_at: new Date(Date.now() + Number(tokens.expires_in || 3600) * 1000).toISOString(),
    });
    return tokens.access_token;
  } catch (error) {
    if ((error as any).code === 'invalid_grant') {
      await base44.asServiceRole.entities.AiConnector.update(connector.id, { status: 'error' });
    }
    return null;
  }
}

const DRIVE_STOP_WORDS = new Set([
  'google', 'drive', 'dans', 'mon', 'mes', 'ma', 'les', 'des', 'une', 'fichier', 'fichiers', 'document',
  'documents', 'cherche', 'trouve', 'dossier', 'resume', 'résume', 'lis', 'avec', 'pour', 'sur', 'quel',
  'quels', 'quelle', 'the', 'and', 'from', 'my', 'file', 'files',
]);

export function looksLikeDriveRequest(text: string): boolean {
  return /(google\s*drive|\bdrive\b|mes (fichiers|documents)|mon document|my (files|documents))/i.test(String(text || ''));
}

/** Recherche plein texte dans le Drive de l'utilisateur ; extrait un court aperçu des Google Docs. */
export async function searchDrive(accessToken: string, message: string) {
  const terms = String(message || '')
    .toLowerCase()
    .split(/[^a-z0-9àâäéèêëîïôöùûüç]+/i)
    .filter((w) => w.length >= 3 && !DRIVE_STOP_WORDS.has(w))
    .slice(0, 5);
  const clauses = terms.map((t) => `fullText contains '${t.replace(/['\\]/g, '')}'`);
  const q = ['trashed = false', ...(clauses.length ? [`(${clauses.join(' or ')})`] : [])].join(' and ');
  const params = new URLSearchParams({
    q,
    pageSize: '3',
    orderBy: 'modifiedTime desc',
    fields: 'files(id,name,mimeType,webViewLink,modifiedTime)',
  });
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  const files = Array.isArray(data.files) ? data.files : [];
  return Promise.all(files.map(async (file) => {
    let excerpt = '';
    if (file.mimeType === 'application/vnd.google-apps.document') {
      const exported = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}/export?mimeType=text/plain`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      ).then((r) => (r.ok ? r.text() : '')).catch(() => '');
      excerpt = exported.replace(/\s+/g, ' ').trim().slice(0, 1500);
    }
    return { name: file.name, link: file.webViewLink || '', modified: file.modifiedTime || '', excerpt };
  }));
}
