// Slot machine visual themes — 6 univers avec fonds d'écran dédiés
// Chaque thème définit: symboles (8+), couleurs de cadre, image de fond

export function pickRandom(symbols) {
  const pool = [];
  symbols.forEach(s => { for (let i = 0; i < s.rare; i++) pool.push(s); });
  return pool[Math.floor(Math.random() * pool.length)];
}

export function formatBet(amount) {
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(2)}B`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return Math.floor(amount).toString();
}

export const SLOT_THEMES = {
  // ==========================================
  // CASINO CLASSIQUE — Or & bleu nuit
  // ==========================================
  classic: {
    name: "Casino Classique",
    emoji: "🎰",
    paylines: 20,
    bgImage: "/media/tuto-gaming/d267ffb17_Gemini_Generated_Image_vr9la2vr9la2vr9l.jpg",
    symbols: [
      { s: "7",   label: "Sept",     color: "#ffd700", glow: "#ffaa00", mult: 50, rare: 1, isWild: true, isText: true },
      { s: "💎",  label: "Diamant",  color: "#00f2ff", glow: "#0099cc", mult: 30, rare: 2 },
      { s: "BAR", label: "Bar",      color: "#d4af37", glow: "#ffaa00", mult: 20, rare: 2, isText: true },
      { s: "🔔",  label: "Cloche",   color: "#fbbf24", glow: "#f59e0b", mult: 15, rare: 3 },
      { s: "🍒",  label: "Cerise",   color: "#ef4444", glow: "#dc2626", mult: 10, rare: 4 },
      { s: "🍇",  label: "Raisin",   color: "#a855f7", glow: "#7c3aed", mult: 8,  rare: 5 },
      { s: "🍀",  label: "Trèfle",   color: "#22c55e", glow: "#16a34a", mult: 5,  rare: 6 },
      { s: "👑",  label: "Couronne", color: "#ffd700", glow: "#ffaa00", mult: 3,  rare: 8 },
    ],
    frameBg: "rgba(5, 10, 25, 0.65)",
    frameBorderColor: "#d4af3780",
    frameShadow: "0 0 30px #d4af3730, 0 0 60px #d4af3715",
    frameAccent: "#d4af37",
    hasColumns: true,
    hasDots: false,
    reelBg: "rgba(0, 5, 20, 0.88)",
    reelBorderColor: "#d4af3740",
    reelShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
    reelFadeColor: "#000510",
    spinBg: "linear-gradient(135deg, #d4af37, #b8860b)",
    spinShadow: "0 0 20px #d4af3780, 0 4px 0 #8b6914",
    controlBg: "rgba(5, 10, 25, 0.9)",
    controlBorderColor: "#d4af3730",
    minusBg: "#c02b2b",
    plusBg: "#58a735",
    paylineColor: "#d4af37",
    messageColor: "#d4af37",
    messageBg: "rgba(212,175,55,0.05)",
  },

  // ==========================================
  // FORÊT ENCHANTÉE — Vert & cristaux
  // ==========================================
  nature: {
    name: "Forêt Enchantée",
    emoji: "🌿",
    paylines: 20,
    bgImage: "/media/tuto-gaming/e13d5ca12_Gemini_Generated_Image_hi0c5khi0c5khi0c.jpg",
    symbols: [
      { s: "🧚", label: "Fée",      color: "#00f2ff", glow: "#0099cc", mult: 50, rare: 1, isWild: true },
      { s: "🌳", label: "Arbre",    color: "#22c55e", glow: "#16a34a", mult: 30, rare: 2 },
      { s: "💎", label: "Cristal",  color: "#00f2ff", glow: "#0099cc", mult: 20, rare: 2 },
      { s: "🦋", label: "Papillon", color: "#a855f7", glow: "#7c3aed", mult: 15, rare: 3 },
      { s: "🍄", label: "Champi",   color: "#ef4444", glow: "#dc2626", mult: 10, rare: 4 },
      { s: "🌿", label: "Herbe",    color: "#22c55e", glow: "#16a34a", mult: 8,  rare: 5 },
      { s: "🦉", label: "Hibou",    color: "#d4af37", glow: "#ffaa00", mult: 5,  rare: 6 },
      { s: "⚡", label: "Éclair",   color: "#fbbf24", glow: "#f59e0b", mult: 3,  rare: 8 },
    ],
    frameBg: "rgba(5, 20, 10, 0.65)",
    frameBorderColor: "#22c55e80",
    frameShadow: "0 0 30px #22c55e30, 0 0 60px #22c55e15",
    frameAccent: "#22c55e",
    hasColumns: false,
    hasDots: true,
    reelBg: "rgba(0, 10, 5, 0.88)",
    reelBorderColor: "#22c55e40",
    reelShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
    reelFadeColor: "#000a05",
    spinBg: "linear-gradient(135deg, #22c55e, #16a34a)",
    spinShadow: "0 0 20px #22c55e80, 0 4px 0 #1a5d2a",
    controlBg: "rgba(5, 20, 10, 0.9)",
    controlBorderColor: "#22c55e30",
    minusBg: "#c02b2b",
    plusBg: "#58a735",
    paylineColor: "#22c55e",
    messageColor: "#22c55e",
    messageBg: "rgba(34,197,94,0.05)",
  },

  // ==========================================
  // ENFER / MAGMA — Rouge & lave
  // ==========================================
  enfer: {
    name: "Enfer / Magma",
    emoji: "🔥",
    paylines: 20,
    bgImage: "/media/tuto-gaming/1a877ab86_Gemini_Generated_Image_tzpxpytzpxpytzpx.jpg",
    symbols: [
      { s: "😈", label: "Démon",    color: "#ff4500", glow: "#cc2200", mult: 50, rare: 1, isWild: true },
      { s: "🔥", label: "Flamme",   color: "#ff6347", glow: "#cc2200", mult: 30, rare: 2 },
      { s: "💀", label: "Crâne",    color: "#e5e4e2", glow: "#ffffff", mult: 20, rare: 2 },
      { s: "🌋", label: "Volcan",   color: "#ff4500", glow: "#cc2200", mult: 15, rare: 3 },
      { s: "🔱", label: "Trident",  color: "#ff8c00", glow: "#cc6600", mult: 10, rare: 4 },
      { s: "🩸", label: "Sang",     color: "#dc2626", glow: "#991b1b", mult: 8,  rare: 5 },
      { s: "👹", label: "Oni",     color: "#ef4444", glow: "#dc2626", mult: 5,  rare: 6 },
      { s: "⚡", label: "Éclair",   color: "#fbbf24", glow: "#f59e0b", mult: 3,  rare: 8 },
    ],
    frameBg: "rgba(25, 5, 5, 0.65)",
    frameBorderColor: "#ff450080",
    frameShadow: "0 0 30px #ff450030, 0 0 60px #ff450015",
    frameAccent: "#ff4500",
    hasColumns: false,
    hasDots: true,
    reelBg: "rgba(15, 0, 0, 0.88)",
    reelBorderColor: "#ff450040",
    reelShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
    reelFadeColor: "#0f0000",
    spinBg: "linear-gradient(135deg, #ff4500, #cc2200)",
    spinShadow: "0 0 20px #ff450080, 0 4px 0 #991b1b",
    controlBg: "rgba(25, 5, 5, 0.9)",
    controlBorderColor: "#ff450030",
    minusBg: "#c02b2b",
    plusBg: "#58a735",
    paylineColor: "#ff4500",
    messageColor: "#ff6347",
    messageBg: "rgba(255,69,0,0.05)",
  },

  // ==========================================
  // PARADIS / CÉLESTE — Or & blanc
  // ==========================================
  paradis: {
    name: "Paradis / Céleste",
    emoji: "😇",
    paylines: 20,
    bgImage: "/media/tuto-gaming/9ad4e2640_Gemini_Generated_Image_pgdhkwpgdhkwpgdh.jpg",
    symbols: [
      { s: "😇", label: "Ange",     color: "#ffd700", glow: "#ffaa00", mult: 50, rare: 1, isWild: true },
      { s: "☁️", label: "Nuage",    color: "#ffffff", glow: "#e0e0e0", mult: 30, rare: 2 },
      { s: "⭐", label: "Étoile",   color: "#ffd700", glow: "#ffaa00", mult: 20, rare: 2 },
      { s: "🕊️", label: "Colombe",  color: "#ffffff", glow: "#e0e0e0", mult: 15, rare: 3 },
      { s: "✨", label: "Étincelle",color: "#ffd700", glow: "#ffaa00", mult: 10, rare: 4 },
      { s: "🌟", label: "Étoile2",  color: "#fbbf24", glow: "#f59e0b", mult: 8,  rare: 5 },
      { s: "👼", label: "Chérubin", color: "#ffd700", glow: "#ffaa00", mult: 5,  rare: 6 },
      { s: "💫", label: "Comète",   color: "#00f2ff", glow: "#0099cc", mult: 3,  rare: 8 },
    ],
    frameBg: "rgba(25, 20, 5, 0.55)",
    frameBorderColor: "#ffd70080",
    frameShadow: "0 0 30px #ffd70030, 0 0 60px #ffd70015",
    frameAccent: "#ffd700",
    hasColumns: true,
    hasDots: false,
    reelBg: "rgba(20, 15, 5, 0.85)",
    reelBorderColor: "#ffd70040",
    reelShadow: "inset 0 0 30px rgba(0,0,0,0.7)",
    reelFadeColor: "#141005",
    spinBg: "linear-gradient(135deg, #ffd700, #ffaa00)",
    spinShadow: "0 0 20px #ffd70080, 0 4px 0 #b8860b",
    controlBg: "rgba(25, 20, 5, 0.9)",
    controlBorderColor: "#ffd70030",
    minusBg: "#c02b2b",
    plusBg: "#58a735",
    paylineColor: "#ffd700",
    messageColor: "#ffd700",
    messageBg: "rgba(255,215,0,0.05)",
  },

  // ==========================================
  // SAVANE / ANIMAUX — Brun & or
  // ==========================================
  savane: {
    name: "Savane / Animaux",
    emoji: "🦁",
    paylines: 20,
    bgImage: "/media/tuto-gaming/abe7c32e3_Gemini_Generated_Image_2ut4s72ut4s72ut4.jpg",
    symbols: [
      { s: "🦁", label: "Lion",     color: "#ff8c00", glow: "#cc6600", mult: 50, rare: 1, isWild: true },
      { s: "🐆", label: "Léopard",  color: "#ffd700", glow: "#ffaa00", mult: 30, rare: 2 },
      { s: "🐘", label: "Éléphant", color: "#a0aec0", glow: "#718096", mult: 20, rare: 2 },
      { s: "🦒", label: "Girafe",   color: "#fbbf24", glow: "#f59e0b", mult: 15, rare: 3 },
      { s: "🦓", label: "Zèbre",    color: "#ffffff", glow: "#e0e0e0", mult: 10, rare: 4 },
      { s: "🐃", label: "Buffle",   color: "#7c2d12", glow: "#431407", mult: 8,  rare: 5 },
      { s: "🐊", label: "Croco",    color: "#22c55e", glow: "#16a34a", mult: 5,  rare: 6 },
      { s: "🦅", label: "Aigle",    color: "#92400e", glow: "#451a03", mult: 3,  rare: 8 },
    ],
    frameBg: "rgba(20, 10, 5, 0.65)",
    frameBorderColor: "#d49f6a80",
    frameShadow: "0 0 30px #d49f6a30, 0 0 60px #d49f6a15",
    frameAccent: "#d49f6a",
    hasColumns: false,
    hasDots: true,
    reelBg: "rgba(15, 8, 3, 0.88)",
    reelBorderColor: "#d49f6a40",
    reelShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
    reelFadeColor: "#0f0803",
    spinBg: "linear-gradient(135deg, #d49f6a, #b8860b)",
    spinShadow: "0 0 20px #d49f6a80, 0 4px 0 #8b6914",
    controlBg: "rgba(20, 10, 5, 0.9)",
    controlBorderColor: "#d49f6a30",
    minusBg: "#c02b2b",
    plusBg: "#58a735",
    paylineColor: "#d49f6a",
    messageColor: "#d49f6a",
    messageBg: "rgba(212,159,106,0.05)",
  },

  // ==========================================
  // OVNI / EXTRATERRESTRE — Violet & cyan
  // ==========================================
  ovni: {
    name: "Ovni / Extraterrestre",
    emoji: "🛸",
    paylines: 20,
    bgImage: "/media/tuto-gaming/0ba1cea9d_Gemini_Generated_Image_d6bzssd6bzssd6bz.jpg",
    symbols: [
      { s: "🛸", label: "Ovni",     color: "#00f2ff", glow: "#0099cc", mult: 50, rare: 1, isWild: true },
      { s: "👽", label: "Alien",    color: "#22c55e", glow: "#16a34a", mult: 30, rare: 2 },
      { s: "🌍", label: "Planète",  color: "#3b82f6", glow: "#1d4ed8", mult: 20, rare: 2 },
      { s: "🛰️", label: "Satellite",color: "#94a3b8", glow: "#64748b", mult: 15, rare: 3 },
      { s: "💫", label: "Comète",   color: "#fbbf24", glow: "#f59e0b", mult: 10, rare: 4 },
      { s: "🔭", label: "Télescope",color: "#a78bfa", glow: "#7c3aed", mult: 8,  rare: 5 },
      { s: "⚡", label: "Éclair",   color: "#00f2ff", glow: "#0099cc", mult: 5,  rare: 6 },
      { s: "💠", label: "Hologramme",color: "#bf00ff", glow: "#7c00cc", mult: 3, rare: 8 },
    ],
    frameBg: "rgba(10, 5, 25, 0.65)",
    frameBorderColor: "#00f2ff80",
    frameShadow: "0 0 30px #00f2ff30, 0 0 60px #00f2ff15",
    frameAccent: "#00f2ff",
    hasColumns: false,
    hasDots: true,
    reelBg: "rgba(5, 0, 20, 0.88)",
    reelBorderColor: "#00f2ff40",
    reelShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
    reelFadeColor: "#050014",
    spinBg: "linear-gradient(135deg, #00f2ff, #0099cc)",
    spinShadow: "0 0 20px #00f2ff80, 0 4px 0 #006699",
    controlBg: "rgba(10, 5, 25, 0.9)",
    controlBorderColor: "#00f2ff30",
    minusBg: "#c02b2b",
    plusBg: "#58a735",
    paylineColor: "#00f2ff",
    messageColor: "#00f2ff",
    messageBg: "rgba(0,242,255,0.05)",
  },
};

export const DEFAULT_THEME = "classic";

export const BET_STEPS = [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];