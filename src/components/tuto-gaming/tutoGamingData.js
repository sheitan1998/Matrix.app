export const QUEST_CATEGORIES = [
  { id: "all", label: "Tous", color: "#BF5AF2" },
  { id: "quete", label: "Quêtes", color: "#BF5AF2" },
  { id: "debutant", label: "Débutants", color: "#4ADE80" },
  { id: "classe", label: "Classes", color: "#60A5FA" },
  { id: "metier", label: "Métiers", color: "#FBBF24" },
  { id: "progression", label: "Progression", color: "#22D3EE" },
  { id: "donjon", label: "Donjons", color: "#F87171" },
  { id: "connaissance", label: "Connaissances", color: "#A78BFA" },
  { id: "faq", label: "FAQ", color: "#94A3B8" },
];

export const DIFFICULTY = {
  facile: { label: "Facile", color: "#4ADE80" },
  moyen: { label: "Moyen", color: "#FBBF24" },
  difficile: { label: "Difficile", color: "#F87171" },
};

export const COMING_SOON_GAMES = [
  { name: "Minecraft", slug: "minecraft", card_gradient: "linear-gradient(135deg, #0D2818 0%, #1A5C3A 50%, #0D2818 100%)" },
  { name: "World of Warcraft", slug: "wow", card_gradient: "linear-gradient(135deg, #1A0A0A 0%, #4A1A0A 50%, #1A0A0A 100%)" },
  { name: "Fortnite", slug: "fortnite", card_gradient: "linear-gradient(135deg, #0A1A2A 0%, #1A3A5A 50%, #0A1A2A 100%)" },
  { name: "League of Legends", slug: "lol", card_gradient: "linear-gradient(135deg, #0A1525 0%, #1A3555 50%, #0A1525 100%)" },
  { name: "Genshin Impact", slug: "genshin", card_gradient: "linear-gradient(135deg, #0D1A2A 0%, #1A3555 50%, #0D1A2A 100%)" },
];

export function getCategoryMeta(categoryId) {
  return QUEST_CATEGORIES.find(c => c.id === categoryId) || { label: categoryId, color: "#BF5AF2" };
}

export function getDifficultyMeta(diff) {
  return DIFFICULTY[diff] || { label: diff, color: "#94A3B8" };
}