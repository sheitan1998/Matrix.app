import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { createApiCache, dataResponse } from "../../shared/apiCache.ts";
import {
  getLocalRocketLeagueCatalog,
  normalizeRocketLeagueCatalogItem,
  paginateRocketLeagueCatalog,
} from "../../shared/rocketLeagueCatalog.ts";
import {
  requestRocketLeaguePlayerStats,
  ROCKET_PLAYER_NOT_FOUND_MESSAGE,
} from "../../shared/rocketLeagueTracker.ts";
import { rateLimitByIp } from '../../shared/security.ts';

const CACHE_TTL_STATS = 5 * 60 * 1000;
const CACHE_TTL_CATALOG = 60 * 60 * 1000;
const { getCached, setCached } = createApiCache(80);
const PRESET_ID = /^[a-zA-Z0-9_-]{8,80}$/;

function validSelection(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const keys = ['body', 'decal', 'wheels', 'paint', 'finish', 'goalExplosion'];
  const result = {};
  for (const key of keys) {
    const candidate = value[key];
    if (candidate !== null && (typeof candidate !== 'string' || candidate.length > 200)) return null;
    result[key] = candidate;
  }
  return result;
}

async function loadLiveCatalog() {
  const endpoint = process.env.ROCKET_LEAGUE_CATALOG_URL;
  if (!endpoint) throw new Error('catalog_not_configured');
  const cached = getCached('catalog:live', CACHE_TTL_CATALOG);
  if (cached) return cached;
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      ...(process.env.ROCKET_LEAGUE_CATALOG_API_KEY
        ? { Authorization: `Bearer ${process.env.ROCKET_LEAGUE_CATALOG_API_KEY}` }
        : {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`catalog_http_${response.status}`);
  const payload = await response.json();
  const rawItems = Array.isArray(payload) ? payload : payload?.items || payload?.data;
  if (!Array.isArray(rawItems)) throw new Error('catalog_malformed');
  const items = rawItems.map(normalizeRocketLeagueCatalogItem).filter(Boolean);
  if (!items.length) throw new Error('catalog_empty');
  const result = { items, fetchedAt: new Date().toISOString() };
  setCached('catalog:live', result);
  return result;
}

async function catalogResponse(body) {
  let source = 'api';
  let fallbackReason = null;
  let items;
  let fetchedAt = null;
  try {
    const live = await loadLiveCatalog();
    items = live.items;
    fetchedAt = live.fetchedAt;
  } catch (error) {
    const fallback = getLocalRocketLeagueCatalog();
    items = fallback.items;
    source = 'local';
    fallbackReason = error instanceof Error ? error.message : 'catalog_unavailable';
  }
  const query = String(body.query || '').trim().toLowerCase();
  const category = String(body.category || 'all');
  const filtered = items.filter(item => (
    (category === 'all' || item.category === category)
    && (!query || `${item.name} ${item.type} ${item.rarity}`.toLowerCase().includes(query))
  ));
  return {
    ...paginateRocketLeagueCatalog(filtered, body.page, body.limit),
    source,
    fallbackReason,
    fetchedAt,
  };
}

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'getItemShop' || action === 'getGarageCatalog' || action === 'searchItems') {
      return dataResponse(await catalogResponse(body), 3600);
    }

    if (action === 'savePreset') {
      if (!rateLimitByIp(req, 'rocketPreset', 20, 60_000)) {
        return Response.json({ error: 'Trop de presets enregistrés. Réessayez dans une minute.', code: 'rate_limited' }, { status: 429 });
      }
      const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
      const selection = validSelection(body.selection);
      if (!name || !selection) {
        return Response.json({ error: 'Preset invalide.', code: 'invalid_preset' }, { status: 400 });
      }
      const shareId = crypto.randomUUID();
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.RocketLeaguePreset.create({
        share_id: shareId,
        name,
        selection,
      });
      return dataResponse({ id: shareId, name, selection }, 0);
    }

    if (action === 'getPreset') {
      const id = String(body.id || '');
      if (!PRESET_ID.test(id)) {
        return Response.json({ error: 'Identifiant de preset invalide.', code: 'invalid_preset_id' }, { status: 400 });
      }
      const base44 = createClientFromRequest(req);
      const records = await base44.asServiceRole.entities.RocketLeaguePreset.filter({ share_id: id }, { limit: 1 });
      const preset = records?.[0];
      if (!preset) {
        return Response.json({ error: 'Preset introuvable.', code: 'preset_not_found' }, { status: 404 });
      }
      return dataResponse({ id: preset.share_id, name: preset.name, selection: preset.selection }, 300);
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
        const status = result.error.upstreamStatus
          || (result.error.code === 'invalid_request' ? 400 : 503);
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
      error: ROCKET_PLAYER_NOT_FOUND_MESSAGE,
      code: 'internal_error',
    });
  }
}