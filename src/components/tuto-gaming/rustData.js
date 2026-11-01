// Données locales Rust - coûts de raid, blueprints, construction
// Sources: wiki officiel Rust (rust.wiki.gg), guides communautaires

export const RUST_TABS = [
  { id: "servers", label: "Serveurs" },
  { id: "raid", label: "Calculateur de Raid" },
  { id: "building", label: "Construction" },
];

export const RUST_SERVER_FILTERS = [
  { id: "all", label: "Tous", color: "#BF5AF2" },
  { id: "official", label: "Officiels", color: "#4ADE80" },
  { id: "community", label: "Communautaires", color: "#60A5FA" },
  { id: "modded", label: "Moddés", color: "#FBBF24" },
  { id: "solo", label: "Solo/Duo/Trio", color: "#F87171" },
];

// Matériaux de construction et leur résistance (HP)
export const RUST_BUILDING_MATERIALS = [
  { id: "wood", name: "Bois", hp: 200, color: "#A0522D", grade: 1 },
  { id: "stone", name: "Pierre", hp: 500, color: "#808080", grade: 2 },
  { id: "metal", name: "Métal", hp: 1000, color: "#4682B4", grade: 3 },
  { id: "toptier", name: "Haut Niveau", hp: 2000, color: "#D4AF37", grade: 4 },
];

// Coûts de raid par type de mur (quantité d'explosifs nécessaire)
export const RUST_RAID_COSTS = [
  { wall: "Mur en Bois", material: "wood", c4: 1, rockets: 2, satchel: 3, color: "#A0522D" },
  { wall: "Mur en Pierre", material: "stone", c4: 1, rockets: 4, satchel: 7, color: "#808080" },
  { wall: "Mur en Métal", material: "metal", c4: 2, rockets: 8, satchel: 15, color: "#4682B4" },
  { wall: "Mur Haut Niveau", material: "toptier", c4: 4, rockets: 15, satchel: 30, color: "#D4AF37" },
  { wall: "Porte en Bois", material: "wood", c4: 1, rockets: 1, satchel: 2, color: "#A0522D" },
  { wall: "Porte en Métal", material: "metal", c4: 1, rockets: 4, satchel: 6, color: "#4682B4" },
  { wall: "Porte Blindée", material: "toptier", c4: 2, rockets: 8, satchel: 15, color: "#D4AF37" },
  { wall: "Fenêtre en Bois", material: "wood", c4: 1, rockets: 1, satchel: 2, color: "#A0522D" },
  { wall: "Fenêtre en Pierre", material: "stone", c4: 1, rockets: 2, satchel: 4, color: "#808080" },
];

// Coûts des explosifs (matériaux nécessaires pour crafter)
export const RUST_EXPLOSIVES = [
  { id: "c4", name: "C4 (Charge Sapeur)", sulfur: 2200, gunpowder: 0, charcoal: 0, lowgrade: 0, color: "#FF4444" },
  { id: "rocket", name: "Roquette", sulfur: 1400, gunpowder: 0, charcoal: 0, lowgrade: 0, color: "#FBBF24" },
  { id: "satchel", name: "Satchel Charge", sulfur: 480, gunpowder: 0, charcoal: 0, lowgrade: 0, color: "#22D3EE" },
];

// Serveurs locaux de fallback (Battlemetrics API nécessite un abonnement)
export const RUST_FALLBACK_SERVERS = [
  { id: "local-1", name: "Rust Official EU 1", players: 198, maxPlayers: 200, rank: 1, country: "FR", ip: "play.rustofficial.eu", port: 28015, status: "online", isOfficial: true, wipe: "Bi-hebdo" },
  { id: "local-2", name: "Rust Official US 1", players: 187, maxPlayers: 200, rank: 2, country: "US", ip: "play.rustofficial.us", port: 28015, status: "online", isOfficial: true, wipe: "Bi-hebdo" },
  { id: "local-3", name: "Modded x2 Solo/Duo/Trio", players: 64, maxPlayers: 75, rank: 3, country: "DE", ip: "modded.rusthub.io", port: 28015, status: "online", isOfficial: false, wipe: "Hebdo" },
  { id: "local-4", name: "Rustoria Solo/Duo/Trio", players: 48, maxPlayers: 60, rank: 4, country: "UK", ip: "play.rustoria.eu", port: 28015, status: "online", isOfficial: false, wipe: "Hebdo" },
  { id: "local-5", name: "Modded x5 EU Community", players: 92, maxPlayers: 100, rank: 5, country: "NL", ip: "x5.rustcommunity.eu", port: 28015, status: "online", isOfficial: false, wipe: "Bi-hebdo" },
  { id: "local-6", name: "Rust Official EU 2", players: 150, maxPlayers: 200, rank: 6, country: "FR", ip: "play.rustofficial2.eu", port: 28015, status: "online", isOfficial: true, wipe: "Bi-hebdo" },
  { id: "local-7", name: "Vanilla Solo Only", players: 38, maxPlayers: 50, rank: 7, country: "SE", ip: "solo.rustnordic.se", port: 28015, status: "online", isOfficial: false, wipe: "Mensuel" },
  { id: "local-8", name: "Modded x10 Instant Craft", players: 85, maxPlayers: 100, rank: 8, country: "PL", ip: "x10.rustpl.eu", port: 28015, status: "online", isOfficial: false, wipe: "Hebdo" },
];

// Guides de construction
export const RUST_BUILDING_GUIDES = [
  {
    name: "Base de Débutant (2x2)",
    tag: "Guide",
    category: "Débutant",
    status: "Recommandé",
    color: "#4ADE80",
    desc: "La base 2x2 est le point de départ idéal pour les nouveaux joueurs. Compacte, économique et facile à défendre. Placez votre tool cupboard au centre, entourez de murs en pierre et ajoutez une airlock double porte pour sécuriser l'entrée. Coût: ~5000 pierre, ~2000 bois.",
  },
  {
    name: "Base Honeycomb (Hexagone)",
    tag: "Guide",
    category: "Intermédiaire",
    status: "Avancé",
    color: "#FBBF24",
    desc: "La structure honeycomb (nid d'abeille) maximise la protection en créant des couches concentriques. Chaque couche doit être détruite avant d'atteindre le noyau. Idéale pour les groupes de 3-5 joueurs. Coût: ~15000 pierre, ~5000 métal.",
  },
  {
    name: "Base Tower (Tour)",
    tag: "Guide",
    category: "Avancé",
    status: "Expert",
    color: "#F87171",
    desc: "La base tour verticale exploite la hauteur pour difficilement accessible. Placez des shooting floors tous les 2 étages, un cupboard par étage et des Launch Storage au sommet. Exige des ressources importantes mais offre une excellente défense anti-raid.",
  },
  {
    name: "Bunker (Sous-terrain)",
    tag: "Guide",
    category: "Expert",
    status: "Légendaire",
    color: "#9333EA",
    desc: "Le bunker enterre la base sous terre, invisible depuis la surface. Utilisez des fondations en pierre, des murs en métal et un système de tunnel d'accès camouflé. Très difficile à raid mais coûteux en temps et ressources.",
  },
  {
    name: "Starter Base (Airlock)",
    tag: "Guide",
    category: "Débutant",
    status: "Essentiel",
    color: "#60A5FA",
    desc: "L'airlock est une double porte qui empêche les intrus de vous suivre. Construisez un sas de 1x2 avec deux portes en métal. Fermez la porte extérieure avant d'ouvrir l'intérieure. Sécurité de base essentielle pour toute construction.",
  },
  {
    name: "Base Clan (Large)",
    tag: "Guide",
    category: "Groupe",
    status: "Avancé",
    color: "#BF5AF2",
    desc: "Pour les clans de 5+ joueurs. Structure modulaire avec zones dédiées: stockage, crafting, dortoirs et armurerie. Utilisez des fondations larges (8x8 minimum) avec honeycomb externe. Prévoyez un réseau de cupboards multiples pour la redondance.",
  },
];

// Blueprints et composants
export const RUST_BLUEPRINTS = [
  { name: "Fusil d'Assaut (AK)", tier: 3, scrap: 500, components: ["Rifle Body", "Semi-auto Body", "Metal Spring"], desc: "Arme à feu polyvalente, dégâts élevés, cadence moyenne. Le fusil standard pour le combat PvP à moyenne portée." },
  { name: "Fusil à Pompe (Pump Shotgun)", tier: 2, scrap: 300, components: ["Pump Shotgun Body", "Metal Spring"], desc: "Dégâts massifs à courte portée. Idéal pour la défense de base et les combats en intérieur." },
  { name: "Bolt Action Rifle", tier: 3, scrap: 600, components: ["Rifle Body", "Metal Spring", "Semi-auto Body"], desc: "Fusil de précision à longue portée. Dégâts élevés par tir, cadence lente. Essentiel pour les snipers." },
  { name: "MP5 (SMG)", tier: 2, scrap: 250, components: ["SMG Body", "Metal Spring"], desc: "Pistolet mitrailleur compact. Cadence élevée, dégâts modérés. Bon pour les combats rapprochés." },
  { name: "Plate Armor", tier: 2, scrap: 200, components: ["Metal Fragments", "Sewing Kit"], desc: "Armure lourde offrant la meilleure protection. Réduit la vitesse de déplacement mais maximise la survie en combat." },
  { name: "Roadsign Armor", tier: 1, scrap: 100, components: ["Metal Fragments", "Rope"], desc: "Armure intermédiaire légère. Bon équilibre entre protection et mobilité pour les débutants." },
  { name: "Satchel Charge", tier: 2, scrap: 400, components: ["Rope", "Tarp", "Flame Thrower"], desc: "Explosif artisanal pour le raid de bases. Alternative économique au C4, mais moins fiable et plus lent." },
  { name: "Rocket (HV)", tier: 3, scrap: 500, components: ["Explosives", "Flame Thrower", "Metal Pipe"], desc: "Roquette à haute vélocité pour les raids à distance. Plus précise que les roquettes standard." },
];