import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Info, Star, Lock,
  MoreVertical, Coins, Globe } from
"lucide-react";

const GAME_CARDS = [
{
  id: "slots",
  title: "Slots",
  img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/cc993559c_generated_image.png",
  bg: "linear-gradient(160deg, #6b1d5a 0%, #c71585 50%, #8b0a6b 100%)",
  glow: "#ff1493",
  width: "320px",
  badge: "JACKPOT 777",
  badgeColor: "#FFD700"
},
{
  id: "blackjack",
  title: "Incredibulls",
  img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/6c7ee7ecd_generated_image.png",
  bg: "linear-gradient(160deg, #8b1a0e 0%, #ff4500 50%, #b22222 100%)",
  glow: "#ff6347",
  width: "200px",
  badge: "MIN 25 000",
  badgeColor: "#FFD700"
},
{
  id: "baccarat",
  title: "Diamonds & Pearls",
  img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/8ebb214ad_generated_image.png",
  bg: "linear-gradient(160deg, #1a0a4a 0%, #4169e1 50%, #2a1a6b 100%)",
  glow: "#4169e1",
  width: "200px",
  badge: "MIN 25 000",
  badgeColor: "#FFD700"
},
{
  id: "roulette",
  title: "Festival Blast",
  img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/715954293_generated_image.png",
  bg: "linear-gradient(160deg, #4b0082 0%, #8a2be2 50%, #c71585 100%)",
  glow: "#9370db",
  width: "380px",
  badge: "RÉCOMPENSE FINALE",
  badgeColor: "#FFD700",
  isEvent: true,
  reward: "340B",
  subRewards: ["3", "1", "35"]
},
{
  id: "poker",
  title: "Music Journey",
  img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/76f30181d_generated_image.png",
  bg: "linear-gradient(160deg, #2a0a4a 0%, #6b2c91 50%, #1a0a3a 100%)",
  glow: "#a855f7",
  width: "240px",
  badge: null,
  isPortrait: true,
  starLocked: 7
},
{
  id: "bingo",
  title: "Other Games",
  img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/6447f5d98_generated_image.png",
  bg: "linear-gradient(160deg, #c71585 0%, #ff1493 50%, #8b0a6b 100%)",
  glow: "#ff69b4",
  width: "320px",
  badge: null
}];


const VERTICAL_TABS = [
{ label: "JOUEURS MATRIX CASINO", color: "#FFD700" },
{ label: "PARTIE RAPIDE", color: "#FF1493" },
{ label: "ÉVÉNEMENTS", color: "#9370db" }];


function FloatingNotes() {
  const notes = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 6 + Math.random() * 6,
    size: 16 + Math.floor(Math.random() * 14),
    emoji: ["🎵", "🎶", " ♪", " ♫"][i % 4]
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {notes.map((n) =>
      <motion.span key={n.id} className="absolute select-none"
      style={{ left: `${n.x}%`, bottom: "-30px", fontSize: `${n.size}px`, opacity: 0.15 }}
      animate={{ y: [0, -600], opacity: [0, 0.2, 0], rotate: [0, 30, -20, 0] }}
      transition={{ duration: n.duration, delay: n.delay, repeat: Infinity, ease: "easeOut" }}>
          {n.emoji}
        </motion.span>
      )}
    </div>);

}

function FloatingChips() {
  const chips = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 5 + Math.random() * 4,
    size: 20 + Math.floor(Math.random() * 16),
    emoji: ["🪙", "🎰", "💎", "🎰"][i % 4]
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {chips.map((c) =>
      <motion.span key={c.id} className="absolute select-none"
      style={{ left: `${c.x}%`, bottom: "-30px", fontSize: `${c.size}px`, opacity: 0.1 }}
      animate={{ y: [0, -500], rotate: [0, 360], opacity: [0, 0.15, 0] }}
      transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: "easeOut" }}>
          {c.emoji}
        </motion.span>
      )}
    </div>);

}

function CountdownTimer() {
  const [time, setTime] = useState({ h: 17, m: 11 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m } = prev;
        m -= 1;
        if (m < 0) {m = 59;h -= 1;}
        if (h < 0) {h = 23;m = 59;}
        return { h, m };
      });
    }, 60000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono font-black text-white">
      {String(time.h).padStart(2, "0")}h {String(time.m).padStart(2, "0")}m
    </span>);

}

export default function CasinoLobby({ balance, jackpot, onPlayGame, onShop, onProfile, onVipClub }) {
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 5;

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative overflow-hidden select-none"
    style={{ background: "linear-gradient(160deg, #2a0a3a 0%, #4b0082 30%, #8a2be2 60%, #c71585 100%)" }}>

      {/* Animated background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(199,21,133,0.3), transparent 50%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 80%, rgba(139,43,226,0.25), transparent 50%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(75,0,130,0.2), transparent 70%)" }} />
      </div>

      <FloatingNotes />
      <FloatingChips />

      {/* === TOP HEADER BAR === */}
      <div className="relative z-30 flex items-center justify-between px-3 py-2.5"
      style={{ background: "rgba(30,0,50,0.6)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {/* Left: avatar + coins + stars */}
        























        

        {/* Right: progress + safe + menu */}
        <div className="flex items-center gap-2 shrink-0">
          








          
          <button onClick={onVipClub} className="relative w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}>
            <Lock className="w-4 h-4" style={{ color: "#FFD700" }} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
            style={{ background: "#FFD700", color: "#000" }}>11</span>
          </button>
          


          
        </div>
      </div>

      {/* === MAIN CONTENT: tabs + horizontal cards === */}
      <div className="relative z-10 flex h-[calc(100vh-120px)]">
        {/* Vertical tabs */}
        <div className="hidden md:flex flex-col justify-center gap-3 px-2 py-4 shrink-0">
          {VERTICAL_TABS.map((tab, i) => null















          )}
        </div>

        {/* Horizontal scrollable cards */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto scrollbar-thin overflow-y-hidden">
          <div className="flex gap-4 px-4 py-6 h-full items-center" style={{ width: "max-content" }}>
            {GAME_CARDS.map((card, i) =>
            <motion.button key={card.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPlayGame(card.id)}
            className="relative overflow-hidden rounded-3xl text-left shrink-0 group"
            style={{
              width: card.width,
              height: card.isPortrait ? "380px" : "280px",
              background: card.bg,
              border: `2px solid ${card.glow}40`,
              boxShadow: `0 0 25px ${card.glow}30, 0 8px 30px rgba(0,0,0,0.4)`
            }}>
                {/* Card image */}
                <div className="absolute inset-0">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover"
                style={{ opacity: 0.7 }} />
                </div>
                {/* Shine overlay */}
                <div className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)" }} />

                {/* Top label */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="text-xs font-black text-white tracking-wide" style={{ textShadow: "0 0 8px rgba(0,0,0,0.8)" }}>
                    {card.title}
                  </span>
                </div>

                {/* Badge */}
                {card.badge &&
              <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full"
              style={{ background: `${card.badgeColor}30`, border: `1px solid ${card.badgeColor}60` }}>
                    <span className="text-[9px] font-black" style={{ color: card.badgeColor }}>{card.badge}</span>
                  </div>
              }

                {/* Event specific content */}
                {card.isEvent &&
              <div className="absolute bottom-3 left-3 right-3 z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,215,0,0.2)", border: "1px solid rgba(255,215,0,0.4)" }}>
                        <Coins className="w-4 h-4" style={{ color: "#FFD700" }} />
                      </div>
                      <span className="text-sm font-black text-white font-mono" style={{ textShadow: "0 0 8px rgba(255,215,0,0.5)" }}>
                        {card.reward}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {card.subRewards.map((r, ri) =>
                  <span key={ri} className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                          {r}
                        </span>
                  )}
                    </div>
                  </div>
              }

                {/* Star locked badge */}
                {card.starLocked &&
              <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.3)" }}>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3" style={{ color: "#FFD700", fill: "#FFD700" }} />
                      <span className="text-[9px] font-black text-white">{card.starLocked}</span>
                    </div>
                  </div>
              }

                {/* Hover play overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "rgba(0,0,0,0.4)" }}>
                  <div className="px-6 py-2.5 rounded-xl text-sm font-black text-white"
                style={{ background: `linear-gradient(135deg, ${card.glow}, ${card.glow}cc)`, boxShadow: `0 0 20px ${card.glow}80` }}>
                    ▶ JOUER
                  </div>
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* === FOOTER NAV === */}
      <div className="relative z-30 flex items-center justify-between px-4 py-3"
      style={{ background: "rgba(30,0,50,0.6)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {/* Left: globe + players online */}
        <div className="flex items-center gap-1.5">
          
          
        </div>

        {/* Center: pagination dots + arrows */}
        <div className="flex items-center gap-3">
          <button onClick={() => scroll(-1)} className="w-8 h-8 rounded-full flex items-center justify-center transition hover:opacity-80"
          style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <ChevronLeft className="w-4 h-4 text-green-400" />
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) =>
            <button key={i} onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({ left: i * 360 * 2, behavior: "smooth" });
                setCurrentPage(i);
              }
            }}
            className="rounded-full transition-all duration-300"
            style={{
              width: currentPage === i ? "24px" : "8px",
              height: "8px",
              background: currentPage === i ? "#22c55e" : "rgba(255,255,255,0.2)"
            }} />
            )}
          </div>
          <button onClick={() => scroll(1)} className="w-8 h-8 rounded-full flex items-center justify-center transition hover:opacity-80"
          style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <ChevronRight className="w-4 h-4 text-green-400" />
          </button>
        </div>

        {/* Right: back to home */}
        <Link to="/" className="flex items-center gap-1 text-xs font-bold text-white/50 hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Accueil</span>
        </Link>
      </div>
    </div>);

}