export const MAX_BOOSTS = 30;

export const BOOST_LEVELS = [
  {
    level: 1,
    requiredBoosts: 2,
    color: "#F472B6",
    label: "Basique",
    perks: [
      { icon: "🖼️", text: "Icône de serveur animée (GIF)" },
      { icon: "🎨", text: "Thème visuel du serveur" },
      { icon: "😀", text: "Jusqu'à 10 emojis personnalisés" },
    ],
  },
  {
    level: 2,
    requiredBoosts: 10,
    color: "#C084FC",
    label: "Avancé",
    perks: [
      { icon: "🖼️", text: "Bannière de serveur fixe" },
      { icon: "💫", text: "Effets visuels sur les messages" },
      { icon: "🛡️", text: "Icônes de rôle personnalisées" },
    ],
  },
  {
    level: 3,
    requiredBoosts: 20,
    color: "#A855F7",
    label: "Max",
    perks: [
      { icon: "⭐", text: "Lien d'invitation personnalisé" },
      { icon: "🎭", text: "Bannière de serveur animée (GIF)" },
      { icon: "🌈", text: "Thèmes visuels personnalisés avancés" },
    ],
  },
  {
    level: 4,
    requiredBoosts: 30,
    color: "#FFD700",
    label: "Légendaire",
    perks: [
      { icon: "🚀", text: "Boost d'XP x2 pour tous les membres actifs" },
      { icon: "😀", text: "Limite portée à 50 emojis personnalisés" },
    ],
  },
];

export function getBoostLevel(boosts) {
  if (boosts >= 30) return 4;
  if (boosts >= 20) return 3;
  if (boosts >= 10) return 2;
  if (boosts >= 2) return 1;
  return 0;
}

export function getBoostLevelInfo(boosts) {
  const level = getBoostLevel(boosts);
  if (level === 0) return { level: 0, color: "#6b7280", label: "Aucun", requiredBoosts: 2 };
  return BOOST_LEVELS.find((l) => l.level === level);
}