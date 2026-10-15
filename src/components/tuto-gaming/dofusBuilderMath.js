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

const POSITIVE={111:'pa',128:'pm',117:'range',115:'critical',174:'initiative',125:'vitality',118:'strength',119:'agility',123:'chance',126:'intelligence',124:'wisdom',138:'power',112:'damage',121:'damage',422:'earthDamage',424:'fireDamage',426:'waterDamage',428:'airDamage',430:'neutralDamage',210:'earthPercent',211:'waterPercent',212:'airPercent',213:'firePercent',214:'neutralPercent',240:'earthResistance',241:'waterResistance',242:'airResistance',243:'fireResistance',244:'neutralResistance'};
const NEGATIVE={101:'pa',127:'pm',116:'range',171:'critical',175:'initiative',153:'vitality',157:'strength',154:'agility',152:'chance',155:'intelligence',156:'wisdom',186:'power',145:'damage',215:'earthPercent',216:'waterPercent',217:'airPercent',218:'firePercent',219:'neutralPercent',245:'earthResistance',246:'waterResistance',247:'airResistance',248:'fireResistance',249:'neutralResistance'};
export const CHARACTERISTICS=['vitality','wisdom','strength','intelligence','chance','agility'];

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
    const duplicate=usedIds.has(itemId);
    const duplicateRingAllowed=item&&slot.id.startsWith('ring')&&Number(item.itemSetId||0)<=0&&
      Object.entries(normalized).some(([key,value])=>key.startsWith('ring')&&Number(value.id)===itemId);
    if(!item||typeof item!=='object'||!Number.isInteger(itemId)||(duplicate&&!duplicateRingAllowed)||!canEquipItem(slot,item))continue;
    normalized[slot.id]=item;
    usedIds.add(itemId);
  }
  return normalized;
}

export function normalizeCharacteristics(value) {
  const source=value&&typeof value==='object'?value:{};
  return Object.fromEntries(CHARACTERISTICS.map(key=>[key,{
    base:Math.max(0,Math.min(995,Math.trunc(Number(source[key]?.base)||0))),
    parchment:Math.max(0,Math.min(100,Math.trunc(Number(source[key]?.parchment)||0))),
  }]));
}

function effectMagnitude(effect) {
  const values=[effect?.from,effect?.to,effect?.value,effect?.diceNum,effect?.diceSide]
    .map(Number).filter(Number.isFinite);
  return values.length?Math.max(...values.map(Math.abs)):0;
}

export function totalStuffStats(equipment,sets=[],characteristics={}) {
  const totals={pa:6,pm:3,range:0,critical:0,initiative:0,vitality:0,strength:0,agility:0,chance:0,intelligence:0,wisdom:0,power:0,damage:0,earthDamage:0,fireDamage:0,waterDamage:0,airDamage:0,neutralDamage:0,earthPercent:0,waterPercent:0,airPercent:0,firePercent:0,neutralPercent:0,earthResistance:0,waterResistance:0,airResistance:0,fireResistance:0,neutralResistance:0};
  const normalizedCharacteristics=normalizeCharacteristics(characteristics);
  for(const key of CHARACTERISTICS)totals[key]+=normalizedCharacteristics[key].base+normalizedCharacteristics[key].parchment;
  const items=Object.values(normalizeEquipment(equipment));
  const effects=items.flatMap(item=>item.effects||[]);
  for(const set of sets){
    const pieces=new Set(items.filter(item=>Number(item.itemSetId)===Number(set.id)).map(item=>item.id)).size;
    if(pieces>0)effects.push(...(set.bonuses?.[pieces-1]||[]));
  }
  for(const effect of effects){
    if(effect.category===2)continue;
    const effectId=Number(effect.effectId);
    const key=POSITIVE[effectId]||NEGATIVE[effectId];
    if(!key)continue;
    const magnitude=effectMagnitude(effect);
    totals[key]+=NEGATIVE[effectId]?-magnitude:magnitude;
  }
  totals.pdv=totals.vitality;
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
