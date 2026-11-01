import { createApiCache } from './apiCache.ts';
import { parseCatalogPage, hasNextCatalogPage } from './farmingCatalog.ts';
import { FARMING_CATALOG_CATEGORIES, ALLOWED_MODHUB_FILTERS } from './farmingCategories.ts';
const { getCached, setCached } = createApiCache(150);

export async function getFarmingCatalogPage({ category = 'all', search = '', cursor = null, page = 1, filter } = {}) {
  const definition = FARMING_CATALOG_CATEGORIES.find(item => item.id === category);
  if (category !== 'all' && !definition) throw new Error('Catégorie ModHub inconnue.');
  const filters = definition?.filters || [filter || 'latest'];
  let filterIndex = Number(cursor?.filterIndex ?? 0);
  let pageNumber = Number(cursor?.page ?? page);
  if (!Number.isInteger(filterIndex) || filterIndex < 0 || filterIndex >= filters.length || !Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 10000) throw new Error('Pagination ModHub invalide.');
  const query = String(search).trim().slice(0, 120);
  const normalize = value => String(value).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr');
  let scanned = 0;
  while (filterIndex < filters.length) {
    const selectedFilter = filters[filterIndex];
    if (!ALLOWED_MODHUB_FILTERS.has(selectedFilter)) throw new Error('Filtre ModHub non autorisé.');
    const key = JSON.stringify([category, selectedFilter, pageNumber, query]);
    let parsed = getCached(key, 3600000);
    if (!parsed) {
      const url = new URL('https://www.farming-simulator.com/mods.php');
      url.search = new URLSearchParams({ title: 'fs2025', lang: 'en', filter: selectedFilter, page: String(pageNumber - 1), ...(query && category === 'all' ? { searchMod: query } : {}) }).toString();
      const response = await fetch(url, { headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`ModHub temporairement indisponible (${response.status}).`);
      const html = await response.text();
      if (!html.includes('mod-item') && !/mod-search|Search Mods/i.test(html)) throw new Error('Réponse ModHub invalide.');
      parsed = { items: parseCatalogPage(html, category), hasMore: hasNextCatalogPage(html, pageNumber) };
      setCached(key, parsed);
    }
    const nextCursor = parsed.hasMore ? { filterIndex, page: pageNumber + 1 } : filterIndex + 1 < filters.length ? { filterIndex: filterIndex + 1, page: 1 } : null;
    // ModHub's searchMod overrides its category filter: scope category searches here instead.
    const items = query && category !== 'all' ? parsed.items.filter(item => normalize(`${item.title} ${item.author}`).includes(normalize(query))) : parsed.items;
    scanned += 1;
    if (items.length || !nextCursor || scanned >= 6) return { items: items.map(item => ({ ...item, category: definition?.label || '', officialFilter: selectedFilter })), page: pageNumber, nextCursor, has_more: Boolean(nextCursor), source: 'live' };
    filterIndex = nextCursor.filterIndex;
    pageNumber = nextCursor.page;
  }
  return { items: [], nextCursor: null, has_more: false, source: 'live' };
}