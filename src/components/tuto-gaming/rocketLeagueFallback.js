// Reference catalogue only: not a claim about today's shop or its prices.
import {rocketAsset} from '@/components/tuto-gaming/rocketItemAssets';
export const ROCKET_FALLBACK = [
  ['octane','Octane','Châssis','Import'],['fennec','Fennec','Châssis','Import'],['dominus','Dominus','Châssis','Import'],['breakout','Breakout','Châssis','Import'],
  ['zomba','Zomba','Roues','Exotique'],['draco','Draco','Roues','Exotique'],['christiano','Cristiano','Roues','Très rare'],['infinium','Infinium','Roues','Exotique'],
  ['dueling-dragons','Dueling Dragons','Explosion de but','Marché noir'],['hellfire','Hellfire','Explosion de but','Marché noir'],['atomizer','Atomizer','Explosion de but','Marché noir'],['party-time','Party Time','Explosion de but','Marché noir']
].map(([id,name,type,rarity])=>({id,name,type,rarity,img:rocketAsset(id),hdImg:rocketAsset(id),price:null,source:'reference'}));