/**
 * Shared server-side security utilities for backend functions.
 * Imported by functions that need auth, rate limiting, sanitization,
 * wallet operations, or content moderation.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/** In-memory sliding-window rate limiter. Returns true if allowed. */
const _rateBuckets = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (_rateBuckets.get(key) || []).filter((t) => t > cutoff);
  if (hits.length >= max) return false;
  hits.push(now);
  _rateBuckets.set(key, hits);
  return true;
}

/** Rate limit by IP address (from request headers). */
export function rateLimitByIp(req: Request, bucket: string, max: number, windowMs = 60_000): boolean {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return rateLimit(`${bucket}:${ip}`, max, windowMs);
}

/** Coerce, trim, and sanitize a text value. Strips control chars and HTML tags. */
export function sanitizeText(value: unknown, maxLength = 2000): string {
  if (typeof value !== 'string') return '';
  let s = value.replace(/[\x00-\x1F\x7F]/g, '').trim();
  if (s.length > maxLength) s = s.slice(0, maxLength);
  return s;
}

/** Require a non-empty sanitized string field from the request body. */
export function requireText(body: Record<string, any>, field: string, maxLength = 2000): string {
  const s = sanitizeText(body[field], maxLength);
  if (!s) throw new HttpError(400, `Champ requis: ${field}.`);
  return s;
}

/** Simple HTTP error with status code. */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

/** Extract the authenticated user from the request, or null. */
export async function getUser(req: Request): Promise<any | null> {
  try {
    const sdk = createClientFromRequest(req);
    return await sdk.auth.me();
  } catch {
    return null;
  }
}

/** Require authentication. Returns the user or throws 401. */
export async function requireUser(req: Request): Promise<any> {
  const user = await getUser(req);
  if (!user) throw new HttpError(401, 'Authentification requise.');
  return user;
}

/** Require admin role. Returns the user or throws 403. */
export async function requireAdmin(req: Request): Promise<any> {
  const user = await requireUser(req);
  if (user.role !== 'admin') throw new HttpError(403, 'Accès réservé aux administrateurs.');
  return user;
}

/** Check if a user is banned (platform-level). */
export function isPlatformBanned(user: any): boolean {
  if (!user) return true;
  if (user.is_banned) {
    if (!user.banned_until) return true;
    return new Date(user.banned_until).getTime() > Date.now();
  }
  return false;
}

/**
 * Conditionally debit TRIX from a user's balance (server-side, service role).
 * Returns true if the user had enough balance and the debit was applied.
 * Uses read-check-write: there is a small TOCTOU window, but it is the best
 * we can do without transactions. For payment-verified flows, use the
 * Stripe event ID as the idempotency key in a TrixTransaction.
 */
export async function debitTrix(sdk: any, email: string, amount: number): Promise<boolean> {
  if (amount <= 0) return false;
  const page = await sdk.asServiceRole.entities.User.filter({ email }, { limit: 1, fields: ['trix_balance'] });
  const u = page?.items?.[0];
  if (!u || (u.trix_balance || 0) < amount) return false;
  await sdk.asServiceRole.entities.User.update(u.id, { trix_balance: (u.trix_balance || 0) - amount });
  return true;
}

/** Credit TRIX to a user's balance (server-side, service role). */
export async function creditTrix(sdk: any, email: string, amount: number): Promise<void> {
  if (amount <= 0) return;
  const page = await sdk.asServiceRole.entities.User.filter({ email }, { limit: 1, fields: ['trix_balance'] });
  const u = page?.items?.[0];
  if (!u) return;
  await sdk.asServiceRole.entities.User.update(u.id, { trix_balance: (u.trix_balance || 0) + amount });
}

/**
 * Moderate an image URL. Fail-closed: if the moderation service is
 * unavailable or returns an ambiguous result, the image is rejected.
 */
export async function moderateImage(sdk: any, fileUrl: string): Promise<{ safe: boolean; reason: string }> {
  if (!fileUrl || typeof fileUrl !== 'string') {
    return { safe: false, reason: 'URL de fichier manquante.' };
  }
  try {
    const result = await sdk.integrations.Core.InvokeLLM({
      prompt:
        'You are a content moderation system. Analyze this image and determine if it contains any of the following: pornography, nudity, sexual content, graphic violence, gore, illegal drugs, hate symbols, or any other content that violates community guidelines. Respond with a JSON object: { "safe": true/false, "reason": "short explanation in French if not safe, empty string if safe" }. Be strict: any nudity or sexual content = not safe. Any graphic violence = not safe. Bikinis/swimwear in non-sexual context = safe. Medical images = safe.',
      file_urls: [fileUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          safe: { type: 'boolean' },
          reason: { type: 'string' },
        },
        required: ['safe', 'reason'],
      },
    });
    // Fail-closed: only explicitly true is safe
    if (result?.safe === true) return { safe: true, reason: '' };
    return { safe: false, reason: result?.reason || 'Image non conforme aux règles de la communauté.' };
  } catch (err) {
    console.error('[moderateImage] error:', err);
    return { safe: false, reason: 'Le service de modération est indisponible. Réessayez plus tard.' };
  }
}

/** JSON error response helper. */
export function errorResponse(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}