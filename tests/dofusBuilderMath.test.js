import test from 'node:test';
import assert from 'node:assert/strict';
import { canEquipItem, normalizeEquipment, STUFF_SLOTS, totalStuffStats } from '../src/components/tuto-gaming/dofusBuilderMath.js';

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
  assert.deepEqual(Object.keys(normalized),['head','ring1']);
});

test('calculates base, positive, negative, elemental and set statistics',()=>{
  const totals=totalStuffStats({ring1:ring,weapon:sword},[{id:7,bonuses:[[],[{effectId:128,from:1,to:0}]]}]);
  assert.equal(totals.pa,7);
  assert.equal(totals.pm,3);
  assert.equal(totals.vitality,80);
  assert.equal(totals.earthDamage,10);
});
