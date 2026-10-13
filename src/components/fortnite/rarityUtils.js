export const RARITY_COLORS = {
  common: { bg: "rgba(158,158,158,0.15)", border: "rgba(158,158,158,0.4)", text: "#9e9e9e" },
  uncommon: { bg: "rgba(76,175,80,0.15)", border: "rgba(76,175,80,0.4)", text: "#4caf50" },
  rare: { bg: "rgba(33,150,243,0.15)", border: "rgba(33,150,243,0.4)", text: "#2196f3" },
  epic: { bg: "rgba(156,39,176,0.15)", border: "rgba(156,39,176,0.4)", text: "#9c27b0" },
  legendary: { bg: "rgba(255,152,0,0.15)", border: "rgba(255,152,0,0.4)", text: "#ff9800" },
  mythic: { bg: "rgba(244,67,54,0.15)", border: "rgba(244,67,54,0.4)", text: "#f44336" },
  marvel: { bg: "rgba(233,30,99,0.15)", border: "rgba(233,30,99,0.4)", text: "#e91e63" },
  dc: { bg: "rgba(63,81,181,0.15)", border: "rgba(63,81,181,0.4)", text: "#3f51b5" },
  icon: { bg: "rgba(0,188,212,0.15)", border: "rgba(0,188,212,0.4)", text: "#00bcd4" },
  starwars: { bg: "rgba(255,235,59,0.15)", border: "rgba(255,235,59,0.4)", text: "#ffeb3b" },
  gaminglegends: { bg: "rgba(139,195,74,0.15)", border: "rgba(139,195,74,0.4)", text: "#8bc34a" },
  transcendent: { bg: "rgba(233,30,99,0.15)", border: "rgba(233,30,99,0.4)", text: "#e91e63" },
  slurp: { bg: "rgba(0,188,212,0.15)", border: "rgba(0,188,212,0.4)", text: "#00bcd4" },
  dark: { bg: "rgba(33,33,33,0.15)", border: "rgba(33,33,33,0.4)", text: "#666666" },
};

export function getRarityStyle(rarity) {
  const key = (rarity || "common").toLowerCase().replace(/\s/g, "");
  return RARITY_COLORS[key] || RARITY_COLORS.common;
}