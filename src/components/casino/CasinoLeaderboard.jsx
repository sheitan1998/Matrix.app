import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Flame, Trophy } from "lucide-react";

const PLAYERS = [
  { rank: 1,  name: "Gabriel",    avatar: "👨‍💼", earnings: "82.49T", chips: "x4,000", game: "Blackjack", color: "#ffd700" },
  { rank: 2,  name: "Damien",     avatar: "😎",    earnings: "67.72T", chips: "x3,000", game: "Slots",     color: "#cccccc" },
  { rank: 3,  name: "Tobias",     avatar: "🧔",    earnings: "65.73T", chips: "x2,400", game: "Roulette",  color: "#cd7f32" },
  { rank: 4,  name: "Adrian",     avatar: "👩‍🦱", earnings: "65.65T", chips: "x2,000", game: "Slots",     color: "#9988ff" },
  { rank: 5,  name: "Spencer",    avatar: "🧑‍🎤", earnings: "60.4T",  chips: "x2,000", game: "Blackjack", color: "#9988ff" },
  { rank: 6,  name: "Felix",      avatar: "😄",    earnings: "59.09T", chips: "x2,000", game: "Roulette",  color: "#9988ff" },
  { rank: 7,  name: "Ashton",     avatar: "👦",    earnings: "57.59T", chips: "x2,000", game: "Slots",     color: "#9988ff" },
  { rank: 8,  name: "Julian",     avatar: "🧑‍🦱", earnings: "55.78T", chips: "x2,000", game: "Bingo",     color: "#9988ff" },
  { rank: 9,  name: "Tristan",    avatar: "👱",    earnings: "46.98T", chips: "x2,000", game: "Sports",    color: "#9988ff" },
  { rank: 10, name: "NightHawk",  avatar: "🦅",    earnings: "41.2T",  chips: "x2,000", game: "Blackjack", color: "#9988ff" },
];

const TABS = ["All-Time", "Weekly", "Today"];
const ROW_BG = ["#b8860b", "#808080", "#8b4513", "#4a3880", "#3a2870", "#2a1860", "#3a2870", "#2a1860", "#3a2870", "#2a1860"];

export default function CasinoLeaderboard({ accentColor, currentUserBalance = 0 }) {
  const [tab, setTab] = useState(0);
  const [players, setPlayers] = useState(PLAYERS);
  const [levelAnim, setLevelAnim] = useState(false);

  useEffect(() => {
    setLevelAnim(true);
    const t = setTimeout(() => {
      const reordered = [...PLAYERS]
        .map(p => ({ ...p, sortScore: Math.random() }))
        .sort((a, b) => b.sortScore - a.sortScore)
        .map((p, i) => ({ ...p, rank: i + 1, color: i < 3 ? PLAYERS[i].color : "#9988ff" }));
      setPlayers(tab === 0 ? PLAYERS : reordered);
      setLevelAnim(false);
    }, 300);
    return () => clearTimeout(t);
  }, [tab]);

  return (
    <div className="select-none">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-4"
        style={{
          background: "linear-gradient(160deg, #1a0040 0%, #2d0070 50%, #1a0040 100%)",
          border: "2px solid #8844ff60"
        }}>
        {/* Background card image effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          {["🃏","🂡","🂱","🃁"].map((c, i) => (
            <div key={i} className="absolute text-4xl"
              style={{ left: `${i * 25}%`, top: `${10 + (i % 2) * 20}%`, transform: `rotate(${-15 + i * 10}deg)` }}>
              {c}
            </div>
          ))}
        </div>

        <div className="relative z-10 p-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#ff8844" }}>
            MEGA HIT POKER LEAGUE
          </p>
          <p className="font-black text-3xl text-white" style={{ fontFamily: "'Arial Black', sans-serif", textShadow: "0 0 15px rgba(255,255,255,0.3)" }}>
            TOP LEAGUE
          </p>
          {/* Tabs */}
          <div className="flex justify-center mt-3">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all mx-1"
                style={{
                  background: tab === i ? "linear-gradient(135deg, #ffaa00, #cc7700)" : "rgba(255,255,255,0.08)",
                  color: tab === i ? "#000" : "#888",
                  border: tab === i ? "none" : "1px solid rgba(255,255,255,0.1)"
                }}>
                {i === 0 && "🏅 "}
                {t === "All-Time" ? "All-Time Winners" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Mythical rank badge */}
        <div className="relative z-10 mx-3 mb-3 rounded-2xl p-2 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #3d1560, #6622aa)", border: "1px solid #9944ff60" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: "linear-gradient(135deg, #8844ff, #5522aa)" }}>
            🌟
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-mono font-black text-2xl text-white">16</span>
              <div>
                <p className="text-[10px] font-bold text-purple-300">NIVEAU</p>
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <span className="font-black text-lg" style={{ color: "#ff88ff", textShadow: "0 0 8px #ff00ff", fontFamily: "'Arial Black', sans-serif" }}>
              MYTHICAL
            </span>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-3 py-1.5 mb-1 rounded-xl"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        <span className="w-16 text-[10px] font-black uppercase tracking-widest text-purple-400">Place</span>
        <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-purple-400">Name</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Earnings</span>
      </div>

      {/* Player rows */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {players.map((p, idx) => (
            <motion.div key={`${p.name}-${tab}`}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: levelAnim ? 0 : 1 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              className="flex items-center px-3 py-2.5 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${ROW_BG[idx]}cc, ${ROW_BG[idx]}88)`,
                border: `1px solid ${p.color}40`
              }}>
              {/* Rank + chips */}
              <div className="w-16 shrink-0">
                <p className="font-black text-sm" style={{ color: p.color }}>
                  {idx === 0 ? "1st" : idx === 1 ? "2nd" : idx === 2 ? "3rd" : `${idx + 1}th`}
                </p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span className="text-[8px]">🪙</span>
                  <span className="text-[9px] font-bold text-yellow-400">{p.chips}</span>
                </div>
              </div>

              {/* Avatar + name */}
              <div className="flex items-center gap-2 flex-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl shrink-0"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${p.color}40, ${p.color}10)`,
                    border: `2px solid ${p.color}60`
                  }}>
                  {p.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{p.name}</p>
                  <p className="text-[9px] text-purple-300">{p.game}</p>
                </div>
              </div>

              {/* Earnings */}
              <div className="text-right shrink-0">
                <p className="font-mono font-black text-sm" style={{ color: p.color, textShadow: idx < 3 ? `0 0 8px ${p.color}` : "none" }}>
                  ${p.earnings}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <motion.div
        animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
        className="mt-4 py-3 px-4 rounded-2xl text-center"
        style={{ background: "linear-gradient(135deg, #ffd700, #ff8800)", boxShadow: "0 0 20px #ffd70060" }}>
        <p className="font-black text-xl text-black" style={{ fontFamily: "'Arial Black', sans-serif" }}>
          MONTREZ VOS TALENTS ! 🎲
        </p>
      </motion.div>
    </div>
  );
}