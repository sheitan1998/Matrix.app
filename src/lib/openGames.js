// Jeux servis par des API publiques ouvertes — aucune clé, aucun secret.
const cover = (id) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/capsule_616x353.jpg`;

export const OPEN_GAMES = [
  {
    slug: "warframe",
    name: "Warframe",
    publisher: "Digital Extremes",
    genre: "Looter shooter",
    accent: "#38bdf8",
    image_url: cover(230410),
    is_active: true,
    supportsPlayer: false,
    source: "api.warframestat.us",
    description: "Boutique du Néant, fissures, alertes et Ondes Nocturnes en direct.",
  },
  {
    slug: "osrs",
    name: "Old School RuneScape",
    publisher: "Jagex",
    genre: "MMORPG",
    accent: "#fbbf24",
    image_url: cover(1343370),
    is_active: true,
    supportsPlayer: true,
    playerHint: "Pseudo OSRS",
    source: "prices.runescape.wiki + hiscores",
    description: "Grand Exchange en direct, quêtes, équipements et suivi de compte.",
  },
  {
    slug: "guild-wars-2",
    name: "Guild Wars 2",
    publisher: "ArenaNet",
    genre: "MMORPG",
    accent: "#f87171",
    image_url: cover(1284210),
    is_active: true,
    supportsPlayer: false,
    source: "api.guildwars2.com/v2",
    description: "Succès, histoires, professions et catalogue d'objets officiels.",
  },
  {
    slug: "dota-2",
    name: "Dota 2",
    publisher: "Valve",
    genre: "MOBA",
    accent: "#ef4444",
    image_url: cover(570),
    is_active: true,
    supportsPlayer: true,
    playerHint: "ID de compte Steam (chiffres)",
    source: "api.opendota.com",
    description: "Héros, objets, méta compétitive et profils joueurs par ID.",
  },
  {
    slug: "overwatch-2",
    name: "Overwatch 2",
    publisher: "Blizzard",
    genre: "FPS",
    accent: "#f97316",
    image_url: cover(2357570),
    is_active: true,
    supportsPlayer: true,
    playerHint: "BattleTag (ex. Pseudo-1234)",
    source: "overfast-api.tekrop.fr",
    description: "Héros, rôles, cartes et profils publics par BattleTag.",
  },
  {
    slug: "helldivers-2",
    name: "Helldivers 2",
    publisher: "Arrowhead",
    genre: "Coop shooter",
    accent: "#facc15",
    image_url: cover(553850),
    is_active: true,
    supportsPlayer: false,
    source: "api.helldivers2.dev",
    description: "Ordres majeurs, front galactique et statistiques de guerre.",
  },
  {
    slug: "dead-by-daylight",
    name: "Dead by Daylight",
    publisher: "Behaviour",
    genre: "Horreur asymétrique",
    accent: "#dc2626",
    image_url: cover(381210),
    is_active: true,
    supportsPlayer: false,
    source: "dbd.tricky.lol",
    description: "Sanctuaire des Secrets, tomes, survivants et tueurs.",
  },
  {
    slug: "palworld",
    name: "Palworld",
    publisher: "Pocketpair",
    genre: "Survival",
    accent: "#34d399",
    image_url: cover(1623730),
    is_active: true,
    supportsPlayer: false,
    source: "palworld.fandom.com",
    description: "Tous les Pals, objets et armes avec leurs visuels officiels.",
  },
  {
    slug: "sea-of-thieves",
    name: "Sea of Thieves",
    publisher: "Rare",
    genre: "Aventure partagée",
    accent: "#22d3ee",
    image_url: cover(1172620),
    is_active: true,
    supportsPlayer: false,
    source: "seaofthieves.fandom.com",
    description: "Cosmétiques, navires, quêtes et hauts faits de pirate.",
  },
  {
    slug: "apex-legends",
    name: "Apex Legends",
    publisher: "Respawn",
    genre: "Battle royale",
    accent: "#a855f7",
    image_url: cover(1172470),
    is_active: true,
    supportsPlayer: false,
    source: "apexlegends.fandom.com",
    description: "Légendes, cartes, arsenal et succès du jeu.",
  },
];

export const OPEN_GAMES_BY_SLUG = Object.fromEntries(OPEN_GAMES.map((g) => [g.slug, g]));

// Jaquettes officielles des jeux déjà présents sur le hub.
export const GAME_POSTERS = {
  rust: cover(252490),
  valheim: cover(892970),
  "rocket-league": cover(252950),
  "farming-simulator-25": cover(2300320),
};

export const TAB_META = [
  { id: "shop", label: "Boutique", icon: "shopping" },
  { id: "rotations", label: "Rotations & Événements", icon: "calendar" },
  { id: "quests", label: "Quêtes & Missions", icon: "scroll" },
  { id: "battlepass", label: "Passe de combat", icon: "crown" },
  { id: "characters", label: "Personnages & Skins", icon: "users" },
  { id: "achievements", label: "Succès", icon: "trophy" },
];

export const RARITY_COLORS = {
  common: "#94a3b8",
  uncommon: "#4ade80",
  rare: "#38bdf8",
  epic: "#a855f7",
  legendary: "#f59e0b",
  mythic: "#ec4899",
  exotic: "#f97316",
};

// Nettoie les résidus techniques des wikis ({Tunable…}, {Keyword…}, balises, liens).
export function cleanGameText(text, max = 600) {
  let s = String(text ?? "");
  s = s.replace(/<[^>]*>/g, " ");
  for (let i = 0; i < 3; i += 1) s = s.replace(/\{[^{}]*\}/g, " ");
  s = s.replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, "$2");
  s = s.replace(/\[\[([^\]]*)\]\]/g, "$1");
  s = s.replace(/'{2,}/g, "");
  s = s.replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max).trim()}…` : s;
}