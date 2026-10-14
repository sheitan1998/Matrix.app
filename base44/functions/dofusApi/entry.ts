import { createApiCache, dataResponse } from "../../shared/apiCache.ts";

const CACHE_TTL = 60 * 60 * 1000;
const CACHE_TTL_TYPES = 24 * 60 * 60 * 1000;
const { getCached: rawGetCached, setCached } = createApiCache(80);
function getCached(key) { return rawGetCached(key, CACHE_TTL); }

const CATEGORY_SUPER_TYPES = {
  equipment: [1, 3, 4, 5, 7, 10, 11, 12, 13],
  weapons: [2],
  consumables: [6, 70],
  resources: [9],
};

async function getItemTypes() {
  const cacheKey = 'item_types_all';
  const cached = rawGetCached(cacheKey, CACHE_TTL_TYPES);
  if (cached) return cached;
  const res = await fetch('https://api.dofusdb.fr/item-types?$limit=1000', {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`DofusDB types (${res.status})`);
  const data = await res.json();
  const types = data.data || [];
  setCached(cacheKey, types);
  return types;
}

async function getTypeIdsForCategory(category) {
  if (!category || category === 'all' || category === 'monsters' || category === 'sets') return null;
  const superTypeIds = CATEGORY_SUPER_TYPES[category];
  if (!superTypeIds) return null;
  const allTypes = await getItemTypes();
  return allTypes.filter(t => superTypeIds.includes(t.superTypeId)).map(t => t.id);
}

function buildQuery(params) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) parts.push(`${key}=${encodeURIComponent(v)}`);
    } else {
      parts.push(`${key}=${encodeURIComponent(value)}`);
    }
  }
  return parts.join('&');
}

function imgUrl(item) {
  if (item.img) return item.img;
  if (item.iconId) return `https://api.dofusdb.fr/img/items/${item.iconId}.png`;
  return null;
}

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

      const params = {
        '$limit': String(limit),
        '$skip': String(skip),
        '$sort': '-level',
      };
      if (search) {
        params[`name.${lang}[$regex]`] = search;
        params[`name.${lang}[$options]`] = 'i';
      }
      if (minLevel > 0) params['level[$gte]'] = String(minLevel);
      if (maxLevel > 0) params['level[$lte]'] = String(maxLevel);

      const typeIds = await getTypeIdsForCategory(category);
      if (typeIds && typeIds.length > 0) {
        params['typeId[$in]'] = typeIds.map(String);
      }

      const cacheKey = `search:${lang}:${limit}:${skip}:${search}:${minLevel}:${maxLevel}:${category}`;
      const cached = getCached(cacheKey);
      if (cached) return dataResponse(cached);

      const url = `https://api.dofusdb.fr/items?${buildQuery(params)}`;
      const res = await fetch(url, {
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
          img: imgUrl(item),
          type: item.type?.name?.[lang] || item.type?.name?.fr || '',
          typeId: item.typeId || 0,
          description: item.description?.[lang] || item.description?.fr || '',
          effects: (item.effects || []).map(e => ({
            from: e.from || 0,
            to: e.to || 0,
            effectId: e.effectId || 0,
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
            ingredientImg: r.value.ingredient?.img || (r.value.ingredient?.iconId ? `https://api.dofusdb.fr/img/items/${r.value.ingredient.iconId}.png` : null),
          }));
      }

      const result = {
        id: item.id,
        name: item.name?.[lang] || item.name?.fr || 'Inconnu',
        level: item.level || 0,
        img: imgUrl(item),
        type: item.type?.name?.[lang] || item.type?.name?.fr || '',
        description: item.description?.[lang] || item.description?.fr || '',
        effects: (item.effects || []).map(e => ({
          from: e.from || 0,
          to: e.to || 0,
          effectId: e.effectId || 0,
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

      const params = {
        '$limit': String(limit),
        '$skip': String(skip),
        '$sort': '-level',
      };
      if (search) {
        params[`name.${lang}[$regex]`] = search;
        params[`name.${lang}[$options]`] = 'i';
      }

      const cacheKey = `monsters:${lang}:${limit}:${skip}:${search}`;
      const cached = getCached(cacheKey);
      if (cached) return dataResponse(cached);

      const url = `https://api.dofusdb.fr/monsters?${buildQuery(params)}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`DofusDB (${res.status})`);
      const data = await res.json();

      const result = {
        items: (data.data || []).map(m => ({
          id: m.id,
          name: m.name?.[lang] || m.name?.fr || 'Inconnu',
          level: m.gradeLevel || m.level || 0,
          img: m.img || (m.iconId ? `https://api.dofusdb.fr/img/items/${m.iconId}.png` : null),
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

      const params = {
        '$limit': String(limit),
        '$skip': String(skip),
        '$sort': '-level',
      };
      if (search) {
        params[`name.${lang}[$regex]`] = search;
        params[`name.${lang}[$options]`] = 'i';
      }

      const cacheKey = `sets:${lang}:${limit}:${skip}:${search}`;
      const cached = getCached(cacheKey);
      if (cached) return dataResponse(cached);

      const url = `https://api.dofusdb.fr/item-sets?${buildQuery(params)}`;
      const res = await fetch(url, {
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