export const FORTNITE_BANNER = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/719de61e0_Gemini_Generated_Image_q2fpd6q2fpd6q2fp.jpg";

export const MAP_CATEGORIES = [
  { id: "all", label: "Tous", color: "#BF5AF2" },
  { id: "tycoon", label: "Tycoon", color: "#FBBF24" },
  { id: "horreur", label: "Horreur", color: "#F87171" },
  { id: "deathrun", label: "Deathrun", color: "#22D3EE" },
  { id: "battle_royale", label: "Battle Royale", color: "#4ADE80" },
  { id: "parkour", label: "Parkour", color: "#A78BFA" },
  { id: "pve", label: "PvE", color: "#60A5FA" },
  { id: "rp", label: "Roleplay", color: "#FB923C" },
  { id: "music", label: "Musique", color: "#EC4899" },
  { id: "puzzle", label: "Puzzle", color: "#2DD4BF" },
  { id: "autre", label: "Autre", color: "#94A3B8" },
];

export const CATEGORY_OPTIONS = MAP_CATEGORIES.filter((c) => c.id !== "all");

export function getCategoryMeta(categoryId) {
  return MAP_CATEGORIES.find((c) => c.id === categoryId) || { label: categoryId, color: "#94A3B8" };
}

export function validateMapCode(code) {
  return /^\d{4}-\d{4}-\d{4}$/.test(code.trim());
}

export function formatMapCode(raw) {
  const digits = (raw || "").replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1-");
}