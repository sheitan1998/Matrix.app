import { secrets } from 'base44:runtime';
import { createApiCache, dataResponse } from "../../shared/apiCache.ts";

const CACHE_TTL_SHOP = 15 * 60 * 1000;
const CACHE_TTL_STATS = 5 * 60 * 1000;
const CACHE_TTL_ITEMS = 60 * 60 * 1000;
const { getCached, setCached } = createApiCache(80);

const PLATFORM_MAP = { epic: 'epic', steam: 'steam', psn: 'psn', xbox: 'xbl' };

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

      const res = await fetch('https://rocket-league.com/items/shop', {
        headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`RL Garage (${res.status})`);
      const html = await res.text();

      // Parse item shop HTML — extract item cards
      const items = [];
      const cardRegex = /data-name="([^"]*)"[^>]*data-rarity="([^"]*)"[^>]*data-price="([^"]*)"[^>]*data-img="([^"]*)"/gi;
      let match;
      while ((match = cardRegex.exec(html)) !== null) {
        items.push({
          name: match[1],
          rarity: match[2],
          price: Number(match[3]) || 0,
          img: match[4],
          rarityColor: RARITY_COLORS[match[2]] || '#9ca3af',
        });
      }

      // Fallback: try alternative parsing if no items found
      if (items.length === 0) {
        const imgRegex = /<img[^>]*src="(https:\/\/cdn\.rocketleague\.com\/[^"]*)"[^>]*alt="([^"]*)"/gi;
        while ((match = imgRegex.exec(html)) !== null) {
          items.push({
            name: match[2],
            rarity: 'common',
            price: 0,
            img: match[1],
            rarityColor: '#9ca3af',
          });
        }
      }

      const result = { items: items.slice(0, 24), total: items.length, cached_at: new Date().toISOString() };
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
      const limit = Math.min(24, Math.max(1, Number(body.limit) || 24));
      const page = Math.max(1, Number(body.page) || 1);
      const search = String(body.search || '').trim().slice(0, 100);
      const rarity = String(body.rarity || 'all');

      const cacheKey = `items:${search}:${rarity}:${page}:${limit}`;
      const cached = getCached(cacheKey, CACHE_TTL_ITEMS);
      if (cached) return dataResponse(cached, 3600);

      const res = await fetch('https://rocketleague.com/items', {
        headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`RL Garage (${res.status})`);
      const html = await res.text();

      const allItems = [];
      const cardRegex = /data-name="([^"]*)"[^>]*data-rarity="([^"]*)"[^>]*data-type="([^"]*)"[^>]*data-img="([^"]*)"/gi;
      let match;
      while ((match = cardRegex.exec(html)) !== null) {
        allItems.push({
          name: match[1],
          rarity: match[2],
          type: match[3],
          img: match[4],
          rarityColor: RARITY_COLORS[match[2]] || '#9ca3af',
        });
      }

      let filtered = allItems;
      if (search) filtered = filtered.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
      if (rarity !== 'all') filtered = filtered.filter(i => i.rarity === rarity);

      const start = (page - 1) * limit;
      const result = {
        items: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        has_more: start + limit < filtered.length,
      };
      setCached(cacheKey, result);
      return dataResponse(result, 3600);
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}