import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDofusAlmanax, normalizeDofusBreed, normalizeDofusItem, normalizeDofusMapArea, normalizeDofusSpell } from '../base44/shared/dofusData.ts';

test('normalizes source-backed class metadata',()=>{
  const breed=normalizeDofusBreed({id:1,shortName:{fr:'Féca'},description:{fr:'Protecteur'},gameplayDescription:{fr:'Défense'},img:'symbol.png',imgTransparent:'logo.png',heads:{male:'male.png',female:'female.png'},breedSpellsId:[1,2]},'fr');
  assert.equal(breed.variants[0].img,'https://static.ankama.com/dofus/ng/modules/mmorpg/encyclopedia/unity/breeds/assets/breeds/sprite1.png');
  assert.deepEqual(breed.variants.map(value=>[value.id,value.crop,value.head]),[['male','left','male.png'],['female','right','female.png']]);
  assert.equal(breed.artworkSource,'Ankama - Encyclopédie DOFUS Unity');
});

test('normalizes map coverage without inventing point details',()=>{
  const positions=new Map([[42,{id:42,posX:7,posY:-3,img:{'0.25':'map.jpg'}}],[43,{id:43,posX:8,posY:-4,img:{}}]]);
  const area=normalizeDofusMapArea({id:3,name:{fr:'Forêt'},level:40,shape:[-2,4,2,8,12000,12000],mapIds:[42],associatedZaapMapId:42,entranceMapIds:[43],dungeonId:9,harvestables:[1,2],npcsIds:[4]},positions,'fr');
  assert.deepEqual(area,{id:3,name:'Forêt',level:40,center:{x:7,y:-3},dungeonId:9,dungeonPosition:{x:8,y:-4},harvestableCount:2,npcCount:1,tile:{id:42,x:7,y:-3,img:'map.jpg'}});
});

test('normalizes Almanax Meryde, offering and sanitized bonus',()=>{
  const value=normalizeDofusAlmanax({npc:{name:{fr:'Dnegeleht'}},name:{fr:'Récolte abondante'},desc:{fr:'<b>125 %</b> de Chanvre'},meriaDescription:{fr:'Description'},quantities:[50],items:[{name:{fr:'Chanvre'},iconId:34121}]},'fr','2026-10-15');
  assert.equal(value.meryde,'Dnegeleht');
  assert.deepEqual(value.offering,{quantity:50,name:'Chanvre',img:'https://api.dofusdb.fr/img/items/34121.png'});
  assert.equal(value.bonus.description,'125 % de Chanvre');
});

test('retains alternate effect values when an item has sparse effects',()=>{
  const value=normalizeDofusItem({id:1,type:{superTypeId:1},possibleEffects:[{effectId:115,diceNum:3,diceSide:5}]});
  assert.deepEqual(value.effects[0],{from:3,to:5,value:undefined,effectId:115,category:undefined,characteristic:undefined});
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
    {id:77,pairedSpell:{id:2,name:{fr:'Variante'}}},
  );
  assert.equal(spell.levels.length,2);
  assert.equal(spell.levels[0].effects[0].description,'17 à 20 dommages Terre');
  assert.equal(spell.levels[1].effects[0].description,'-40 Force');
  assert.deepEqual(spell.variant,{groupId:77,pairedSpellId:2,pairedSpellName:'Variante'});
});
