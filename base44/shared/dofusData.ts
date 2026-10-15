export function normalizeDofusItem(item,lang='fr') {
  const superType=item.type?.superTypeId;
  const category=superType===2?'weapons':[6,70].includes(superType)?'consumables':superType===9?'resources':'equipment';
  return {id:item.id,name:item.name?.[lang]||item.name?.fr||'Inconnu',level:item.level||0,img:item.img||(item.iconId?`https://api.dofusdb.fr/img/items/${item.iconId}.png`:null),type:item.type?.name?.[lang]||item.type?.name?.fr||'',typeId:item.typeId,itemSetId:item.itemSetId||0,category,description:item.description?.[lang]||item.description?.fr||'',effects:(item.effects||item.possibleEffects||[]).map(e=>({from:e.from??e.diceNum??e.value??0,to:e.to??e.diceSide??0,value:e.value,effectId:e.effectId,category:e.category,characteristic:e.characteristic})),hasRecipe:!!item.hasRecipe,source:'live'};
}
export function normalizeDofusSet(set,lang='fr') {
  const members=(set.items||[]).filter(i=>typeof i==='object').map(i=>normalizeDofusItem(i,lang));
  return {id:set.id,name:set.name?.[lang]||set.name?.fr||'Panoplie',level:set.level||0,category:'sets',type:'Panoplie',img:members[0]?.img||null,members,bonuses:(set.effects||[]).map(effects=>effects.map(e=>({from:e.from??e.diceNum??e.value??0,to:e.to??e.diceSide??0,value:e.value,effectId:e.effectId,category:e.category}))),source:'live'};
}
function localized(value,lang) {
  return value?.[lang]||value?.fr||'';
}
function normalizedRewardItems(reward,lang) {
  const quantityById=new Map();
  for(const [index,entry] of (reward?.itemsReward||[]).entries()){
    if(Array.isArray(entry))quantityById.set(Number(entry[0]),Number(entry[1])||1);
    else quantityById.set(Number(entry),Number(reward?.itemsQuantityReward?.[index])||1);
  }
  return (reward?.items||[]).map(item=>({
    id:Number(item.id),
    name:localized(item.name,lang)||`Ressource ${item.id}`,
    quantity:quantityById.get(Number(item.id))||1,
    img:item.img||(item.iconId?`https://api.dofusdb.fr/img/items/${item.iconId}.png`:null),
  }));
}
function normalizeReward(reward,lang) {
  return {
    id:Number(reward.id),
    experienceRatio:Number(reward.experienceRatio)||0,
    kamasRatio:Number(reward.kamasRatio)||0,
    kamasScaleWithPlayerLevel:!!reward.kamasScaleWithPlayerLevel,
    criterions:String(reward.criterions||''),
    items:normalizedRewardItems(reward,lang),
    emoteIds:(reward.emotesReward||[]).map(Number),
    spellIds:(reward.spellsReward||[]).map(Number),
    titleIds:(reward.titlesReward||[]).map(Number),
    ornamentIds:(reward.ornamentsReward||[]).map(Number),
  };
}
export function normalizeDofusAchievement(achievement,lang='fr',detailed=false) {
  const category=achievement.category;
  const result={
    id:Number(achievement.id),
    name:localized(achievement.name,lang)||`Succès ${achievement.id}`,
    description:localized(achievement.description,lang),
    points:Number(achievement.points)||0,
    level:Number(achievement.level)||0,
    img:achievement.img||(achievement.iconId!=null?`https://api.dofusdb.fr/img/achievements/${achievement.iconId}.png`:null),
    category:category?{
      id:Number(category.id),
      name:localized(category.name,lang)||`Catégorie ${category.id}`,
      parent:category.parent?{id:Number(category.parent.id),name:localized(category.parent.name,lang)||`Catégorie ${category.parent.id}`}:null,
    }:null,
    prerequisites:{
      quests:(achievement.need?.quests||[]).map(Number),
      achievements:(achievement.need?.achievements||[]).map(Number),
    },
    updatedAt:achievement.updatedAt||null,
  };
  if(!detailed)return result;
  return {
    ...result,
    objectives:(achievement.objectives||[])
      .filter(Boolean)
      .map(objective=>({id:Number(objective.id),order:Number(objective.order)||0,name:localized(objective.name,lang)||`Objectif ${objective.id}`}))
      .sort((a,b)=>a.order-b.order||a.id-b.id),
    rewards:(achievement.rewards||[]).map(reward=>normalizeReward(reward,lang)),
  };
}
export function normalizeDofusQuest(quest,lang='fr',category=null,detailed=false,referenceNames={}) {
  const result={
    id:Number(quest.id),
    name:localized(quest.name,lang)||`Quête ${quest.id}`,
    levelMin:Math.max(1,Number(quest.levelMin)||1),
    levelMax:Math.max(1,Number(quest.levelMax)||Number(quest.levelMin)||1),
    isDungeonQuest:!!quest.isDungeonQuest,
    isPartyQuest:!!quest.isPartyQuest,
    isEvent:!!quest.isEvent,
    category:category?{id:Number(category.id),name:localized(category.name,lang)||`Catégorie ${category.id}`}:null,
    stepCount:Array.isArray(quest.stepIds)?quest.stepIds.length:0,
    prerequisites:{
      level:Math.max(1,Number(quest.levelMin)||1),
      quests:(quest.need?.quests||[]).map(Number),
      achievements:(quest.need?.achievements||[]).map(Number),
    },
    updatedAt:quest.updatedAt||null,
  };
  if(!detailed)return result;
  const stepOrder=new Map((quest.stepIds||[]).map((id,index)=>[Number(id),index]));
  return {
    ...result,
    startPositions:(quest.startPosition||[]).map(position=>({mapId:Number(position.mapId)||null,npcId:Number(position.npcId)||null})),
    steps:(quest.steps||[]).map(step=>({
      id:Number(step.id),
      order:stepOrder.get(Number(step.id))??Number.MAX_SAFE_INTEGER,
      name:localized(step.name,lang)||`Étape ${step.id}`,
      description:localized(step.description,lang),
      optimalLevel:Number(step.optimalLevel)||result.levelMin,
      duration:Number(step.duration)||1,
      objectives:(step.objectives||[]).map(objective=>{
        const text=localized(objective.text,lang)||`Objectif ${objective.id}`;
        const resolvedText=text.replace(/\{(npc|item|monster),(\d+)\}/g,(match,type,id)=>referenceNames[`${type}:${id}`]||match);
        const map=objective.map;
        const coords=objective.coords||map&&{x:map.posX,y:map.posY};
        return {
          id:Number(objective.id),
          typeId:Number(objective.typeId),
          text:resolvedText,
          unresolvedReferences:/\{(?:npc|item|monster),\d+\}/.test(resolvedText),
          coords:coords&&Number.isFinite(Number(coords.x))&&Number.isFinite(Number(coords.y))?{x:Number(coords.x),y:Number(coords.y)}:null,
          mapId:Number(objective.mapId)||Number(map?.id)||null,
          isCombat:[6,7,11,13,14,16].includes(Number(objective.typeId)),
        };
      }),
      rewards:(step.rewards||[]).map(reward=>normalizeReward(reward,lang)),
    })).sort((a,b)=>a.order-b.order||a.id-b.id),
  };
}
const ANKAMA_UNITY_BREED_ASSETS='https://static.ankama.com/dofus/ng/modules/mmorpg/encyclopedia/unity/breeds/assets/breeds';
function formatSpellEffect(template,effect) {
  const first=Number(effect.diceNum||effect.value||0);
  const second=Number(effect.diceSide||0);
  const values=[first,second,Number(effect.value||0),Number(effect.duration||0),Number(effect.random||0)];
  return String(template||'')
    .replace(/\{\{~1~2 ([^}]*)\}\}/g,(_,text)=>second&&second!==first?` ${String(text).trim()} `:'')
    .replace(/#([1-5])/g,(_,index)=>{
      const value=values[Number(index)-1];
      return Number(index)===2&&!value?'':String(value);
    })
    .replace(/\s+/g,' ')
    .trim();
}
export function normalizeDofusBreed(breed,lang='fr') {
  const fullBody=`${ANKAMA_UNITY_BREED_ASSETS}/sprite${breed.id}.png`;
  return {
    id:breed.id,
    name:localized(breed.shortName,lang)||`Classe ${breed.id}`,
    description:localized(breed.description,lang),
    gameplay:localized(breed.gameplayDescription,lang),
    img:breed.imgTransparent||breed.img||null,
    symbol:breed.img||null,
    variants:[
      {id:'male',name:'Mâle',img:fullBody,head:breed.heads?.male||null,crop:'left'},
      {id:'female',name:'Femelle',img:fullBody,head:breed.heads?.female||null,crop:'right'},
    ],
    artworkSource:'Ankama - Encyclopédie DOFUS Unity',
    spellCount:Array.isArray(breed.breedSpellsId)?breed.breedSpellsId.length:0,
  };
}
export function normalizeDofusMapArea(area,positions=new Map(),lang='fr') {
  const coordinates=[];
  for(let index=0;index<(area.shape||[]).length-1;index+=2){
    const x=Number(area.shape[index]);
    const y=Number(area.shape[index+1]);
    if(Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x)<=200&&Math.abs(y)<=200)coordinates.push([x,y]);
  }
  const shapeCenter=coordinates.length
    ?{x:Math.round(coordinates.reduce((sum,value)=>sum+value[0],0)/coordinates.length),y:Math.round(coordinates.reduce((sum,value)=>sum+value[1],0)/coordinates.length)}
    :null;
  const zaapMapId=Number(area.associatedZaapMapId);
  const entranceMapId=Number(area.entranceMapIds?.[0]);
  const representativeId=zaapMapId>0?zaapMapId:Number(area.mapIds?.[0])||null;
  const dungeonMapId=entranceMapId>0?entranceMapId:representativeId;
  const representative=positions.get(representativeId);
  const dungeonPosition=positions.get(dungeonMapId);
  const center=representative?{x:representative.posX,y:representative.posY}:shapeCenter;
  return {
    id:area.id,
    name:localized(area.name,lang)||`Zone ${area.id}`,
    level:Number(area.level)||0,
    center,
    dungeonId:Number(area.dungeonId)>=0?Number(area.dungeonId):null,
    dungeonPosition:dungeonPosition?{x:dungeonPosition.posX,y:dungeonPosition.posY}:center,
    harvestableCount:Array.isArray(area.harvestables)?area.harvestables.length:0,
    npcCount:Array.isArray(area.npcsIds)?area.npcsIds.length:0,
    tile:representative?{id:representative.id,x:representative.posX,y:representative.posY,img:representative.img?.['0.25']||null}:null,
  };
}
export function normalizeDofusSpell(spell,levels,effectDefinitions,lang='fr',variant=null) {
  return {
    id:spell.id,
    name:localized(spell.name,lang)||`Sort ${spell.id}`,
    description:localized(spell.description,lang),
    img:spell.img||(spell.iconId!=null?`https://api.dofusdb.fr/img/spells/sort_${spell.iconId}.png`:null),
    variant:variant?{
      groupId:variant.id,
      pairedSpellId:variant.pairedSpell?.id||null,
      pairedSpellName:localized(variant.pairedSpell?.name,lang)||null,
    }:null,
    levels:(levels||[]).sort((a,b)=>a.grade-b.grade).map(level=>({
      id:level.id,
      grade:level.grade,
      minPlayerLevel:level.minPlayerLevel,
      apCost:level.apCost,
      minRange:level.minRange,
      range:level.range,
      maxCastPerTurn:level.maxCastPerTurn,
      maxCastPerTarget:level.maxCastPerTarget,
      criticalHitProbability:level.criticalHitProbability,
      castInLine:!!level.castInLine,
      rangeCanBeBoosted:!!level.rangeCanBeBoosted,
      effects:(level.effects||[]).filter(effect=>effect.visibleInTooltip!==false).map(effect=>{
        const definition=effectDefinitions.get(effect.effectId);
        return {
          effectId:effect.effectId,
          description:formatSpellEffect(localized(definition?.description,lang),effect)||`Effet ${effect.effectId}`,
          duration:effect.duration||0,
        };
      }),
      criticalEffects:(level.criticalEffect||[]).filter(effect=>effect.visibleInTooltip!==false).map(effect=>{
        const definition=effectDefinitions.get(effect.effectId);
        return {
          effectId:effect.effectId,
          description:formatSpellEffect(localized(definition?.description,lang),effect)||`Effet critique ${effect.effectId}`,
          duration:effect.duration||0,
        };
      }),
    })),
  };
}
function plainText(value) {
  return String(value||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
}
export function normalizeDofusAlmanax(entry,lang='fr',date='') {
  const description=plainText(localized(entry?.meriaDescription,lang));
  const meryde=entry?.npc?.name?.[lang]||entry?.npc?.name?.fr||
    description.match(/^(.+?) est le Méryde/i)?.[1]||'Méryde du jour';
  const item=entry?.items?.[0];
  return {
    date,
    meryde,
    merydeDescription:description,
    offering:{
      quantity:Number(entry?.quantities?.[0]||1),
      name:item?.name?.[lang]||item?.name?.fr||'Offrande du jour',
      img:item?.img||(item?.iconId?`https://api.dofusdb.fr/img/items/${item.iconId}.png`:null),
    },
    bonus:{name:localized(entry?.name,lang)||'Bonus du jour',description:plainText(localized(entry?.desc,lang))},
    source:'DofusDB',
  };
}
export async function loadDofusRecipes(ids,lang='fr') {
  if(!ids.length)return new Map();
  const query=ids.map(id=>`resultId[$in]=${encodeURIComponent(id)}`).join('&');
  const res=await fetch(`https://api.dofusdb.fr/recipes?$limit=50&${query}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(4000)});
  if(!res.ok)throw new Error(`Recettes DofusDB (${res.status})`);
  const {data=[]}=await res.json();
  return new Map(data.map(recipe=>[recipe.resultId,(recipe.ingredientIds||[]).map((id,index)=>{const ingredient=recipe.ingredients?.find(i=>i.id===id);return {id,quantity:recipe.quantities?.[index]||1,ingredientName:ingredient?.name?.[lang]||ingredient?.name?.fr||`Ressource ${id}`,ingredientImg:ingredient?.img||(ingredient?.iconId?`https://api.dofusdb.fr/img/items/${ingredient.iconId}.png`:null)};})]));
}