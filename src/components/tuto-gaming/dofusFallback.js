// Reference snapshot from DofusDB, 14 October 2026. Real effects and crafting ingredients.
const rows = [
  [70,"Amulette du Hibou","equipment",8,1001,"Amulette",[[10,13,126]],[[16524,3,"Relique d'Incarnam",164068],[385,3,"Bave de Bouftou",15057]]],
  [77,"Amulette de l'Ours","equipment",8,1005,"Amulette",[[10,13,118]],[[16524,3,"Relique d'Incarnam",164068],[1984,3,"Cendres Éternelles",48671]]],
  [84,"Amulette du Mulou","equipment",8,1006,"Amulette",[[16,20,125],[3,4,178]],[[16524,3,"Relique d'Incarnam",164068],[303,3,"Bois de Frêne",38017]]],
  [103,"Anneau de Sagesse","equipment",9,9007,"Anneau",[[7,10,124]],[[310,3,"Os de Chafer",47015],[16522,3,"Peau de Gloot",164066]]],
  [112,"Anneau de Chance","equipment",9,9009,"Anneau",[[7,10,123]],[[16523,3,"Volve d'Aminite",119014],[303,3,"Bois de Frêne",38017]]],
  [121,"Anneau d'Agilité","equipment",9,9001,"Anneau",[[7,10,119]],[[16524,3,"Relique d'Incarnam",164068],[312,1,"Fer",39024]]],
  [127,"Bottes de Bowisse","equipment",50,11002,"Bottes",[[16,20,123],[1,0,128],[2,3,176],[-10,0,754]],[[12737,1,"Galet cramoisi",15290],[2571,6,"Patte de Tofukaz",103577],[11814,1,"Moustache de Boostache",54680],[13098,3,"Casque du Chafer Primitif",15798]]],
  [130,"L'Ecrabouilleur de Iop","equipment",27,11007,"Bottes",[[21,25,118],[-10,0,155],[-10,0,152],[21,25,119],[2,0,422],[2,0,428]],[[13726,4,"Conque Marine",15813],[2491,4,"Œil d'Arakmuté",109516],[2563,4,"Peau de Larve Jaune",25138]]],
  [156,"Ceinture de Puissance","equipment",31,10019,"Ceinture",[[31,40,125],[31,40,123],[-30,0,154],[2,0,115],[2,0,426]],[[2468,1,"Estomac de Ouassingue",15506],[387,4,"Défense du Sanglier",47059],[746,1,"Ébonite",40658]]],
  [157,"La Gougnole","equipment",17,1007,"Amulette",[[21,25,125],[11,15,126],[2,3,178]],[[13726,3,"Conque Marine",15813],[363,3,"Peau de Larve Orange",59033]]],
  [158,"La Destinée Dorée","equipment",12,1009,"Amulette",[[11,15,125],[7,10,119],[2,0,753]],[[16440,2,"Ferrite",40712],[377,3,"Épine du Champ Champ",15049]]],
  [159,"La Broche Céleste","equipment",40,1008,"Amulette",[[-20,0,153],[1,0,111],[-300,0,175]],[[2467,1,"Rondelles de Milirat Strubien",63373],[12745,2,"Substrat de Bocage",12729],[6845,5,"Casque de Martoa",25149]]],
  [44,"Épée de Boisaille","weapons",7,6007,"Épée",[[8,10,100],[7,10,118],[1,0,422]],[[16512,3,"Plume Chimérique",53661],[303,3,"Bois de Frêne",38017]]],
  [49,"Épée de Fouraille","weapons",15,6002,"Épée",[[14,18,100],[11,15,125],[7,10,118],[2,0,430],[2,0,422]],[[1673,1,"Patte d'Arakne Magique",103392],[377,3,"Épine du Champ Champ",15049]]],
  [55,"Épée d'Alle","weapons",26,6001,"Épée",[[11,15,99],[-20,0,153],[16,20,118],[16,20,126],[4,5,752]],[[364,4,"Peau de Larve Verte",59034],[300,4,"Graine de Pavot",58011],[2659,4,"Pétale de Tournesol Sauvage",35632]]],
  [58,"La Triste Lame","weapons",21,6005,"Épée",[[6,10,100],[4,6,115]],[[747,2,"Aluminite",40660],[1673,1,"Patte d'Arakne Magique",103392],[306,4,"Fleur de Pissenlit Diabolique",35018]]],
  [62,"Épée d'Ha","weapons",17,6006,"Épée",[[6,10,100],[16,20,125],[7,10,118],[3,4,752]],[[1673,1,"Patte d'Arakne Magique",103392],[366,3,"Bec du Tofu",47037]]],
  [65,"Goultard","weapons",40,6017,"Épée",[[26,30,100],[31,40,125],[21,30,118],[21,30,119],[2,3,753]],[[407,5,"Pic de Prespic",47134],[881,5,"Laine de Ramane Strubien",57208],[6841,5,"Œil de Pikdoa",25151]]],
  [66,"La crinière de Badoul","weapons",33,6011,"Épée",[[6,10,100],[1,0,128],[-12,0,755],[-12,0,754]],[[387,5,"Défense du Sanglier",47059],[2468,1,"Estomac de Ouassingue",15506],[885,6,"Laine de Boufton Noir",57210]]],
  [67,"Le Tranchant Infernal","weapons",22,6013,"Épée",[[11,15,100],[31,40,125],[21,25,119],[-10,0,179],[2,3,752]],[[13487,4,"Serviette de Plage",55130],[2455,2,"Sang de Bouftou",15499],[6899,4,"Plume de Piou Vert",53116]]],
  [282,"Potion de Soin supérieure","consumables",60,12039,"Potion",[[70,0,110]],[[380,5,"Menthe Sauvage",36052],[1731,1,"Dose de jus goûtu",15262],[533,1,"Avoine",34154]]],
  [283,"Potion de Soin","consumables",40,12003,"Potion",[[50,0,110]],[[395,5,"Trèfle à 5 feuilles",36067],[1975,1,"Oignon",68377],[400,1,"Orge",34082]]],
  [580,"Potion Ghetto Raide","consumables",50,12018,"Potion",[[150,0,139]],[[395,5,"Trèfle à 5 feuilles",36067],[1983,1,"Graisse Gélatineuse",15379],[400,1,"Orge",34082]]],
  [1182,"Potion de Mini Soin","consumables",1,12016,"Potion",[[11,0,110]],[[421,4,"Ortie",36642]]]
];
export const DOFUS_FALLBACK = rows.map(([id,name,category,level,icon,type,effects,recipes]) => ({
  id,name,category,level,type,img:`https://api.dofusdb.fr/img/items/${icon}.png`,hasRecipe:true,source:'reference',
  description: category === 'consumables' ? 'Consommable Dofus. Effets et recette issus du catalogue DofusDB sauvegardé.' : `${type} de niveau ${level}. Caractéristiques et recette issues du catalogue DofusDB sauvegardé.`,
  effects:effects.map(([from,to,effectId])=>({from,to,effectId})),
  recipes:recipes.map(([id,quantity,ingredientName,icon])=>({id,quantity,ingredientName,ingredientImg:`https://api.dofusdb.fr/img/items/${icon}.png`}))
}));
export function getDofusFallback({category='all',search='',minLevel=0,maxLevel=0,page=1,limit=50}={}) {
  const needle=search.toLocaleLowerCase('fr');
  const matches=DOFUS_FALLBACK.filter(i=>(category==='all'||i.category===category)&&(!needle||i.name.toLocaleLowerCase('fr').includes(needle))&&i.level>=Number(minLevel||0)&&(!Number(maxLevel)||i.level<=Number(maxLevel)));
  const skip=(page-1)*limit;
  return {items:matches.slice(skip,skip+limit),total:matches.length,page,has_more:skip+limit<matches.length,source:'reference'};
}