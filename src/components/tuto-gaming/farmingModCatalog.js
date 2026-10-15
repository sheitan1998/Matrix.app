const CATALOG_CACHE_KEY = 'matrix.fs25.modhub.catalog.v1';
const CATALOG_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export function isValidFarmingModId(value) {
  return /^\d{1,10}$/.test(String(value || ''));
}

export function farmingModShareUrl(modId, origin = globalThis.location?.origin) {
  if (!isValidFarmingModId(modId) || !origin) return null;
  const url = new URL('/farming', origin);
  url.searchParams.set('mod', String(modId));
  return url.href;
}

export function farmingSearchWithMod(search, modId) {
  if (!isValidFarmingModId(modId)) return search || '';
  const params = new URLSearchParams(search);
  params.set('mod', String(modId));
  return `?${params.toString()}`;
}

export function farmingSearchWithoutMod(search) {
  const params = new URLSearchParams(search);
  params.delete('mod');
  const value = params.toString();
  return value ? `?${value}` : '';
}

export function readCachedFarmingCatalog(storage = globalThis.localStorage, now = Date.now()) {
  try {
    const cached = JSON.parse(storage?.getItem(CATALOG_CACHE_KEY) || 'null');
    if (!cached?.savedAt || now - cached.savedAt > CATALOG_CACHE_MAX_AGE) return null;
    if (!cached.data?.categories?.some(category => category.items?.length)) return null;
    return cached.data;
  } catch {
    return null;
  }
}

export function cacheFarmingCatalog(data, storage = globalThis.localStorage, now = Date.now()) {
  if (!data?.categories?.some(category => category.items?.length)) return false;
  try {
    storage?.setItem(CATALOG_CACHE_KEY, JSON.stringify({ savedAt: now, data }));
    return true;
  } catch {
    return false;
  }
}
