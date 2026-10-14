import { secrets } from 'base44:runtime';
import { createApiCache, dataResponse } from "../../shared/apiCache.ts";
import { rocketFallback, normalizeRocketRanks } from "../../shared/rocketLeagueData.ts";
import { rocketAsset, rocketHdAsset, getRocketItemDetails } from "../../shared/rocketItemAssets.ts";

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
      const cacheKey = 'rl_shop_items_native_v3';
      const cached = getCached(cacheKey, CACHE_TTL_SHOP);
      if (cached) return dataResponse(cached, 900);
      const fallback = { items: rocketFallback.map(item=>({...item,img:rocketAsset(item.id),hdImg:rocketHdAsset(item.id)})), source: 'reference', message: 'Catalogue natif : disponibilité du jour non confirmée.', cached_at: new Date().toISOString() };
      const apiKey = secrets.get('TRN_API_KEY');
      if (!apiKey) return dataResponse(fallback, 60);
      try {
        const res = await fetch('https://public-api.tracker.gg/v2/rocket-league/standard/items/shop', { headers: { 'TRN-Api-Key': apiKey, Accept: 'application/json' }, signal: AbortSignal.timeout(4000) });
        if (!res.ok) return dataResponse({ ...fallback, upstream_status: res.status }, 60);
        const payload = await res.json();
        const offers = payload.data?.items || payload.items;
        if (!Array.isArray(offers) || !offers.length) return dataResponse(fallback, 60);
        const items = offers.filter(i => i.name || i.item?.name).map((offer,index) => { const item = offer.item || offer; return { id: String(item.id || index), name: item.name, type: item.type?.name || item.type || 'Objet', rarity: item.rarity?.name || item.rarity || '', img: item.imageUrl || item.image || item.iconUrl || null, price: offer.price?.amount ?? (typeof offer.price === 'number' ? offer.price : null), source: 'live', url: 'https://rocket-league.com/items' }; });
        if (!items.length) return dataResponse(fallback, 60);
        const result = { items, categories: RL_CATEGORIES, source: 'live', cached_at: new Date().toISOString() };
        setCached(cacheKey, result);
        return dataResponse(result, 900);
      } catch { return dataResponse(fallback, 60); }
    }

    if (action === 'getItemDetails') {
      const item = rocketFallback.find(item=>item.id===String(body.id));
      if (!item) return Response.json({error:'Objet introuvable.'},{status:404});
      const cached = getCached(`native-item-hd:${item.id}`,CACHE_TTL_ITEMS);
      if (cached) return dataResponse(cached);
      const details = await getRocketItemDetails(item);
      setCached(`native-item-hd:${item.id}`,details);
      return dataResponse(details);
    }

    if (action === 'getPlayerStats') {
      const platform = PLATFORM_MAP[String(body.platform || 'epic')] || 'epic';
      const gamertag = String(body.gamertag || '').trim().slice(0, 100);
      if (!gamertag) return Response.json({ error: 'Pseudo requis' }, { status: 400 });

      const cacheKey = `stats:${platform}:${gamertag.toLowerCase()}`;
      const cached = getCached(cacheKey, CACHE_TTL_STATS);
      if (cached) return dataResponse(cached, 300);

      const apiKey = secrets.get('TRN_API_KEY');
      if (!apiKey) {
        return Response.json({ error: 'Le service Tracker Network n’est pas encore disponible.' });
      }

      const res = await fetch(
        `https://public-api.tracker.gg/v2/rocket-league/standard/profile/${platform}/${encodeURIComponent(gamertag)}`,
        {
          headers: { 'TRN-Api-Key': apiKey, Accept: 'application/json' },
          signal: AbortSignal.timeout(15000),
        }
      );

      if (res.status === 404) return Response.json({ error: 'Joueur introuvable' });
      if (res.status === 401 || res.status === 403) return Response.json({ error: 'Tracker Network refuse actuellement l’accès à ces statistiques. Aucun rang fictif n’est affiché.' });
      if (res.status === 429) return Response.json({ error: 'Trop de requêtes, réessayez plus tard' });
      if (!res.ok) return Response.json({ error: `Erreur API (${res.status})` });

      const data = await res.json();
      if (!data.data?.platformInfo) return Response.json({ error: 'Profil introuvable ou privé.' });
      const segments = data.data?.segments || [];

      const profile = {
        platform: data.data?.platformInfo?.platformSlug || platform,
        username: data.data?.platformInfo?.platformUserHandle || gamertag,
        avatar: data.data?.platformInfo?.avatarUrl || null,
        ranks: normalizeRocketRanks(segments),
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