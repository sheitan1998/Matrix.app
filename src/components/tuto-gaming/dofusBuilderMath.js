export const STUFF_SLOTS=[
  {id:'head',name:'Coiffe',typeIds:[16]},
  {id:'cape',name:'Cape',typeIds:[17]},
  {id:'amulet',name:'Amulette',typeIds:[1]},
  {id:'ring1',name:'Anneau 1',typeIds:[9]},
  {id:'ring2',name:'Anneau 2',typeIds:[9]},
  {id:'belt',name:'Ceinture',typeIds:[10]},
  {id:'boots',name:'Bottes',typeIds:[11]},
  {id:'weapon',name:'Arme',category:'weapons'},
  {id:'shield',name:'Bouclier',typeIds:[82]},
  {id:'companion',name:'Familier / Montilier',typeIds:[18,121]},
  ...Array.from({length:6},(_,index)=>({id:`dofus${index+1}`,name:`Dofus / Trophée ${index+1}`,typeIds:[23,151]})),
];

const POSITIVE={111:'pa',128:'pm',125:'vitality',118:'strength',119:'agility',123:'chance',126:'intelligence',124:'wisdom',138:'power',112:'damage',121:'damage',422:'earthDamage',424:'fireDamage',426:'waterDamage',428:'airDamage',430:'neutralDamage',210:'earthPercent',211:'waterPercent',212:'airPercent',213:'firePercent',214:'neutralPercent',240:'earthResistance',241:'waterResistance',242:'airResistance',243:'fireResistance',244:'neutralResistance'};
const NEGATIVE={101:'pa',127:'pm',153:'vitality',157:'strength',154:'agility',152:'chance',155:'intelligence',156:'wisdom',186:'power',145:'damage',215:'earthPercent',216:'waterPercent',217:'airPercent',218:'firePercent',219:'neutralPercent',245:'earthResistance',246:'waterResistance',247:'airResistance',248:'fireResistance',249:'neutralResistance'};

export function canEquipItem(slot,item) {
  if(!slot||!item)return false;
  if(slot.category&&item.category!==slot.category)return false;
  return !slot.typeIds||slot.typeIds.includes(Number(item.typeId));
}

export function normalizeEquipment(equipment) {
  if(!equipment||typeof equipment!=='object'||Array.isArray(equipment))return {};
  const usedIds=new Set();
  const normalized={};
  for(const slot of STUFF_SLOTS){
    const item=equipment[slot.id];
    const itemId=Number(item?.id);
    if(!item||typeof item!=='object'||!Number.isInteger(itemId)||usedIds.has(itemId)||!canEquipItem(slot,item))continue;
    normalized[slot.id]=item;
    usedIds.add(itemId);
  }
  return normalized;
}

export function totalStuffStats(equipment,sets=[]) {
  const totals={pa:6,pm:3,vitality:0,strength:0,agility:0,chance:0,intelligence:0,wisdom:0,power:0,damage:0,earthDamage:0,fireDamage:0,waterDamage:0,airDamage:0,neutralDamage:0,earthPercent:0,waterPercent:0,airPercent:0,firePercent:0,neutralPercent:0,earthResistance:0,waterResistance:0,airResistance:0,fireResistance:0,neutralResistance:0};
  const items=Object.values(normalizeEquipment(equipment));
  const effects=items.flatMap(item=>item.effects||[]);
  for(const set of sets){
    const pieces=new Set(items.filter(item=>item.itemSetId===set.id).map(item=>item.id)).size;
    if(pieces>0)effects.push(...(set.bonuses?.[pieces-1]||[]));
  }
  for(const effect of effects){
    if(effect.category===2)continue;
    const key=POSITIVE[effect.effectId]||NEGATIVE[effect.effectId];
    if(!key)continue;
    const magnitude=Math.max(Math.abs(Number(effect.from)||0),Math.abs(Number(effect.to)||0));
    totals[key]+=NEGATIVE[effect.effectId]?-magnitude:magnitude;
  }
  return totals;
}

export function downloadPreset(preset) {
  const blob=new Blob([JSON.stringify({...preset,version:2,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');
  anchor.href=url;
  anchor.download=`${(preset.name||'stuff-dofus').replace(/[^a-z0-9-_]/gi,'-')}.json`;
  anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
