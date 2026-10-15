import { createApiCache } from '../../shared/apiCache.ts';
import {
  fetchRocketImage,
  MAX_ROCKET_IMAGE_BYTES,
  parseRocketImageHosts,
  readRocketImageBytes,
  resolveRocketImageCache,
  RocketMediaError,
  validateRocketImageBytes,
  validateRocketImageMetadata,
} from '../../shared/rocketLeagueMedia.ts';
import { rateLimitByIp } from '../../shared/security.ts';

const { getCached, setCached } = createApiCache(40);
const ROUTE_SUFFIX = '/api/rocket-league-proxy';

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

async function loadImage(source, allowedHosts) {
  const response = await fetchRocketImage(source, { allowedHosts });
  if (!response.ok) {
    await response.body?.cancel();
    throw new RocketMediaError(
      'upstream_rejected',
      `La source du visuel a répondu ${response.status}.`,
      response.status === 403 ? 403 : response.status === 404 ? 404 : 502,
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
  return {
    bytes,
    headers: {
      'Content-Type': type,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Access-Control-Allow-Origin': '*',
    },
  };
}

export default async function(req) {
  try {
    const pathname = new URL(req.url).pathname;
    if (!pathname.endsWith(ROUTE_SUFFIX)) {
      return Response.json({ error: 'Route inconnue.', code: 'not_found' }, { status: 404 });
    }
    if (req.method !== 'POST') {
      return Response.json(
        { error: 'Méthode non autorisée.', code: 'method_not_allowed' },
        { status: 405, headers: { Allow: 'POST' } },
      );
    }
    if (!rateLimitByIp(req, 'rocketLeagueProxy', 120, 60_000)) {
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
    const { cacheStatus, value } = await resolveRocketImageCache(source, {
      getCached,
      setCached,
      loader: () => loadImage(source, allowedHosts),
    });
    return new Response(value.bytes, {
      headers: { ...value.headers, 'X-Proxy-Cache': cacheStatus },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
