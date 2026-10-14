import { secrets } from 'base44:runtime';
import { createApiCache, dataResponse } from "../../shared/apiCache.ts";

const CACHE_TTL_SHOP = 15 * 60 * 1000;
const CACHE_TTL_STATS = 5 * 60 * 1000;
const CACHE_TTL_ITEMS = 60 * 60 * 1000;
const { getCached, setCached } = createApiCache(80);

const PLATFORM_MAP = { epic: 'epic', steam: 'steam', psn: 'psn', xbox: 'xbl' };

const RL_CATEGORIES = [
  { label: 'New Items', url: 'https://rocket-league.com/items/new' },
  { label: 'Popular Items', url: 'https://rocket-league.com/items/popular' },
  { label: 'Rocket Passes', url: 'https://rocket-league.com/items/rocketpass' },
  { label: 'Series & Misc', url: 'https://rocket-league.com/items/misc' },
  { label: 'Bodies', url: 'https://rocket-league.com/items/bodies' },
  { label: 'Decals', url: 'https://rocket-league.com/items/decals' },
  { label: 'Paint Finishes', url: 'https://rocket-league.com/items/paints' },
  { label: 'Wheels', url: 'https://rocket-league.com/items/wheels' },
  { label: 'Rocket Boosts', url: 'https://rocket-league.com/items/boosts' },
  { label: 'Toppers', url: 'https://rocket-league.com/items/toppers' },
  { label: 'Antennas', url: 'https://rocket-league.com/items/antennas' },
  { label: 'Goal Explosions', url: 'https://rocket-league.com/items/explosions' },
  { label: 'Trails', url: 'https://rocket-league.com/items/trails' },
  { label: 'Player Anthems', url: 'https://rocket-league.com/items/anthems' },
  { label: 'Player Banners', url: 'https://rocket-league.com/items/banners' },
  { label: 'Avatar Borders', url: 'https://rocket-league.com/items/borders' },
  { label: 'Engine Audio', url: 'https://rocket-league.com/items/engines' },
  { label: 'Titles', url: 'https://rocket-league.com/items/titles' },
  { label: 'Stickers', url: 'https://rocket-league.com/items/stickers' },
  { label: 'Avatars', url: 'https://rocket-league.com/items/avatars' },
];

const RARITY_COLORS = {
  common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6',
  very_rare: '#a855f7', import: '#f59e0b', exotic: '#ec4899', black_market: '#6b7280',
  limited: '#ef4444', premium: '#fbbf24',
};

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'getItemShop') {
      const cacheKey = 'rl_shop';
      const cached = getCached(cacheKey, CACHE_TTL_SHOP);
      if (cached) return dataResponse(cached, 900);
      const result = { categories: RL_CATEGORIES, cached_at: new Date().toISOString() };
      setCached(cacheKey, result);
      return dataResponse(result, 900);
    }

    if (action === 'getPlayerStats') {
      const platform = PLATFORM_MAP[String(body.platform || 'epic')] || 'epic';
      const gamertag = String(body.gamertag || '').trim();
      if (!gamertag) return Response.json({ error: 'Pseudo requis' }, { status: 400 });

      const cacheKey = `stats:${platform}:${gamertag.toLowerCase()}`;
      const cached = getCached(cacheKey, CACHE_TTL_STATS);
      if (cached) return dataResponse(cached, 300);

      const apiKey = secrets.get('TRN_API_KEY');
      if (!apiKey) {
        return Response.json({
          error: 'Clé API Tracker.gg requise. Configurez TRN_API_KEY dans les secrets de l\'app (dashboard > Secrets).',
          needsKey: true,
        });
      }

      const res = await fetch(
        `https://public-api.tracker.gg/v2/rocket-league/standard/profile/${platform}/${encodeURIComponent(gamertag)}`,
        {
          headers: { 'TRN-Api-Key': apiKey, Accept: 'application/json' },
          signal: AbortSignal.timeout(15000),
        }
      );

      if (res.status === 404) return Response.json({ error: 'Joueur introuvable' });
      if (res.status === 401) return Response.json({ error: 'Clé API invalide' });
      if (res.status === 429) return Response.json({ error: 'Trop de requêtes, réessayez plus tard' });
      if (!res.ok) return Response.json({ error: `Erreur API (${res.status})` });

      const data = await res.json();
      const segments = data.data?.segments || [];

      const profile = {
        platform: data.data?.platformInfo?.platformSlug || platform,
        username: data.data?.platformInfo?.platformUserHandle || gamertag,
        avatar: data.data?.platformInfo?.avatarUrl || null,
        ranks: segments
          .filter(s => s.type === 'RankedSeason')
          .map(s => ({
            playlist: s.metadata?.name || 'Inconnu',
            rank: s.metadata?.rankName || 'Non classé',
            tier: s.metadata?.tierName || '',
            division: s.metadata?.divisionName || '',
            rating: s.stats?.rating?.value || 0,
          })),
        overview: segments.find(s => s.type === 'overview')?.stats || {},
      };

      setCached(cacheKey, profile);
      return dataResponse(profile, 300);
    }

    if (action === 'searchItems') {
      const cacheKey = `items:categories`;
      const cached = getCached(cacheKey, CACHE_TTL_ITEMS);
      if (cached) return dataResponse(cached, 3600);
      const result = { categories: RL_CATEGORIES, total: RL_CATEGORIES.length };
      setCached(cacheKey, result);
      return dataResponse(result, 3600);
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}