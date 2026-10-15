export const DOFUS_MAX_LEVEL=200;

// CharacterXPMappings extrait des données du client DOFUS, niveaux 1 à 200.
export const DOFUS_CHARACTER_XP=[
  0,110,650,1500,2800,4800,7300,10500,14500,19200,25200,32600,41000,50500,61000,75000,91000,115000,142000,171000,
  202000,235000,270000,310000,353000,398500,448000,503000,561000,621600,687000,755000,829000,910000,1000000,1100000,1240000,1400000,1580000,1780000,
  2000000,2250000,2530000,2850000,3200000,3570000,3960000,4400000,4860000,5350000,5860000,6390000,6950000,7530000,8130000,8765100,9420000,10150000,10894000,11655000,
  12450000,13278000,14138000,15171000,16251000,17377000,18553000,19778000,21055000,22385000,23769000,25209000,26707000,28264000,29882000,31563000,33307000,35118000,36997000,38945000,
  40965000,43059000,45229000,47476000,49803000,52211000,54704000,57284000,59952000,62712000,65565000,68514000,71561000,74710000,77963000,81323000,84792000,88374000,92071000,95886000,
  99823000,103885000,108075000,112396000,116853000,121447000,126184000,131066000,136098000,141283000,146626000,152130000,157800000,163640000,169655000,175848000,182225000,188791000,195550000,202507000,
  209667000,217037000,224620000,232424000,240452000,248712000,257209000,265949000,274939000,284186000,293694000,303473000,313527000,323866000,334495000,345423000,356657000,368206000,380076000,392278000,
  404818000,417706000,430952000,444564000,458551000,472924000,487693000,502867000,518458000,534476000,550933000,567839000,585206000,603047000,621374000,640199000,659536000,679398000,699798000,720751000,
  742272000,764374000,787074000,810387000,834329000,858917000,884167000,910098000,936727000,964073000,992154000,1020991000,1050603000,1081010000,1112235000,1144298000,1177222000,1211030000,1245745000,1281393000,
  1317997000,1355584000,1404179000,1463811000,1534506000,1616294000,1709205000,1813267000,1928513000,2054975000,2192686000,2341679000,2501990000,2673655000,2856710000,3051194000,3257146000,3474606000,3703616000,5555424000,
];

export function xpForLevel(level){
  return DOFUS_CHARACTER_XP[Math.max(1,Math.min(DOFUS_MAX_LEVEL,Number(level)||1))-1];
}

export function calculateXpRemaining({currentLevel,currentXp,targetLevel,mode='total'}){
  const level=Number(currentLevel);
  const target=Number(targetLevel);
  const enteredXp=Number(currentXp);
  const errors=[];
  if(!Number.isInteger(level)||level<1||level>DOFUS_MAX_LEVEL)errors.push('Le niveau actuel doit être un entier entre 1 et 200.');
  if(!Number.isInteger(target)||target<1||target>DOFUS_MAX_LEVEL)errors.push('Le niveau cible doit être un entier entre 1 et 200.');
  if(Number.isFinite(level)&&Number.isFinite(target)&&target<=level)errors.push('Le niveau cible doit être supérieur au niveau actuel.');
  if(!Number.isFinite(enteredXp)||enteredXp<0)errors.push('L’XP actuelle doit être un nombre positif ou nul.');
  if(errors.length)return {valid:false,errors,remaining:0,currentTotal:0,targetTotal:0};
  const levelTotal=xpForLevel(level);
  const nextTotal=level<DOFUS_MAX_LEVEL?xpForLevel(level+1):levelTotal;
  const currentTotal=mode==='level'?levelTotal+enteredXp:enteredXp;
  if(mode==='total'&&(currentTotal<levelTotal||currentTotal>=nextTotal))errors.push(`Au niveau ${level}, l’XP totale doit être comprise entre ${levelTotal} et ${nextTotal-1}.`);
  if(mode==='level'&&enteredXp>=nextTotal-levelTotal)errors.push(`La progression du niveau doit rester inférieure à ${nextTotal-levelTotal} XP.`);
  if(errors.length)return {valid:false,errors,remaining:0,currentTotal,targetTotal:xpForLevel(target)};
  const targetTotal=xpForLevel(target);
  return {valid:true,errors:[],remaining:Math.max(0,targetTotal-currentTotal),currentTotal,targetTotal};
}

function fixedReward(level,duration,ratio){
  return level*Math.pow(100+2*level,2)/20*duration*ratio;
}

export function estimateDofusRewardXp({playerLevel,optimalLevel,experienceRatio,duration=1}){
  const player=Math.max(1,Math.min(DOFUS_MAX_LEVEL,Number(playerLevel)||1));
  const optimal=Math.max(1,Math.min(DOFUS_MAX_LEVEL,Number(optimalLevel)||player));
  const ratio=Math.max(0,Number(experienceRatio)||0);
  const rewardDuration=Math.max(0,Number(duration)||1);
  if(!ratio)return 0;
  if(player<=optimal)return Math.floor(fixedReward(player,rewardDuration,ratio));
  const rewardLevel=Math.min(player,optimal*1.5);
  return Math.floor(0.3*fixedReward(optimal,rewardDuration,ratio)+0.7*fixedReward(rewardLevel,rewardDuration,ratio));
}

export function analyzePrerequisites(payload,completedQuestIds=[]){
  const nodes=new Map((payload?.nodes||[]).map(node=>[`${node.type}:${node.id}`,node]));
  const completed=new Set(completedQuestIds.map(Number));
  const uniqueQuestIds=new Set();
  const cycles=[];
  const missing=[...(payload?.missing||[])];
  const expanded=new Set();
  function visit(type,id,path=[]){
    const key=`${type}:${id}`;
    if(path.includes(key)){
      cycles.push([...path.slice(path.indexOf(key)),key]);
      return {type,id,name:nodes.get(key)?.name||`${type} ${id}`,cycle:true,children:[]};
    }
    const node=nodes.get(key);
    if(!node){
      if(!missing.some(entry=>entry.type===type&&entry.id===id))missing.push({type,id});
      return {type,id,name:`Référence ${id} indisponible`,missing:true,children:[]};
    }
    if(type==='quest'&&id!==Number(payload.rootId))uniqueQuestIds.add(id);
    const shared=expanded.has(key);
    if(shared)return {...node,shared,completed:type==='quest'&&completed.has(id),children:[]};
    expanded.add(key);
    const nextPath=[...path,key];
    const children=[
      ...(node.questIds||[]).map(childId=>visit('quest',Number(childId),nextPath)),
      ...(node.achievementIds||[]).map(childId=>visit('achievement',Number(childId),nextPath)),
    ];
    return {...node,completed:type==='quest'&&completed.has(id),children};
  }
  const tree=visit('quest',Number(payload?.rootId));
  const done=[...uniqueQuestIds].filter(id=>completed.has(id)).length;
  return {tree,cycles,missing,total:uniqueQuestIds.size,done,remaining:uniqueQuestIds.size-done};
}
