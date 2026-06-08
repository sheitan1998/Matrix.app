import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Zap, TrendingUp, Crown, Star, Target, Flame } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { base44 } from "@/api/base44Client";

const RANK_TIERS = [
  { name: "BRONZE",   min: 0,       max: 9999,      color: "#cd7f32", glow: "#8b4513", emoji: "🥉" },
  { name: "SILVER",   min: 10000,   max: 49999,     color: "#c0c0c0", glow: "#888888", emoji: "🥈" },
  { name: "GOLD",     min: 50000,   max: 199999,    color: "#ffd700", glow: "#cc8800", emoji: "🥇" },
  { name: "PLATINUM", min: 200000,  max: 999999,    color: "#44ddff", glow: "#0088cc", emoji: "💠" },
  { name: "DIAMOND",  min: 1000000, max: 9999999,   color: "#88ddff", glow: "#4488ff", emoji: "💎" },
  { name: "MYTHICAL", min: 10000000, max: Infinity, color: "#ff44ff", glow: "#cc00cc", emoji: "🌟" },
];

function getRank(balance) {
  return RANK_TIERS.find(r => balance >= r.min && balance <= r.max) || RANK_TIERS[0];
}

const MOCK_HISTORY = [
  { game: "Diamond Slots",  result: "win",  amount: 45000,  mult: "×50", date: "Il y a 2h" },
  { game: "Blackjack",      result: "win",  amount: 12500,  mult: "×2.5",date: "Il y a 5h" },
  { game: "Roulette",       result: "loss", amount: -1000,  mult: null,  date: "Il y a 6h" },
  { game: "Diamond Slots",  result: "win",  amount: 8000,   mult: "×8",  date: "Hier" },
  { game: "Bingo",          result: "loss", amount: -500,   mult: null,  date: "Hier" },
  { game: "Blackjack",      result: "win",  amount: 3750,   mult: "×1.5",date: "Hier" },
  { game: "Paris Sportifs", result: "win",  amount: 6200,   mult: "×3.1",date: "Il y a 2j" },
  { game: "Roulette",       result: "loss", amount: -2000,  mult: null,  date: "Il y a 2j" },
];

const LEADERBOARD = [
  { rank: 1, name: "Gabriel",   earnings: "82.49T", avatar: "👨‍💼", color: "#ffd700" },
  { rank: 2, name: "Damien",    earnings: "67.72T", avatar: "😎",   color: "#c0c0c0" },
  { rank: 3, name: "Tobias",    earnings: "65.73T", avatar: "🧔",   color: "#cd7f32" },
  { rank: 4, name: "Adrian",    earnings: "65.65T", avatar: "👩‍🦱",color: "#9988ff" },
  { rank: 5, name: "Vous",      earnings: "?",      avatar: "👤",   color: "#ff44ff", isYou: true },
];

function StatCard({ label, value, icon, color }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1"
      style={{ background: `linear-gradient(135deg, ${color}12, #0a001a)`, border: `1px solid ${color}30` }}>
      <span className="text-xl">{icon}</span>
      <p className="font-mono font-black text-lg text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: `${color}aa` }}>{label}</p>
    </div>
  );
}

export default function CasinoProfile({ onBack }) {
  const { balance } = useWallet();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("stats");
  const [lightPhase, setLightPhase] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const t = setInterval(() => setLightPhase(p => (p + 1) % 12), 150);
    return () => clearInterval(t);
  }, []);

  const rank = getRank(balance);
  const nextRank = RANK_TIERS[RANK_TIERS.indexOf(rank) + 1];
  const progress = nextRank
    ? Math.min(100, ((balance - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100;

  const totalWins = MOCK_HISTORY.filter(h => h.result === "win").length;
  const totalLosses = MOCK_HISTORY.filter(h => h.result === "loss").length;
  const biggestWin = Math.max(...MOCK_HISTORY.filter(h => h.result === "win").map(h => h.amount));

  return (
    <div className="min-h-screen pb-16"
      style={{ background: "linear-gradient(160deg, #080015 0%, #0f0028 50%, #080015 100%)" }}>

      {/* Header */}
      <div className="sticky top-0 z-40"
        style={{ background: "rgba(8,0,20,0.97)", borderBottom: "2px solid rgba(136,68,255,0.25)", backdropFilter: "blur(20px)" }}>
        {/* Neon strip */}
        <div className="h-1 flex overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => {
            const colors = ["#ff00ff","#8844ff","#0088ff","#ff0088","#ffd700","#00ffcc"];
            const active = i % 6 === lightPhase % 6;
            return <div key={i} className="flex-1 transition-all duration-100"
              style={{ background: active ? colors[i % 6] : "rgba(255,255,255,0.04)" }} />;
          })}
        </div>
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </button>
          <span className="font-black text-white text-base tracking-wide">MON PROFIL CASINO</span>
          <span className="ml-auto text-xl" style={{ filter: `drop-shadow(0 0 6px ${rank.color})` }}>{rank.emoji}</span>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Profile hero card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden p-5"
          style={{
            background: `linear-gradient(135deg, ${rank.color}18, #12003a)`,
            border: `2px solid ${rank.color}40`,
            boxShadow: `0 0 40px ${rank.color}20`
          }}>
          {/* Background shimmer */}
          <div className="absolute inset-0 pointer-events-none opacity-5"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: `radial-gradient(circle at 30% 30%, ${rank.color}40, ${rank.color}10)`, border: `2px solid ${rank.color}60` }}>
              👤
            </div>
            <div className="flex-1">
              <p className="font-black text-white text-lg">{user?.full_name || "Joueur"}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-black" style={{ color: rank.color, textShadow: `0 0 8px ${rank.color}` }}>
                  {rank.emoji} {rank.name}
                </span>
              </div>
              <div className="font-mono text-sm font-bold mt-1" style={{ color: "#ffd700" }}>
                {balance.toLocaleString()} 🪙
              </div>
            </div>
          </div>

          {/* Rank progress bar */}
          {nextRank && (
            <div className="relative z-10 mt-4">
              <div className="flex justify-between text-[10px] font-bold mb-1.5" style={{ color: `${rank.color}aa` }}>
                <span>{rank.name}</span>
                <span>{progress.toFixed(0)}%</span>
                <span>{nextRank.name}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ background: `linear-gradient(90deg, ${rank.color}, ${nextRank.color})`, boxShadow: `0 0 8px ${rank.color}` }} />
              </div>
              <p className="text-[10px] text-center mt-1 font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                {(nextRank.min - balance).toLocaleString()} 🪙 pour atteindre {nextRank.name}
              </p>
            </div>
          )}
          {!nextRank && (
            <div className="relative z-10 mt-3 text-center">
              <p className="font-black" style={{ color: rank.color, textShadow: `0 0 12px ${rank.color}` }}>
                ✨ RANG MAXIMUM ATTEINT ✨
              </p>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: "stats", label: "📊 Stats" },
            { key: "history", label: "📜 Historique" },
            { key: "leaderboard", label: "🏆 Classement" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 rounded-2xl text-xs font-black transition-all"
              style={{
                background: tab === t.key ? "linear-gradient(135deg, #6644ff, #4422cc)" : "rgba(255,255,255,0.04)",
                color: tab === t.key ? "white" : "#555",
                border: `1px solid ${tab === t.key ? "#8866ff" : "rgba(255,255,255,0.08)"}`,
                boxShadow: tab === t.key ? "0 0 15px #6644ff60" : "none"
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* STATS TAB */}
        <AnimatePresence mode="wait">
          {tab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Solde actuel" value={balance.toLocaleString() + " 🪙"} icon="💰" color="#ffd700" />
                <StatCard label="Victoires" value={totalWins} icon="🏆" color="#44ff88" />
                <StatCard label="Défaites" value={totalLosses} icon="💸" color="#ff4444" />
                <StatCard label="Meilleur gain" value={biggestWin.toLocaleString() + " 🪙"} icon="🚀" color="#ff00ff" />
              </div>

              {/* Win rate */}
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-white">Taux de victoire</span>
                  <span className="font-mono font-black text-sm" style={{ color: "#44ff88" }}>
                    {Math.round((totalWins / (totalWins + totalLosses)) * 100)}%
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <motion.div initial={{ width: 0 }}
                    animate={{ width: `${Math.round((totalWins / (totalWins + totalLosses)) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #44ff88, #00cc66)", boxShadow: "0 0 8px #44ff8880" }} />
                </div>
              </div>

              {/* Rank ladder */}
              <div className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-xs font-black text-white mb-3">ÉCHELLE DES RANGS</p>
                {RANK_TIERS.map((r, i) => (
                  <div key={r.name} className="flex items-center gap-3 py-1.5 px-2 rounded-xl transition-all"
                    style={{ background: r.name === rank.name ? `${r.color}15` : "transparent", border: r.name === rank.name ? `1px solid ${r.color}40` : "1px solid transparent" }}>
                    <span className="text-lg">{r.emoji}</span>
                    <span className="font-black text-sm flex-1" style={{ color: r.color }}>{r.name}</span>
                    <span className="text-[10px] font-mono text-white/40">{r.min.toLocaleString()}+</span>
                    {r.name === rank.name && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${r.color}20`, color: r.color }}>VOUS</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {tab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-2">
              {MOCK_HISTORY.map((h, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    background: h.result === "win" ? "rgba(68,255,136,0.05)" : "rgba(255,68,68,0.05)",
                    border: `1px solid ${h.result === "win" ? "rgba(68,255,136,0.15)" : "rgba(255,68,68,0.12)"}`
                  }}>
                  <span className="text-xl">{h.result === "win" ? "🎉" : "💸"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white truncate">{h.game}</p>
                    <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{h.date}</p>
                  </div>
                  {h.mult && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,215,0,0.15)", color: "#ffd700" }}>{h.mult}</span>
                  )}
                  <span className={`font-mono font-black text-sm ${h.result === "win" ? "text-green-400" : "text-red-400"}`}>
                    {h.result === "win" ? "+" : ""}{h.amount.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* LEADERBOARD TAB */}
          {tab === "leaderboard" && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-2">
              <div className="text-center py-2 mb-2">
                <p className="font-black text-white text-lg">🏆 TOP CLASSEMENT</p>
                <p className="text-xs text-white/40">Meilleurs joueurs de la semaine</p>
              </div>
              {LEADERBOARD.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    background: p.isYou ? `${p.color}15` : `${p.color}08`,
                    border: `1px solid ${p.color}${p.isYou ? "60" : "30"}`,
                    boxShadow: p.isYou ? `0 0 15px ${p.color}20` : "none"
                  }}>
                  <span className="font-black text-lg w-8 text-center" style={{ color: p.color }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                  </span>
                  <span className="text-2xl">{p.avatar}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">{p.name} {p.isYou && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1" style={{ background: `${p.color}20`, color: p.color }}>VOUS</span>}</p>
                  </div>
                  <span className="font-mono font-black text-sm" style={{ color: p.color }}>
                    ${p.earnings}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}