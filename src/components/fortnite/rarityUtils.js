// Fortnite series and rarity palettes used when the API does not provide offer/series colors.
export const RARITY_COLORS = {
  common:      { bg: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", border: "rgba(156,163,175,0.5)",  text: "#d1d5db", glow: "rgba(107,114,128,0.3)" },
  uncommon:    { bg: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", border: "rgba(34,197,94,0.5)",   text: "#86efac", glow: "rgba(34,197,94,0.3)" },
  rare:        { bg: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", border: "rgba(59,130,246,0.5)", text: "#93c5fd", glow: "rgba(59,130,246,0.3)" },
  epic:        { bg: "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)", border: "rgba(168,85,247,0.5)", text: "#d8b4fe", glow: "rgba(168,85,247,0.3)" },
  legendary:   { bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", border: "rgba(245,158,11,0.6)", text: "#fcd34d", glow: "rgba(245,158,11,0.4)" },
  mythic:      { bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", border: "rgba(239,68,68,0.5)",  text: "#fca5a5", glow: "rgba(239,68,68,0.3)" },
  marvel:      { bg: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)", border: "rgba(244,63,94,0.5)",  text: "#fda4af", glow: "rgba(244,63,94,0.3)" },
  dc:          { bg: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)", border: "rgba(59,130,246,0.5)", text: "#93c5fd", glow: "rgba(59,130,246,0.3)" },
  icon:        { bg: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", border: "rgba(6,182,212,0.6)", text: "#67e8f9", glow: "rgba(6,182,212,0.4)" },
  starwars:    { bg: "linear-gradient(135deg, #171717 0%, #3f3a16 58%, #ca8a04 100%)", border: "rgba(234,179,8,0.65)",  text: "#fde047", glow: "rgba(234,179,8,0.3)" },
  gaminglegends: { bg: "linear-gradient(135deg, #8078ff 0%, #5328d6 45%, #0d0027 100%)", border: "rgba(128,120,255,0.65)", text: "#c4b5fd", glow: "rgba(83,40,214,0.4)" },
  transcendent:{ bg: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", border: "rgba(236,72,153,0.5)", text: "#f9a8d4", glow: "rgba(236,72,153,0.3)" },
  slurp:       { bg: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)", border: "rgba(6,182,212,0.5)", text: "#67e8f9", glow: "rgba(6,182,212,0.3)" },
  dark:        { bg: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", border: "rgba(75,85,99,0.5)",  text: "#9ca3af", glow: "rgba(75,85,99,0.3)" },
  default:     { bg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", border: "rgba(100,116,139,0.4)", text: "#94a3b8", glow: "rgba(100,116,139,0.2)" },
};

const SERIES_KEYS = {
  "iconseries": "icon",
  "marvelseries": "marvel",
  "dcseries": "dc",
  "starwarsseries": "starwars",
  "gaminglegendsseries": "gaminglegends",
  "slurpseries": "slurp",
  "darkseries": "dark",
};

function paletteKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z]/g, "");
}

function apiColors(item) {
  const offer = item.shop_colors
    ? [item.shop_colors.color1, item.shop_colors.color2, item.shop_colors.color3, item.shop_colors.textBackgroundColor]
    : [];
  const series = Array.isArray(item.series_colors) ? item.series_colors : [];
  return [...offer, ...series]
    .filter(value => typeof value === "string" && /^[a-f\d]{6}([a-f\d]{2})?$/i.test(value))
    .map(value => value.slice(0, 6));
}

export function getFortniteItemStyle(item) {
  const seriesKey = SERIES_KEYS[paletteKey(item.series)];
  const fallback = getRarityStyle(seriesKey || item.rarity);
  const colors = apiColors(item);
  if (colors.length < 2) return fallback;
  const [red, green, blue] = colors[0].match(/.{2}/g).map(value => parseInt(value, 16));
  return {
    ...fallback,
    bg: `linear-gradient(135deg, ${colors.map((color, index) => `#${color} ${Math.round(index * 100 / (colors.length - 1))}%`).join(", ")})`,
    border: `#${colors[0]}`,
    glow: `rgba(${red},${green},${blue},0.35)`,
  };
}

export function getRarityStyle(rarity) {
  const rawKey = paletteKey(rarity);
  const key = SERIES_KEYS[rawKey] || rawKey;
  return RARITY_COLORS[key] || RARITY_COLORS.common;
}

// Solid color for a rarity (used for badges, text accents)
export function getRarityColor(rarity) {
  const key = (rarity || "common").toLowerCase().replace(/\s/g, "");
  const map = {
    common: "#9ca3af", uncommon: "#22c55e", rare: "#3b82f6", epic: "#a855f7",
    legendary: "#f59e0b", mythic: "#ef4444", marvel: "#f43f5e", dc: "#3b82f6",
    icon: "#06b6d4", starwars: "#eab308", gaminglegends: "#84cc16",
    transcendent: "#ec4899", slurp: "#06b6d4", dark: "#6b7280",
  };
  return map[key] || "#9ca3af";
}