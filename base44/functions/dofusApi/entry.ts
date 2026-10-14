import { createApiCache, dataResponse } from "../../shared/apiCache.ts";

const CACHE_TTL = 60 * 60 * 1000;
const { getCached: rawGetCached, setCached } = createApiCache(80);
function getCached(key) { return rawGetCached(key, CACHE_TTL); }

const SUPER_TYPES = { equipment: '1', weapons: '2', resources: '9', all: null };

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const lang = body.lang || 'fr';

    if (action === 'searchItems') {
      const limit = Math.min(24, Math.max(1, Number(body.limit) || 24));
      const page = Math.max(1, Number(body.page) || 1);
      const skip = (page - 1) * limit;
      const search = String(body.search || '').trim().slice(0, 100);
      const minLevel = Number(body.minLevel) || 0;
      const maxLevel = Number(body.maxLevel) || 0;
      const category = String(body.category || 'all');

      const params = new URLSearchParams();
      params.set('$limit', String(limit));
      params.set('$skip', String(skip));
      params.set('$sort', '-level');
      if (search) {
        params.set(`name.${lang}[$regex]`, search);
        params.set(`name.${lang}[$options]`, 'i');
      }
      if (minLevel > 0) params.set('level[$gte]', String(minLevel));
      if (maxLevel > 0) params.set('level[$lte]', String(maxLevel));
      const st = SUPER_TYPES[category];
      if (st) params.set('type.superTypeId', st);

      const cacheKey = `search:${lang}:${limit}:${skip}:${search}:${minLevel}:${maxLevel}:${category}`;
      const cached = getCached(cacheKey);
      if (cached) return dataResponse(cached);

      const res = await fetch(`https://api.dofusdb.fr/items?${params.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`DofusDB (${res.status})`);
      const data = await res.json();

      const result = {
        items: (data.data || []).map(item => ({
          id: item.id,
          name: item.name?.[lang] || item.name?.fr || 'Inconnu',
          level: item.level || 0,
          img: item.img || null,
          type: item.type?.name?.[lang] || item.type?.name?.fr || '',
          description: item.description?.[lang] || item.description?.fr || '',
          effects: (item.possibleEffects || []).map(e => ({
            id: e.effectId,
            value: e.value || 0,
          })),
          hasRecipe: !!item.hasRecipe,
          recipeIds: item.recipeIds || [],
        })),
        total: data.total || 0,
        page,
        has_more: skip + limit < (data.total || 0),
      };
      setCached(cacheKey, result);
      return dataResponse(result);
    }

    if (action === 'getItemDetails') {
      const id = Number(body.id);
      if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });

      const cacheKey = `item:${id}:${lang}`;
      const cached = getCached(cacheKey);
      if (cached) return dataResponse(cached);

      const res = await fetch(`https://api.dofusdb.fr/items/${id}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`DofusDB (${res.status})`);
      const item = await res.json();

      let recipes = [];
      if (item.recipeIds?.length) {
        const recipeResults = await Promise.allSettled(
          item.recipeIds.slice(0, 10).map(rid =>
            fetch(`https://api.dofusdb.fr/recipes/${rid}`, {
              headers: { Accept: 'application/json' },
              signal: AbortSignal.timeout(10000),
            }).then(r => r.ok ? r.json() : null)
          )
        );
        recipes = recipeResults
          .filter(r => r.status === 'fulfilled' && r.value)
          .map(r => ({
            id: r.value.id,
            quantity: r.value.quantity || 1,
            ingredientId: r.value.ingredientId,
            ingredientName: r.value.ingredient?.name?.[lang] || r.value.ingredient?.name?.fr || '',
            ingredientImg: r.value.ingredient?.img || null,
          }));
      }

      const result = {
        id: item.id,
        name: item.name?.[lang] || item.name?.fr || 'Inconnu',
        level: item.level || 0,
        img: item.img || null,
        type: item.type?.name?.[lang] || item.type?.name?.fr || '',
        description: item.description?.[lang] || item.description?.fr || '',
        effects: (item.possibleEffects || []).map(e => ({
          id: e.effectId,
          value: e.value || 0,
        })),
        recipes,
      };
      setCached(cacheKey, result);
      return dataResponse(result);
    }

    if (action === 'getMonsters') {
      const limit = Math.min(24, Math.max(1, Number(body.limit) || 24));
      const page = Math.max(1, Number(body.page) || 1);
      const skip = (page - 1) * limit;
      const search = String(body.search || '').trim().slice(0, 100);

      const params = new URLSearchParams({
        $limit: String(limit),
        $skip: String(skip),
        $sort: '-level',
      });
      if (search) {
        params.set(`name.${lang}[$regex]`, search);
        params.set(`name.${lang}[$options]`, 'i');
      }

      const cacheKey = `monsters:${lang}:${limit}:${skip}:${search}`;
      const cached = getCached(cacheKey);
      if (cached) return dataResponse(cached);

      const res = await fetch(`https://api.dofusdb.fr/monsters?${params.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`DofusDB (${res.status})`);
      const data = await res.json();

      const result = {
        items: (data.data || []).map(m => ({
          id: m.id,
          name: m.name?.[lang] || m.name?.fr || 'Inconnu',
          level: m.gradeLevel || 0,
          img: m.img || null,
          type: m.type?.name?.[lang] || m.type?.name?.fr || 'Monstre',
        })),
        total: data.total || 0,
        page,
        has_more: skip + limit < (data.total || 0),
      };
      setCached(cacheKey, result);
      return dataResponse(result);
    }

    if (action === 'getItemSets') {
      const limit = Math.min(24, Math.max(1, Number(body.limit) || 24));
      const page = Math.max(1, Number(body.page) || 1);
      const skip = (page - 1) * limit;
      const search = String(body.search || '').trim().slice(0, 100);

      const params = new URLSearchParams({
        $limit: String(limit),
        $skip: String(skip),
        $sort: '-level',
      });
      if (search) {
        params.set(`name.${lang}[$regex]`, search);
        params.set(`name.${lang}[$options]`, 'i');
      }

      const cacheKey = `sets:${lang}:${limit}:${skip}:${search}`;
      const cached = getCached(cacheKey);
      if (cached) return dataResponse(cached);

      const res = await fetch(`https://api.dofusdb.fr/item-sets?${params.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`DofusDB (${res.status})`);
      const data = await res.json();

      const result = {
        items: (data.data || []).map(s => ({
          id: s.id,
          name: s.name?.[lang] || s.name?.fr || 'Inconnu',
          level: s.level || 0,
          img: s.img || null,
          items: (s.itemIds || []).slice(0, 10),
        })),
        total: data.total || 0,
        page,
        has_more: skip + limit < (data.total || 0),
      };
      setCached(cacheKey, result);
      return dataResponse(result);
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}