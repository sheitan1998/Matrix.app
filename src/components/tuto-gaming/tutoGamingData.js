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

export const ENTRY_TYPE_META = {
  monstre: { label: "Monstre", color: "#F87171" },
  equipement: { label: "Équipement", color: "#60A5FA" },
  ressource: { label: "Ressource", color: "#FBBF24" },
  pnj: { label: "PNJ", color: "#22D3EE" },
  zone: { label: "Zone", color: "#4ADE80" },
  succes: { label: "Succès", color: "#FFD700" },
  carte: { label: "Carte", color: "#A78BFA" },
  astuce: { label: "Astuce", color: "#BF5AF2" },
};

export const WIKI_SECTIONS = [
  { id: "quetes", label: "Quêtes", entity: "quest", group: "guides" },
  { id: "classes", label: "Classes", entity: "quest", questCategory: "classe", group: "guides" },
  { id: "metiers", label: "Métiers", entity: "quest", questCategory: "metier", group: "guides" },
  { id: "donjons", label: "Donjons", entity: "quest", questCategory: "donjon", group: "guides" },
  { id: "progression", label: "Progression", entity: "quest", questCategory: "progression", group: "guides" },
  { id: "monstres", label: "Monstres", entity: "wiki", entryType: "monstre", group: "encyclopedie" },
  { id: "equipements", label: "Équipements", entity: "wiki", entryType: "equipement", group: "encyclopedie" },
  { id: "ressources", label: "Ressources", entity: "wiki", entryType: "ressource", group: "encyclopedie" },
  { id: "pnj", label: "PNJ", entity: "wiki", entryType: "pnj", group: "encyclopedie" },
  { id: "zones", label: "Zones", entity: "wiki", entryType: "zone", group: "encyclopedie" },
  { id: "succes", label: "Succès", entity: "wiki", entryType: "succes", group: "divers" },
  { id: "cartes", label: "Cartes", entity: "wiki", entryType: "carte", group: "divers" },
  { id: "astuces", label: "Astuces", entity: "wiki", entryType: "astuce", group: "divers" },
  { id: "connaissances", label: "Connaissances", entity: "quest", questCategory: "connaissance", group: "divers" },
  { id: "faq", label: "FAQ", entity: "quest", questCategory: "faq", group: "divers" },
];

export const SECTION_GROUPS = [
  { id: "guides", label: "Guides" },
  { id: "encyclopedie", label: "Encyclopédie" },
  { id: "divers", label: "Divers" },
];

export const FEATURED_GAMES = [
  {
    name: "Farming Simulator 25",
    slug: "farming-simulator-25",
    image_url: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/5a7d6231a_Farming-Simulator-25.jpg",
    is_active: true,
  },
];

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

export function getEntryTypeMeta(type) {
  return ENTRY_TYPE_META[type] || { label: type, color: "#BF5AF2" };
}

export function getSectionMeta(sectionId) {
  return WIKI_SECTIONS.find(s => s.id === sectionId);
}