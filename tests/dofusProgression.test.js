import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeDofusAchievement,normalizeDofusQuest} from '../base44/shared/dofusData.ts';
import {DOFUS_CHARACTER_XP,analyzePrerequisites,calculateXpRemaining,estimateDofusRewardXp,xpForLevel} from '../src/components/tuto-gaming/dofusProgression.js';

test('normalizes achievement objectives and resource rewards from the live schema',()=>{
  const value=normalizeDofusAchievement({
    id:37,name:{fr:'Cour royale'},description:{fr:'Vaincre le boss'},points:10,level:30,iconId:3,
    category:{id:11,name:{fr:'Niveaux 1 à 50'},parent:{id:3,name:{fr:'Donjons'}}},
    objectives:[{id:2,order:1,name:{fr:'Bouftou Royal'}},{id:1,order:0,name:{fr:'Challenge'}}],
    rewards:[{id:2,experienceRatio:1,kamasRatio:0,itemsReward:[886],itemsQuantityReward:[2],items:[{id:886,name:{fr:'Cuir'},iconId:5}]}],
  },'fr',true);
  assert.equal(value.category.parent.name,'Donjons');
  assert.deepEqual(value.objectives.map(objective=>objective.name),['Challenge','Bouftou Royal']);
  assert.deepEqual(value.rewards[0].items,[{id:886,name:'Cuir',quantity:2,img:'https://api.dofusdb.fr/img/items/5.png'}]);
});

test('orders quest steps and resolves objective references and rewards',()=>{
  const value=normalizeDofusQuest({
    id:215,name:{fr:'Émissaire'},levelMin:40,levelMax:40,stepIds:[20,10],need:{quests:[211],achievements:[9]},
    steps:[
      {id:10,name:{fr:'Fin'},optimalLevel:40,duration:1,objectives:[{id:2,typeId:6,text:{fr:'Vaincre {monster,147}'},coords:{x:1,y:2}}],rewards:[]},
      {id:20,name:{fr:'Début'},optimalLevel:40,duration:2,objectives:[],rewards:[{id:3,experienceRatio:1.2,kamasRatio:1,itemsReward:[[885,5]],items:[{id:885,name:{fr:'Laine'},img:'wool.png'}]}]},
    ],
  },'fr',{id:55,name:{fr:'Amakna'}},true,{'monster:147':'Bouftou Royal'});
  assert.deepEqual(value.steps.map(step=>step.name),['Début','Fin']);
  assert.equal(value.steps[1].objectives[0].text,'Vaincre Bouftou Royal');
  assert.equal(value.steps[1].objectives[0].isCombat,true);
  assert.deepEqual(value.steps[0].rewards[0].items,[{id:885,name:'Laine',quantity:5,img:'wool.png'}]);
});

test('uses the complete official cumulative XP curve with strict input semantics',()=>{
  assert.equal(DOFUS_CHARACTER_XP.length,200);
  assert.equal(xpForLevel(1),0);
  assert.equal(xpForLevel(200),5555424000);
  assert.deepEqual(calculateXpRemaining({currentLevel:1,currentXp:50,targetLevel:2,mode:'level'}),{valid:true,errors:[],remaining:60,currentTotal:50,targetTotal:110});
  assert.equal(calculateXpRemaining({currentLevel:2,currentXp:109,targetLevel:3,mode:'total'}).valid,false);
  assert.equal(calculateXpRemaining({currentLevel:200,currentXp:0,targetLevel:200,mode:'level'}).valid,false);
});

test('estimates Dofus reward ratios with the client reward formula',()=>{
  assert.equal(estimateDofusRewardXp({playerLevel:40,optimalLevel:40,experienceRatio:1,duration:1}),64800);
  assert.equal(estimateDofusRewardXp({playerLevel:80,optimalLevel:40,experienceRatio:1,duration:1}),121080);
  assert.equal(estimateDofusRewardXp({playerLevel:40,optimalLevel:40,experienceRatio:0,duration:1}),0);
});

test('deduplicates recursive prerequisites and stops cycles while recalculating progress',()=>{
  const payload={rootId:1,missing:[{type:'quest',id:99}],nodes:[
    {type:'quest',id:1,name:'Cible',level:50,questIds:[2,3],achievementIds:[8]},
    {type:'quest',id:2,name:'Deux',level:30,questIds:[4],achievementIds:[]},
    {type:'quest',id:3,name:'Trois',level:20,questIds:[4],achievementIds:[]},
    {type:'quest',id:4,name:'Cycle',level:10,questIds:[2,99],achievementIds:[]},
    {type:'achievement',id:8,name:'Succès',level:25,questIds:[],achievementIds:[]},
  ]};
  const value=analyzePrerequisites(payload,[2,4]);
  assert.equal(value.total,3);
  assert.equal(value.done,2);
  assert.equal(value.remaining,1);
  assert.equal(value.cycles.length,1);
  assert.ok(value.missing.some(entry=>entry.id===99));
});
