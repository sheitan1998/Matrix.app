import { waitUntil } from 'base44:runtime';

const HOUR = 60 * 60 * 1000;
const catalogs = new Map();
const BR_TYPES = new Set(['outfit', 'pickaxe', 'backpack', 'backbling', 'emote', 'dance', 'glider']);
const TYPE_ALIASES = { backbling: 'backpack', dance: 'emote', contrail: 'skydive' };
const canonicalType = type => TYPE_ALIASES[type] || type;

function normalize(item) {
  const images = item.images || {};
  return {
    id: item.id, name: item.name || 'Inconnu', description: item.description || '',
    type: item.type?.value || item.type || 'item', rarity: item.rarity?.value || 'common',
    image: images.featured || images.icon || images.smallIcon || null,
    images: { featured: images.featured || null, icon: images.icon || null, smallIcon: images.smallIcon || null, animated: images.animated || null },
    video: item.video || null, audio: item.audio || null, series: item.series?.value || item.set?.value || null,
    set_display: item.set?.displayValue || item.set?.text || item.series?.value || null,
    rarity_display: item.rarity?.displayValue || item.rarity?.value || 'Common',
    added: item.added?.date || item.added || null,
    season: item.introduction?.chapter?.season || null,
    chapter: item.introduction?.chapter?.number || item.introduction?.number || null,
  };
}

async function download(kind) {
  const endpoint = kind === 'shop' ? 'shop' : 'cosmetics/br';
  const response = await fetch(`https://fortnite-api.com/v2/${endpoint}`, {
    headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Fortnite-API indisponible (${response.status})`);
  const { data } = await response.json();
  if (kind === 'cosmetics') {
    if (!Array.isArray(data)) throw new Error('Catalogue Fortnite invalide');
    return { items: data.map(normalize), cached_at: new Date().toISOString() };
  }
  if (!Array.isArray(data?.entries)) throw new Error('Boutique Fortnite invalide');
  const items = [];
  for (const entry of data.entries) {
    for (const item of entry.brItems || []) {
      if (!BR_TYPES.has(item.type?.value || item.type)) continue;
      items.push({ ...normalize(item), price: entry.finalPrice ?? entry.regularPrice ?? 0,
        offer_id: entry.offerId || item.id, layout: entry.layout?.name || null });
    }
  }
  return { items, date: data.date, cached_at: new Date().toISOString() };
}

async function getCatalog(kind) {
  let state = catalogs.get(kind);
  if (!state) { state = { data: null, nextRefresh: 0, pending: null, error: null }; catalogs.set(kind, state); }
  if (Date.now() >= state.nextRefresh && !state.pending) {
    state.nextRefresh = Date.now() + HOUR;
    state.pending = download(kind).then(data => { state.data = data; state.error = null; return data; })
      .catch(error => { state.error = error; throw error; }).finally(() => { state.pending = null; });
  }
  if (state.data) {
    if (state.pending) waitUntil(state.pending.catch(error => console.warn('Fortnite cache refresh:', error.message)));
    return state.data;
  }
  if (state.pending) return await state.pending;
  throw state.error || new Error('Catalogue temporairement indisponible');
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

export function clearCatalogCache() { catalogs.clear(); }