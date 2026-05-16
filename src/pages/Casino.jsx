import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "@/components/NotificationBell";
import { ArrowLeft, ShoppingCart, Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { base44 } from "@/api/base44Client";
import AgeGate from "@/components/casino/AgeGate";
import RouletteGame from "@/components/casino/RouletteGame";
import SlotsGame from "@/components/casino/SlotsGame";
import BingoGame from "@/components/casino/BingoGame";
import SportsBetting from "@/components/casino/SportsBetting";
import SportLive from "@/components/casino/SportLive";
import BlackjackGame from "@/components/casino/BlackjackGame";
import CasinoLeaderboard from "@/components/casino/CasinoLeaderboard";
import CasinoHome from "@/components/casino/CasinoHome";
import CasinoShop from "@/pages/casino/CasinoShop";
import { motion, AnimatePresence } from "framer-motion";

const GAME_META = {
  slots:       { label: "DIAMOND SLOTS",     color: "#8866ff", emoji: "💎" },
  blackjack:   { label: "BLACKJACK",          color: "#ffd700", emoji: "🃏" },
  roulette:    { label: "ROULETTE",           color: "#ff2020", emoji: "🎡" },
  sports_live: { label: "SPORT EN DIRECT",    color: "#44ff00", emoji: "📡" },
  sports:      { label: "PARIS SPORTIFS",     color: "#00aaff", emoji: "⚽" },
  bingo:       { label: "BINGO",              color: "#ffaa00", emoji: "🎱" },
  leaderboard: { label: "TOP LEAGUE",         color: "#ffd700", emoji: "🏆" },
};

export default function Casino() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [screen, setScreen] = useState("home"); // "home" | game key
  const [showShop, setShowShop] = useState(false);
  const [user, setUser] = useState(null);
  const { balance, setBalance } = useWallet();
  const [lightPhase, setLightPhase] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const verified = sessionStorage.getItem("casino_age_ok");
    if (verified === "yes") setAgeVerified(true);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLightPhase(p => (p + 1) % 12), 120);
    return () => clearInterval(t);
  }, []);

  const onVerified = () => { sessionStorage.setItem("casino_age_ok", "yes"); setAgeVerified(true); };
  if (!ageVerified) return <AgeGate onVerified={onVerified} />;

  // Home screen — delegated to CasinoHome
  if (screen === "home") {
    return (
      <CasinoHome
        balance={balance}
        onSelectGame={(key) => setScreen(key)}
        onShop={() => setShowShop(true)}
      />
    );
  }

  const meta = GAME_META[screen] || GAME_META.slots;

  return (
    <div className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #080015 0%, #0f0028 50%, #080015 100%)" }}>

      {/* === HEADER === */}
      <div className="sticky top-0 z-40 backdrop-blur-xl"
        style={{
          background: "linear-gradient(180deg, rgba(15,0,35,0.98), rgba(8,0,20,0.95))",
          borderBottom: "2px solid rgba(136,68,255,0.25)",
          boxShadow: "0 4px 30px rgba(100,40,255,0.12)"
        }}>
        {/* Top neon strip */}
        <div className="h-1.5 flex overflow-hidden">
          {Array.from({ length: 36 }).map((_, i) => {
            const colors = ["#ff00ff", "#8844ff", "#0088ff", "#ff0088", "#ffcc00", "#00ffcc"];
            const active = i % 6 === lightPhase % 6;
            return (
              <div key={i} className="flex-1 transition-all duration-100"
                style={{ background: active ? colors[i % 6] : "rgba(255,255,255,0.05)", boxShadow: active ? `0 0 5px ${colors[i % 6]}` : "none" }} />
            );
          })}
        </div>

        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-white/60 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Game title */}
          <div className="flex items-center gap-2">
            <span className="text-xl" style={{ filter: `drop-shadow(0 0 6px ${meta.color})` }}>{meta.emoji}</span>
            <span className="font-black text-base tracking-wider"
              style={{ color: meta.color, textShadow: `0 0 10px ${meta.color}80`, fontFamily: "'Arial Black', sans-serif" }}>
              {meta.label}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {user && <NotificationBell user={user} />}
            <Link to="/wallet"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold"
              style={{ borderColor: "rgba(136,68,255,0.3)", color: "#aa88ff", background: "rgba(100,40,255,0.1)" }}>
              <Wallet className="w-3.5 h-3.5" />
            </Link>
            <button onClick={() => setShowShop(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
              style={{ borderColor: "rgba(255,215,0,0.3)", background: "rgba(255,215,0,0.07)" }}>
              <ShoppingCart className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-mono font-black" style={{ color: "#ffd700" }}>
                {balance.toLocaleString()}🪙
              </span>
            </button>
          </div>
        </div>

        {/* Bottom neon strip */}
        <div className="h-0.5 flex overflow-hidden">
          {Array.from({ length: 36 }).map((_, i) => {
            const colors = ["#00ffcc", "#0088ff", "#ff0088", "#aa44ff"];
            const active = i % 4 === (lightPhase + 2) % 4;
            return (
              <div key={i} className="flex-1 transition-all duration-100"
                style={{ background: active ? colors[i % 4] : "transparent" }} />
            );
          })}
        </div>
      </div>

      {/* Responsible gaming */}
      <div className="px-4 py-1.5 text-center text-[10px] font-semibold"
        style={{ background: "rgba(255,215,0,0.05)", color: "rgba(255,200,0,0.5)", borderBottom: "1px solid rgba(255,215,0,0.1)" }}>
        ⚠️ Jeu fictif — Aucun argent réel — 18+ uniquement
      </div>

      {/* === GAME AREA === */}
      <div className="px-3 pb-28 pt-4">
        <AnimatePresence mode="wait">
          <motion.div key={screen}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #0e001e 0%, #180035 60%, #0e001e 100%)",
              border: `2px solid ${meta.color}25`,
              boxShadow: `0 0 50px rgba(0,0,0,0.8), 0 0 25px ${meta.color}08`
            }}>
            <div className="p-4 sm:p-6">
              {screen === "slots"       && <SlotsGame balance={balance} setBalance={setBalance} accentColor={meta.color} />}
              {screen === "blackjack"   && <BlackjackGame balance={balance} setBalance={setBalance} accentColor={meta.color} />}
              {screen === "roulette"    && <RouletteGame balance={balance} setBalance={setBalance} accentColor={meta.color} />}
              {screen === "sports_live" && <SportLive accentColor={meta.color} />}
              {screen === "sports"      && <SportsBetting balance={balance} setBalance={setBalance} />}
              {screen === "bingo"       && <BingoGame balance={balance} setBalance={setBalance} accentColor={meta.color} />}
              {screen === "leaderboard" && <CasinoLeaderboard accentColor={meta.color} currentUserBalance={balance} />}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick nav back */}
        <button onClick={() => setScreen("home")}
          className="mt-4 w-full py-3 rounded-2xl font-bold text-sm text-center transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#666" }}>
          ← Retour à l'accueil Casino
        </button>
      </div>

      {showShop && <CasinoShop balance={balance} setBalance={setBalance} onClose={() => setShowShop(false)} />}
    </div>
  );
}