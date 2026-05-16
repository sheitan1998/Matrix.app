import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "@/components/NotificationBell";
import { ArrowLeft, Dices, CircleDot, Radio, Trophy, ShoppingCart, Wallet, Spade } from "lucide-react";
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
import CasinoShop from "@/pages/casino/CasinoShop";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const GAMES = [
  { key: "slots", label: "Slots", emoji: "🎰", desc: "7 néon chanceux", color: "#ff00ff" },
  { key: "blackjack", label: "Blackjack", emoji: "🃏", desc: "Blackjack pays 3:2", color: "#ffd700" },
  { key: "roulette", label: "Roulette", emoji: "🎡", desc: "Rouge ou noir", color: "#ff2020" },
  { key: "sports_live", label: "Sport Live", emoji: "📡", desc: "En direct 🔴", color: "#44ff00" },
  { key: "sports", label: "Paris", emoji: "⚽", desc: "Misez vos équipes", color: "#00aaff" },
  { key: "bingo", label: "Bingo", emoji: "🎱", desc: "BINGO !", color: "#ffaa00" },
  { key: "leaderboard", label: "Classement", emoji: "🏆", desc: "Top joueurs", color: "#ffd700" },
];

export default function Casino() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [game, setGame] = useState("slots");
  const [showShop, setShowShop] = useState(false);
  const [user, setUser] = useState(null);
  const { balance, setBalance, addTransaction } = useWallet();
  const [lightPhase, setLightPhase] = useState(0);
  const [jackpotDisplay, setJackpotDisplay] = useState(12847635);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const verified = sessionStorage.getItem("casino_age_ok");
    if (verified === "yes") setAgeVerified(true);
  }, []);

  useEffect(() => {
    const t1 = setInterval(() => setLightPhase(p => (p + 1) % 10), 150);
    const t2 = setInterval(() => setJackpotDisplay(j => j + Math.floor(Math.random() * 47 + 3)), 250);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const onVerified = () => { sessionStorage.setItem("casino_age_ok", "yes"); setAgeVerified(true); };
  const activeGame = GAMES.find(g => g.key === game);

  if (!ageVerified) return <AgeGate onVerified={onVerified} />;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #08000f 0%, #100020 40%, #08000f 100%)" }}>

      {/* === ANIMATED NEON HEADER === */}
      <div className="sticky top-0 z-40 backdrop-blur-xl"
        style={{
          background: "linear-gradient(180deg, rgba(20,0,40,0.98) 0%, rgba(10,0,25,0.95) 100%)",
          borderBottom: "2px solid #6600cc40",
          boxShadow: "0 4px 30px rgba(136,0,255,0.15)"
        }}>

        {/* Top animated neon lights */}
        <div className="flex overflow-hidden h-1.5">
          {Array.from({ length: 40 }).map((_, i) => {
            const colors = ["#ff00ff", "#8800ff", "#0088ff", "#ff0088", "#ffcc00"];
            const active = i % 5 === lightPhase % 5;
            return (
              <div key={i} className="flex-1 transition-all duration-150"
                style={{
                  background: active ? colors[i % 5] : "rgba(255,255,255,0.06)",
                  boxShadow: active ? `0 0 6px ${colors[i % 5]}` : "none"
                }} />
            );
          })}
        </div>

        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Casino title */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-black text-xl tracking-widest"
                style={{ color: "#ffd700", textShadow: "0 0 10px #ffaa00, 0 0 20px #ff8800", fontFamily: "'Arial Black', sans-serif" }}>
                MATRIX
              </span>
              <span className="font-black text-xl tracking-widest"
                style={{ color: "#ff00ff", textShadow: "0 0 10px #ff00ff, 0 0 20px #aa00ff", fontFamily: "'Arial Black', sans-serif" }}>
                {" "}CASINO
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-red-400">LIVE</span>
              <span className="text-[10px] text-muted-foreground">• Jeu fictif 18+</span>
            </div>
          </div>

          {/* Rolling jackpot */}
          <div className="hidden sm:flex flex-col items-center px-3 py-1 rounded-xl border"
            style={{ borderColor: "#ffd70030", background: "rgba(255,215,0,0.06)" }}>
            <span className="text-[8px] font-bold text-yellow-600 uppercase tracking-widest">Jackpot</span>
            <span className="font-mono font-black text-sm" style={{ color: "#ffd700", textShadow: "0 0 8px #ffaa00" }}>
              {jackpotDisplay.toLocaleString()}🪙
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {user && <NotificationBell user={user} />}
            <Link to="/wallet"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition"
              style={{ borderColor: "#6600cc40", color: "#aa66ff", background: "rgba(136,0,255,0.1)" }}>
              <Wallet className="w-3.5 h-3.5" />
            </Link>
            <button onClick={() => setShowShop(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition"
              style={{ borderColor: "#ffd70040", background: "rgba(255,215,0,0.08)" }}>
              <ShoppingCart className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-mono font-black" style={{ color: "#ffd700" }}>
                {balance.toLocaleString()}🪙
              </span>
            </button>
          </div>
        </div>

        {/* Bottom animated neon lights */}
        <div className="flex overflow-hidden h-1">
          {Array.from({ length: 40 }).map((_, i) => {
            const colors = ["#00ffcc", "#0088ff", "#ff00ff", "#ffd700"];
            const active = i % 4 === (lightPhase + 2) % 4;
            return (
              <div key={i} className="flex-1 transition-all duration-150"
                style={{
                  background: active ? colors[i % 4] : "rgba(255,255,255,0.04)",
                  boxShadow: active ? `0 0 4px ${colors[i % 4]}` : "none"
                }} />
            );
          })}
        </div>
      </div>

      {/* === GAME SELECTOR (horizontal scroll) === */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {GAMES.map(g => (
            <motion.button key={g.key} onClick={() => setGame(g.key)}
              whileTap={{ scale: 0.93 }}
              className="shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border-2 transition-all"
              style={{
                minWidth: "80px",
                background: game === g.key
                  ? `linear-gradient(135deg, ${g.color}20, ${g.color}08)`
                  : "rgba(255,255,255,0.04)",
                borderColor: game === g.key ? g.color + "80" : "rgba(255,255,255,0.08)",
                boxShadow: game === g.key ? `0 0 20px ${g.color}30, inset 0 0 15px ${g.color}08` : "none",
              }}>
              <span className="text-2xl" style={{ filter: game === g.key ? `drop-shadow(0 0 6px ${g.color})` : "none" }}>
                {g.emoji}
              </span>
              <span className="text-[10px] font-bold"
                style={{ color: game === g.key ? g.color : "#666", textShadow: game === g.key ? `0 0 8px ${g.color}` : "none" }}>
                {g.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* === GAME AREA === */}
      <div className="px-3 pb-24">
        {/* Game title banner */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${activeGame?.color || "#888"}40)` }} />
          <span className="text-sm font-black tracking-widest" style={{ color: activeGame?.color, textShadow: `0 0 10px ${activeGame?.color}` }}>
            {activeGame?.emoji} {activeGame?.label?.toUpperCase()}
          </span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${activeGame?.color || "#888"}40)` }} />
        </div>

        {/* Game container */}
        <AnimatePresence mode="wait">
          <motion.div key={game}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #0f0020 0%, #180030 50%, #0f0020 100%)",
              border: `2px solid ${activeGame?.color || "#333"}30`,
              boxShadow: `0 0 40px rgba(0,0,0,0.8), 0 0 20px ${activeGame?.color || "#000"}10`
            }}>
            <div className="p-4 sm:p-6">
              {game === "slots" && <SlotsGame balance={balance} setBalance={setBalance} accentColor={activeGame.color} />}
              {game === "blackjack" && <BlackjackGame balance={balance} setBalance={setBalance} accentColor={activeGame.color} />}
              {game === "roulette" && <RouletteGame balance={balance} setBalance={setBalance} accentColor={activeGame.color} />}
              {game === "sports_live" && <SportLive accentColor={activeGame.color} />}
              {game === "sports" && <SportsBetting balance={balance} setBalance={setBalance} />}
              {game === "bingo" && <BingoGame balance={balance} setBalance={setBalance} accentColor={activeGame.color} />}
              {game === "leaderboard" && <CasinoLeaderboard accentColor={activeGame.color} currentUserBalance={balance} />}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick game promo cards */}
        {game !== "leaderboard" && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {GAMES.filter(g => g.key !== game && g.key !== "leaderboard" && g.key !== "sports_live").slice(0, 3).map(g => (
              <button key={g.key} onClick={() => setGame(g.key)}
                className="rounded-2xl p-3 text-left transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${g.color}15, rgba(0,0,0,0.4))`,
                  border: `1px solid ${g.color}30`
                }}>
                <span className="text-xl block mb-1" style={{ filter: `drop-shadow(0 0 4px ${g.color})` }}>{g.emoji}</span>
                <p className="text-[10px] font-black" style={{ color: g.color }}>{g.label.toUpperCase()}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{g.desc}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {showShop && <CasinoShop balance={balance} setBalance={setBalance} onClose={() => setShowShop(false)} />}
    </div>
  );
}