import { createApiCache, dataResponse } from "../../shared/apiCache.ts";
import {
  COMMUNITY_CATALOG_URL,
  COMMUNITY_CATALOG_VERSION,
  normalizeRocketLeagueCatalogPayload,
  paginateRocketLeagueCatalog,
} from "../../shared/rocketLeagueCatalog.ts";
import {
  requestRocketLeaguePlayerStats,
} from "../../shared/rocketLeagueTracker.ts";

const CACHE_TTL_STATS = 5 * 60 * 1000;
const CACHE_TTL_CATALOG = 60 * 60 * 1000;
const MAX_CATALOG_BYTES = 8 * 1024 * 1024;
const { getCached, setCached } = createApiCache(80);

function trackerHttpStatus(code, upstreamStatus) {
  if (code === 'invalid_request') return 400;
  if (code === 'not_found') return 404;
  if (code === 'private_or_forbidden') return 403;
  if (code === 'rate_limited') return 429;
  if (code === 'timeout') return 504;
  if (code === 'invalid_api_key' || code === 'missing_api_key') return 503;
  if (upstreamStatus && upstreamStatus >= 500) return 502;
  return 502;
}
function configuredImageHosts() {
  return new Set(String(process.env.ROCKET_LEAGUE_IMAGE_HOSTS || '')
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean));
}

async function fetchCatalog(endpoint, source) {
  let catalogUrl;
  try {
    catalogUrl = new URL(endpoint);
  } catch {
    throw new Error('catalog_url_invalid');
  }
  if (catalogUrl.protocol !== 'https:') throw new Error('catalog_url_invalid');
  const cacheKey = `catalog:${source}:${endpoint}`;
  const cached = getCached(cacheKey, CACHE_TTL_CATALOG);
  if (cached) return cached;
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      ...(source === 'bakkesmod' && process.env.ROCKET_LEAGUE_CATALOG_API_KEY
        ? { Authorization: `Bearer ${process.env.ROCKET_LEAGUE_CATALOG_API_KEY}` }
        : {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`catalog_http_${response.status}`);
  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > MAX_CATALOG_BYTES) throw new Error('catalog_too_large');
  const rawPayload = await response.text();
  if (rawPayload.length > MAX_CATALOG_BYTES) throw new Error('catalog_too_large');
  let payload;
  try {
    payload = JSON.parse(rawPayload);
  } catch {
    throw new Error('catalog_malformed');
  }
  const items = normalizeRocketLeagueCatalogPayload(payload, {
    allowedImageHosts: configuredImageHosts(),
    source,
  });
  if (!items.length) throw new Error('catalog_empty');
  const result = {
    items,
    fetchedAt: new Date().toISOString(),
    source,
    version: source === 'community-snapshot' ? COMMUNITY_CATALOG_VERSION : null,
  };
  setCached(cacheKey, result);
  return result;
}

async function catalogResponse(body) {
  const configuredEndpoint = process.env.ROCKET_LEAGUE_CATALOG_URL;
  let fallbackReason = configuredEndpoint ? null : 'catalog_not_configured';
  let result;
  try {
    if (!configuredEndpoint) throw new Error('catalog_not_configured');
    result = await fetchCatalog(configuredEndpoint, 'bakkesmod');
  } catch (error) {
    fallbackReason = error instanceof Error ? error.message : 'catalog_unavailable';
    result = await fetchCatalog(COMMUNITY_CATALOG_URL, 'community-snapshot');
  }
  const query = String(body.query || '').trim().toLowerCase();
  const category = String(body.category || 'all');
  const filtered = result.items.filter(item => (
    (category === 'all' || item.category === category)
    && (!query || `${item.name} ${item.type} ${item.rarity}`.toLowerCase().includes(query))
  ));
  return {
    ...paginateRocketLeagueCatalog(filtered, body.page, body.limit),
    source: result.source,
    version: result.version,
    fallbackReason,
    fetchedAt: result.fetchedAt,
  };
}

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'getItemShop' || action === 'getGarageCatalog' || action === 'searchItems') {
      return dataResponse(await catalogResponse(body), 3600);
    }

    if (action === 'getPlayerStats') {
      const platform = String(body.platform || '');
      const gamertag = String(body.gamertag || '').trim();

      const cacheKey = `stats:${platform}:${gamertag.toLowerCase()}`;
      const cached = getCached(cacheKey, CACHE_TTL_STATS);
      if (cached) return dataResponse(cached, 300);

      const result = await requestRocketLeaguePlayerStats({
        platform,
        playerId: gamertag,
        apiKey: process.env.TRN_API_KEY,
      });
      if (!result.ok) {
        console.warn('Rocket League Tracker lookup failed', {
          code: result.error.code,
          upstreamStatus: result.error.upstreamStatus,
          platform,
        });
        const status = trackerHttpStatus(result.error.code, result.error.upstreamStatus);
        return Response.json({
          error: result.error.message,
          code: result.error.code,
        }, { status });
      }

      setCached(cacheKey, result.profile);
      return dataResponse(result.profile, 300);
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    console.error('Rocket League API request failed', error);
    return Response.json({
      error: 'Le service Rocket League est temporairement indisponible.',
      code: 'internal_error',
    }, { status: 500 });
  }
}