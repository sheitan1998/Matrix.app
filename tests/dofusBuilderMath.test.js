import test from 'node:test';
import assert from 'node:assert/strict';
import { canEquipItem, normalizeCharacteristics, normalizeEquipment, STUFF_SLOTS, totalStuffStats } from '../src/components/tuto-gaming/dofusBuilderMath.js';

const ring={id:1,typeId:9,category:'equipment',effects:[{effectId:125,from:80,to:100},{effectId:153,from:-20,to:0}]};
const sword={id:2,typeId:6,category:'weapons',effects:[{effectId:111,from:1,to:0},{effectId:422,from:8,to:10}]};

test('defines exactly 16 coherent stuff slots',()=>{
  assert.equal(STUFF_SLOTS.length,16);
  assert.equal(new Set(STUFF_SLOTS.map(slot=>slot.id)).size,16);
  assert.equal(canEquipItem(STUFF_SLOTS.find(slot=>slot.id==='ring1'),ring),true);
  assert.equal(canEquipItem(STUFF_SLOTS.find(slot=>slot.id==='weapon'),ring),false);
  assert.equal(canEquipItem(STUFF_SLOTS.find(slot=>slot.id==='weapon'),sword),true);
});

test('normalizes incompatible and duplicate persisted equipment',()=>{
  const normalized=normalizeEquipment({ring1:ring,ring2:ring,weapon:ring,head:{id:3,typeId:16,category:'equipment'}});
  assert.deepEqual(Object.keys(normalized),['head','ring1','ring2']);
});

test('allows duplicate non-set rings but rejects duplicate set rings and Dofus',()=>{
  assert.equal(Object.keys(normalizeEquipment({ring1:ring,ring2:ring})).length,2);
  const setRing={...ring,id:4,itemSetId:7};
  assert.deepEqual(Object.keys(normalizeEquipment({ring1:setRing,ring2:setRing})),['ring1']);
  const dofus={id:5,typeId:23,category:'equipment'};
  assert.deepEqual(Object.keys(normalizeEquipment({dofus1:dofus,dofus2:dofus})),['dofus1']);
});

test('calculates base, positive, negative, elemental and set statistics',()=>{
  const totals=totalStuffStats({ring1:ring,weapon:sword},[{id:7,bonuses:[[],[{effectId:128,from:1,to:0}]]}]);
  assert.equal(totals.pa,7);
  assert.equal(totals.pm,3);
  assert.equal(totals.vitality,80);
  assert.equal(totals.earthDamage,10);
});

test('combines editable characteristics, missing effect fields, malus and two-piece set bonus',()=>{
  const item={id:8,typeId:16,category:'equipment',itemSetId:7,effects:[
    {effectId:117,value:1},{effectId:171,from:2},{effectId:174,diceNum:120},
  ]};
  const second={id:9,typeId:17,category:'equipment',itemSetId:7,effects:null};
  const characteristics=normalizeCharacteristics({vitality:{base:200,parchment:100},strength:{base:-4,parchment:999}});
  const totals=totalStuffStats({head:item,cape:second},[{id:'7',bonuses:[[],[{effectId:115,value:3}]]}],characteristics);
  assert.equal(totals.pdv,300);
  assert.equal(totals.strength,100);
  assert.equal(totals.range,1);
  assert.equal(totals.critical,1);
  assert.equal(totals.initiative,120);
});
