import { GTA6_CHARACTERS } from '@/components/tuto-gaming/gta6/gta6Characters';
import { GTA6_VEHICLES } from '@/components/tuto-gaming/gta6/gta6Vehicles';
import { GTA6_WEAPONS } from '@/components/tuto-gaming/gta6/gta6Weapons';
import { GTA6_LOCATIONS } from '@/components/tuto-gaming/gta6/gta6Locations';
import { GTA6_MISSIONS } from '@/components/tuto-gaming/gta6/gta6Missions';
import { GTA6_QUESTS } from '@/components/tuto-gaming/gta6/gta6Quests';
import { GTA6_TROPHIES } from '@/components/tuto-gaming/gta6/gta6Trophies';
import { isolateGta6Items } from '@/components/tuto-gaming/gta6/gta6Collection';
export const GTA6_TAB_TYPES = Object.freeze({ personnages: 'character', vehicules: 'vehicle', armes: 'weapon', lieux: 'location', quetes: 'quest', missions: 'activity', succes: 'trophy' });
const sources = Object.freeze({ character: GTA6_CHARACTERS, vehicle: GTA6_VEHICLES, weapon: GTA6_WEAPONS, location: GTA6_LOCATIONS, quest: GTA6_QUESTS, activity: GTA6_MISSIONS, trophy: GTA6_TROPHIES });
export function getGta6TabItems(tab) {
  const type = GTA6_TAB_TYPES[tab];
  return type ? isolateGta6Items(sources[type], type) : [];
}
export function resolveGta6Selection(tab, id) { return getGta6TabItems(tab).find(item => item.id === id) || null; }