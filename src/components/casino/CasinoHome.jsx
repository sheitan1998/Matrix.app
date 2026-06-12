import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Wallet, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const GAME_CARDS = [
  {
    key: "slots",
    title: "DIAMOND SLOTS",
    subtitle: "HIT THE JACKPOT",
    bg: "linear-gradient(160deg, #1a0060 0%, #2d00a0 50%, #0d0040 100%)",
    border: "#6644ff",
    glow: "#4422ff",
    emoji: "💎",
    badge: "JACKPOT",
    badgeColor: "#ffd700",
    hot: true,
  },
  {
    key: "blackjack",
    title: "BLACKJACK",
    subtitle: "PLAY WITH A TWIST",
    bg: "linear-gradient(160deg, #1a0800 0%, #3d1500 50%, #1a0500 100%)",
    border: "#ff8800",
    glow: "#ff6600",
    emoji: "🃏",
    badge: "3:2 PAYS",
    badgeColor: "#ff8800",
    hot: false,
  },
  {
    key: "roulette",
    title: "ROULETTE",
    subtitle: "ROUGE OU NOIR",
    bg: "linear-gradient(160deg, #1a0000 0%, #3d0000 50%, #1a0000 100%)",
    border: "#ff2020",
    glow: "#ff0000",
    emoji: "🎡",
    badge: "LIVE",
    badgeColor: "#ff2020",
    hot: false,
  },
  {
    key: "bingo",
    title: "BINGO",
    subtitle: "BINGO !",
    bg: "linear-gradient(160deg, #1a1000 0%, #3d2800 50%, #1a1000 100%)",
    border: "#ffaa00",
    glow: "#ff8800",
    emoji: "🎱",
    badge: "FUN",
    badgeColor: "#ffaa00",
    hot: false,
  },
  {
    key: "lotto",
    title: "LOTO",
    subtitle: "SAMEDI 21H",
    bg: "linear-gradient(160deg, #1a1800 0%, #3d3800 50%, #1a1800 100%)",
    border: "#ffd700",
    glow: "#ffcc00",
    emoji: "🎰",
    badge: "JACKPOT",
    badgeColor: "#ffd700",
    hot: true,
  },
  {
    key: "leaderboard",
    title: "TOP LEAGUE",
    subtitle: "CLASSEMENT MONDIAL",
    bg: "linear-gradient(160deg, #1a0030 0%, #3d0070 50%, #1a0030 100%)",
    border: "#cc44ff",
    glow: "#aa00ff",
    emoji: "🏆",
    badge: "TOP",
    badgeColor: "#ffd700",
    hot: false,
  },
];

// Floating coins component
function FloatingCoins() {
  const coins = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2.5 + Math.random() * 2,
    size: 16 + Math.floor(Math.random() * 16),
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {coins.map(c => (
        <motion.div key={c.id}
          className="absolute text-yellow-400 select-none"
          style={{ left: `${c.x}%`, bottom: "-20px", fontSize: `${c.size}px` }}
          animate={{ y: [0, -400 - Math.random() * 200], opacity: [0, 1, 1, 0], rotate: [0, 360] }}
          transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: "easeOut" }}>
          🪙
        </motion.div>
      ))}
    </div>
  );
}

export default function CasinoHome({ onSelectGame, balance, onShop, onProfile }) {
  const [jackpot, setJackpot] = useState(1_250_203_560);
  const [lightPhase, setLightPhase] = useState(0);
  const [hoveredGame, setHoveredGame] = useState(null);

  useEffect(() => {
    const t1 = setInterval(() => setJackpot(j => j + Math.floor(Math.random() * 137 + 13)), 150);
    const t2 = setInterval(() => setLightPhase(p => (p + 1) % 12), 100);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden select-none"
      style={{ background: "linear-gradient(160deg, #0a0030 0%, #160050 40%, #0a0020 100%)" }}>

      {/* Background sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`, height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              background: ["#ffd700", "#ff00ff", "#00aaff", "#ffffff"][i % 4]
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 1.5 + Math.random() * 2, delay: Math.random() * 3, repeat: Infinity }} />
        ))}
      </div>

      <FloatingCoins />

      {/* === TOP NAV === */}
      <div className="relative z-20 px-4 pt-4 pb-2 flex items-center justify-between">
        <Link to="/" className="text-white/60 hover:text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/wallet" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.3)" }}>
            <span className="text-xs font-mono font-black" style={{ color: "#ffd700" }}>{balance.toLocaleString()} 🪙</span>
          </Link>
          <button onClick={onShop}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <ShoppingCart className="w-4 h-4 text-white" />
          </button>
          <button onClick={onProfile}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
            style={{ background: "rgba(136,68,255,0.15)", border: "1px solid rgba(136,68,255,0.4)" }}>
            👤
          </button>
        </div>
      </div>

      {/* === HERO LOGO === */}
      <div className="relative z-10 px-4 pt-2 pb-4 text-center">
        {/* Animated glow orb behind logo */}
        <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-48 h-24 rounded-full"
            style={{ background: "radial-gradient(ellipse, #8844ff60, transparent 70%)", filter: "blur(20px)" }} />
        </div>

        {/* Logo oval style Huuuge */}
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative inline-block mb-2">
          <div className="relative px-8 py-4 rounded-full"
            style={{
              background: "linear-gradient(160deg, #2200aa, #4400cc, #1100aa)",
              border: "3px solid #8866ff",
              boxShadow: "0 0 30px #6644ff80, 0 0 60px #4422ff40, inset 0 2px 0 rgba(255,255,255,0.2)"
            }}>
            {/* Shine */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-1/2"
                style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)" }} />
            </div>
            {/* Diamond emojis */}
            <div className="flex items-center justify-center gap-1 mb-0.5">
              {["💎","💎","💎"].map((d, i) => (
                <motion.span key={i} className="text-xl"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}>
                  {d}
                </motion.span>
              ))}
            </div>
            <p className="font-black tracking-widest leading-none" style={{
              fontSize: "28px", color: "#ffffff",
              textShadow: "0 0 10px #aaffff, 0 0 20px #88ddff",
              fontFamily: "'Arial Black', sans-serif",
              WebkitTextStroke: "1px #66aaff"
            }}>MATRIX</p>
            <p className="font-black tracking-widest leading-none" style={{
              fontSize: "20px", color: "#88ddff",
              textShadow: "0 0 8px #66bbff",
              fontFamily: "'Arial Black', sans-serif",
            }}>CASINO</p>
          </div>
        </motion.div>

        {/* Jackpot display */}
        <div className="inline-flex flex-col items-center px-4 py-1.5 rounded-xl"
          style={{ background: "linear-gradient(135deg, #3a2800, #5a4000)", border: "2px solid #ffd70060", boxShadow: "0 0 20px #ffd70030" }}>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#ffd700" }}>✨ JACKPOT</p>
          <p className="font-mono font-black text-xl" style={{ color: "#ffffff", textShadow: "0 0 10px #ffd700" }}>
            {jackpot.toLocaleString()}
          </p>
        </div>
      </div>

      {/* === ANIMATED NEON STRIP === */}
      <div className="flex h-1.5 overflow-hidden mx-4 rounded-full mb-4">
        {Array.from({ length: 30 }).map((_, i) => {
          const colors = ["#ff00ff", "#8844ff", "#0088ff", "#ff0088", "#ffd700", "#00ffcc"];
          const active = i % 6 === lightPhase % 6;
          return (
            <div key={i} className="flex-1 transition-all duration-100"
              style={{ background: active ? colors[i % 6] : "rgba(255,255,255,0.06)", boxShadow: active ? `0 0 4px ${colors[i % 6]}` : "none" }} />
          );
        })}
      </div>

      {/* === GAME CARDS GRID === */}
      <div className="px-3 pb-24 space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-center mb-3"
          style={{ color: "#aa88ff", textShadow: "0 0 8px #8844ff" }}>
          ✦ CHOISISSEZ VOTRE JEU ✦
        </p>

        {/* Featured - Slots big card */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelectGame("slots")}
          onMouseEnter={() => setHoveredGame("slots")}
          onMouseLeave={() => setHoveredGame(null)}
          className="w-full relative overflow-hidden rounded-3xl text-left"
          style={{
            background: GAME_CARDS[0].bg,
            border: `2px solid ${GAME_CARDS[0].border}80`,
            boxShadow: hoveredGame === "slots" ? `0 0 30px ${GAME_CARDS[0].glow}60` : `0 0 15px ${GAME_CARDS[0].glow}30`,
            minHeight: "120px"
          }}>
          {/* Shine effect */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
          {/* Floating diamonds */}
          {["💎","💎","💎"].map((d, i) => (
            <motion.span key={i} className="absolute text-2xl pointer-events-none"
              style={{ right: `${8 + i * 14}%`, top: `${10 + i * 20}%`, opacity: 0.6 }}
              animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }}
              transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}>
              {d}
            </motion.span>
          ))}
          <div className="relative z-10 p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0"
              style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${GAME_CARDS[0].border}60` }}>
              💎
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ background: "#ffd70030", color: "#ffd700", border: "1px solid #ffd70050" }}>
                  🔥 HOT
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ background: "#ff000020", color: "#ff6666", border: "1px solid #ff333340" }}>
                  JACKPOT
                </span>
              </div>
              <p className="font-black text-xl text-white leading-none" style={{ fontFamily: "'Arial Black', sans-serif" }}>
                DIAMOND SLOTS
              </p>
              <p className="text-sm mt-0.5" style={{ color: GAME_CARDS[0].border }}>Hit the Ultimate Jackpot</p>
            </div>
          </div>
          <div className="px-4 pb-3">
            <div className="w-full py-2 rounded-2xl text-center font-black text-sm"
              style={{ background: "linear-gradient(135deg, #6644ff, #4422cc)", color: "white", boxShadow: "0 0 15px #6644ff80" }}>
              JOUER MAINTENANT →
            </div>
          </div>
        </motion.button>

        {/* 2-col grid for other games */}
        <div className="grid grid-cols-2 gap-3">
          {GAME_CARDS.slice(1).map((g) => (
            <motion.button key={g.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectGame(g.key)}
              onMouseEnter={() => setHoveredGame(g.key)}
              onMouseLeave={() => setHoveredGame(null)}
              className="relative overflow-hidden rounded-2xl text-left"
              style={{
                background: g.bg,
                border: `2px solid ${g.border}60`,
                boxShadow: hoveredGame === g.key ? `0 0 20px ${g.glow}50` : `0 0 8px ${g.glow}20`,
                minHeight: "110px"
              }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)" }} />
              <div className="relative z-10 p-3">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl" style={{ filter: `drop-shadow(0 0 6px ${g.glow})` }}>{g.emoji}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: `${g.badgeColor}20`, color: g.badgeColor, border: `1px solid ${g.badgeColor}40` }}>
                    {g.badge}
                  </span>
                </div>
                <p className="font-black text-sm text-white leading-none" style={{ fontFamily: "'Arial Black', sans-serif" }}>
                  {g.title}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: g.border }}>{g.subtitle}</p>
              </div>
              <div className="px-3 pb-3">
                <div className="w-full py-1.5 rounded-xl text-center font-black text-xs"
                  style={{ background: `${g.border}20`, color: g.border, border: `1px solid ${g.border}40` }}>
                  JOUER →
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Bottom coins row */}
        <div className="flex justify-center gap-2 pt-2 opacity-60">
          {["🪙","🪙","🪙","🪙","🪙"].map((c, i) => (
            <motion.span key={i} className="text-2xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}>
              {c}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}