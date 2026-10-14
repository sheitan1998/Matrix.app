export function normalizeDofusItem(item,lang='fr') {
  const superType=item.type?.superTypeId;
  const category=superType===2?'weapons':[6,70].includes(superType)?'consumables':superType===9?'resources':'equipment';
  return {id:item.id,name:item.name?.[lang]||item.name?.fr||'Inconnu',level:item.level||0,img:item.img||(item.iconId?`https://api.dofusdb.fr/img/items/${item.iconId}.png`:null),type:item.type?.name?.[lang]||item.type?.name?.fr||'',typeId:item.typeId,category,description:item.description?.[lang]||item.description?.fr||'',effects:(item.effects||[]).map(e=>({from:e.from??0,to:e.to??0,effectId:e.effectId})),hasRecipe:!!item.hasRecipe,source:'live'};
}
export async function loadDofusRecipes(ids,lang='fr') {
  if(!ids.length)return new Map();
  const query=ids.map(id=>`resultId[$in]=${encodeURIComponent(id)}`).join('&');
  const res=await fetch(`https://api.dofusdb.fr/recipes?$limit=50&${query}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(4000)});
  if(!res.ok)throw new Error(`Recettes DofusDB (${res.status})`);
  const {data=[]}=await res.json();
  return new Map(data.map(recipe=>[recipe.resultId,(recipe.ingredientIds||[]).map((id,index)=>{const ingredient=recipe.ingredients?.find(i=>i.id===id);return {id,quantity:recipe.quantities?.[index]||1,ingredientName:ingredient?.name?.[lang]||ingredient?.name?.fr||`Ressource ${id}`,ingredientImg:ingredient?.img||(ingredient?.iconId?`https://api.dofusdb.fr/img/items/${ingredient.iconId}.png`:null)};})]));
}