import { createApiCache, dataResponse } from "../../shared/apiCache.ts";
import { dofusFallback, fallbackDofusPage } from "../../shared/dofusFallback.ts";
import { normalizeDofusAchievement, normalizeDofusAlmanax, normalizeDofusBreed, normalizeDofusHarvestCoverage, normalizeDofusItem, normalizeDofusMapArea, normalizeDofusQuest, normalizeDofusSet, normalizeDofusSpell, normalizeDofusWorld, loadDofusRecipes } from "../../shared/dofusData.ts";

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
function bytesToBase64(bytes) {
  let binary='';
  for(let index=0;index<bytes.length;index+=0x8000){
    binary+=String.fromCharCode(...bytes.subarray(index,index+0x8000));
  }
  return btoa(binary);
}
async function loadBreedArtwork(breedId) {
  const cacheKey=`breed-artwork:v1:${breedId}`;
  const cached=rawGetCached(cacheKey,CACHE_TTL_TYPES);
  if(cached)return cached;
  const url=`https://static.ankama.com/dofus/ng/modules/mmorpg/encyclopedia/unity/breeds/assets/breeds/sprite${breedId}.png`;
  const response=await fetch(url,{headers:{Accept:'image/png'},signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error(`Illustration Ankama (${response.status})`);
  const contentType=response.headers.get('content-type')||'';
  if(!contentType.startsWith('image/png'))throw new Error('Format d’illustration Ankama inattendu');
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(!bytes.length||bytes.length>300000)throw new Error('Taille d’illustration Ankama invalide');
  const result={dataUrl:`data:image/png;base64,${bytesToBase64(bytes)}`,sourceUrl:url};
  setCached(cacheKey,result);
  return result;
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
async function fetchAllDofus(path,params={},timeout=12000) {
  const first=await fetchDofusCollection(path,{...params,'$limit':'100','$skip':'0'},timeout);
  const rows=[...(first.data||[])];
  const pageSize=Math.max(1,Number(first.limit)||rows.length||100);
  for(let skip=pageSize;skip<Number(first.total||0);skip+=pageSize){
    const page=await fetchDofusCollection(path,{...params,'$limit':String(pageSize),'$skip':String(skip)},timeout);
    rows.push(...(page.data||[]));
  }
  return rows;
}
async function getProgressionCategories(lang) {
  const cacheKey=`progression-categories:v1:${lang}`;
  const cached=rawGetCached(cacheKey,CACHE_TTL_TYPES);
  if(cached)return cached;
  const [achievementRows,questRows]=await Promise.all([
    fetchAllDofus('achievement-categories',{},15000),
    fetchAllDofus('quest-categories',{},15000),
  ]);
  const localize=value=>value?.[lang]||value?.fr||'';
  const achievements=achievementRows.map(category=>({
    id:Number(category.id),
    parentId:Number(category.parentId)||0,
    name:localize(category.name)||`Catégorie ${category.id}`,
    order:Number(category.order)||0,
  }));
  const quests=questRows.map(category=>({
    id:Number(category.id),
    name:localize(category.name)||`Catégorie ${category.id}`,
    order:Number(category.order)||0,
  })).sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,lang));
  const result={
    achievements:achievements.filter(category=>category.parentId===0).sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,lang)),
    achievementTree:achievements,
    quests,
  };
  setCached(cacheKey,result);
  return result;
}
function descendantCategoryIds(rootId,categories) {
  if(!rootId)return [];
  const ids=new Set([rootId]);
  let changed=true;
  while(changed){
    changed=false;
    for(const category of categories){
      if(ids.has(category.parentId)&&!ids.has(category.id)){ids.add(category.id);changed=true;}
    }
  }
  return [...ids];
}
function progressionListParams(body,lang,levelField='level') {
  const limit=Math.min(30,Math.max(12,Number(body.limit)||24));
  const page=Math.max(1,Number(body.page)||1);
  const search=String(body.search||'').trim().slice(0,80);
  const minLevel=Math.max(0,Number(body.minLevel)||0);
  const maxLevel=Math.min(200,Math.max(0,Number(body.maxLevel)||0));
  const params={'$limit':String(limit),'$skip':String((page-1)*limit),[`$sort[${levelField}]`]:'1'};
  if(search){
    params[`name.${lang}[$regex]`]=search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    params[`name.${lang}[$options]`]='i';
  }
  if(minLevel)params[`${levelField}[$gte]`]=String(minLevel);
  if(maxLevel)params[`${levelField}[$lte]`]=String(maxLevel);
  return {limit,page,params,search,minLevel,maxLevel};
}
function objectiveReferenceIds(quest) {
  const npcIds=new Set();
  const itemIds=new Set();
  const monsterIds=new Set();
  for(const objective of (quest.steps||[]).flatMap(step=>step.objectives||[])){
    const type=Number(objective.typeId);
    const parameters=objective.parameters||{};
    if([1,2,3,9,10,12].includes(type)&&Number(parameters.parameter0)>0)npcIds.add(Number(parameters.parameter0));
    if([2,3].includes(type)&&Number(parameters.parameter1)>0)itemIds.add(Number(parameters.parameter1));
    if([8,17].includes(type)&&Number(parameters.parameter0)>0)itemIds.add(Number(parameters.parameter0));
    if([6,7,14,16].includes(type)&&Number(parameters.parameter0)>0)monsterIds.add(Number(parameters.parameter0));
  }
  return {npcIds:[...npcIds],itemIds:[...itemIds],monsterIds:[...monsterIds]};
}
async function resolveQuestReferences(quest,lang) {
  const ids=objectiveReferenceIds(quest);
  const [npcs,items,monsters]=await Promise.all([
    ids.npcIds.length?fetchDofusByIds('npcs',ids.npcIds):[],
    ids.itemIds.length?fetchDofusByIds('items',ids.itemIds):[],
    ids.monsterIds.length?fetchDofusByIds('monsters',ids.monsterIds):[],
  ]);
  const result={};
  const localize=value=>value?.[lang]||value?.fr||'';
  for(const npc of npcs)result[`npc:${npc.id}`]=localize(npc.name)||`PNJ ${npc.id}`;
  for(const item of items)result[`item:${item.id}`]=localize(item.name)||`Objet ${item.id}`;
  for(const monster of monsters)result[`monster:${monster.id}`]=localize(monster.name)||`Monstre ${monster.id}`;
  return result;
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
      const cacheKey=`breeds:v2:${lang}`;
      const cached=rawGetCached(cacheKey,CACHE_TTL_TYPES);
      if(cached)return dataResponse(cached);
      const data=await fetchDofusCollection('breeds',{'$limit':'30','$sort[sortIndex]':'1'});
      const breeds=await Promise.all((data.data||[]).map(async breed=>{
        const normalized=normalizeDofusBreed(breed,lang);
        try{return {...normalized,artworkDataUrl:(await loadBreedArtwork(breed.id)).dataUrl};}
        catch{return {...normalized,artworkDataUrl:null};}
      }));
      const result={breeds,source:'live'};
      setCached(cacheKey,result);
      return dataResponse(result);
    }

    if (action === 'getBreedArtwork') {
      const breedId=Number(body.breedId);
      const allowedIds=new Set([...Array.from({length:18},(_,index)=>index+1),20]);
      if(!allowedIds.has(breedId))return Response.json({error:'Classe invalide'},{status:400});
      return dataResponse(await loadBreedArtwork(breedId));
    }

    if (action === 'getBreedSpells') {
      const breedId=Number(body.breedId);
      if(!Number.isInteger(breedId)||breedId<=0)return Response.json({error:'Classe requise'},{status:400});
      const cacheKey=`breed-spells:v2:${breedId}:${lang}`;
      const cached=rawGetCached(cacheKey,CACHE_TTL_TYPES);
      if(cached)return dataResponse(cached);
      const breedResponse=await fetch(`https://api.dofusdb.fr/breeds/${breedId}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(8000)});
      if(!breedResponse.ok)throw new Error(`DofusDB breeds (${breedResponse.status})`);
      const breed=await breedResponse.json();
      const spellIds=[...new Set((breed.breedSpellsId||[]).map(Number).filter(Number.isInteger))];
      if(!spellIds.length)return dataResponse({breed:normalizeDofusBreed(breed,lang),spells:[],source:'live'});
      const spells=await fetchDofusByIds('spells',spellIds);
      const variantsResponse=await fetchDofusCollection('spell-variants',{'$limit':'50','breedId':String(breedId)});
      const variantBySpell=new Map();
      for(const variant of variantsResponse.data||[]){
        for(const spellId of variant.spellIds||[]){
          variantBySpell.set(Number(spellId),{
            id:variant.id,
            pairedSpell:(variant.spells||[]).find(value=>Number(value.id)!==Number(spellId))||null,
          });
        }
      }
      const levelIds=[...new Set(spells.flatMap(spell=>spell.spellLevels||[]).map(Number).filter(Number.isInteger))];
      const levels=levelIds.length?await fetchDofusByIds('spell-levels',levelIds):[];
      const effectIds=[...new Set(levels.flatMap(level=>[...(level.effects||[]),...(level.criticalEffect||[])]).map(effect=>Number(effect.effectId)).filter(Number.isInteger))];
      const effects=effectIds.length?await fetchDofusByIds('effects',effectIds):[];
      const effectDefinitions=new Map(effects.map(effect=>[effect.id,effect]));
      if(levelIds.length&&!levels.length)throw new Error('DofusDB Unity: aucun spell-level live retourné');
      const result={
        breed:normalizeDofusBreed(breed,lang),
        spells:spells
          .map(spell=>normalizeDofusSpell(spell,levels.filter(level=>level.spellId===spell.id),effectDefinitions,lang,variantBySpell.get(spell.id)||null))
          .sort((a,b)=>a.levels[0]?.minPlayerLevel-b.levels[0]?.minPlayerLevel||a.name.localeCompare(b.name,lang)),
        source:'DofusDB Unity live',
        endpoints:['/breeds/:id','/spells','/spell-variants','/spell-levels','/effects'],
        schemaCoverage:{
          requestedSpells:spellIds.length,
          resolvedSpells:spells.length,
          requestedLevels:levelIds.length,
          resolvedLevels:levels.length,
          requestedEffects:effectIds.length,
          resolvedEffects:effects.length,
        },
        updatedAt:spells.map(spell=>spell.updatedAt).filter(Boolean).sort().at(-1)||null,
      };
      setCached(cacheKey,result);
      return dataResponse(result);
    }

    if (action === 'getMapLayers') {
      const cacheKey=`map-layers:v3:${lang}`;
      const cached=rawGetCached(cacheKey,CACHE_TTL_TYPES);
      if(cached)return dataResponse(cached);
      const worldResponse=fetch('https://api.dofusdb.fr/worlds/1',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});
      const [worldRaw,rows,jobs,skills,npcSummary,poiSummary]=await Promise.all([
        worldResponse.then(async response=>{
          if(!response.ok)throw new Error(`DofusDB worlds (${response.status})`);
          return response.json();
        }),
        fetchAllDofus('subareas',{},15000),
        fetchAllDofus('jobs',{},12000),
        fetchAllDofus('skills',{'gatheredRessourceItem[$gt]':'0'},15000),
        fetchDofusCollection('npcs',{'$limit':'1'},12000),
        fetchDofusCollection('point-of-interest',{'$limit':'1'},12000),
      ]);
      const entranceIds=[...new Set(rows.flatMap(area=>area.entranceMapIds||[]).map(Number).filter(id=>Number.isInteger(id)&&id>0))];
      const npcIds=[...new Set(rows.flatMap(area=>area.npcsIds||[]).map(Number).filter(id=>Number.isInteger(id)&&id>0))];
      const [positions,npcDefinitions]=await Promise.all([
        entranceIds.length?fetchDofusByIds('map-positions',entranceIds,15000):[],
        npcIds.length?fetchDofusByIds('npcs',npcIds,15000):[],
      ]);
      const positionsById=new Map(positions.map(position=>[Number(position.id),position]));
      const localize=value=>value?.[lang]||value?.fr||'';
      const npcById=new Map(npcDefinitions.map(npc=>[Number(npc.id),npc]));
      const harvestCoverage=normalizeDofusHarvestCoverage(skills,jobs,lang);
      const areas=rows.map(area=>normalizeDofusMapArea(
        area,
        positionsById,
        lang,
        harvestCoverage.resourcesBySubarea.get(Number(area.id))||[],
        (area.npcsIds||[]).map(id=>npcById.get(Number(id))).filter(Boolean).map(npc=>({id:Number(npc.id),name:localize(npc.name)||`PNJ ${npc.id}`})),
      )).filter(area=>area.center);
      const resourceJobs=harvestCoverage.jobs;
      const positionedNpcCount=areas.reduce((sum,area)=>sum+area.npcCount,0);
      const result={
        world:normalizeDofusWorld(worldRaw,lang),
        areas,
        resourceJobs,
        total:areas.length,
        coverage:{
          dungeons:areas.filter(area=>area.dungeonId!==null).length,
          resourceZones:areas.filter(area=>area.harvestableCount>0).length,
          resourceTypes:resourceJobs.reduce((sum,job)=>sum+job.resources.length,0),
          resourceInstances:areas.reduce((sum,area)=>sum+area.resourceCount,0),
          positionedNpcs:positionedNpcCount,
          unplacedNpcDefinitions:Math.max(0,Number(npcSummary.total||0)-positionedNpcCount),
          unplacedPointsOfInterest:Number(poiSummary.total)||0,
        },
        source:'DofusDB',
        endpoints:['/worlds/1','/img/worlds/{worldId}/{scale}/{index}.jpg','/subareas','/map-positions','/jobs','/skills','/npcs','/point-of-interest'],
        limits:{
          resources:'Les quantités sont reliées aux sous-zones par items.resourcesBySubarea ; l’API publique ne fournit pas la position exacte de chaque récolte.',
          npcs:'Les définitions /npcs et /point-of-interest ne publient pas de coordonnées ; seuls les IDs présents dans subareas.npcsIds peuvent être placés.',
        },
      };
      setCached(cacheKey,result);
      return dataResponse(result);
    }

    if(action==='getProgressionFilters'){
      const categories=await getProgressionCategories(lang);
      return dataResponse({
        achievements:categories.achievements,
        quests:categories.quests,
        levelRanges:[[1,50],[51,100],[101,150],[151,190],[191,200]],
        source:'DofusDB',
      });
    }

    if(action==='getAchievements'){
      const {limit,page,params,search,minLevel,maxLevel}=progressionListParams(body,lang,'level');
      const categoryId=Math.max(0,Number(body.categoryId)||0);
      const categories=await getProgressionCategories(lang);
      const categoryIds=descendantCategoryIds(categoryId,categories.achievementTree);
      if(categoryIds.length)params['categoryId[$in]']=categoryIds.map(String);
      const cacheKey=`achievements:v1:${lang}:${page}:${limit}:${search}:${minLevel}:${maxLevel}:${categoryId}`;
      const cached=getCached(cacheKey);
      if(cached)return dataResponse(cached);
      const response=await fetchDofusCollection('achievements',params,12000);
      const achievements=(response.data||[]).map(value=>normalizeDofusAchievement(value,lang));
      const result={
        achievements,
        total:Number(response.total)||0,
        page,
        hasMore:(page-1)*limit+achievements.length<Number(response.total||0),
        source:'DofusDB',
      };
      setCached(cacheKey,result);
      return dataResponse(result);
    }

    if(action==='getAchievementDetails'){
      const id=Number(body.id);
      if(!Number.isInteger(id)||id<=0)return Response.json({error:'Succès invalide'},{status:400});
      const cacheKey=`achievement-detail:v1:${lang}:${id}`;
      const cached=getCached(cacheKey);
      if(cached)return dataResponse(cached);
      const response=await fetch(`https://api.dofusdb.fr/achievements/${id}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});
      if(!response.ok)throw new Error(`DofusDB achievements (${response.status})`);
      const result={achievement:normalizeDofusAchievement(await response.json(),lang,true),source:'DofusDB'};
      setCached(cacheKey,result);
      return dataResponse(result);
    }

    if(action==='getQuests'){
      const {limit,page,params,search,minLevel,maxLevel}=progressionListParams(body,lang,'levelMin');
      const categoryId=Math.max(0,Number(body.categoryId)||0);
      if(categoryId)params.categoryId=String(categoryId);
      const cacheKey=`quests:v1:${lang}:${page}:${limit}:${search}:${minLevel}:${maxLevel}:${categoryId}`;
      const cached=getCached(cacheKey);
      if(cached)return dataResponse(cached);
      const [response,categories]=await Promise.all([
        fetchDofusCollection('quests',params,15000),
        getProgressionCategories(lang),
      ]);
      const categoriesById=new Map(categories.quests.map(category=>[category.id,category]));
      const quests=(response.data||[]).map(value=>normalizeDofusQuest(value,lang,categoriesById.get(Number(value.categoryId))));
      const result={
        quests,
        total:Number(response.total)||0,
        page,
        hasMore:(page-1)*limit+quests.length<Number(response.total||0),
        source:'DofusDB',
      };
      setCached(cacheKey,result);
      return dataResponse(result);
    }

    if(action==='getQuestDetails'){
      const id=Number(body.id);
      if(!Number.isInteger(id)||id<=0)return Response.json({error:'Quête invalide'},{status:400});
      const cacheKey=`quest-detail:v1:${lang}:${id}`;
      const cached=getCached(cacheKey);
      if(cached)return dataResponse(cached);
      const [response,categories]=await Promise.all([
        fetch(`https://api.dofusdb.fr/quests/${id}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)}),
        getProgressionCategories(lang),
      ]);
      if(!response.ok)throw new Error(`DofusDB quests (${response.status})`);
      const quest=await response.json();
      const category=categories.quests.find(value=>value.id===Number(quest.categoryId))||null;
      const references=await resolveQuestReferences(quest,lang);
      const result={quest:normalizeDofusQuest(quest,lang,category,true,references),source:'DofusDB'};
      setCached(cacheKey,result);
      return dataResponse(result);
    }

    if(action==='getQuestPrerequisites'){
      const id=Number(body.id);
      if(!Number.isInteger(id)||id<=0)return Response.json({error:'Quête invalide'},{status:400});
      const cacheKey=`quest-prerequisites:v1:${lang}:${id}`;
      const cached=getCached(cacheKey);
      if(cached)return dataResponse(cached);
      const questsById=new Map();
      const missing=[];
      let pending=[id];
      while(pending.length&&questsById.size<500){
        const batch=[...new Set(pending.filter(value=>!questsById.has(value)))].slice(0,100);
        pending=[];
        if(!batch.length)break;
        const rows=await fetchDofusByIds('quests',batch,15000);
        const foundIds=new Set(rows.map(row=>Number(row.id)));
        for(const requestedId of batch)if(!foundIds.has(requestedId))missing.push({type:'quest',id:requestedId});
        for(const row of rows){
          questsById.set(Number(row.id),row);
          for(const dependency of row.need?.quests||[])if(!questsById.has(Number(dependency)))pending.push(Number(dependency));
        }
      }
      const achievementIds=[...new Set([...questsById.values()].flatMap(quest=>quest.need?.achievements||[]).map(Number).filter(Number.isInteger))];
      const achievements=achievementIds.length?await fetchDofusByIds('achievements',achievementIds,15000):[];
      const achievementById=new Map(achievements.map(value=>[Number(value.id),value]));
      const localize=value=>value?.[lang]||value?.fr||'';
      for(const achievementId of achievementIds)if(!achievementById.has(achievementId))missing.push({type:'achievement',id:achievementId});
      const nodes=[...questsById.values()].map(quest=>({
        id:Number(quest.id),
        type:'quest',
        name:localize(quest.name)||`Quête ${quest.id}`,
        level:Math.max(1,Number(quest.levelMin)||1),
        questIds:(quest.need?.quests||[]).map(Number),
        achievementIds:(quest.need?.achievements||[]).map(Number),
      }));
      const achievementNodes=achievements.map(value=>({
        id:Number(value.id),
        type:'achievement',
        name:localize(value.name)||`Succès ${value.id}`,
        level:Math.max(1,Number(value.level)||1),
        questIds:[],
        achievementIds:[],
      }));
      const result={rootId:id,nodes:[...nodes,...achievementNodes],missing,truncated:pending.length>0,source:'DofusDB'};
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