import { createApiCache, dataResponse } from "../../shared/apiCache.ts";
import { getLocalRocketLeagueCatalog } from "../../shared/rocketLeagueCatalog.ts";
import {
  requestRocketLeaguePlayerStats,
  ROCKET_PLAYER_NOT_FOUND_MESSAGE,
} from "../../shared/rocketLeagueTracker.ts";

const CACHE_TTL_STATS = 5 * 60 * 1000;
const { getCached, setCached } = createApiCache(80);

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'getItemShop' || action === 'getGarageCatalog' || action === 'searchItems') {
      const catalog = getLocalRocketLeagueCatalog();
      if (action !== 'searchItems') return dataResponse(catalog, 86400);
      const query = String(body.query || '').trim().toLowerCase();
      return dataResponse({
        ...catalog,
        items: query
          ? catalog.items.filter(item => `${item.name} ${item.type} ${item.rarity}`.toLowerCase().includes(query))
          : catalog.items,
      }, 86400);
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
        return Response.json({
          error: ROCKET_PLAYER_NOT_FOUND_MESSAGE,
          code: result.error.code,
        });
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