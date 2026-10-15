import { createApiCache } from '../../shared/apiCache.ts';
import {
  fetchRocketImage,
  MAX_ROCKET_IMAGE_BYTES,
  parseRocketImageHosts,
  readRocketImageBytes,
  RocketMediaError,
  validateRocketImageBytes,
  validateRocketImageMetadata,
} from '../../shared/rocketLeagueMedia.ts';
import { rateLimitByIp } from '../../shared/security.ts';

const { getCached, setCached } = createApiCache(40);
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function errorResponse(error) {
  if (error instanceof RocketMediaError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error('Rocket League image proxy failed', error);
  return Response.json({
    error: 'Le proxy de visuels est indisponible.',
    code: 'internal_error',
  }, { status: 500 });
}

export default async function(req) {
  try {
    if (req.method !== 'POST') {
      return Response.json(
        { error: 'Méthode non autorisée.', code: 'method_not_allowed' },
        { status: 405, headers: { Allow: 'POST' } },
      );
    }
    if (!rateLimitByIp(req, 'rocketLeagueImage', 120, 60_000)) {
      return Response.json(
        { error: 'Trop de requêtes de visuels.', code: 'rate_limited' },
        { status: 429 },
      );
    }
    const allowedHosts = parseRocketImageHosts(process.env.ROCKET_LEAGUE_IMAGE_HOSTS);
    if (!allowedHosts.size) {
      throw new RocketMediaError(
        'not_configured',
        'Aucune source de visuels Rocket League n’est configurée.',
        503,
      );
    }
    const body = await req.json().catch(() => ({}));
    const source = String(body.url || '');
    const cached = getCached(source, CACHE_TTL_MS);
    if (cached) return new Response(cached.bytes, { headers: cached.headers });

    const response = await fetchRocketImage(source, { allowedHosts });
    if (!response.ok) {
      await response.body?.cancel();
      throw new RocketMediaError(
        'upstream_rejected',
        `La source du visuel a répondu ${response.status}.`,
        response.status === 404 ? 404 : 502,
      );
    }
    const type = response.headers.get('content-type') || '';
    const declaredSize = Number(response.headers.get('content-length') || 0);
    try {
      validateRocketImageMetadata(type, declaredSize);
    } catch (error) {
      await response.body?.cancel();
      throw error;
    }
    const bytes = await readRocketImageBytes(response, MAX_ROCKET_IMAGE_BYTES);
    validateRocketImageBytes(bytes, type);
    const headers = {
      'Content-Type': type,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Access-Control-Allow-Origin': '*',
    };
    setCached(source, { bytes, headers });
    return new Response(bytes, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}
