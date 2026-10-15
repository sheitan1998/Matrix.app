export function normalizeDofusItem(item,lang='fr') {
  const superType=item.type?.superTypeId;
  const category=superType===2?'weapons':[6,70].includes(superType)?'consumables':superType===9?'resources':'equipment';
  return {id:item.id,name:item.name?.[lang]||item.name?.fr||'Inconnu',level:item.level||0,img:item.img||(item.iconId?`https://api.dofusdb.fr/img/items/${item.iconId}.png`:null),type:item.type?.name?.[lang]||item.type?.name?.fr||'',typeId:item.typeId,itemSetId:item.itemSetId||0,category,description:item.description?.[lang]||item.description?.fr||'',effects:(item.effects||[]).map(e=>({from:e.from??0,to:e.to??0,effectId:e.effectId,category:e.category,characteristic:e.characteristic})),hasRecipe:!!item.hasRecipe,source:'live'};
}
export function normalizeDofusSet(set,lang='fr') {
  const members=(set.items||[]).filter(i=>typeof i==='object').map(i=>normalizeDofusItem(i,lang));
  return {id:set.id,name:set.name?.[lang]||set.name?.fr||'Panoplie',level:set.level||0,category:'sets',type:'Panoplie',img:members[0]?.img||null,members,bonuses:(set.effects||[]).map(effects=>effects.map(e=>({from:e.from??0,to:e.to??0,effectId:e.effectId,category:e.category}))),source:'live'};
}
function localized(value,lang) {
  return value?.[lang]||value?.fr||'';
}
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
  return {
    id:breed.id,
    name:localized(breed.shortName,lang)||`Classe ${breed.id}`,
    description:localized(breed.description,lang),
    gameplay:localized(breed.gameplayDescription,lang),
    img:breed.imgTransparent||breed.img||null,
    symbol:breed.img||null,
    spellCount:Array.isArray(breed.breedSpellsId)?breed.breedSpellsId.length:0,
  };
}
export function normalizeDofusSpell(spell,levels,effectDefinitions,lang='fr') {
  return {
    id:spell.id,
    name:localized(spell.name,lang)||`Sort ${spell.id}`,
    description:localized(spell.description,lang),
    img:spell.img||(spell.iconId!=null?`https://api.dofusdb.fr/img/spells/sort_${spell.iconId}.png`:null),
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
export async function loadDofusRecipes(ids,lang='fr') {
  if(!ids.length)return new Map();
  const query=ids.map(id=>`resultId[$in]=${encodeURIComponent(id)}`).join('&');
  const res=await fetch(`https://api.dofusdb.fr/recipes?$limit=50&${query}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(4000)});
  if(!res.ok)throw new Error(`Recettes DofusDB (${res.status})`);
  const {data=[]}=await res.json();
  return new Map(data.map(recipe=>[recipe.resultId,(recipe.ingredientIds||[]).map((id,index)=>{const ingredient=recipe.ingredients?.find(i=>i.id===id);return {id,quantity:recipe.quantities?.[index]||1,ingredientName:ingredient?.name?.[lang]||ingredient?.name?.fr||`Ressource ${id}`,ingredientImg:ingredient?.img||(ingredient?.iconId?`https://api.dofusdb.fr/img/items/${ingredient.iconId}.png`:null)};})]));
}