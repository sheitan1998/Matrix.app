/**
 * Base de données des jeux détectables via les processus Windows/Linux/Mac.
 * Clé = nom du processus (sans extension .exe), Valeur = nom d'affichage.
 * Le matching est insensible à la casse.
 *
 * Pour ajouter un jeu, ajoute une entrée avec le nom exact du processus
 * (sans chemin ni extension) et le nom d'affichage souhaité.
 */
export const DETECTABLE_GAMES = {
  // Farming Simulator
  "farming simulator 2025": { label: "Farming Simulator 25", icon: "🚜" },
  "farmingsimulator2025": { label: "Farming Simulator 25", icon: "🚜" },
  "farmingsimulator2025game": { label: "Farming Simulator 25", icon: "🚜" },
  "farming simulator 22": { label: "Farming Simulator 22", icon: "🚜" },
  "farmingsimulator22": { label: "Farming Simulator 22", icon: "🚜" },
  "farming simulator 19": { label: "Farming Simulator 19", icon: "🚜" },
  "farmingsimulator19": { label: "Farming Simulator 19", icon: "🚜" },

  // Minecraft
  "minecraft": { label: "Minecraft", icon: "⛏️" },
  "minecraft launcher": { label: "Minecraft", icon: "⛏️" },
  "javaw": { label: "Minecraft", icon: "⛏️" },

  // Valorant / Riot
  "valorant": { label: "Valorant", icon: "🎯" },
  "valorant-win64-shipping": { label: "Valorant", icon: "🎯" },
  "league of legends": { label: "League of Legends", icon: "🏆" },
  "league client": { label: "League of Legends", icon: "🏆" },
  "riot clientservices": { label: "Riot Client", icon: "🎮" },

  // Steam games
  "csgo": { label: "CS2", icon: "🔫" },
  "cs2": { label: "Counter-Strike 2", icon: "🔫" },
  "dota2": { label: "Dota 2", icon: "⚔️" },
  "gmod": { label: "Garry's Mod", icon: "🔧" },
  "hl2": { label: "Half-Life 2", icon: "🤖" },

  // Epic / EA / Ubisoft
  "fortniteclient-win64-shipping": { label: "Fortnite", icon: "🏗️" },
  "fortnite": { label: "Fortnite", icon: "🏗️" },
  "apex_legends": { label: "Apex Legends", icon: "🎯" },
  "rdr2": { label: "Red Dead Redemption 2", icon: "🤠" },
  "gtav": { label: "GTA V", icon: "🚗" },
  "gta5": { label: "GTA V", icon: "🚗" },

  // Blizzard
  "wow": { label: "World of Warcraft", icon: "⚔️" },
  "overwatch": { label: "Overwatch 2", icon: "🦸" },
  "diablo iv": { label: "Diablo IV", icon: "😈" },
  "hearthstone": { label: "Hearthstone", icon: "🃏" },

  // Other popular games
  "rocketleague": { label: "Rocket League", icon: "⚽" },
  "rocket league": { label: "Rocket League", icon: "⚽" },
  "genshinimpact": { label: "Genshin Impact", icon: "⚔️" },
  "eldenring": { label: "Elden Ring", icon: "⚔️" },
  "bg3": { label: "Baldur's Gate 3", icon: "🐉" },
  "baldursgate3": { label: "Baldur's Gate 3", icon: "🐉" },
  "cyberpunk2077": { label: "Cyberpunk 2077", icon: "🌃" },
  "the witcher 3": { label: "The Witcher 3", icon: "⚔️" },
  "witcher3": { label: "The Witcher 3", icon: "⚔️" },
  "sekiro": { label: "Sekiro", icon: "⚔️" },
  "forza horizon 5": { label: "Forza Horizon 5", icon: "🏎️" },
  "forzahorizon5": { label: "Forza Horizon 5", icon: "🏎️" },
  "fh5": { label: "Forza Horizon 5", icon: "🏎️" },
  "eafc25": { label: "EA FC 25", icon: "⚽" },
  "fc25": { label: "EA FC 25", icon: "⚽" },
  "ea fc 25": { label: "EA FC 25", icon: "⚽" },
  "eafc24": { label: "EA FC 24", icon: "⚽" },
  "fc24": { label: "EA FC 24", icon: "⚽" },

  // Roblox
  "robloxplayerbeta": { label: "Roblox", icon: "🎮" },
  "roblox": { label: "Roblox", icon: "🎮" },

  // Among Us
  "among us": { label: "Among Us", icon: "👨‍🚀" },
  "amongus": { label: "Among Us", icon: "👨‍🚀" },

  // Flight Simulator
  "flightsimulator": { label: "Microsoft Flight Simulator", icon: "✈️" },
  "msfs": { label: "Microsoft Flight Simulator", icon: "✈️" },
};

/**
 * Récupère la liste des noms de processus à détecter.
 * Utilisé par le frontend pour passer la liste à la commande Tauri.
 */
export function getProcessNamesToDetect() {
  return Object.keys(DETECTABLE_GAMES);
}

/**
 * Résout un nom de processus en nom d'affichage de jeu.
 * @param {string} processName - Nom du processus (sans extension)
 * @returns {{ label: string, icon: string } | null}
 */
export function resolveGameFromProcess(processName) {
  if (!processName) return null;
  const key = processName.toLowerCase().replace(/\.exe$/i, "").trim();
  return DETECTABLE_GAMES[key] || null;
}

/**
 * Résout le premier jeu détecté à partir d'une liste de processus.
 * @param {string[]} processNames - Liste des noms de processus détectés
 * @returns {{ label: string, icon: string } | null}
 */
export function resolveFirstGame(processNames) {
  if (!processNames || processNames.length === 0) return null;
  for (const p of processNames) {
    const game = resolveGameFromProcess(p);
    if (game) return game;
  }
  return null;
}