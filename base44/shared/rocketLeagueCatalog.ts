export type RocketLeagueCategory =
  | 'body'
  | 'paint'
  | 'finish'
  | 'wheels'
  | 'decal'
  | 'goalExplosion';

export type RocketLeagueCatalogItem = {
  id: string;
  name: string;
  type: string;
  category: RocketLeagueCategory;
  rarity: string;
  image: string | null;
  images?: string[];
  price: number;
  paint: string | null;
  accent: string;
  source: 'local' | 'api';
};

const item = (
  id: string,
  name: string,
  type: string,
  category: RocketLeagueCategory,
  rarity: string,
  price: number,
  accent: string,
): RocketLeagueCatalogItem => ({
  id,
  name,
  type,
  category,
  rarity,
  image: null,
  price,
  paint: null,
  accent,
  source: 'local',
});

export const ROCKET_LEAGUE_CATEGORY_LABELS: Record<RocketLeagueCategory, string> = {
  body: 'Carrosseries',
  paint: 'Peintures',
  finish: 'Finitions',
  wheels: 'Roues',
  decal: 'Stickers',
  goalExplosion: 'Explosions de but',
};

export const LOCAL_ROCKET_LEAGUE_ITEMS: readonly RocketLeagueCatalogItem[] = Object.freeze([
  item('body-octane', 'Octane', 'Carrosserie', 'body', 'Importé', 700, '#f97316'),
  item('body-fennec', 'Fennec', 'Carrosserie', 'body', 'Importé', 700, '#06b6d4'),
  item('body-dominus', 'Dominus', 'Carrosserie', 'body', 'Premium', 500, '#8b5cf6'),
  item('body-breakout', 'Breakout', 'Carrosserie', 'body', 'Très rare', 400, '#3b82f6'),
  item('body-merc', 'Merc', 'Carrosserie', 'body', 'Très rare', 400, '#22c55e'),
  item('body-endo', 'Endo', 'Carrosserie', 'body', 'Importé', 700, '#ec4899'),
  item('paint-original', 'Original', 'Peinture', 'paint', 'Standard', 0, '#64748b'),
  item('paint-titanium-white', 'Blanc titane', 'Peinture', 'paint', 'Peint', 800, '#f8fafc'),
  item('paint-crimson', 'Cramoisi', 'Peinture', 'paint', 'Peint', 600, '#dc2626'),
  item('paint-cobalt', 'Cobalt', 'Peinture', 'paint', 'Peint', 600, '#2563eb'),
  item('paint-forest-green', 'Vert forêt', 'Peinture', 'paint', 'Peint', 600, '#15803d'),
  item('paint-saffron', 'Safran', 'Peinture', 'paint', 'Peint', 600, '#eab308'),
  item('finish-anodized-pearl', 'Anodized Pearl', 'Finition', 'finish', 'Très rare', 200, '#c4b5fd'),
  item('finish-matte', 'Matte', 'Finition', 'finish', 'Rare', 100, '#475569'),
  item('finish-pearlescent', 'Pearlescent', 'Finition', 'finish', 'Rare', 100, '#67e8f9'),
  item('finish-metallic-flake', 'Metallic Flake', 'Finition', 'finish', 'Rare', 100, '#fbbf24'),
  item('wheels-zomba', 'Zomba', 'Roues', 'wheels', 'Exotique', 900, '#a855f7'),
  item('wheels-draco', 'Draco', 'Roues', 'wheels', 'Exotique', 900, '#ef4444'),
  item('wheels-cristianos', 'Cristianos', 'Roues', 'wheels', 'Très rare', 400, '#111827'),
  item('wheels-dieci', 'Dieci', 'Roues', 'wheels', 'Commun', 200, '#f59e0b'),
  item('wheels-reaper', 'Reaper', 'Roues', 'wheels', 'Très rare', 400, '#94a3b8'),
  item('wheels-oem', 'OEM', 'Roues', 'wheels', 'Commun', 200, '#0ea5e9'),
  item('decal-mainframe', 'Mainframe', 'Sticker', 'decal', 'Marché noir', 2000, '#7c3aed'),
  item('decal-dissolver', 'Dissolver', 'Sticker', 'decal', 'Marché noir', 2000, '#06b6d4'),
  item('decal-interstellar', 'Interstellar', 'Sticker', 'decal', 'Marché noir', 2000, '#4f46e5'),
  item('decal-heatwave', 'Heatwave', 'Sticker', 'decal', 'Marché noir', 2000, '#f97316'),
  item('decal-20xx', '20XX', 'Sticker', 'decal', 'Marché noir', 2000, '#ec4899'),
  item('decal-storm-watch', 'Storm Watch', 'Sticker', 'decal', 'Marché noir', 2000, '#0ea5e9'),
  item('goal-dueling-dragons', 'Dueling Dragons', 'Explosion de but', 'goalExplosion', 'Marché noir', 2000, '#ef4444'),
  item('goal-hellfire', 'Hellfire', 'Explosion de but', 'goalExplosion', 'Marché noir', 2000, '#f97316'),
  item('goal-shattered', 'Shattered', 'Explosion de but', 'goalExplosion', 'Marché noir', 2000, '#a855f7'),
  item('goal-big-splash', 'Big Splash', 'Explosion de but', 'goalExplosion', 'Limitée', 800, '#0ea5e9'),
  item('goal-atomizer', 'Atomizer', 'Explosion de but', 'goalExplosion', 'Marché noir', 2000, '#22c55e'),
  item('goal-party-time', 'Party Time', 'Explosion de but', 'goalExplosion', 'Marché noir', 2000, '#eab308'),
]);

export function getLocalRocketLeagueCatalog() {
  const garage = Object.fromEntries(
    Object.keys(ROCKET_LEAGUE_CATEGORY_LABELS).map(category => [
      category,
      LOCAL_ROCKET_LEAGUE_ITEMS.filter(candidate => candidate.category === category),
    ]),
  ) as Record<RocketLeagueCategory, RocketLeagueCatalogItem[]>;

  return {
    items: [...LOCAL_ROCKET_LEAGUE_ITEMS],
    garage,
    source: 'local' as const,
    fetchedAt: null,
  };
}

const CATEGORIES = new Set(Object.keys(ROCKET_LEAGUE_CATEGORY_LABELS));

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, 200) : fallback;
}

function imageUrls(value: any): string[] {
  const values = [
    value?.imageHd,
    value?.image_hd,
    value?.imageUrl,
    value?.image,
    value?.thumbnail,
    ...(Array.isArray(value?.images) ? value.images : []),
  ];
  return [...new Set(values.filter((candidate): candidate is string => {
    if (typeof candidate !== 'string') return false;
    try {
      return new URL(candidate).protocol === 'https:';
    } catch {
      return false;
    }
  }))];
}

export function normalizeRocketLeagueCatalogItem(value: any, index = 0): RocketLeagueCatalogItem | null {
  if (!value || typeof value !== 'object') return null;
  const rawCategory = text(value.category || value.slot || value.typeSlug);
  const category = CATEGORIES.has(rawCategory) ? rawCategory as RocketLeagueCategory : null;
  const name = text(value.name || value.displayName);
  if (!category || !name) return null;
  const images = imageUrls(value);
  const rawId = text(value.id || value.slug, `${category}-${index}`);
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  return {
    id,
    name,
    type: text(value.type || value.typeName, ROCKET_LEAGUE_CATEGORY_LABELS[category]),
    category,
    rarity: text(value.rarity || value.quality, 'Non précisée'),
    image: images[0] || null,
    images,
    price: Number.isFinite(Number(value.price)) ? Math.max(0, Number(value.price)) : 0,
    paint: text(value.paint || value.paintName) || null,
    accent: /^#[0-9a-f]{6}$/i.test(value.accent) ? value.accent : '#334155',
    source: 'api',
  };
}

export function paginateRocketLeagueCatalog(items: readonly RocketLeagueCatalogItem[], pageValue: unknown, limitValue: unknown) {
  const page = Math.max(1, Math.min(1000, Number(pageValue) || 1));
  const limit = Math.max(1, Math.min(100, Number(limitValue) || 60));
  const offset = (page - 1) * limit;
  return {
    items: items.slice(offset, offset + limit),
    page,
    limit,
    total: items.length,
    hasMore: offset + limit < items.length,
  };
}
