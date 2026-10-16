import test from 'node:test';
import assert from 'node:assert/strict';
import { DOFUS_UNITY_GENDER_CROPS, normalizeDofusAlmanax, normalizeDofusBreed, normalizeDofusHarvestCoverage, normalizeDofusItem, normalizeDofusMapArea, normalizeDofusSpell, normalizeDofusWorld } from '../base44/shared/dofusData.ts';

test('maps official Unity sprite halves to verified genders for several classes',()=>{
  assert.deepEqual(DOFUS_UNITY_GENDER_CROPS,{male:'right',female:'left'});
  for(const id of [1,6,20]){
    const breed=normalizeDofusBreed({id,shortName:{fr:`Classe ${id}`},heads:{male:`male-${id}.png`,female:`female-${id}.png`},maleLook:`male-look-${id}`,femaleLook:`female-look-${id}`,breedSpellsId:[1,2]},'fr');
    assert.equal(breed.variants[0].img,`https://static.ankama.com/dofus/ng/modules/mmorpg/encyclopedia/unity/breeds/assets/breeds/sprite${id}.png`);
    assert.deepEqual(breed.variants.map(value=>[value.id,value.crop,value.head,value.look]),[
      ['male','right',`male-${id}.png`,`male-look-${id}`],
      ['female','left',`female-${id}.png`,`female-look-${id}`],
    ]);
    assert.equal(breed.artworkSource,'Ankama - Encyclopédie DOFUS Unity');
  }
});

test('normalizes map coverage, linked resources and positioned NPCs without inventing points',()=>{
  const positions=new Map([[42,{id:42,posX:7,posY:-3,img:{'0.25':'map.jpg'}}],[43,{id:43,posX:8,posY:-4,img:{}}]]);
  const resources=[{id:303,name:'Bois de Frêne',jobId:2,jobName:'Bûcheron',count:28}];
  const npcs=[{id:4,name:'Mériana'}];
  const area=normalizeDofusMapArea({id:3,name:{fr:'Forêt'},level:40,shape:[-2,4,2,8,12000,12000],mapIds:[42],associatedZaapMapId:42,entranceMapIds:[43],dungeonId:9},positions,'fr',resources,npcs);
  assert.deepEqual(area,{id:3,name:'Forêt',level:40,center:{x:7,y:-3},dungeonId:9,dungeonPosition:{x:8,y:-4},resources,resourceCount:28,harvestableCount:1,npcs,npcCount:1});
});

test('normalizes the verified DofusDB world pyramid',()=>{
  const world=normalizeDofusWorld({id:1,name:{fr:'Monde des Douze'},origineX:6480,origineY:4944,mapWidth:69.5,mapHeight:49.7,totalWidth:10000,totalHeight:8000,minScale:0.20000000298,maxScale:1},'fr');
  assert.deepEqual(world.tileBanks,[
    {zoom:0,scale:0.2,columns:8,rows:7},
    {zoom:1,scale:0.4,columns:16,rows:13},
    {zoom:2,scale:0.8,columns:32,rows:26},
  ]);
  assert.equal(world.tileUrlBase,'https://api.dofusdb.fr/img/worlds/1');
});

test('deduplicates harvest skills and excludes resources without subarea relations',()=>{
  const jobs=[{id:1,name:{fr:'Base'}},{id:2,name:{fr:'Bûcheron'}}];
  const ash={id:303,name:{fr:'Bois de Frêne'},level:1,resourcesBySubarea:[[3,28],[4,4]]};
  const coverage=normalizeDofusHarvestCoverage([
    {id:6,parentJobId:2,gatheredRessourceItem:303,item:ash},
    {id:299,parentJobId:2,gatheredRessourceItem:303,item:ash},
    {id:42,parentJobId:1,gatheredRessourceItem:537,item:{id:537,name:{fr:'Pomme de Terre'},resourcesBySubarea:[]}},
  ],jobs,'fr');
  assert.equal(coverage.jobs.length,1);
  assert.deepEqual(coverage.jobs[0].resources.map(resource=>[resource.id,resource.zoneCount,resource.count]),[[303,2,32]]);
  assert.deepEqual(coverage.resourcesBySubarea.get(3).map(resource=>[resource.name,resource.count]),[['Bois de Frêne',28]]);
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

test('maps live Unity spell levels, cast restrictions, variants and effects',()=>{
  const spell=normalizeDofusSpell(
    {id:1,name:{fr:'Retour'},description:{fr:'Occasionne des dommages.'},img:'spell.png'},
    [
      {id:11,grade:1,minPlayerLevel:1,apCost:3,minRange:1,range:6,maxCastPerTurn:2,maxCastPerTarget:1,maxGlobalCastPerTurn:5,maxGlobalCastPerTarget:2,minCastInterval:2,initialCooldown:1,globalCooldown:3,criticalHitProbability:15,castInLine:true,castInDiagonal:true,castTestLos:false,rangeCanBeBoosted:true,needFreeCell:true,needTakenCell:false,needVisibleEntity:true,needCellWithoutPortal:true,portalProjectionForbidden:true,effects:[{actionId:2,effectId:97,baseEffectId:97,diceNum:17,diceSide:20,value:0,duration:2,delay:1,triggers:'I',targetMask:'a',zoneDescr:{shape:1},effectElement:3,visibleInTooltip:true}],criticalEffect:[]},
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
  assert.deepEqual(
    (({maxGlobalCastPerTurn,maxGlobalCastPerTarget,minCastInterval,initialCooldown,globalCooldown,castInLine,castInDiagonal,castTestLos,needFreeCell,needVisibleEntity,needCellWithoutPortal,portalProjectionForbidden})=>({maxGlobalCastPerTurn,maxGlobalCastPerTarget,minCastInterval,initialCooldown,globalCooldown,castInLine,castInDiagonal,castTestLos,needFreeCell,needVisibleEntity,needCellWithoutPortal,portalProjectionForbidden}))(spell.levels[0]),
    {maxGlobalCastPerTurn:5,maxGlobalCastPerTarget:2,minCastInterval:2,initialCooldown:1,globalCooldown:3,castInLine:true,castInDiagonal:true,castTestLos:false,needFreeCell:true,needVisibleEntity:true,needCellWithoutPortal:true,portalProjectionForbidden:true},
  );
  assert.deepEqual(
    (({actionId,baseEffectId,diceNum,diceSide,duration,delay,triggers,targetMask,zoneDescr,effectElement})=>({actionId,baseEffectId,diceNum,diceSide,duration,delay,triggers,targetMask,zoneDescr,effectElement}))(spell.levels[0].effects[0]),
    {actionId:2,baseEffectId:97,diceNum:17,diceSide:20,duration:2,delay:1,triggers:'I',targetMask:'a',zoneDescr:{shape:1},effectElement:3},
  );
  assert.equal(spell.levels[1].effects[0].description,'-40 Force');
  assert.deepEqual(spell.variant,{groupId:77,pairedSpellId:2,pairedSpellName:'Variante'});
});
