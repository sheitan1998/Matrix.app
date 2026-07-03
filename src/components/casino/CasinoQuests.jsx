import React from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { QUESTS } from "./casinoData";

export default function CasinoQuests() {
  return (
    <section>
      <h3 className="text-lg font-black text-white mb-4">Quêtes & Missions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUESTS.map((q, i) => {
          const pct = Math.min(100, (q.progress / q.total) * 100);
          return (
            <motion.div key={q.title}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-4"
              style={{ background: q.done ? "rgba(34,197,94,0.04)" : "rgba(12,12,16,0.7)", border: q.done ? "1px solid rgba(34,197,94,0.15)" : "1px solid rgba(255,255,255,0.06)" }}>

              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {q.done ? (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.2)" }}>
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center">
                      <Star className="w-2.5 h-2.5 text-white/30" />
                    </div>
                  )}
                  <p className="text-xs font-bold text-white">{q.title}</p>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={q.done ? { background: "rgba(34,197,94,0.15)", color: "#22c55e" } : { background: "rgba(139,92,246,0.1)", color: "#a855f7" }}>
                  {q.done ? "TERMINÉ" : `${q.progress}/${q.total}`}
                </span>
              </div>

              <p className="text-[11px] text-white/40 mb-2">{q.desc}</p>

              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: q.done ? "#22c55e" : "linear-gradient(90deg, #8b5cf6, #3b82f6)" }} />
              </div>

              <p className="text-[10px] text-white/50">🎁 {q.reward}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}