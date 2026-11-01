// Données locales Valheim - boss, biomes, équipements, craft
// Sources: wiki officiel Valheim (valheim.fandom.com), guides communautaires

export const VALHEIM_TABS = [
  { id: "bosses", label: "Boss & Biomes" },
  { id: "equipment", label: "Équipements & Craft" },
  { id: "seeds", label: "Partage de Seeds" },
];

export const VALHEIM_BOSSES = [
  {
    name: "Eikthyr",
    biome: "Prairies",
    tag: "Boss",
    category: "Premier boss",
    status: "Niveau 1",
    color: "#4ADE80",
    image: "",
    hp: 2500,
    desc: "Eikthyr est le premier boss de Valheim, un grand cerf spectral invoqué en plaçant 2 Trophées de Cerf sur son autel dans les Prairies. Il attaque avec des charges frontales et des éclairs d'antlers. Faiblesse: vulnérable aux dégâts contondants (masses). Récompense: Pouvoir d'Eikthyr (régen d'endurance), Trophée d'Eikthyr, Cornes d'Eikthyr (outil de minage).",
    summon: "2x Trophée de Cerf",
    weakness: "Dégâts contondants (masses, marteaux)",
  },
  {
    name: "The Elder",
    biome: "Forêt Noire",
    tag: "Boss",
    category: "Deuxième boss",
    status: "Niveau 2",
    color: "#22C55E",
    image: "",
    hp: 5000,
    desc: "The Elder est un colosse de bois vivant invoqué en plaçant 3 Trophées d'Ancien sur son autel dans la Forêt Noire. Il attaque avec des racines souterraines, des coups de poing et des tirs à distance. Faiblesse: vulnérable au feu. Récompense: Pouvoir de l'Ancien (couper les arbres plus vite), Trophée de l'Ancien, Swamp Key (accès au Marais).",
    summon: "3x Trophée d'Ancien",
    weakness: "Feu (flèches enflammées, torches)",
  },
  {
    name: "Bonemass",
    biome: "Marais",
    tag: "Boss",
    category: "Troisième boss",
    status: "Niveau 3",
    color: "#84CC16",
    image: "",
    hp: 7500,
    desc: "Bonemass est une masse d'os et de chair invoquée en plaçant 3 Trophées d'Ossements sur son autel dans les Marais. Il attaque avec des attaques de mêlée, des projectiles de poison et invoque des adds (slimes). Faiblesse: vulnérable aux dégâts contondants. Récompense: Pouvoir de Bonemass (résistance au poison), Trophée de Bonemass, Wishbone (détecteur de trésors enterrés).",
    summon: "3x Trophée d'Ossements",
    weakness: "Dégâts contondants (masses, marteaux)",
  },
  {
    name: "Moder",
    biome: "Montagnes",
    tag: "Boss",
    category: "Quatrième boss",
    status: "Niveau 4",
    color: "#60A5FA",
    image: "",
    hp: 10000,
    desc: "Moder est un grand dragon de glace invoqué en plaçant 3 Trophées de Dragon sur son autel dans les Montagnes. Elle attaque avec des souffles de glace, des attaques de mêlée et peut voler. Faiblesse: vulnérable au feu. Récompense: Pouvoir de Moder (résistance au froid), Trophée de Moder, Dragon Tears (craft de l'Artisan Table).",
    summon: "3x Trophée de Dragon",
    weakness: "Feu (flèches enflammées, haches)",
  },
  {
    name: "Yagluth",
    biome: "Plaines",
    tag: "Boss",
    category: "Cinquième boss",
    status: "Niveau 5",
    color: "#A855F7",
    image: "",
    hp: 15000,
    desc: "Yagluth est une créature squelettique géante invoquée en plaçant 5 Trophées de Fuling sur son autel dans les Plaines. Il attaque avec des météores, des explosions de zone et des attaques de mêlée dévastatrices. Faiblesse: vulnérable aux dégâts d'esprit. Récompense: Pouvoir de Yagluth (résistance aux éléments), Trophée de Yagluth.",
    summon: "5x Trophée de Fuling",
    weakness: "Dégâts d'esprit (armes en argent)",
  },
  {
    name: "The Queen",
    biome: "Mistlands",
    tag: "Boss",
    category: "Sixième boss",
    status: "Niveau 6",
    color: "#EC4899",
    image: "",
    hp: 20000,
    desc: "The Queen est le boss final de Valheim (Mistlands), une immense insectoïde invoquée au sommet de la Citadelle Infestée. Elle attaque avec des pinces, des spits acides et invoque des insectes. Faiblesse: vulnérable aux dégâts de slash. Récompense: Pouvoir de la Reine, Trophée de la Reine, Galdr Table (craft avancé).",
    summon: "Accès à la Citadelle Infestée",
    weakness: "Dégâts tranchants (épées, haches)",
  },
];

export const VALHEIM_BIOMES = [
  { name: "Prairies", tag: "Biome", category: "Débutant", color: "#4ADE80", desc: "Biome de départ paisible. Herbe verte, cerfs, sangliers et geysers. Ressources: bois, pierre, cuir, viande. Premier autel de boss (Eikthyr)." },
  { name: "Forêt Noire", tag: "Biome", category: "Intermédiaire", color: "#22C55E", desc: "Forêt dense avec pins et sapins. Trolls, squelettes, Geyser. Ressources: cuivre, étain, bois fin, Core Wood. Boss: The Elder." },
  { name: "Marais", tag: "Biome", category: "Avancé", color: "#84CC16", desc: "Marécages sombres et toxiques. Abomination, Blobs, Leeches. Ressources: fer, ancient bark, guck, thistle. Boss: Bonemass." },
  { name: "Montagnes", tag: "Biome", category: "Expert", color: "#60A5FA", desc: "Sommets enneigés. Drakes, Wolves, Stone Golems. Ressources: argent, obsidienne, wolf fur, drake eggs. Boss: Moder." },
  { name: "Plaines", tag: "Biome", category: "Expert", color: "#FBBF24", desc: "Plaines ouvertes et vallonnées. Fulings, Lox, Deathsquitos. Ressources: black metal, barley, flax, needle. Boss: Yagluth." },
  { name: "Mistlands", tag: "Biome", category: "End-game", color: "#A855F7", desc: "Biome brumeux et mystérieux. Seekers, Ticks, Dvergers. Ressources: black marble, soft tissue, yggdrasil wood, carapace. Boss: The Queen." },
  { name: "Océan", tag: "Biome", category: "Exploration", color: "#3B82F6", desc: "Eaux profondes navigables. Serpents, Leviathans. Ressources: fish, serpent meat, chitin. Nécessite un raft ou karve pour explorer." },
  { name: "Ashlands", tag: "Biome", category: "End-game+", color: "#EF4444", desc: "Biome volcanique brûlant. Charred, Morgen, Bonemaw. Ressources: flametal, asksvin, morgen heart. Le biome le plus hostile du jeu." },
];

export const VALHEIM_WEAPONS = [
  { name: "Hache de Pierre", tier: 1, damage: 15, type: "Slash", color: "#A0522D", desc: "Première arme et outil. Coupe le bois et inflige des dégâts de slash modérés. Craft: 5x Bois, 4x Pierre." },
  { name: "Épée de Bronze", tier: 2, damage: 35, type: "Slash", color: "#CD7F32", desc: "Épée en bronze pour débutant. Bon équilibre dégâts/vitesse. Craft: 2x Bronze, 1x Leather Scraps, 2x Wood." },
  { name: "Épée de Fer", tier: 3, damage: 55, type: "Slash", color: "#71797E", desc: "Épée en fer intermédiaire. Dégâts solides pour le combat de mêlée. Craft: 2x Iron, 1x Leather Scraps, 2x Wood." },
  { name: "Épée en Argent", tier: 4, damage: 75, type: "Slash/Spirit", color: "#C0C0C0", desc: "Épée en argent avec dégâts d'esprit bonus. Efficace contre les undead. Craft: 2x Silver, 1x Leather Scraps, 2x Wood." },
  { name: "Masse de Fer", tier: 3, damage: 45, type: "Blunt", color: "#71797E", desc: "Masse en fer pour dégâts contondants. Efficace contre les squelettes et Bonemass. Craft: 5x Iron, 2x Wood." },
  { name: "Arc de Chasse", tier: 1, damage: 25, type: "Pierce", color: "#8B4513", desc: "Arc de chasse en bois. Idéal pour les débutants et la chasse au cerf. Craft: 10x Wood, 2x Leather Scraps." },
  { name: "Arc Draugr", tier: 3, damage: 52, type: "Pierce", color: "#5C4033", desc: "Arc en ancient bark puissant. Dégâts élevés et portée longue. Craft: 10x Ancient Bark, 4x Deer Hide, 2x Iron." },
  { name: "Épée Blackmetal", tier: 5, damage: 95, type: "Slash", color: "#2F4F4F", desc: "Épée en black metal, l'une des meilleures armes du jeu. Dégâts massifs. Craft: 2x Black Metal, 1x Leather Scraps, 2x Fine Wood." },
];

export const VALHEIM_ARMORS = [
  { name: "Armure de Cuir", tier: 1, armor: 5, color: "#8B4513", desc: "Première armure en cuir de cerf. Légère et économique. Set complet: 15 armor. Craft: 6x Deer Hide par pièce." },
  { name: "Armure de Troll", tier: 2, armor: 7, color: "#6B8E23", desc: "Armure en cuir de troll. Bonus de furtivité. Set complet: 21 armor. Craft: 5x Troll Hide, 1x Bone Fragments par pièce." },
  { name: "Armure de Bronze", tier: 2, armor: 8, color: "#CD7F32", desc: "Armure en bronze intermédiaire. Bon rapport protection/poids. Set complet: 24 armor. Craft: 5x Bronze par pièce." },
  { name: "Armure de Fer", tier: 3, armor: 14, color: "#71797E", desc: "Armure en fer solide. Protection intermédiaire-avancée. Set complet: 42 armor. Craft: 5x Iron par pièce." },
  { name: "Armure de Loup", tier: 4, armor: 20, color: "#808080", desc: "Armure en fourrure de loup. Résistance au froid et dégâts élevés. Set complet: 60 armor. Craft: 5x Wolf Fur, 5x Silver, 1x Wolf Trophy." },
  { name: "Armure Padded", tier: 4, armor: 16, color: "#F5F5DC", desc: "Armure matelée en lin et tissu. Légère et polyvalente. Set complet: 48 armor. Craft: 10x Linen Thread, 1x Iron par pièce." },
  { name: "Armure Root", tier: 5, armor: 22, color: "#2F4F4F", desc: "Armure avancée en root et carapace. Protection maximale Mistlands. Set complet: 66 armor. Craft: 5x Root, 3x Carapace par pièce." },
];

export const VALHEIM_FOOD = [
  { name: "Viande Cuite", tier: 1, health: 25, stamina: 20, color: "#A0522D", desc: "Viande de sanglier ou cerf cuite. Aliment de base pour débutant." },
  { name: "Ragoût de Queue de Serpent", tier: 2, health: 50, stamina: 35, color: "#84CC16", desc: "Cuit avec serpent meat et mushroom. Bon aliment d'exploration maritime." },
  { name: "Pain de Viande", tier: 3, health: 60, stamina: 30, color: "#CD7F32", desc: "Cuit avec viande de cerf, sanglier et neck tail. Aliment équilibré intermédiaire." },
  { name: "Serpent Ragoût", tier: 3, health: 70, stamina: 40, color: "#22C55E", desc: "Cuit avec serpent meat, thistle et mushroom. Bon aliment pour les zones maritimes." },
  { name: "Blood Pudding", tier: 4, health: 90, stamina: 50, color: "#DC2626", desc: "Cuit avec bloodbag, thistle et barley flour. Excellent aliment avancé." },
  { name: "Lox Meat Pie", tier: 4, health: 85, stamina: 55, color: "#FBBF24", desc: "Cuit avec lox meat, barley flour et cloudberries. Un des meilleurs aliments du jeu." },
];