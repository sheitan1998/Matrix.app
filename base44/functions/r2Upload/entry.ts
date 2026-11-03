import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');

async function sha256Hex(value: string) {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

async function hmac(key: Uint8Array | string, data: string) {
  const raw = typeof key === 'string' ? encoder.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data)));
}

const encodeRfc3986 = (value: string) =>
  encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

const ALLOWED_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'mp4', 'webm', 'mov', 'm4v', 'ogg']);
const SAFE_FOLDER_RE = /^[a-z0-9/_-]{1,80}$/i;

function extensionOf(filename: string) {
  const clean = String(filename || '').trim().toLowerCase();
  const ext = clean.includes('.') ? clean.split('.').pop() : '';
  if (!ext || !ALLOWED_EXT.has(ext)) return '';
  return ext === 'jpeg' ? 'jpg' : ext;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { filename, folder } = body;
    const ext = extensionOf(filename);
    if (!ext) return Response.json({ error: 'Type de fichier non autorisé' }, { status: 400 });

    const dir = String(folder || 'cosmetics').replace(/^\/+|\/+$/g, '');
    if (!SAFE_FOLDER_RE.test(dir)) return Response.json({ error: 'Dossier invalide' }, { status: 400 });

    const endpoint = (secrets.get('R2_ENDPOINT') || '').replace(/\/+$/, '');
    const bucket = secrets.get('R2_BUCKET') || '';
    const publicBase = (secrets.get('R2_PUBLIC_URL') || '').replace(/\/+$/, '');
    const accessKeyId = secrets.get('R2_ACCESS_KEY_ID') || '';
    const secretKey = secrets.get('R2_SECRET_ACCESS_KEY') || '';
    if (!endpoint || !bucket || !publicBase || !accessKeyId || !secretKey) {
      return Response.json({ error: 'Configuration R2 incomplète' }, { status: 500 });
    }

    const key = `${dir}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
    const expires = 900;

    const endpointUrl = new URL(endpoint);
    const basePath = endpointUrl.pathname.replace(/\/+$/, '');
    const canonicalUri = `${basePath}/${bucket}/${key}`.split('/').map(encodeRfc3986).join('/');
    const host = endpointUrl.host;

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const region = 'auto';
    const service = 's3';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

    const query = {
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${accessKeyId}/${credentialScope}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': String(expires),
      'X-Amz-SignedHeaders': 'host',
    };
    const canonicalQuery = Object.keys(query)
      .sort()
      .map((k) => `${encodeRfc3986(k)}=${encodeRfc3986(query[k])}`)
      .join('&');

    const canonicalRequest = `PUT\n${canonicalUri}\n${canonicalQuery}\nhost:${host}\n\nhost\nUNSIGNED-PAYLOAD`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${await sha256Hex(canonicalRequest)}`;

    const kDate = await hmac(`AWS4${secretKey}`, dateStamp);
    const kRegion = await hmac(kDate, region);
    const kService = await hmac(kRegion, service);
    const signingKey = await hmac(kService, 'aws4_request');
    const signature = toHex(await hmac(signingKey, stringToSign));

    const uploadUrl = `${endpointUrl.protocol}//${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
    const publicUrl = `${publicBase}/${key}`;

    return Response.json({ uploadUrl, publicUrl, key, expiresIn: expires });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}