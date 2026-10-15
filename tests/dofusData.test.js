import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDofusBreed, normalizeDofusSpell } from '../base44/shared/dofusData.ts';

test('normalizes source-backed class metadata',()=>{
  const breed=normalizeDofusBreed({id:1,shortName:{fr:'Féca'},description:{fr:'Protecteur'},gameplayDescription:{fr:'Défense'},img:'symbol.png',imgTransparent:'hd.png',breedSpellsId:[1,2]},'fr');
  assert.deepEqual(breed,{id:1,name:'Féca',description:'Protecteur',gameplay:'Défense',img:'hd.png',symbol:'symbol.png',spellCount:2});
});

test('formats spell effects and retains every supplied rank',()=>{
  const spell=normalizeDofusSpell(
    {id:1,name:{fr:'Retour'},description:{fr:'Occasionne des dommages.'},img:'spell.png'},
    [
      {id:11,grade:1,minPlayerLevel:1,effects:[{effectId:97,diceNum:17,diceSide:20,visibleInTooltip:true}],criticalEffect:[]},
      {id:12,grade:2,minPlayerLevel:67,effects:[{effectId:157,diceNum:40,diceSide:0,visibleInTooltip:true}],criticalEffect:[]},
    ],
    new Map([
      [97,{description:{fr:'#1{{~1~2 à }}#2 dommages Terre'}}],
      [157,{description:{fr:'-#1{{~1~2 à -}}#2 Force'}}],
    ]),
    'fr',
  );
  assert.equal(spell.levels.length,2);
  assert.equal(spell.levels[0].effects[0].description,'17 à 20 dommages Terre');
  assert.equal(spell.levels[1].effects[0].description,'-40 Force');
});
