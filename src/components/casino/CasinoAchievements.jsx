import React from "react";
import { motion } from "framer-motion";
import { ACHIEVEMENTS } from "./casinoData";

const RARITY_COLORS = {
  commun: "#94a3b8",
  rare: "#3b82f6",
  "épique": "#a855f7",
  légendaire: "#fbbf24",
};

export default function CasinoAchievements() {
  return (
    <section>
      <h3 className="text-lg font-black text-white mb-4">Succès</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {ACHIEVEMENTS.map((a, i) => {
          const color = RARITY_COLORS[a.rarity] || "#94a3b8";
          return (
            <motion.div key={a.title}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl p-3 text-center transition relative overflow-hidden"
              style={{
                background: a.unlocked ? `linear-gradient(135deg, ${color}10, rgba(12,12,16,0.8))` : "rgba(12,12,16,0.5)",
                border: a.unlocked ? `1px solid ${color}30` : "1px solid rgba(255,255,255,0.04)",
                opacity: a.unlocked ? 1 : 0.4,
              }}>

              <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2"
                style={{ background: a.unlocked ? `${color}15` : "rgba(255,255,255,0.03)" }}>
                <span className="text-lg" style={{ filter: a.unlocked ? "none" : "grayscale(1)" }}>{a.icon}</span>
              </div>
              <p className="text-[10px] font-bold text-white leading-tight mb-1">{a.title}</p>
              <p className="text-[8px] uppercase tracking-wider" style={{ color }}>{a.rarity}</p>

              {!a.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-2xl">🔒</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}