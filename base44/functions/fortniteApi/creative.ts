import { cached } from './cache.ts';

const TTL = 15 * 60 * 1000;
const EPIC = 'https://api.fortnite.com/ecosystem/v1';
const FYI = 'https://hnnpaewhugfyoomcuiyg.supabase.co/functions/v1';
const GENRES = { tycoon: 'simulation-tycoon', horreur: 'horror', deathrun: 'deathrun-platformer', parkour: 'deathrun-platformer', battle_royale: 'battle-royale', pve: 'adventure-rpg', rp: 'roleplaying-social', music: 'music-rhythm', puzzle: 'strategy', autre: 'party-mini-games' };
const POPULAR = ['shooter', 'simulation-tycoon', 'survival', 'party-mini-games'];
async function json(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Source Créatif indisponible (${response.status})`);
  return await response.json();
}
async function batches(items, callback, size = 8) {
  const results = [];
  for (let i = 0; i < items.length; i += size) results.push(...await Promise.all(items.slice(i, i + size).map(callback)));
  return results;
}
export async function thumbnailHD(url) {
  if (!url || !/^https:\/\/cdn-[\w-]+\.qstv\.on\.epicgames\.com\//.test(url)) return url || null;
  const candidate = url.replace(/landscape_comp_s(?:_b)?\.jpeg$/, 'landscape_comp.jpeg');
  if (candidate === url) return url;
  return await cached(`thumbnail:${candidate}`, 3600000, async () => {
    const response = await fetch(candidate, { method: 'HEAD', signal: AbortSignal.timeout(5000) }).catch(() => null);
    return response?.ok && response.headers.get('content-type')?.startsWith('image/') ? candidate : url;
  });
}
function category(tags = []) {
  tags = tags.map(tag => String(tag).trim().toLocaleLowerCase());
  const rules = [['tycoon', 'tycoon'], ['horror', 'horreur'], ['deathrun', 'deathrun'], ['parkour', 'parkour'], ['battle royale', 'battle_royale'], ['pve', 'pve'], ['roleplay', 'rp'], ['music', 'music'], ['puzzle', 'puzzle']];
  return rules.find(([tag]) => tags.some(value => value === tag || value.includes(tag)))?.[1] || 'autre';
}
export async function islandSnapshot(code) {
  if (!/^\d{4}-\d{4}-\d{4}$/.test(code)) return null;
  return await cached(`island:${code}`, TTL, async () => {
    const [epic, fyi] = await Promise.allSettled([json(`${EPIC}/islands/${code}`), json(`${FYI}/public-ccu?code=${code}`)]);
    const meta = epic.status === 'fulfilled' ? epic.value : null;
    const live = fyi.status === 'fulfilled' ? fyi.value : null;
    if (!meta && !live?.title) return null;
    const known = Number.isFinite(live?.ccu) && live?.updatedAt && Date.now() - Date.parse(live.updatedAt) < 3600000;
    const thumbnail = live?.thumbnailUrl || null;
    const image = await thumbnailHD(thumbnail);
    return { id: `api_${code}`, map_code: code, title: meta?.title || live?.title || code,
      creator_name: meta?.creatorCode || live?.creatorName || 'Créateur non fourni',
      image_url: image, thumbnail_url: thumbnail, live_players: known ? live.ccu : null,
      last_synced_at: known ? live.updatedAt : null, category: category(meta?.tags), tags: meta?.tags || [],
      created_in: meta?.createdIn || null, description: meta?.description || meta?.longDescription || live?.description || '', is_api: true, players_kind: 'peak_ccu_10_minutes',
      source: 'Epic Games + fortnite.fyi', cached_at: new Date().toISOString() };
  });
}
async function download(options) {
  const search = String(options.search || '').trim().slice(0, 100);
  const selected = String(options.category || 'all');
  const mode = options.mode === 'recent' ? 'recent' : 'popular';
  let cursor = {};
  if (options.cursor) {
    try {
      cursor = JSON.parse(String(options.cursor));
    } catch {
      cursor = {};
    }
  }
  let candidates = [], next = null, total = null;
  if (search) {
    if (/^\d{4}-\d{4}-\d{4}$/.test(search)) candidates = [{ code: search }];
    else {
      const result = await json(`${FYI}/public-island-search?q=${encodeURIComponent(search)}&limit=24`);
      candidates = (result.results || []).slice(0, 24);
    }
  } else if (mode === 'recent') {
    const result = await json(`${EPIC}/islands?size=24${cursor.after ? `&after=${encodeURIComponent(cursor.after)}` : ''}`);
    candidates = result.data || [];
    if (result.meta?.page?.nextCursor) next = JSON.stringify({ after: result.meta.page.nextCursor });
  } else {
    const genres = GENRES[selected] ? [GENRES[selected]] : POPULAR;
    const settledPages = await Promise.allSettled(genres.map(async genre => {
      if (cursor.done?.includes(genre)) return { genre, data: [], meta: {} };
      const params = new URLSearchParams({ size: String(Math.floor(24 / genres.length)) });
      if (cursor[genre]) params.set('after', cursor[genre]);
      if (cursor.at) params.set('at', cursor.at);
      return { genre, ...await json(`${EPIC}/genres/${genre}/rankings?${params}`) };
    }));
    const pages = settledPages
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
    if (!pages.length) throw new Error('Classements Créatif temporairement indisponibles');
    const nextState = { at: pages.find(p => p.meta?.snapshot)?.meta.snapshot || cursor.at, done: [...(cursor.done || [])] };
    for (const page of pages) {
      candidates.push(...(page.data || []).map(i => ({ code: i.islandCode, rank: i.rank, genre: page.genre })));
      if (page.meta?.page?.nextCursor) nextState[page.genre] = page.meta.page.nextCursor;
      else if (!nextState.done.includes(page.genre)) nextState.done.push(page.genre);
    }
    if (genres.some(genre => nextState[genre])) next = JSON.stringify(nextState);
    if (genres.length === 1) total = pages[0].meta?.total ?? null;
  }
  candidates = [...new Map(candidates.map(item => [item.code, item])).values()];
  const results = await batches(candidates, async candidate => {
    const map = await islandSnapshot(candidate.code);
    return map ? { ...map, thumbnail_url: map.thumbnail_url || candidate.thumbnail || null,
      image_url: map.image_url || await thumbnailHD(candidate.thumbnail), rank: candidate.rank ?? null, genre: candidate.genre ?? null } : null;
  });
  const items = results.filter(Boolean).filter(map => !search || selected === 'all' || map.category === selected);
  return { items, total, has_more: !!next, next_cursor: next, mode, cached_at: new Date().toISOString(),
    source: 'Epic Games + fortnite.fyi', players_kind: 'peak_ccu_10_minutes' };
}
export async function creativePage(options = {}) {
  return await cached(`creative:${JSON.stringify({ search: options.search || '', category: options.category || 'all', mode: options.mode || 'popular', cursor: options.cursor || null })}`, TTL, () => download(options));
}
export async function enrichMaps(maps) {
  return await batches(maps, async map => {
    const snapshot = await islandSnapshot(map.map_code);
    return { ...map, api_title: snapshot?.title || null, api_creator: snapshot?.creator_name || null,
      api_thumbnail: snapshot?.image_url || null, api_thumbnail_url: snapshot?.thumbnail_url || null,
      live_players: snapshot?.live_players ?? null,
      last_synced_at: snapshot?.last_synced_at || null, api_description: snapshot?.description || null,
      players_kind: 'peak_ccu_10_minutes' };
  });
}