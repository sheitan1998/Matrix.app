import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Heart, Users } from "lucide-react";

const BADGE_STYLES = {
  new: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Nouveau" },
  hot: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Hot" },
  jackpot: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", label: "Jackpot" },
  live: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Live" },
  exclusive: { bg: "rgba(139,92,246,0.15)", color: "#a855f7", label: "Exclusif" },
};

export default function CasinoGameCard({ game, onPlay, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [fav, setFav] = useState(false);
  const badge = game.badge ? BADGE_STYLES[game.badge] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(game.key)}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: "rgba(12,12,16,0.7)",
        border: hovered ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.06)",
        boxShadow: hovered ? "0 0 30px rgba(139,92,246,0.15)" : "none",
        transition: "border 0.3s, box-shadow 0.3s",
      }}>

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={game.img} alt={game.name} className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(8,8,12,0.95) 100%)" }} />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {badge && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
              style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}30` }}>
              {badge.label}
            </span>
          )}
          {game.isHot && !badge && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
              style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>🔥 Hot</span>
          )}
        </div>

        {/* Favorite */}
        <button onClick={(e) => { e.stopPropagation(); setFav(!fav); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <Heart className="w-3.5 h-3.5" style={{ color: fav ? "#ef4444" : "rgba(255,255,255,0.5)", fill: fav ? "#ef4444" : "none" }} />
        </button>

        {/* Hover overlay */}
        <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.2 }}
          style={{ background: "rgba(8,8,12,0.6)" }}>
          <div className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}>
            <Play className="w-3.5 h-3.5 fill-white" /> Jouer
          </div>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-bold text-white truncate">{game.name}</p>
        <p className="text-[10px] text-white/40 truncate">{game.provider}</p>

        <div className="flex items-center gap-2 mt-2 text-[9px]">
          <span className="text-white/40">RTP <span style={{ color: "#22c55e" }}>{game.rtp}</span></span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-0.5 text-white/40">
            <Users className="w-2.5 h-2.5" />{game.players.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[9px] text-white/30">
          <span>Mise {game.minBet}–{game.maxBet.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}