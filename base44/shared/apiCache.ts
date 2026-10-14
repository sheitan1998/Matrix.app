// Shared API cache utilities — used by fortniteApi, dofusApi, rocketLeagueApi, farmingModApi

export function createApiCache(maxSize = 120) {
  const cache = new Map();

  function getCached(key, ttlMs) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > ttlMs) { cache.delete(key); return null; }
    return entry.data;
  }

  function setCached(key, data) {
    cache.set(key, { data, ts: Date.now() });
    if (cache.size > maxSize) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
      cache.delete(oldest[0]);
    }
  }

  function purgeAll(prefix) {
    for (const key of cache.keys()) {
      if (!prefix || key.startsWith(prefix)) cache.delete(key);
    }
  }

  return { getCached, setCached, purgeAll, _map: cache };
}

export function dataResponse(data, ttl = 3600) {
  return Response.json(data, {
    headers: { 'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}` },
  });
}