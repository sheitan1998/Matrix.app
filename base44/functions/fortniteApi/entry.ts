import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getCatalogPage, getCatalog, clearCatalogCache } from './catalog.ts';
import { creativePage, enrichMaps, islandSnapshot } from './creative.ts';
import { cached } from './cache.ts';
import { createApiCache, dataResponse } from "../../shared/apiCache.ts";

// ─── In-memory cache (shared module, fn: prefix) ───
const { getCached: rawGetCached, setCached: rawSetCached, purgeAll: rawPurgeAll } = createApiCache(120);
const CACHE_PREFIX = 'fn:';
function getCached(key, ttlMinutes) { return rawGetCached(CACHE_PREFIX + key, ttlMinutes * 60 * 1000); }
function setCached(key, data) { rawSetCached(CACHE_PREFIX + key, data); }
function purgeAllCache() { rawPurgeAll(CACHE_PREFIX); clearCatalogCache(); }

// ─── Config ───
let configPending = null;
async function getConfig(base44, fresh = false) {
  const cached = !fresh && getCached('config', 1);
  if (cached) return cached.value;
  const load = async () => {
    const result = await base44.asServiceRole.entities.FortniteConfig.filter({}, { limit: 1 });
    const value = result.items?.[0] || null;
    setCached('config', { value });
    return value;
  };
  if (fresh) return await load();
  if (!configPending) configPending = load().finally(() => { configPending = null; });
  return await configPending;
}

// ─── EOS OAuth (client_credentials) ───
async function getEosToken(config) {
  const cached = getCached('eos_token', 55);
  if (cached) return cached;

  const basicAuth = btoa(`${config.client_id}:${config.client_secret}`);
  const res = await fetch('https://api.epicgames.dev/auth/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: `grant_type=client_credentials&deployment_id=${config.sandbox_id}`,
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`EOS auth failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  setCached('eos_token', data.access_token);
  return data.access_token;
}

// ─── Player stats (fortnite-api.com, needs API key) ───
async function getPlayerStats(pseudo, apiKey) {
  const headers = { 'Accept': 'application/json' };
  if (apiKey) headers['Authorization'] = apiKey;
  const res = await fetch(`https://fortnite-api.com/v2/stats/br/v2?name=${encodeURIComponent(pseudo)}`, {
    headers,
    signal: AbortSignal.timeout(15000),
  });
  if (res.status === 401) return { error: 'Clé API fortnite-api.com requise. Ajoutez-la dans le Panel Admin > Fortnite > Clés API.' };
  if (res.status === 403) return { error: 'Joueur introuvable ou statistiques privées' };
  if (res.status === 429) return { error: 'Trop de requêtes, réessayez dans quelques minutes' };
  if (!res.ok) return { error: `Erreur API (${res.status})` };
  return await res.json();
}

// Public catalogues and Creative discovery use shared stale-while-revalidate caches.

// ─── Main handler ───
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // Stored maps are returned immediately, without any external island API call.
    if (action === 'getMaps') {
      const query = {};
      if (body.category && body.category !== 'all') query.category = String(body.category);
      const term = String(body.search || '').trim().slice(0, 100);
      if (term) {
        const pattern = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [{ title: { $regex: pattern, $options: 'i' } }, { creator_name: { $regex: pattern, $options: 'i' } }];
      }
      const limit = Math.min(24, Math.max(1, Math.floor(Number(body.limit) || 24)));
      const [page, total] = await Promise.all([
        base44.entities.FortniteMap.filter(query, { sort: '-created_date', limit, ...(body.cursor ? { cursor: body.cursor } : {}) }),
        base44.entities.FortniteMap.count(query),
      ]);
      const items = await enrichMaps(page.items || []);
      return dataResponse({ items, total, has_more: page.has_more, next_cursor: page.next_cursor }, 900);
    }

    if (action === 'getMapDetails') {
      const code = String(body.code || '').trim().toUpperCase();
      if (!/^\d{4}-\d{4}-\d{4}$/.test(code)) {
        return Response.json({ error: 'Code de carte invalide' }, { status: 400 });
      }
      const stored = await base44.entities.FortniteMap.filter({ map_code: code }, { limit: 1 });
      if (stored.items?.[0]) {
        const [map] = await enrichMaps([stored.items[0]]);
        return dataResponse(map, 900);
      }
      return dataResponse(await islandSnapshot(code), 900);
    }

    const adminAction = ['purgeCache', 'getConfig', 'updateConfig', 'testConnection'].includes(action);
    const config = await getConfig(base44, adminAction);
    const cacheTtl = config?.cache_ttl_minutes || 12;

    if (action === 'getCreativeMaps' || action === 'getApiFeaturedMaps') {
      if (config?.show_api_maps === false) return Response.json(action === 'getApiFeaturedMaps' ? [] : { items: [], has_more: false });
      const result = await creativePage(body);
      return dataResponse(action === 'getApiFeaturedMaps' ? result.items : result, 900);
    }

    if (action === 'getFeaturedMaps') {
      const result = await cached('featured:stored', 15 * 60 * 1000, async () => {
        const page = await base44.entities.FortniteMap.filter(
          { is_featured: true, is_approved: { $ne: false } }, { sort: 'sort_order', limit: 24 }
        );
        return await enrichMaps(page.items || []);
      });
      return dataResponse(result, 900);
    }

    if (action === 'getCosmeticDetails') {
      const id = String(body.id || '').trim().slice(0, 200);
      if (!id) return Response.json({ error: 'Identifiant requis' }, { status: 400 });
      const catalog = await getCatalog('cosmetics');
      return dataResponse(catalog.items.find(item => item.id === id) || null);
    }

    // ── Public: 24-item pages, shared hourly catalogue cache ──
    if (action === 'getDailyShop') {
      if (config?.show_daily_shop === false) return Response.json({ entries: [], total: 0, has_more: false, next_page: null });
      return dataResponse(await getCatalogPage('shop', body));
    }
    if (action === 'searchCosmetics') {
      if (config?.show_cosmetics === false) return Response.json({ items: [], total: 0, has_more: false, next_page: null });
      return dataResponse(await getCatalogPage('cosmetics', body));
    }

    // ── Public: Player stats ──
    if (action === 'getPlayerStats') {
      if (config?.show_player_stats === false) return Response.json({ error: 'Section désactivée' });
      const pseudo = body.pseudo;
      if (!pseudo || pseudo.trim().length < 2) {
        return Response.json({ error: 'Pseudo requis (min 2 caractères)' }, { status: 400 });
      }

      const cacheKey = `player:${pseudo.toLowerCase().trim()}`;
      const cached = getCached(cacheKey, cacheTtl);
      if (cached) return Response.json(cached);

      const stats = await getPlayerStats(pseudo.trim(), config?.fortnite_api_key);
      setCached(cacheKey, stats);
      return Response.json(stats);
    }

    // ── Public: Vote on a cosmetic ──
    if (action === 'voteCosmetic') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Connexion requise pour voter' }, { status: 401 });
      const { cosmetic_id, cosmetic_name, cosmetic_type, cosmetic_image, cosmetic_rarity, vote_type } = body;
      if (!cosmetic_id || !vote_type) return Response.json({ error: 'cosmetic_id et vote_type requis' }, { status: 400 });
      const score = vote_type === 'fire' ? 2 : vote_type === 'love' ? 1 : vote_type === 'meh' ? -1 : vote_type === 'trash' ? -2 : 0;
      const existing = await base44.asServiceRole.entities.FortniteCosmeticVote.filter(
        { cosmetic_id, user_email: user.email }, { limit: 1 }
      );
      const existingVote = existing?.items?.[0] || existing?.[0];
      if (existingVote) {
        await base44.asServiceRole.entities.FortniteCosmeticVote.update(existingVote.id, {
          vote_type, score, cosmetic_name, cosmetic_type, cosmetic_image, cosmetic_rarity,
        });
        return Response.json({ ok: true, vote_type, score, updated: true });
      }
      await base44.asServiceRole.entities.FortniteCosmeticVote.create({
        cosmetic_id, cosmetic_name, cosmetic_type, cosmetic_image, cosmetic_rarity,
        vote_type, score, user_email: user.email,
      });
      return Response.json({ ok: true, vote_type, score, created: true });
    }

    // ── Public: Get user's vote for a cosmetic ──
    if (action === 'getUserCosmeticVote') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ vote_type: null });
      const { cosmetic_id } = body;
      if (!cosmetic_id) return Response.json({ vote_type: null });
      const existing = await base44.asServiceRole.entities.FortniteCosmeticVote.filter(
        { cosmetic_id, user_email: user.email }, { limit: 1 }
      );
      const existingVote = existing?.items?.[0] || existing?.[0];
      return Response.json({ vote_type: existingVote?.vote_type || null });
    }

    // ── Public: Cosmetic leaderboard ──
    if (action === 'getCosmeticLeaderboard') {
      const cacheKey = 'cosmetic_leaderboard';
      const cached = getCached(cacheKey, 15);
      if (cached) return Response.json(cached);
      const aggResult = await base44.asServiceRole.entities.FortniteCosmeticVote.aggregate({
        groupBy: 'cosmetic_id', sum: 'score', count: true, sort: '-sum_score', limit: 50,
      });
      const rows = aggResult?.rows || [];
      if (rows.length === 0) return Response.json([]);
      const cosmeticIds = rows.map(r => r.cosmetic_id);
      const metaResult = await base44.asServiceRole.entities.FortniteCosmeticVote.filter(
        { cosmetic_id: { $in: cosmeticIds } }, { sort: '-created_date', limit: 100 }
      );
      const metaRecords = metaResult?.items || metaResult || [];
      const metaMap = {};
      for (const rec of metaRecords) {
        if (!metaMap[rec.cosmetic_id]) metaMap[rec.cosmetic_id] = rec;
      }
      const leaderboard = rows.map(r => ({
        cosmetic_id: r.cosmetic_id,
        score: r.sum_score || 0,
        votes: r.count || 0,
        cosmetic_name: metaMap[r.cosmetic_id]?.cosmetic_name || 'Inconnu',
        cosmetic_type: metaMap[r.cosmetic_id]?.cosmetic_type || 'item',
        cosmetic_image: metaMap[r.cosmetic_id]?.cosmetic_image || null,
        cosmetic_rarity: metaMap[r.cosmetic_id]?.cosmetic_rarity || 'common',
      }));
      setCached(cacheKey, leaderboard);
      return Response.json(leaderboard);
    }

    // ── Public: Vote counts for a batch of cosmetics ──
    if (action === 'getCosmeticVoteCounts') {
      const ids = Array.isArray(body.cosmetic_ids) ? body.cosmetic_ids.filter(id => id && typeof id === 'string') : [];
      if (ids.length === 0) return Response.json({});
      const user = await base44.auth.isAuthenticated() ? await base44.auth.me() : null;
      const [aggResult, ownVotes] = await Promise.all([
        base44.asServiceRole.entities.FortniteCosmeticVote.aggregate({
          query: { cosmetic_id: { $in: ids } }, groupBy: ['cosmetic_id', 'vote_type'], limit: 1000,
        }),
        user ? base44.entities.FortniteCosmeticVote.filter({ cosmetic_id: { $in: ids }, user_email: user.email },
          { limit: Math.min(ids.length, 1000), fields: ['cosmetic_id', 'vote_type'] }) : Promise.resolve({ items: [] }),
      ]);
      const counts = Object.fromEntries(ids.map(id => [id, { total: 0, user_vote: null }]));
      for (const row of aggResult.rows || []) {
        counts[row.cosmetic_id][row.vote_type] = row.count || 0;
        counts[row.cosmetic_id].total += row.count || 0;
      }
      for (const vote of ownVotes.items || []) counts[vote.cosmetic_id].user_vote = vote.vote_type;
      return Response.json(counts);
    }

    // ── Public: Items from the same set/series ──
    if (action === 'getSetItems') {
      const setName = String(body.set || body.series || '').trim();
      if (!setName) return Response.json([]);
      const cacheKey = `set:${setName.toLowerCase()}`;
      const cached = getCached(cacheKey, 30);
      if (cached) return Response.json(cached);
      const catalog = await getCatalog('cosmetics').catch(() => null);
      if (!catalog) return Response.json([]);
      const items = catalog.items.filter(i => (i.set_name || i.series || '').toLowerCase() === setName.toLowerCase()).slice(0, 12);
      setCached(cacheKey, items);
      return dataResponse(items);
    }

    // ── Public: Section visibility config ──
    if (action === 'getSectionsConfig') {
      return Response.json({
        show_api_maps: config?.show_api_maps ?? true,
        show_daily_shop: config?.show_daily_shop ?? true,
        show_cosmetics: config?.show_cosmetics ?? true,
        show_player_stats: config?.show_player_stats ?? true,
      });
    }

    // ── Admin actions ──
    if (action === 'purgeCache' || action === 'getConfig' || action === 'updateConfig' || action === 'testConnection') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      if (action === 'purgeCache') {
        purgeAllCache();
        return Response.json({ ok: true, cleared: true, message: 'Cache purgé avec succès' });
      }

      if (action === 'getConfig') {
        return Response.json({
          cache_ttl_minutes: config?.cache_ttl_minutes || 12,
          sync_enabled: config?.sync_enabled ?? true,
          last_sync_at: config?.last_sync_at || null,
          show_api_maps: config?.show_api_maps ?? true,
          show_daily_shop: config?.show_daily_shop ?? true,
          show_cosmetics: config?.show_cosmetics ?? true,
          show_player_stats: config?.show_player_stats ?? true,
          product_id: config?.product_id ? '✓ Configuré' : 'Non configuré',
          application_id: config?.application_id ? '✓ Configuré' : 'Non configuré',
          sandbox_id: config?.sandbox_id ? '✓ Configuré' : 'Non configuré',
          client_id: config?.client_id ? config.client_id.slice(0, 4) + '••••••••' : 'Non configuré',
          client_secret: config?.client_secret ? '✓ Configuré' : 'Non configuré',
          fortnite_api_key: config?.fortnite_api_key ? '✓ Configuré' : 'Non configuré',
        });
      }

      if (action === 'updateConfig') {
        const updateData = {};
        if (body.cache_ttl_minutes !== undefined) updateData.cache_ttl_minutes = body.cache_ttl_minutes;
        if (body.sync_enabled !== undefined) updateData.sync_enabled = body.sync_enabled;
        if (body.show_api_maps !== undefined) updateData.show_api_maps = body.show_api_maps;
        if (body.show_daily_shop !== undefined) updateData.show_daily_shop = body.show_daily_shop;
        if (body.show_cosmetics !== undefined) updateData.show_cosmetics = body.show_cosmetics;
        if (body.show_player_stats !== undefined) updateData.show_player_stats = body.show_player_stats;
        if (body.client_id) updateData.client_id = body.client_id;
        if (body.client_secret) updateData.client_secret = body.client_secret;
        if (body.product_id) updateData.product_id = body.product_id;
        if (body.sandbox_id) updateData.sandbox_id = body.sandbox_id;
        if (body.fortnite_api_key) updateData.fortnite_api_key = body.fortnite_api_key;
        if (body.application_id) updateData.application_id = body.application_id;

        if (config) {
          await base44.asServiceRole.entities.FortniteConfig.update(config.id, updateData);
        } else {
          await base44.asServiceRole.entities.FortniteConfig.create({
            cache_ttl_minutes: 12,
            sync_enabled: true,
            ...updateData,
          });
        }
        purgeAllCache();
        return Response.json({ ok: true, message: 'Configuration mise à jour' });
      }

      if (action === 'testConnection') {
        if (!config?.client_id || !config?.client_secret) {
          return Response.json({ ok: false, error: 'Clés EOS non configurées' });
        }
        try {
          const token = await getEosToken(config);
          return Response.json({ ok: true, message: 'Connexion EOS réussie', token_preview: token?.slice(0, 8) + '...' });
        } catch (e) {
          return Response.json({ ok: false, error: e.message });
        }
      }
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}