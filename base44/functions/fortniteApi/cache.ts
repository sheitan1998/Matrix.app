import { waitUntil } from 'base44:runtime';

const cache = new Map();
export async function cached(key, ttl, load) {
  let state = cache.get(key);
  if (!state) {
    state = { data: undefined, expires: 0, pending: null };
    if (cache.size >= 160) cache.delete(cache.keys().next().value);
    cache.set(key, state);
  }
  if (Date.now() >= state.expires && !state.pending) {
    state.pending = load().then(data => {
      state.data = data;
      state.expires = Date.now() + ttl;
      return data;
    }).catch(error => {
      state.expires = Date.now() + 30000;
      throw error;
    }).finally(() => { state.pending = null; });
  }
  if (state.data !== undefined) {
    if (state.pending) waitUntil(state.pending.catch(error => console.warn('Fortnite refresh:', error.message)));
    return state.data;
  }
  if (state.pending) return await state.pending;
  throw new Error('Source Fortnite temporairement indisponible');
}
export function clearCache() { cache.clear(); }