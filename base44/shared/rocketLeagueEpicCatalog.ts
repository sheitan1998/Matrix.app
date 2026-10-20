import {
  estimateRocketLeaguePrice,
  normalizeRocketPaintId,
  rocketPaintMetadata,
  type RocketLeagueCatalogItem,
  type RocketLeagueCategory,
  type RocketLeaguePaintVariant,
} from './rocketLeagueCatalog.ts';

export interface EpicRocketLeagueRawVariant {
  id?: string | number;
  paint_id?: string;
  color_name?: string;
  color_hex?: string;
  image_url?: string | null;
  thumbnail_url?: string | null;
  render_url?: string | null;
  credits?: number | null;
}

export interface EpicRocketLeagueRawDefinition {
  id: string | number;
  model_id?: string | number;
  model_name?: string;
  name: string;
  category: RocketLeagueCategory;
  rarity?: string;
  image_url?: string | null;
  thumbnail_url?: string | null;
  render_url?: string | null;
  credits?: number | null;
  compatible_bodies?: Array<string | number>;
  paint_id?: string;
  color_name?: string;
  color_hex?: string;
  variants?: EpicRocketLeagueRawVariant[];
}

export interface EpicRocketLeagueRawResponse {
  definitions?: EpicRocketLeagueRawDefinition[];
  items?: EpicRocketLeagueRawDefinition[];
  data?: EpicRocketLeagueRawDefinition[];
}

export interface RocketLeagueVehicleModel extends RocketLeagueCatalogItem {
  variants: RocketLeaguePaintVariant[];
}

const MAX_EPIC_CATALOG_BYTES = 8 * 1024 * 1024;

export class EpicCatalogError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'EpicCatalogError';
    this.code = code;
    this.status = status;
  }
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, 200) : fallback;
}

function safeId(value: unknown, fallback: string) {
  return safeText(String(value ?? ''), fallback).replace(/[^a-zA-Z0-9_-]/g, '-');
}

function officialImage(
  value: EpicRocketLeagueRawDefinition | EpicRocketLeagueRawVariant,
  allowedImageHosts: ReadonlySet<string>,
) {
  for (const candidate of [value.render_url, value.image_url, value.thumbnail_url]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === 'https:' && allowedImageHosts.has(url.hostname.toLowerCase())) {
        return url.href;
      }
    } catch {
      continue;
    }
  }
  return null;
}

function normalizedVariant(
  definition: EpicRocketLeagueRawDefinition,
  value: EpicRocketLeagueRawVariant,
  allowedImageHosts: ReadonlySet<string>,
): RocketLeaguePaintVariant {
  const paint = rocketPaintMetadata(
    value.paint_id || definition.paint_id || 'original',
    value.color_name || definition.color_name,
    value.color_hex || definition.color_hex,
  );
  const variantId = safeId(value.id, `${definition.id}-${paint.paintId}`);
  const suppliedPrice = Number(value.credits ?? definition.credits);
  const hasOfficialPrice = Number.isFinite(suppliedPrice) && suppliedPrice > 0;
  return {
    id: variantId,
    paint_id: normalizeRocketPaintId(paint.paintId),
    color_name: paint.colorName,
    color_hex: paint.colorHex,
    image_url: officialImage(value, allowedImageHosts) || officialImage(definition, allowedImageHosts),
    estimated_credits: hasOfficialPrice
      ? suppliedPrice
      : estimateRocketLeaguePrice(variantId, definition.rarity),
    priceEstimated: !hasOfficialPrice,
  };
}

export function mapEpicRocketLeagueCatalog(
  payload: EpicRocketLeagueRawResponse | EpicRocketLeagueRawDefinition[],
  allowedImageHosts: ReadonlySet<string>,
): RocketLeagueVehicleModel[] {
  const definitions = Array.isArray(payload)
    ? payload
    : payload.definitions || payload.items || payload.data || [];
  const groups = new Map<string, RocketLeagueVehicleModel>();
  definitions.forEach((definition, index) => {
    if (!definition || typeof definition !== 'object') return;
    const category = definition.category;
    if (!['body', 'wheels', 'decal', 'goalExplosion'].includes(category)) return;
    const modelId = safeId(definition.model_id ?? definition.id, `${category}-${index}`);
    const modelName = safeText(definition.model_name || definition.name);
    if (!modelName) return;
    const rawVariants = definition.variants?.length ? definition.variants : [definition];
    const variantsByPaint = new Map<string, RocketLeaguePaintVariant>();
    for (const value of rawVariants) {
      const variant = normalizedVariant(definition, value, allowedImageHosts);
      const previous = variantsByPaint.get(variant.paint_id);
      if (!previous || (!previous.image_url && variant.image_url)) {
        variantsByPaint.set(variant.paint_id, variant);
      }
    }
    const variants = [...variantsByPaint.values()];
    const key = `${category}:${modelId}`;
    const existing = groups.get(key);
    if (!existing) {
      const primary = variants.find(variant => variant.paint_id === 'paint-original') || variants[0];
      groups.set(key, {
        id: modelId,
        name: modelName,
        type: category === 'body' ? 'Carrosserie'
          : category === 'wheels' ? 'Roues'
            : category === 'decal' ? 'Sticker' : 'Explosion de but',
        category,
        rarity: safeText(definition.rarity, 'Non précisée'),
        image: primary?.image_url || null,
        images: [...new Set(variants.map(variant => variant.image_url).filter(Boolean))] as string[],
        price: primary?.estimated_credits || estimateRocketLeaguePrice(modelId, definition.rarity),
        priceEstimated: primary?.priceEstimated ?? true,
        paint: primary?.color_name || 'Original',
        accent: primary?.color_hex || '#64748b',
        compatibleBodies: [...new Set((definition.compatible_bodies || []).map(String))],
        variants,
        source: 'epic',
      });
      return;
    }
    const byPaint = new Map(existing.variants.map(variant => [variant.paint_id, variant]));
    for (const variant of variants) {
      const previous = byPaint.get(variant.paint_id);
      if (!previous || (!previous.image_url && variant.image_url)) byPaint.set(variant.paint_id, variant);
    }
    existing.variants = [...byPaint.values()];
    existing.images = [...new Set(existing.variants.map(variant => variant.image_url).filter(Boolean))] as string[];
  });
  return [...groups.values()];
}

export async function requestEpicRocketLeagueCatalog({
  endpoint,
  accessToken,
  allowedImageHosts,
  fetchImpl = fetch,
  timeoutMs = 15_000,
}: {
  endpoint?: string;
  accessToken?: string;
  allowedImageHosts: ReadonlySet<string>;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}) {
  if (!endpoint || !accessToken) {
    throw new EpicCatalogError(
      'epic_not_configured',
      'Le catalogue Epic Rocket League partenaire n’est pas configuré.',
      503,
    );
  }
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new EpicCatalogError('epic_url_invalid', 'URL du catalogue Epic invalide.', 503);
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) {
    throw new EpicCatalogError('epic_url_invalid', 'URL du catalogue Epic invalide.', 503);
  }
  let response: Response;
  try {
    response = await fetchImpl(url, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const timeout = error instanceof DOMException && error.name === 'TimeoutError';
    throw new EpicCatalogError(
      timeout ? 'epic_timeout' : 'epic_unavailable',
      timeout ? 'Le catalogue Epic ne répond pas.' : 'Le catalogue Epic est indisponible.',
      timeout ? 504 : 502,
    );
  }
  if (response.status === 401 || response.status === 403) {
    throw new EpicCatalogError('epic_auth_failed', 'Accès au catalogue Epic refusé.', 503);
  }
  if (response.status === 429) {
    throw new EpicCatalogError('epic_rate_limited', 'Le catalogue Epic limite les requêtes.', 429);
  }
  if (!response.ok) {
    throw new EpicCatalogError('epic_upstream_error', 'Le catalogue Epic est indisponible.', 502);
  }
  const declaredSize = Number(response.headers.get('content-length') || 0);
  if (declaredSize > MAX_EPIC_CATALOG_BYTES) {
    throw new EpicCatalogError('epic_too_large', 'Le catalogue Epic dépasse 8 Mio.', 502);
  }
  const rawPayload = await response.text();
  if (rawPayload.length > MAX_EPIC_CATALOG_BYTES) {
    throw new EpicCatalogError('epic_too_large', 'Le catalogue Epic dépasse 8 Mio.', 502);
  }
  const payload = (() => {
    try {
      return JSON.parse(rawPayload);
    } catch {
      throw new EpicCatalogError('epic_malformed', 'Réponse Epic inutilisable.', 502);
    }
  })();
  const items = mapEpicRocketLeagueCatalog(payload, allowedImageHosts);
  if (!items.length) throw new EpicCatalogError('epic_empty', 'Le catalogue Epic est vide.', 502);
  return items;
}
