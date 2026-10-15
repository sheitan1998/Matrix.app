import { createApiCache, dataResponse } from "../../shared/apiCache.ts";
import { dofusFallback, fallbackDofusPage } from "../../shared/dofusFallback.ts";
import { normalizeDofusAlmanax, normalizeDofusBreed, normalizeDofusItem, normalizeDofusMapArea, normalizeDofusSet, normalizeDofusSpell, loadDofusRecipes } from "../../shared/dofusData.ts";

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
  const cacheKey = 'item_types_complete_v3';
  const cached = rawGetCached(cacheKey, CACHE_TTL_TYPES);
  if (cached) return cached;
  const fetchPage = async skip => { const res = await fetch(`https://api.dofusdb.fr/item-types?$limit=50&$skip=${skip}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) }); if (!res.ok) throw new Error(`DofusDB types (${res.status})`); return res.json(); };
  const first = await fetchPage(0);
  const types = first.data || [];
  const offsets = [];
  for (let skip = 50; skip < first.total; skip += 50) offsets.push(skip);
  for (let i = 0; i < offsets.length; i += 5) { const pages = await Promise.all(offsets.slice(i, i + 5).map(fetchPage)); for (const page of pages) types.push(...page.data); }
  setCached(cacheKey, types);
  return types;
}

async function getTypeIdsForCategory(category) {
  if (category === 'monsters' || category === 'sets') return null;
  const superTypeIds = !category || category === 'all' ? [...CATEGORY_SUPER_TYPES.equipment, ...CATEGORY_SUPER_TYPES.weapons, ...CATEGORY_SUPER_TYPES.consumables] : CATEGORY_SUPER_TYPES[category];
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

async function fetchDofusCollection(path, params, timeout=8000) {
  const res=await fetch(`https://api.dofusdb.fr/${path}?${buildQuery(params)}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(timeout)});
  if(!res.ok)throw new Error(`DofusDB ${path} (${res.status})`);
  return res.json();
}
async function fetchDofusByIds(path,ids,timeout=12000) {
  const rows=[];
  for(let index=0;index<ids.length;index+=50){
    const batch=ids.slice(index,index+50);
    const response=await fetchDofusCollection(path,{'$limit':String(batch.length),'id[$in]':batch.map(String)},timeout);
    rows.push(...(response.data||[]));
  }
  return rows;
}

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const lang = body.lang || 'fr';

    if (action === 'getAlmanax') {
      const date=/^\d{4}-\d{2}-\d{2}$/.test(String(body.date||''))?String(body.date):new Date().toISOString().slice(0,10);
      const cacheKey=`almanax:v1:${date}:${lang}`;
      const cached=rawGetCached(cacheKey,CACHE_TTL_TYPES);
      if(cached)return dataResponse(cached);
      try {
        const response=await fetch(`https://api.dofusdb.fr/almanax?date=${date}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(6000)});
        if(!response.ok)throw new Error(`DofusDB almanax (${response.status})`);
        const entry=await response.json();
        const result={almanax:normalizeDofusAlmanax(entry,lang,date),fallback:false};
        setCached(cacheKey,result);
        return dataResponse(result);
      } catch {
        const response=await fetch(`https://api.dofusdu.de/dofus2/${lang}/almanax/${date}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(6000)});
        if(!response.ok)throw new Error(`Almanax de secours (${response.status})`);
        const entry=await response.json();
        return dataResponse({fallback:true,almanax:{date,meryde:'Méryde du jour',merydeDescription:'Le nom du Méryde n’est pas fourni par la source de secours.',offering:{quantity:Number(entry.tribute?.quantity||1),name:entry.tribute?.item?.name||'Offrande du jour',img:entry.tribute?.item?.image_urls?.icon||null},bonus:{name:entry.bonus?.type?.name||'Bonus du jour',description:entry.bonus?.description||'Description temporairement indisponible.'},source:'Dofusdu.de'}},300);
      }
    }

    if (action === 'getItemTypes') {
      const types=await getItemTypes();
      const allowedSuperTypes=new Set([...CATEGORY_SUPER_TYPES.equipment,...CATEGORY_SUPER_TYPES.weapons]);
      return dataResponse({
        types:types
          .filter(type=>allowedSuperTypes.has(type.superTypeId))
          .map(type=>({id:type.id,name:type.name?.[lang]||type.name?.fr||`Type ${type.id}`,theme:type.superTypeId===2?'weapons':'equipment'}))
          .sort((a,b)=>a.name.localeCompare(b.name,lang)),
        source:'live',
      });
    }

    if (action === 'getBreeds') {
      const cacheKey=`breeds:v1:${lang}`;
      const cached=rawGetCached(cacheKey,CACHE_TTL_TYPES);
      if(cached)return dataResponse(cached);
      const data=await fetchDofusCollection('breeds',{'$limit':'30','$sort[sortIndex]':'1'});
      const result={breeds:(data.data||[]).map(breed=>normalizeDofusBreed(breed,lang)),source:'live'};
      setCached(cacheKey,result);
      return dataResponse(result);
    }

    if (action === 'getBreedSpells') {
      const breedId=Number(body.breedId);
      if(!Number.isInteger(breedId)||breedId<=0)return Response.json({error:'Classe requise'},{status:400});
      const cacheKey=`breed-spells:v1:${breedId}:${lang}`;
      const cached=rawGetCached(cacheKey,CACHE_TTL_TYPES);
      if(cached)return dataResponse(cached);
      const breedResponse=await fetch(`https://api.dofusdb.fr/breeds/${breedId}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(8000)});
      if(!breedResponse.ok)throw new Error(`DofusDB breeds (${breedResponse.status})`);
      const breed=await breedResponse.json();
      const spellIds=[...new Set((breed.breedSpellsId||[]).map(Number).filter(Number.isInteger))];
      if(!spellIds.length)return dataResponse({breed:normalizeDofusBreed(breed,lang),spells:[],source:'live'});
      const spells=await fetchDofusByIds('spells',spellIds);
      const levelIds=[...new Set(spells.flatMap(spell=>spell.spellLevels||[]).map(Number).filter(Number.isInteger))];
      const levels=levelIds.length?await fetchDofusByIds('spell-levels',levelIds):[];
      const effectIds=[...new Set(levels.flatMap(level=>[...(level.effects||[]),...(level.criticalEffect||[])]).map(effect=>Number(effect.effectId)).filter(Number.isInteger))];
      const effects=effectIds.length?await fetchDofusByIds('effects',effectIds):[];
      const effectDefinitions=new Map(effects.map(effect=>[effect.id,effect]));
      const result={
        breed:normalizeDofusBreed(breed,lang),
        spells:spells
          .map(spell=>normalizeDofusSpell(spell,levels.filter(level=>level.spellId===spell.id),effectDefinitions,lang))
          .sort((a,b)=>a.levels[0]?.minPlayerLevel-b.levels[0]?.minPlayerLevel||a.name.localeCompare(b.name,lang)),
        source:'live',
      };
      setCached(cacheKey,result);
      return dataResponse(result);
    }

    if (action === 'getMapLayers') {
      const cacheKey=`map-layers:v1:${lang}`;
      const cached=rawGetCached(cacheKey,CACHE_TTL_TYPES);
      if(cached)return dataResponse(cached);
      const first=await fetchDofusCollection('subareas',{'$limit':'100','$skip':'0'},15000);
      const rows=[...(first.data||[])];
      const pageSize=Math.max(1,Number(first.limit)||rows.length||100);
      for(let skip=pageSize;skip<Number(first.total||0);skip+=pageSize){
        const page=await fetchDofusCollection('subareas',{'$limit':String(pageSize),'$skip':String(skip)},15000);
        rows.push(...(page.data||[]));
      }
      const areas=rows.map(area=>normalizeDofusMapArea(area,lang)).filter(area=>area.center);
      const result={
        areas,
        total:Number(first.total)||areas.length,
        coverage:{
          dungeons:areas.filter(area=>area.dungeonId!==null).length,
          harvestableZones:areas.filter(area=>area.harvestableCount>0).length,
          npcZones:areas.filter(area=>area.npcCount>0).length,
        },
        source:'DofusDB',
      };
      setCached(cacheKey,result);
      return dataResponse(result);
    }

    if (action === 'searchItems') {
      const limit = Math.min(50, Math.max(1, Number(body.limit) || 50));
      const page = Math.max(1, Number(body.page) || 1);
      const skip = (page - 1) * limit;
      const search = String(body.search || '').trim().slice(0, 100);
      const minLevel = Number(body.minLevel) || 0;
      const maxLevel = Number(body.maxLevel) || 0;
      const category = String(body.category || 'all');
      const requestedTypes = Array.isArray(body.typeIds) ? [...new Set(body.typeIds.map(Number).filter(id => Number.isInteger(id) && id > 0))].slice(0,30) : null;
      const cacheKey = `search:v3:${lang}:${limit}:${skip}:${search}:${minLevel}:${maxLevel}:${category}:${requestedTypes?.join(',')||''}:${!!body.builder}`;
      const cached = getCached(cacheKey);
      if (cached) return dataResponse(cached);
      try {
        const params = { '$limit': String(limit), '$skip': String(skip), '$sort[level]': '-1' };
        if (search) { params[`name.${lang}[$regex]`] = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); params[`name.${lang}[$options]`] = 'i'; }
        if (minLevel > 0) params['level[$gte]'] = String(minLevel);
        if (maxLevel > 0) params['level[$lte]'] = String(maxLevel);
        const typeIds = requestedTypes?.length ? requestedTypes : await getTypeIdsForCategory(category);
        if (typeIds?.length) params['typeId[$in]'] = typeIds.map(String);
        // dofusdb.fr/api/v1/items returns 404; api.dofusdb.fr is the verified JSON API.
        const res = await fetch(`https://api.dofusdb.fr/items?${buildQuery(params)}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4000) });
        if (!res.ok) throw new Error(`DofusDB (${res.status})`);
        const data = await res.json();
        const items = (data.data || []).map(item => normalizeDofusItem(item, lang));
        if (!body.builder && !requestedTypes?.length && page === 1 && category === 'all' && !search && !minLevel && !maxLevel && items.length < 20) return dataResponse(fallbackDofusPage(body), 60);
        if (body.builder) { const result = { items, total: data.total || 0, page, has_more: skip + items.length < (data.total || 0), source: 'live' }; setCached(cacheKey,result); return dataResponse(result); }
        try {
          const recipes = await loadDofusRecipes(items.filter(i => i.hasRecipe).map(i => i.id), lang);
          for (const item of items) item.recipes = recipes.get(item.id) || [];
        } catch {
          for (const item of items) { item.recipes = dofusFallback.find(i => i.id === item.id)?.recipes || []; item.recipeUnavailable = item.hasRecipe && !item.recipes.length; }
        }
        const result = { items, total: data.total || 0, page, has_more: skip + items.length < (data.total || 0), source: 'live' };
        setCached(cacheKey, result);
        return dataResponse(result);
      } catch { return dataResponse(fallbackDofusPage(body), 60); }
    }

    if (action === 'getItemDetails') {
      const id = Number(body.id);
      if (!Number.isInteger(id) || id <= 0) return Response.json({ error: 'ID requis' }, { status: 400 });
      const cacheKey = `item:v3:${id}:${lang}`;
      const cached = getCached(cacheKey);
      if (cached) return dataResponse(cached);
      try {
        const res = await fetch(`https://api.dofusdb.fr/items/${id}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4000) });
        if (!res.ok) throw new Error(`DofusDB (${res.status})`);
        const item = await res.json();
        const result = { ...normalizeDofusItem(item, lang), recipes: [] };
        if (item.hasRecipe) {
          try { result.recipes = (await loadDofusRecipes([id], lang)).get(id) || []; }
          catch { result.recipes = dofusFallback.find(i => i.id === id)?.recipes || []; result.recipeUnavailable = !result.recipes.length; }
        }
        setCached(cacheKey, result);
        return dataResponse(result);
      } catch {
        const fallback = dofusFallback.find(item => item.id === id);
        return fallback ? dataResponse(fallback, 60) : Response.json({ error: 'Détails DofusDB temporairement indisponibles.' }, { status: 503 });
      }
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
        signal: AbortSignal.timeout(4000),
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

    if (action === 'getItemSets' || action === 'getSetBonuses') {
      const limit = action === 'getSetBonuses' ? 16 : Math.min(50, Math.max(1, Number(body.limit) || 50));
      const page = Math.max(1, Number(body.page) || 1);
      const skip = (page - 1) * limit;
      const search = String(body.search || '').trim().slice(0,100);
      const ids = action === 'getSetBonuses' ? [...new Set((body.ids||[]).map(Number).filter(id=>Number.isInteger(id)&&id>0))].slice(0,16) : null;
      if (ids && !ids.length) return dataResponse({sets:[]});
      const cacheKey = `sets:v4:${lang}:${limit}:${skip}:${search}:${ids?.join(',')||''}`;
      const cached = getCached(cacheKey);
      if (cached) return dataResponse(cached);
      const params = {'$limit':String(limit),'$skip':String(skip),'$sort[level]':'-1'};
      if (search) params[`name.${lang}[$regex]`]='(?i)'+search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      if (ids) params['id[$in]']=ids.map(String);
      const res = await fetch(`https://api.dofusdb.fr/item-sets?${buildQuery(params)}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});
      if (!res.ok) throw new Error(`DofusDB (${res.status})`);
      const data = await res.json();
      const sets = (data.data||[]).map(set=>normalizeDofusSet(set,lang));
      const result = ids ? {sets} : {items:sets,total:data.total||0,page,has_more:skip+sets.length<(data.total||0),source:'live'};
      setCached(cacheKey,result);
      return dataResponse(result);
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}