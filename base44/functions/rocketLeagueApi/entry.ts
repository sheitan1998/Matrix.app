import { secrets } from 'base44:runtime';
import { createApiCache, dataResponse } from "../../shared/apiCache.ts";
import { normalizeRocketRanks } from "../../shared/rocketLeagueData.ts";

const CACHE_TTL_SHOP = 15 * 60 * 1000;
const CACHE_TTL_STATS = 5 * 60 * 1000;
const { getCached, setCached } = createApiCache(80);

const PLATFORM_MAP = { epic: 'epic', steam: 'steam', psn: 'psn', xbox: 'xbl' };

const GARAGE_CATEGORIES = ['body', 'decal', 'wheels', 'goalExplosion'];

function text(value) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value.name === 'string') return value.name.trim();
  return '';
}

function safeImage(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function garageCategory(type) {
  const normalized = type.toLowerCase();
  if (/body|car|chassis|châssis/.test(normalized)) return 'body';
  if (/decal|sticker/.test(normalized)) return 'decal';
  if (/wheel|roue/.test(normalized)) return 'wheels';
  if (/goal.*explosion|explosion.*but/.test(normalized)) return 'goalExplosion';
  return null;
}

function normalizeOffer(offer, index) {
  const item = offer?.item || offer;
  if (!item || !text(item.name)) return null;
  const type = text(item.type) || 'Objet';
  const image = safeImage(
    item.imageUrl
      || (typeof item.image === 'string' ? item.image : item.image?.url)
      || item.iconUrl,
  );
  return {
    id: String(item.id || item.slug || `${text(item.name)}-${index}`),
    name: text(item.name),
    type,
    category: garageCategory(type),
    rarity: text(item.rarity),
    image,
    price: Number.isFinite(offer?.price?.amount)
      ? offer.price.amount
      : Number.isFinite(offer?.price) ? offer.price : null,
    paint: text(item.paint || offer?.paint) || null,
    source: 'tracker',
  };
}

async function fetchTrackerCatalog() {
  const cached = getCached('rl_tracker_catalog_v4', CACHE_TTL_SHOP);
  if (cached) return cached;

  const apiKey = secrets.get('TRN_API_KEY');
  if (!apiKey) {
    throw new Error('Le catalogue Rocket League n’est pas configuré sur ce déploiement.');
  }

  const response = await fetch(
    'https://public-api.tracker.gg/v2/rocket-league/standard/items/shop',
    {
      headers: { 'TRN-Api-Key': apiKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!response.ok) {
    throw new Error(`Tracker Network ne peut pas fournir le catalogue (${response.status}).`);
  }

  const payload = await response.json();
  const offers = payload.data?.items || payload.items;
  if (!Array.isArray(offers)) {
    throw new Error('Tracker Network a renvoyé un catalogue illisible.');
  }

  const items = offers.map(normalizeOffer).filter(Boolean);
  const garage = Object.fromEntries(
    GARAGE_CATEGORIES.map(category => [
      category,
      items.filter(item => item.category === category && item.image),
    ]),
  );
  const result = {
    items,
    garage,
    source: 'tracker',
    fetchedAt: new Date().toISOString(),
  };
  setCached('rl_tracker_catalog_v4', result);
  return result;
}

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'getItemShop' || action === 'getGarageCatalog' || action === 'searchItems') {
      try {
        return dataResponse(await fetchTrackerCatalog(), 900);
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : 'Catalogue Rocket League indisponible.' },
          { status: 503 },
        );
      }
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

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}