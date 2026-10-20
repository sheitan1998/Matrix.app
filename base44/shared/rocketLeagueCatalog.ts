export type RocketLeagueCategory =
  | 'body'
  | 'wheels'
  | 'decal'
  | 'goalExplosion';

export type RocketLeaguePaintVariant = {
  id: string;
  paint_id: string;
  color_name: string;
  color_hex: string;
  image_url: string | null;
  estimated_credits: number;
  priceEstimated: boolean;
};

export type RocketLeagueCatalogItem = {
  id: string;
  name: string;
  type: string;
  category: RocketLeagueCategory;
  rarity: string;
  image: string | null;
  images: string[];
  price: number;
  priceEstimated: boolean;
  paint: string | null;
  accent: string;
  compatibleBodies: string[];
  variants: RocketLeaguePaintVariant[];
  source: 'epic' | 'community-snapshot' | 'remote';
};

export const ROCKET_LEAGUE_CATEGORY_LABELS: Record<RocketLeagueCategory, string> = {
  body: 'Carrosseries',
  wheels: 'Roues',
  decal: 'Stickers',
  goalExplosion: 'Explosions de but',
};

export const COMMUNITY_CATALOG_VERSION = '3.2.16';
export const COMMUNITY_CATALOG_URL =
  `https://raw.githubusercontent.com/rocketleagueapi/items/v${COMMUNITY_CATALOG_VERSION}/src/parsed/products.json`;

const CATEGORY_BY_SLOT: Record<number, RocketLeagueCategory | undefined> = {
  0: 'body',
  1: 'decal',
  2: 'wheels',
  15: 'goalExplosion',
};

const TYPE_BY_CATEGORY: Record<RocketLeagueCategory, string> = {
  body: 'Carrosserie',
  wheels: 'Roues',
  decal: 'Sticker',
  goalExplosion: 'Explosion de but',
};

const QUALITY_LABELS: Record<number, string> = {
  0: 'Commun',
  1: 'Peu commun',
  2: 'Rare',
  3: 'Très rare',
  4: 'Importé',
  5: 'Exotique',
  6: 'Marché noir',
  7: 'Premium',
  8: 'Limité',
  9: 'Héritage',
};

export const ROCKET_LEAGUE_PAINTS = [
  ['original', 'Original', '#64748b'],
  ['crimson', 'Cramoisi', '#dc2626'],
  ['lime', 'Citron vert', '#84cc16'],
  ['black', 'Noir', '#111827'],
  ['sky-blue', 'Bleu ciel', '#38bdf8'],
  ['cobalt', 'Cobalt', '#2563eb'],
  ['burnt-sienna', 'Terre de Sienne', '#92400e'],
  ['forest-green', 'Vert forêt', '#15803d'],
  ['purple', 'Violet', '#7e22ce'],
  ['pink', 'Rose', '#ec4899'],
  ['orange', 'Orange', '#f97316'],
  ['grey', 'Gris', '#6b7280'],
  ['titanium-white', 'Blanc titane', '#f8fafc'],
  ['saffron', 'Safran', '#eab308'],
  ['gold', 'Or', '#d4a017'],
] as const;
const PAINT_BY_ID = new Map(ROCKET_LEAGUE_PAINTS.map(([id, name, color]) => [id, { name, color }]));

const CATEGORIES = new Set(Object.keys(ROCKET_LEAGUE_CATEGORY_LABELS));
const MAX_ITEMS = 20_000;
const PRICE_RANGES = {
  standard: [100, 200],
  rare: [400, 700],
  import: [800, 1100],
  exotic: [1200, 1600],
  blackMarket: [2000, 2500],
} as const;

function text(value: unknown, fallback = '', maxLength = 200) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : fallback;
}

function safeId(value: unknown, fallback: string) {
  return text(value, fallback, 120).replace(/[^a-zA-Z0-9_-]/g, '-');
}

export function normalizeRocketPaintId(value: unknown) {
  const id = safeId(value, 'original').replace(/^paint-/, '').toLowerCase();
  return `paint-${id || 'original'}`;
}

export function rocketPaintMetadata(value: unknown, name?: unknown, color?: unknown) {
  const paintId = normalizeRocketPaintId(value);
  const known = PAINT_BY_ID.get(paintId.replace(/^paint-/, ''));
  return {
    paintId,
    colorName: text(name, known?.name || 'Original'),
    colorHex: /^#[0-9a-f]{6}$/i.test(String(color || ''))
      ? String(color)
      : known?.color || '#64748b',
  };
}

function normalizedPriceTier(rarity: unknown): keyof typeof PRICE_RANGES {
  const value = String(rarity || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (value.includes('marche noir') || value.includes('black market')) return 'blackMarket';
  if (value.includes('exotique') || value.includes('exotic')) return 'exotic';
  if (value.includes('importe') || value.includes('import')) return 'import';
  if (value.includes('rare')) return 'rare';
  return 'standard';
}

export function estimateRocketLeaguePrice(id: unknown, rarity: unknown) {
  const [minimum, maximum] = PRICE_RANGES[normalizedPriceTier(rarity)];
  let hash = 2166136261;
  for (const character of String(id || 'rocket-league')) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const steps = Math.floor((maximum - minimum) / 100) + 1;
  return minimum + ((hash >>> 0) % steps) * 100;
}

function imageUrls(value: any, allowedImageHosts: ReadonlySet<string>): string[] {
  if (!allowedImageHosts.size) return [];
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
      const url = new URL(candidate);
      return url.protocol === 'https:' && allowedImageHosts.has(url.hostname.toLowerCase());
    } catch {
      return false;
    }
  }))];
}

function compatibleBodies(value: any) {
  const values = value?.compatibleBodies || value?.compatible_bodies || value?.bodies;
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map(candidate => safeId(candidate, '')).filter(Boolean))].slice(0, 100);
}

export function normalizeRocketLeagueCatalogItem(
  value: any,
  index = 0,
  options: {
    allowedImageHosts?: ReadonlySet<string>;
    source?: RocketLeagueCatalogItem['source'];
  } = {},
): RocketLeagueCatalogItem | null {
  if (!value || typeof value !== 'object') return null;
  const rawCategory = text(value.category || value.slotName || value.typeSlug);
  const category = CATEGORIES.has(rawCategory)
    ? rawCategory as RocketLeagueCategory
    : CATEGORY_BY_SLOT[Number(value.slot)] || null;
  const name = text(value.name || value.displayName);
  if (!category || !name) return null;
  const images = imageUrls(value, options.allowedImageHosts || new Set());
  const id = safeId(value.id ?? value.productId ?? value.slug, `${category}-${index}`);
  const rarity = text(value.rarity || value.qualityName, QUALITY_LABELS[Number(value.quality)] || 'Non précisée');
  const providedPrice = Number(value.price);
  const hasProvidedPrice = Number.isFinite(providedPrice) && providedPrice > 0;
  const paintMetadata = rocketPaintMetadata(
    value.paintId || value.paint_id || value.paint || 'original',
    value.paintName || value.color_name || value.paint,
    value.colorHex || value.color_hex || value.accent,
  );
  const price = hasProvidedPrice ? providedPrice : estimateRocketLeaguePrice(id, rarity);
  const variant: RocketLeaguePaintVariant = {
    id: `${id}:${paintMetadata.paintId}`,
    paint_id: paintMetadata.paintId,
    color_name: paintMetadata.colorName,
    color_hex: paintMetadata.colorHex,
    image_url: images[0] || null,
    estimated_credits: price,
    priceEstimated: !hasProvidedPrice,
  };
  return {
    id,
    name,
    type: text(value.type || value.typeName, TYPE_BY_CATEGORY[category]),
    category,
    rarity,
    image: images[0] || null,
    images,
    price,
    priceEstimated: !hasProvidedPrice,
    paint: paintMetadata.colorName,
    accent: paintMetadata.colorHex,
    compatibleBodies: compatibleBodies(value),
    variants: [variant],
    source: options.source || 'remote',
  };
}

function groupCatalogVariants(items: RocketLeagueCatalogItem[]) {
  const groups = new Map<string, RocketLeagueCatalogItem>();
  for (const item of items) {
    const groupKey = `${item.category}:${safeId((item as any).modelId || item.name, item.id).toLowerCase()}`;
    const existing = groups.get(groupKey);
    if (!existing) {
      groups.set(groupKey, item);
      continue;
    }
    const variants = new Map(existing.variants.map(variant => [variant.paint_id, variant]));
    for (const variant of item.variants) {
      const previous = variants.get(variant.paint_id);
      if (!previous || (!previous.image_url && variant.image_url)) variants.set(variant.paint_id, variant);
    }
    existing.variants = [...variants.values()];
    const original = existing.variants.find(variant => variant.paint_id === 'paint-original')
      || existing.variants[0];
    existing.image = original?.image_url || existing.image;
    existing.images = [...new Set(existing.variants.map(variant => variant.image_url).filter(Boolean))] as string[];
  }
  return [...groups.values()];
}

export function normalizeRocketLeagueCatalogPayload(
  payload: unknown,
  options: {
    allowedImageHosts?: ReadonlySet<string>;
    source?: RocketLeagueCatalogItem['source'];
  } = {},
) {
  const source = options.source || 'remote';
  const candidate = payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload as any).items || (payload as any).data || (payload as any).products || payload
    : payload;
  const entries = Array.isArray(candidate)
    ? candidate.map((value, index) => [index, value] as const)
    : candidate && typeof candidate === 'object'
      ? Object.entries(candidate)
      : [];
  if (!entries.length || entries.length > MAX_ITEMS) return [];
  const items = entries
    .map(([key, value], index) => normalizeRocketLeagueCatalogItem(
      value && typeof value === 'object' && !Array.isArray(value)
        ? { id: (value as any).id ?? key, ...value }
        : value,
      index,
      { ...options, source },
    ))
    .filter((value): value is RocketLeagueCatalogItem => Boolean(value));
  return groupCatalogVariants(items);
}

export function paginateRocketLeagueCatalog(
  items: readonly RocketLeagueCatalogItem[],
  pageValue: unknown,
  limitValue: unknown,
) {
  const page = Math.max(1, Math.min(1000, Number(pageValue) || 1));
  const limit = Math.max(1, Math.min(5000, Number(limitValue) || 1000));
  const offset = (page - 1) * limit;
  return {
    items: items.slice(offset, offset + limit),
    page,
    limit,
    total: items.length,
    hasMore: offset + limit < items.length,
  };
}
