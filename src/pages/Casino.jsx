import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Dices, CircleDot, Radio, Trophy, ShoppingCart, Palette, Grid3X3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AgeGate from "@/components/casino/AgeGate";
import RouletteGame from "@/components/casino/RouletteGame";
import SlotsGame from "@/components/casino/SlotsGame";
import BingoGame from "@/components/casino/BingoGame";
import SportsBetting from "@/components/casino/SportsBetting";
import SportLive from "@/components/casino/SportLive";
import CasinoShop from "@/pages/casino/CasinoShop";
import { cn } from "@/lib/utils";

const GAMES = [
  { key: "sports_live", label: "Sport Live", icon: Radio, desc: "En direct 🔴" },
  { key: "sports", label: "Paris Sportifs", icon: Trophy, desc: "Misez sur vos équipes" },
  { key: "roulette", label: "Roulette", icon: CircleDot, desc: "Rouge ou noir" },
  { key: "slots", label: "Slots", icon: Dices, desc: "7 fruits chanceux" },
  { key: "bingo", label: "Bingo", icon: Grid3X3, desc: "BINGO !" },
];

const CASINO_THEMES = [
  {
    key: "matrix",
    label: "MATRIX",
    emoji: "🟩",
    bg: "linear-gradient(160deg, #0a0a12 0%, #110a1a 50%, #0a0f0a 100%)",
    felt: "linear-gradient(145deg, #0f1a0f 0%, #0d1510 50%, #0a130a 100%)",
    accent: "#00ff41",
    header: "linear-gradient(to right, rgba(10,10,20,0.95), rgba(17,10,26,0.95))",
    border: "rgba(0,255,65,0.15)",
  },
  {
    key: "vegas",
    label: "Las Vegas",
    emoji: "🎰",
    bg: "linear-gradient(160deg, #1a0a00 0%, #2a1500 50%, #1a0800 100%)",
    felt: "linear-gradient(145deg, #1a0800 0%, #250d00 50%, #1a0600 100%)",
    accent: "#ff6b00",
    header: "linear-gradient(to right, rgba(30,10,0,0.95), rgba(40,20,0,0.95))",
    border: "rgba(255,107,0,0.2)",
  },
  {
    key: "macao",
    label: "Macao",
    emoji: "🏮",
    bg: "linear-gradient(160deg, #1a0000 0%, #2d0000 50%, #1a0010 100%)",
    felt: "linear-gradient(145deg, #1a0505 0%, #250808 50%, #1a0305 100%)",
    accent: "#ff2020",
    header: "linear-gradient(to right, rgba(30,0,0,0.95), rgba(45,0,0,0.95))",
    border: "rgba(255,32,32,0.2)",
  },
  {
    key: "montecarlo",
    label: "Monte-Carlo",
    emoji: "👑",
    bg: "linear-gradient(160deg, #0a0a00 0%, #1a1500 50%, #0a0c00 100%)",
    felt: "linear-gradient(145deg, #0f1208 0%, #141a0a 50%, #0c1008 100%)",
    accent: "#ffd700",
    header: "linear-gradient(to right, rgba(15,12,0,0.95), rgba(25,20,0,0.95))",
    border: "rgba(255,215,0,0.2)",
  },
  {
    key: "space",
    label: "Espace",
    emoji: "🚀",
    bg: "linear-gradient(160deg, #04001a 0%, #0a0030 50%, #020010 100%)",
    felt: "linear-gradient(145deg, #04001a 0%, #080028 50%, #04000f 100%)",
    accent: "#a855f7",
    header: "linear-gradient(to right, rgba(4,0,26,0.95), rgba(10,0,48,0.95))",
    border: "rgba(168,85,247,0.2)",
  },
  {
    key: "underwater",
    label: "Sous-marin",
    emoji: "🌊",
    bg: "linear-gradient(160deg, #001520 0%, #002035 50%, #001018 100%)",
    felt: "linear-gradient(145deg, #001520 0%, #002030 50%, #001018 100%)",
    accent: "#06b6d4",
    header: "linear-gradient(to right, rgba(0,20,30,0.95), rgba(0,30,45,0.95))",
    border: "rgba(6,182,212,0.2)",
  },
];

export default function Casino() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [game, setGame] = useState("sports_live");
  const [balance, setBalance] = useState(1000);
  const [showShop, setShowShop] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [casinoTheme, setCasinoTheme] = useState("matrix");
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const verified = sessionStorage.getItem("casino_age_ok");
    if (verified === "yes") setAgeVerified(true);
    const savedTheme = localStorage.getItem("casino_theme");
    if (savedTheme) setCasinoTheme(savedTheme);
  }, []);

  const onVerified = () => { sessionStorage.setItem("casino_age_ok", "yes"); setAgeVerified(true); };

  const applyTheme = (key) => {
    setCasinoTheme(key);
    localStorage.setItem("casino_theme", key);
    setShowThemePicker(false);
  };

  const theme = CASINO_THEMES.find((t) => t.key === casinoTheme) || CASINO_THEMES[0];

  if (!ageVerified) return <AgeGate onVerified={onVerified} />;

  return (
    <div className="min-h-screen" style={{ background: theme.bg }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b backdrop-blur-xl px-4 py-3 flex items-center gap-3"
        style={{ background: theme.header, borderColor: theme.border }}>
        <Link to="/" className="text-muted-foreground hover:text-foreground transition"><ArrowLeft className="w-5 h-5" /></Link>
        <span className="font-black text-lg tracking-wide">
          <span style={{ color: theme.accent, textShadow: `0 0 20px ${theme.accent}80` }}>M</span>
          <span className="text-white">ATRIX </span>
          <span className="text-sm font-bold" style={{ color: theme.accent }}>{theme.emoji} {theme.label.toUpperCase()}</span>
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShowThemePicker(!showThemePicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition"
            style={{ borderColor: theme.border, color: theme.accent, background: `${theme.accent}10` }}>
            <Palette className="w-3.5 h-3.5" /> Lieu
          </button>
          <button onClick={() => setShowShop(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition"
            style={{ borderColor: `${theme.accent}40`, background: `${theme.accent}10` }}>
            <ShoppingCart className="w-4 h-4" style={{ color: theme.accent }} />
            <span className="text-sm font-mono font-black" style={{ color: theme.accent }}>{balance.toLocaleString()} 🪙</span>
          </button>
        </div>
      </div>

      {/* Theme picker */}
      {showThemePicker && (
        <div className="px-4 py-4 border-b" style={{ borderColor: theme.border, background: theme.header }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: theme.accent }}>Choisir le lieu</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CASINO_THEMES.map((t) => (
              <button key={t.key} onClick={() => applyTheme(t.key)}
                className={cn("shrink-0 flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition w-20 text-xs font-bold text-white",
                  casinoTheme === t.key ? "scale-105" : "opacity-70 hover:opacity-100")}
                style={{ background: t.bg, borderColor: casinoTheme === t.key ? t.accent : "transparent" }}>
                <span className="text-2xl">{t.emoji}</span>
                <span style={{ color: t.accent }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Responsible gaming */}
      <div className="px-4 py-2 text-center text-xs font-semibold border-b" style={{ background: `${theme.accent}08`, color: theme.accent + "cc", borderColor: theme.border }}>
        ⚠️ Jeu fictif — Aucun argent réel — 18+ uniquement
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Game selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {GAMES.map((g) => {
            const Icon = g.icon;
            return (
              <button key={g.key} onClick={() => setGame(g.key)}
                className={cn("relative p-4 rounded-2xl border text-left transition overflow-hidden",
                  game === g.key ? "" : "hover:opacity-90")}
                style={game === g.key
                  ? { borderColor: `${theme.accent}60`, background: `${theme.accent}15` }
                  : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
                {game === g.key && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top left, ${theme.accent}, transparent 60%)` }} />
                )}
                <Icon className="w-5 h-5 mb-2" style={{ color: game === g.key ? theme.accent : "hsl(var(--muted-foreground))" }} />
                <p className="font-bold text-sm" style={{ color: game === g.key ? "white" : "hsl(var(--muted-foreground))" }}>{g.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{g.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Game table */}
        <div className="rounded-3xl overflow-hidden border"
          style={{ background: theme.felt, boxShadow: `0 0 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)`, borderColor: theme.border }}>
          {/* Table felt texture overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none rounded-3xl"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "8px 8px" }} />
          <div className="p-6 sm:p-8 relative">
            {game === "sports_live" && <SportLive accentColor={theme.accent} />}
            {game === "sports" && <SportsBetting balance={balance} setBalance={setBalance} />}
            {game === "roulette" && <RouletteGame balance={balance} setBalance={setBalance} accentColor={theme.accent} />}
            {game === "slots" && <SlotsGame balance={balance} setBalance={setBalance} accentColor={theme.accent} />}
            {game === "bingo" && <BingoGame balance={balance} setBalance={setBalance} accentColor={theme.accent} />}
          </div>
        </div>
      </div>

      {showShop && <CasinoShop balance={balance} setBalance={setBalance} onClose={() => setShowShop(false)} />}
    </div>
  );
}