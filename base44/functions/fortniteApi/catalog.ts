import { cached, clearCache } from './cache.ts';
import { normalize } from './assets.ts';
import { shopOffers } from './offers.ts';

const HOUR = 60 * 60 * 1000;
const TYPE_ALIASES = { backbling: 'backpack', dance: 'emote', contrail: 'skydive' };
const canonicalType = type => TYPE_ALIASES[type] || type;


async function download(kind) {
  const endpoint = kind === 'shop' ? 'shop' : 'cosmetics/br';
  const response = await fetch(`https://fortnite-api.com/v2/${endpoint}?language=fr`, {
    headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Fortnite-API indisponible (${response.status})`);
  const { data } = await response.json();
  if (kind === 'cosmetics') {
    if (!Array.isArray(data)) throw new Error('Catalogue Fortnite invalide');
    return { items: data.map(normalize), cached_at: new Date().toISOString() };
  }
  if (!Array.isArray(data?.entries)) throw new Error('Boutique Fortnite invalide');
  return { items: shopOffers(data), date: data.date, vbuck_icon: data.vbuckIcon, cached_at: new Date().toISOString() };
}

async function getCatalog(kind) {
  return await cached(`catalog:${kind}`, HOUR, () => download(kind));
}

export { getCatalog };

export async function getCatalogPage(kind, options = {}) {
  const catalog = await getCatalog(kind);
  const page = Math.max(1, Math.floor(Number(options.page) || 1));
  const limit = Math.min(24, Math.max(1, Math.floor(Number(options.limit) || 24)));
  const query = String(options.query || '').trim().toLocaleLowerCase().slice(0, 100);
  const type = canonicalType(String(options.type || 'all'));
  const matches = kind === 'cosmetics' && (query || type !== 'all')
    ? catalog.items.filter(item => (!query || item.name.toLocaleLowerCase().includes(query)) && (type === 'all' || canonicalType(item.type) === type))
    : catalog.items;
  const start = (page - 1) * limit;
  const items = matches.slice(start, start + limit);
  const hasMore = start + items.length < matches.length;
  const result = { total: matches.length, page, limit, has_more: hasMore, next_page: hasMore ? page + 1 : null,
    cached_at: catalog.cached_at, stale: Date.now() - Date.parse(catalog.cached_at) >= HOUR };
  return kind === 'shop' ? { ...result, date: catalog.date, entries: items } : { ...result, items };
}

export function clearCatalogCache() { clearCache(); }