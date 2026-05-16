import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Flame, TrendingUp, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_PLAYERS = [
  { rank: 1, name: "NeonKing_XL", avatar: "👑", score: 9842350, game: "Slots", streak: 12, badge: "🏆" },
  { rank: 2, name: "VegasDiablo", avatar: "😈", score: 7634200, game: "Blackjack", streak: 8, badge: "🥈" },
  { rank: 3, name: "QueenOfLuck", avatar: "🌟", score: 5921800, game: "Roulette", streak: 6, badge: "🥉" },
  { rank: 4, name: "MrJackpot77", avatar: "🎰", score: 4103500, game: "Slots", streak: 4, badge: null },
  { rank: 5, name: "BlackAce_Pro", avatar: "🃏", score: 3287100, game: "Blackjack", streak: 3, badge: null },
  { rank: 6, name: "RouletteGod", avatar: "🔴", score: 2845600, game: "Roulette", streak: 5, badge: null },
  { rank: 7, name: "LuckyCharm88", avatar: "🍀", score: 2341200, game: "Slots", streak: 2, badge: null },
  { rank: 8, name: "CryptoGambler", avatar: "💎", score: 1987400, game: "Blackjack", streak: 1, badge: null },
  { rank: 9, name: "NightOwl_X", avatar: "🦉", score: 1432100, game: "Bingo", streak: 3, badge: null },
  { rank: 10, name: "LasVegas_MVP", avatar: "🎲", score: 987600, game: "Sports", streak: 2, badge: null },
];

const GAME_COLORS = {
  Slots: "#ff00ff",
  Blackjack: "#ffd700",
  Roulette: "#ff2020",
  Bingo: "#00ffcc",
  Sports: "#44ff00",
};

const TABS = ["Tout temps", "Cette semaine", "Aujourd'hui"];

export default function CasinoLeaderboard({ accentColor = "#ff00ff", currentUserBalance = 0 }) {
  const [tab, setTab] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [players, setPlayers] = useState(MOCK_PLAYERS);

  const switchTab = (i) => {
    setAnimating(true);
    setTimeout(() => {
      setTab(i);
      // Shuffle scores slightly for different periods
      const shuffled = [...MOCK_PLAYERS].map(p => ({
        ...p,
        score: Math.round(p.score * (0.3 + Math.random() * 0.7))
      })).sort((a, b) => b.score - a.score).map((p, idx) => ({ ...p, rank: idx + 1 }));
      setPlayers(shuffled);
      setAnimating(false);
    }, 200);
  };

  // Estimate user position
  const userRank = players.findIndex(p => currentUserBalance > p.score / 100) + 1 || players.length + 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-1">
          <Trophy className="w-6 h-6" style={{ color: "#ffd700", filter: "drop-shadow(0 0 8px #ffd700)" }} />
          <h2 className="text-2xl font-black tracking-wider"
            style={{ color: "#ffd700", textShadow: "0 0 15px #ffaa00", fontFamily: "'Arial Black', sans-serif" }}>
            CLASSEMENT
          </h2>
          <Trophy className="w-6 h-6" style={{ color: "#ffd700", filter: "drop-shadow(0 0 8px #ffd700)" }} />
        </div>
        <p className="text-xs text-fuchsia-400 font-semibold">Meilleurs joueurs MATRIX Casino</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)" }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => switchTab(i)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: tab === i ? "linear-gradient(135deg, #8800ff, #4400aa)" : "transparent",
              color: tab === i ? "white" : "#666",
              boxShadow: tab === i ? "0 0 10px #8800ff60" : "none"
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="flex items-end justify-center gap-3 py-4">
        {/* 2nd */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-1">
          <div className="text-2xl">{players[1]?.avatar}</div>
          <div className="w-16 rounded-t-2xl flex flex-col items-center pt-2 pb-1"
            style={{ height: "80px", background: "linear-gradient(180deg, #888888, #555555)", boxShadow: "0 0 15px #88888840" }}>
            <span className="text-xl">🥈</span>
            <span className="text-[10px] font-bold text-white mt-1">2</span>
          </div>
          <p className="text-[10px] font-bold text-white text-center max-w-[60px] truncate">{players[1]?.name}</p>
          <p className="text-[9px] font-black" style={{ color: "#aaaaaa" }}>{(players[1]?.score / 1000).toFixed(0)}K</p>
        </motion.div>

        {/* 1st */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0 }}
          className="flex flex-col items-center gap-1">
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Crown className="w-8 h-8 mx-auto" style={{ color: "#ffd700", filter: "drop-shadow(0 0 10px #ffd700)" }} />
          </motion.div>
          <div className="text-3xl">{players[0]?.avatar}</div>
          <div className="w-20 rounded-t-2xl flex flex-col items-center pt-2 pb-1 relative overflow-hidden"
            style={{ height: "100px", background: "linear-gradient(180deg, #ffd700, #aa8800)", boxShadow: "0 0 25px #ffd70060" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)" }} />
            <span className="text-2xl">🏆</span>
            <span className="text-xs font-black text-black mt-1">1</span>
          </div>
          <p className="text-[10px] font-bold text-white text-center max-w-[70px] truncate">{players[0]?.name}</p>
          <p className="text-[9px] font-black" style={{ color: "#ffd700" }}>{(players[0]?.score / 1000).toFixed(0)}K</p>
        </motion.div>

        {/* 3rd */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-1">
          <div className="text-2xl">{players[2]?.avatar}</div>
          <div className="w-16 rounded-t-2xl flex flex-col items-center pt-2 pb-1"
            style={{ height: "60px", background: "linear-gradient(180deg, #cd7f32, #8b4513)", boxShadow: "0 0 15px #cd7f3240" }}>
            <span className="text-lg">🥉</span>
            <span className="text-[10px] font-bold text-white mt-0.5">3</span>
          </div>
          <p className="text-[10px] font-bold text-white text-center max-w-[60px] truncate">{players[2]?.name}</p>
          <p className="text-[9px] font-black" style={{ color: "#cd7f32" }}>{(players[2]?.score / 1000).toFixed(0)}K</p>
        </motion.div>
      </div>

      {/* Full leaderboard list */}
      <div className="space-y-1.5">
        {players.map((player, idx) => {
          const gameColor = GAME_COLORS[player.game] || "#888";
          const isTop3 = idx < 3;
          return (
            <motion.div key={player.name}
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.04 }}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all", animating && "opacity-0")}
              style={{
                background: isTop3
                  ? `linear-gradient(135deg, ${gameColor}15, rgba(255,255,255,0.03))`
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${isTop3 ? gameColor + "30" : "rgba(255,255,255,0.06)"}`,
                boxShadow: isTop3 ? `0 0 10px ${gameColor}10` : "none"
              }}>
              {/* Rank */}
              <div className="w-7 text-center">
                {idx === 0 ? <span className="text-lg">🏆</span>
                  : idx === 1 ? <span className="text-lg">🥈</span>
                  : idx === 2 ? <span className="text-lg">🥉</span>
                  : <span className="text-xs font-black text-muted-foreground">#{player.rank}</span>}
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
                style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${gameColor}40` }}>
                {player.avatar}
              </div>

              {/* Name + game */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">{player.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: gameColor + "20", color: gameColor }}>
                    {player.game}
                  </span>
                  {player.streak > 3 && (
                    <span className="text-[9px] font-bold flex items-center gap-0.5 text-orange-400">
                      <Flame className="w-2.5 h-2.5" />{player.streak}🔥
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="font-mono font-black text-sm"
                  style={{ color: isTop3 ? gameColor : "#888", textShadow: isTop3 ? `0 0 8px ${gameColor}` : "none" }}>
                  {player.score.toLocaleString()}
                </p>
                <p className="text-[9px] text-muted-foreground">🪙</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* User position */}
      <div className="rounded-2xl px-4 py-3 mt-4"
        style={{ background: "linear-gradient(135deg, #1a0035, #2a005a)", border: "1px solid #8800ff40" }}>
        <div className="flex items-center gap-3">
          <Medal className="w-5 h-5 text-fuchsia-400" />
          <div className="flex-1">
            <p className="text-xs text-fuchsia-400 font-semibold">Votre position estimée</p>
            <p className="font-black text-white">#{userRank > 10 ? "10+" : userRank} — {currentUserBalance.toLocaleString()} 🪙</p>
          </div>
          <TrendingUp className="w-4 h-4 text-fuchsia-400" />
        </div>
      </div>
    </div>
  );
}