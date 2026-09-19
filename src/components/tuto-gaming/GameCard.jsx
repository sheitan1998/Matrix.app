import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Lock } from "lucide-react";
import { normalizeAppAssetUrl } from "@/lib/urlUtils";

export default function GameCard({ game, guideCount = 0, index = 0 }) {
  const isActive = game.is_active !== false;
  const gradient =
    game.card_gradient ||
    "linear-gradient(135deg, #1A0B2E 0%, #4A148C 50%, #1A0B2E 100%)";

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={isActive ? { scale: 1.02 } : {}}
      className="relative rounded-2xl overflow-hidden group"
      style={{
        background: "#0D0518",
        border: `1.5px solid ${isActive ? "rgba(191,90,242,0.25)" : "rgba(255,255,255,0.06)"}`,
        boxShadow: isActive ? "0 0 20px rgba(191,90,242,0.08)" : "none",
      }}
    >
      {/* Visual area */}
      <div className="relative h-40 sm:h-48 overflow-hidden" style={{ background: gradient }}>
        {game.image_url && (
          <img
            src={normalizeAppAssetUrl(game.image_url)}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Decorative pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, rgba(191,90,242,0.15) 0%, transparent 50%)
            `,
          }}
        />

        {!isActive && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.55)" }}
          >
            <div className="flex flex-col items-center gap-2">
              <Lock className="w-7 h-7 text-white/30" />
              <span className="text-[9px] font-black uppercase tracking-wider text-white/40">
                Bientôt disponible
              </span>
            </div>
          </div>
        )}

        {/* Game name overlay */}
        <div
          className="absolute inset-0 flex items-end p-4"
          style={{
            background: "linear-gradient(180deg, transparent 40%, rgba(13,5,24,0.95) 100%)",
          }}
        >
          <h3 className="text-lg font-black text-white uppercase tracking-tight">
            {game.name}
          </h3>
        </div>

        {/* Glow border on hover */}
        {isActive && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ boxShadow: "inset 0 0 30px rgba(191,90,242,0.2)" }}
          />
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span
          className="text-[10px] uppercase tracking-wider font-bold"
          style={{ color: isActive ? "#BF5AF2" : "rgba(255,255,255,0.3)" }}
        >
          {isActive ? "Disponible" : "Bientôt"}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-white/40">
          <BookOpen className="w-3 h-3" />
          {guideCount} guide{guideCount > 1 ? "s" : ""}
        </span>
      </div>
    </motion.div>
  );

  if (isActive) {
    return <Link to={`/tuto-gaming/${game.slug}`}>{cardContent}</Link>;
  }
  return <div className="opacity-70 cursor-not-allowed">{cardContent}</div>;
}