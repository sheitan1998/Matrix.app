// Slot machine visual themes — 5×3 grid, 50/20 paylines, themed frames
// Each theme defines: symbols (8+), frame styling, reel styling, control colors, jackpot colors

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
  // NATURE / MYTHOLOGIE GRECQUE — Or & émeraude
  // ==========================================
  nature: {
    name: "Nature / Mythologie",
    paylines: 50,
    symbols: [
      { s: "ZEUS", label: "Zeus",   color: "#ffd700", glow: "#ffaa00", mult: 50, rare: 1, isWild: true, isText: true },
      { s: "👸",  label: "Athena", color: "#ffd700", glow: "#ffaa00", mult: 30, rare: 2 },
      { s: "🏛️", label: "Temple", color: "#e5e4e2", glow: "#ffffff", mult: 20, rare: 2 },
      { s: "🦉",  label: "Hibou",  color: "#a78bfa", glow: "#7c3aed", mult: 15, rare: 3 },
      { s: "🎵",  label: "Lyre",   color: "#fbbf24", glow: "#f59e0b", mult: 10, rare: 4 },
      { s: "🌿",  label: "Olive",  color: "#22c55e", glow: "#16a34a", mult: 8,  rare: 5 },
      { s: "⚔️",  label: "Épée",   color: "#94a3b8", glow: "#64748b", mult: 5,  rare: 6 },
      { s: "🛡️",  label: "Bouclier",color: "#64748b", glow: "#475569", mult: 3,  rare: 8 },
    ],
    frameBg: "linear-gradient(160deg, #1a0a2a 0%, #0d0517 60%, #1a0a2a 100%)",
    frameBorderColor: "#d4af3760",
    frameShadow: "0 0 30px #d4af3730, 0 0 60px #d4af3715",
    frameAccent: "#d4af37",
    hasColumns: true,
    hasDots: false,
    reelBg: "linear-gradient(180deg, #0a0510 0%, #1a0a2a 100%)",
    reelBorderColor: "#d4af3740",
    reelShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
    reelFadeColor: "#0a0510",
    spinBg: "linear-gradient(135deg, #4caf50, #2d9a52)",
    spinShadow: "0 0 20px #4caf5080, 0 4px 0 #1a5d2a",
    autoBg: "linear-gradient(135deg, #d4af37, #b8860b)",
    betActiveBg: "linear-gradient(135deg, #d4af37, #b8860b)",
    betActiveBorder: "#d4af37",
    jackpotBg: "linear-gradient(135deg, #1a0a2a, #2a1a4a)",
    jackpotBorderColor: "#d4af3750",
    jackpotColor: "#d4af37",
    sideBg: "rgba(212,175,55,0.05)",
    sideBorderColor: "rgba(212,175,55,0.15)",
    paylineColor: "#d4af37",
    messageColor: "#d4af37",
    messageBg: "rgba(212,175,55,0.05)",
    controlBg: "linear-gradient(180deg, #1a0a2a, #0d0517)",
    controlBorderColor: "#d4af3730",
    minusBg: "#c02b2b",
    plusBg: "#58a735",
  },

  // ==========================================
  // AVENTURE / CLASSIC HOT — Violet néon & magenta
  // ==========================================
  adventure: {
    name: "Aventure / Trésor",
    paylines: 50,
    symbols: [
      { s: "7",  label: "Sept",    color: "#ff6b35", glow: "#cc4400", mult: 50, rare: 1, isWild: true, isText: true },
      { s: "🌹", label: "Rose",    color: "#e02a64", glow: "#cc1155", mult: 30, rare: 2 },
      { s: "🪙", label: "Pièce",   color: "#ffd700", glow: "#ffaa00", mult: 20, rare: 2 },
      { s: "🔔", label: "Cloche",  color: "#fbbf24", glow: "#f59e0b", mult: 15, rare: 3 },
      { s: "👹", label: "Monstre", color: "#ef4444", glow: "#dc2626", mult: 10, rare: 4 },
      { s: "💎", label: "Diamant", color: "#3b82f6", glow: "#1d4ed8", mult: 8,  rare: 5 },
      { s: "📦", label: "Coffre", color: "#cd7f32", glow: "#8b4513", mult: 5,  rare: 6 },
      { s: "👑", label: "Couronne",color: "#ffd700", glow: "#ffaa00", mult: 3,  rare: 8 },
    ],
    frameBg: "linear-gradient(160deg, #1a0a2a 0%, #0d0517 60%, #1a0a2a 100%)",
    frameBorderColor: "#b026ff60",
    frameShadow: "0 0 30px #b026ff30, 0 0 60px #b026ff15",
    frameAccent: "#b026ff",
    hasColumns: false,
    hasDots: true,
    reelBg: "linear-gradient(180deg, #0a0510 0%, #1a0a2a 100%)",
    reelBorderColor: "#b026ff40",
    reelShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
    reelFadeColor: "#0a0510",
    spinBg: "linear-gradient(135deg, #4caf50, #2d9a52)",
    spinShadow: "0 0 20px #4caf5080, 0 4px 0 #1a5d2a",
    autoBg: "linear-gradient(135deg, #b026ff, #7c00cc)",
    betActiveBg: "linear-gradient(135deg, #b026ff, #7c00cc)",
    betActiveBorder: "#b026ff",
    jackpotBg: "linear-gradient(135deg, #1a0a2a, #2a0a4a)",
    jackpotBorderColor: "#b026ff50",
    jackpotColor: "#ffd700",
    sideBg: "rgba(176,38,255,0.05)",
    sideBorderColor: "rgba(176,38,255,0.15)",
    paylineColor: "#b026ff",
    messageColor: "#b026ff",
    messageBg: "rgba(176,38,255,0.05)",
    controlBg: "linear-gradient(180deg, #1a0a2a, #0d0517)",
    controlBorderColor: "#b026ff30",
    minusBg: "#c02b2b",
    plusBg: "#58a735",
  },

  // ==========================================
  // CYBERPUNK / FUTURISTE — Cyan & violet néon
  // ==========================================
  cyber: {
    name: "Cyberpunk / Futuriste",
    paylines: 20,
    symbols: [
      { s: "AI", label: "AI",       color: "#00f2ff", glow: "#0099cc", mult: 50, rare: 1, isWild: true, isText: true },
      { s: "🤖", label: "Robot",   color: "#bf00ff", glow: "#7c00cc", mult: 30, rare: 2 },
      { s: "💠", label: "Hologramme",color: "#00f2ff", glow: "#0099cc", mult: 20, rare: 2 },
      { s: "🚀", label: "Vaisseau", color: "#22c55e", glow: "#16a34a", mult: 15, rare: 3 },
      { s: "🔌", label: "Circuit", color: "#fbbf24", glow: "#f59e0b", mult: 10, rare: 4 },
      { s: "⚡", label: "Drone",   color: "#60a5fa", glow: "#3b82f6", mult: 8,  rare: 5 },
      { s: "📡", label: "Antenne", color: "#a78bfa", glow: "#7c3aed", mult: 5,  rare: 6 },
      { s: "💾", label: "Chip",    color: "#94a3b8", glow: "#64748b", mult: 3,  rare: 8 },
    ],
    frameBg: "linear-gradient(160deg, #0a0118 0%, #050010 60%, #0a0118 100%)",
    frameBorderColor: "#00f2ff60",
    frameShadow: "0 0 30px #00f2ff30, 0 0 60px #00f2ff15",
    frameAccent: "#00f2ff",
    hasColumns: false,
    hasDots: true,
    reelBg: "linear-gradient(180deg, #040008 0%, #0a0025 100%)",
    reelBorderColor: "#00f2ff40",
    reelShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
    reelFadeColor: "#040008",
    spinBg: "linear-gradient(135deg, #4caf50, #2d9a52)",
    spinShadow: "0 0 20px #4caf5080, 0 4px 0 #1a5d2a",
    autoBg: "linear-gradient(135deg, #00f2ff, #0099cc)",
    betActiveBg: "linear-gradient(135deg, #00f2ff, #0099cc)",
    betActiveBorder: "#00f2ff",
    jackpotBg: "linear-gradient(135deg, #0a0118, #1a0a2e)",
    jackpotBorderColor: "#00f2ff50",
    jackpotColor: "#00f2ff",
    sideBg: "rgba(0,242,255,0.05)",
    sideBorderColor: "rgba(0,242,255,0.15)",
    paylineColor: "#00f2ff",
    messageColor: "#00f2ff",
    messageBg: "rgba(0,242,255,0.05)",
    controlBg: "linear-gradient(180deg, #0a0118, #050010)",
    controlBorderColor: "#00f2ff30",
    minusBg: "#c02b2b",
    plusBg: "#58a735",
  },
};

export const DEFAULT_THEME = "cyber";