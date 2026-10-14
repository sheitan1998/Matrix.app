// Reference catalogue only: not a claim about today's shop or its prices.
export const ROCKET_FALLBACK = [
  ['octane','Octane','Châssis','Import'],['fennec','Fennec','Châssis','Import'],['dominus','Dominus','Châssis','Import'],['breakout','Breakout','Châssis','Import'],
  ['zomba','Zomba','Roues','Exotique'],['draco','Draco','Roues','Exotique'],['christiano','Cristiano','Roues','Très rare'],['infinium','Infinium','Roues','Exotique'],
  ['dueling-dragons','Dueling Dragons','Explosion de but','Marché noir'],['hellfire','Hellfire','Explosion de but','Marché noir'],['atomizer','Atomizer','Explosion de but','Marché noir'],['party-time','Party Time','Explosion de but','Marché noir']
].map(([id,name,type,rarity])=>({id,name,type,rarity,img:null,price:null,source:'reference',url:`https://rocket-league.com/items/${type==='Châssis'?'bodies':type==='Roues'?'wheels':'explosions'}`}));