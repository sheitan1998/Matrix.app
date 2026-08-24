import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Home, Trophy, Zap, TrendingUp, Target, Flame, Star } from "lucide-react";
import { casinoGetProfile } from "@/hooks/useCasinoJackpot";
import CasinoToken from "@/components/casino/CasinoToken";
import { formatBet } from "@/components/casino/slotThemes";
import { toast } from "sonner";

const RANK_TIERS = [
  { name: "BRONZE",   minLevel: 1,  color: "#cd7f32", glow: "#8b4513", emoji: "🥉" },
  { name: "SILVER",   minLevel: 5,  color: "#c0c0c0", glow: "#888888", emoji: "🥈" },
  { name: "GOLD",     minLevel: 10, color: "#ffd700", glow: "#cc8800", emoji: "🥇" },
  { name: "PLATINUM", minLevel: 20, color: "#44ddff", glow: "#0088cc", emoji: "💠" },
  { name: "DIAMOND",  minLevel: 35, color: "#88ddff", glow: "#4488ff", emoji: "💎" },
  { name: "MYTHICAL", minLevel: 50, color: "#ff44ff", glow: "#cc00cc", emoji: "🌟" },
];

function getRank(level) {
  return [...RANK_TIERS].reverse().find(r => level >= r.minLevel) || RANK_TIERS[0];
}

export default function CasinoProfile({ onBack }) {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("badges");

  useEffect(() => {
    casinoGetProfile()
      .then(data => setProfile(data))
      .catch(() => toast.error("Erreur lors du chargement du profil"));
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a050f" }}>
        <div className="w-9 h-9 border-4 border-white/10 rounded-full animate-spin" style={{ borderTopColor: "#C5A059" }} />
      </div>
    );
  }

  const rank = getRank(profile.level || 1);
  const nextRank = RANK_TIERS[RANK_TIERS.indexOf(rank) + 1];
  const progress = nextRank
    ? Math.min(100, ((profile.level - rank.minLevel) / (nextRank.minLevel - rank.minLevel)) * 100)
    : 100;
  const xpPercent = ((profile.xp || 0) / (profile.xp_needed || 5000)) * 100;

  const stats = [
    { icon: Zap,       label: "Niveau",        value: profile.level || 1,           color: "#C5A059" },
    { icon: Trophy,    label: "Parties",       value: profile.total_bets || 0,      color: "#a855f7" },
    { icon: TrendingUp,label: "Total misé",    value: formatBet(profile.total_wagered || 0), color: "#3b82f6" },
    { icon: Target,   label: "Total gagné",   value: formatBet(profile.total_won || 0),     color: "#22C55E" },
    { icon: Flame,    label: "Meilleur gain", value: formatBet(profile.biggest_win || 0),   color: "#ef4444" },
    { icon: Star,     label: "Mise max",      value: formatBet(profile.max_bet || 0),       color: "#fbbf24" },
  ];

  return (
    <div className="min-h-screen pb-16"
      style={{ background: "linear-gradient(160deg, #0a050f 0%, #1a0a2e 40%, #0a050f 100%)" }}>

      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{ background: "rgba(10,5,15,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(197,160,89,0.15)" }}>
        <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition tap-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour</span>
        </button>
        <h1 className="font-black text-lg tracking-wider" style={{
          background: "linear-gradient(135deg, #C5A059, #8B6B2B)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>PROFIL NEXUS GAME</h1>
        <span className="ml-auto text-xl" style={{ filter: `drop-shadow(0 0 6px ${rank.color})` }}>{rank.emoji}</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden p-5"
          style={{
            background: `linear-gradient(135deg, ${rank.color}18, #1a0a2e)`,
            border: `2px solid ${rank.color}40`,
            boxShadow: `0 0 40px ${rank.color}20`,
          }}>

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${rank.color}40, ${rank.color}10)`,
                border: `2px solid ${rank.color}60`,
              }}>
              {rank.emoji}
            </div>
            <div className="flex-1">
              <p className="font-black text-white text-lg">Niveau {profile.level || 1}</p>
              <span className="text-sm font-black" style={{ color: rank.color, textShadow: `0 0 8px ${rank.color}` }}>
                {rank.emoji} {rank.name}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <CasinoToken size={16} />
                <span className="font-mono text-sm font-bold" style={{ color: "#C5A059" }}>
                  {formatBet(profile.balance || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Level XP bar */}
          <div className="relative z-10 mt-4">
            <div className="flex justify-between text-[10px] font-bold mb-1.5" style={{ color: `${rank.color}aa` }}>
              <span>Niv. {profile.level || 1}</span>
              <span>{profile.xp || 0} / {profile.xp_needed || 5000} XP</span>
              <span>Niv. {(profile.level || 1) + 1}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }} transition={{ duration: 1, ease: "easeOut" }}
                style={{ background: `linear-gradient(90deg, ${rank.color}, ${rank.color}aa)`, boxShadow: `0 0 8px ${rank.color}` }} />
            </div>
          </div>

          {/* Rank progress */}
          {nextRank && (
            <div className="relative z-10 mt-3">
              <div className="flex justify-between text-[10px] font-bold mb-1.5" style={{ color: `${rank.color}aa` }}>
                <span>{rank.name}</span>
                <span>{progress.toFixed(0)}%</span>
                <span>{nextRank.name}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ background: `linear-gradient(90deg, ${rank.color}, ${nextRank.color})` }} />
              </div>
              <p className="text-[10px] text-center mt-1 font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                Niveau {nextRank.minLevel} pour atteindre {nextRank.name}
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

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl"
              style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <s.icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
              <p className="text-lg font-black text-white font-mono">{s.value}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5">
          {[
            { key: "badges", label: "🏅 Succès" },
            { key: "ranks", label: "🏆 Rangs" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 rounded-2xl text-xs font-black transition-all"
              style={{
                background: tab === t.key ? "linear-gradient(135deg, #C5A059, #8B6B2B)" : "rgba(255,255,255,0.04)",
                color: tab === t.key ? "#0a050f" : "rgba(255,255,255,0.4)",
                border: `1px solid ${tab === t.key ? "rgba(197,160,89,0.5)" : "rgba(255,255,255,0.06)"}`,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Badges tab */}
        <AnimatePresence mode="wait">
          {tab === "badges" && (
            <motion.div key="badges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-center" style={{ color: "#C5A059aa" }}>
                Succès Nexus Game ({(profile.achievements || []).length} / {(profile.achievement_defs || []).length})
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(profile.achievement_defs || []).map((badge) => {
                  const unlocked = (profile.achievements || []).includes(badge.id);
                  return (
                    <motion.div key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="relative p-3 rounded-2xl text-center overflow-hidden"
                      style={{
                        background: unlocked ? `linear-gradient(135deg, ${rank.color}15, #0a050f)` : "rgba(255,255,255,0.02)",
                        border: `1px solid ${unlocked ? rank.color + "50" : "rgba(255,255,255,0.06)"}`,
                        boxShadow: unlocked ? `0 0 12px ${rank.color}12` : "none",
                      }}>
                      {!unlocked && (
                        <div className="absolute inset-0 rounded-2xl flex items-end justify-center pb-2 z-10"
                          style={{ background: "rgba(0,0,0,0.6)" }}>
                          <span className="text-[8px] font-bold text-white/30">🔒 Verrouillé</span>
                        </div>
                      )}
                      <div className="text-3xl mb-1" style={{ filter: unlocked ? `drop-shadow(0 0 8px ${rank.color})` : "grayscale(1) opacity(0.35)" }}>
                        {badge.emoji}
                      </div>
                      <p className="font-black text-xs text-white leading-none">{badge.label}</p>
                      <p className="text-[9px] mt-0.5 leading-tight" style={{ color: unlocked ? `${rank.color}cc` : "rgba(255,255,255,0.25)" }}>
                        {badge.desc}
                      </p>
                      {unlocked && (
                        <span className="inline-block mt-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: `${rank.color}25`, color: rank.color }}>
                          DÉBLOQUÉ
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {tab === "ranks" && (
            <motion.div key="ranks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-2">
              <div className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-xs font-black text-white mb-3">ÉCHELLE DES RANGS</p>
                {RANK_TIERS.map((r) => (
                  <div key={r.name} className="flex items-center gap-3 py-1.5 px-2 rounded-xl transition-all"
                    style={{
                      background: r.name === rank.name ? `${r.color}15` : "transparent",
                      border: r.name === rank.name ? `1px solid ${r.color}40` : "1px solid transparent",
                    }}>
                    <span className="text-lg">{r.emoji}</span>
                    <span className="font-black text-sm flex-1" style={{ color: r.color }}>{r.name}</span>
                    <span className="text-[10px] font-mono text-white/40">Niv. {r.minLevel}+</span>
                    {r.name === rank.name && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${r.color}20`, color: r.color }}>VOUS</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}