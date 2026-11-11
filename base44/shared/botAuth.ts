import { secrets } from 'base44:runtime';

// Authentification des appels du worker (en-tête x-api-key) + origine publique de l'app.

export function botKeyConfigured() {
  return !!secrets.get('BOT_API_KEY');
}

export function isBotRequestAuthorized(req: Request) {
  const expected = secrets.get('BOT_API_KEY');
  if (!expected) return false;
  const sent = req.headers.get('x-api-key') || '';
  if (sent.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= sent.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function appOrigin(req: Request) {
  const header = req.headers.get('x-base44-app-url') || '';
  try {
    const url = new URL(header);
    if (url.protocol === 'https:') return url.origin;
  } catch {
    // header absent ou invalide : on retombe sur l'URL publiée
  }
  return 'https://matrix-hub.base44.app';
}

export function listOf(page: any): any[] {
  if (Array.isArray(page)) return page;
  return Array.isArray(page?.items) ? page.items : [];
}

export function unauthorized() {
  return Response.json({ error: 'unauthorized' }, { status: 401 });
}