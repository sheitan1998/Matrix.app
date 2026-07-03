import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RECENT_WINNERS_SEED } from "./casinoData";

const NEW_WINNERS = [
  { pseudo: "PhantomX", game: "Mines", amount: 3400, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop" },
  { pseudo: "NovaStar", game: "Dice", amount: 12500, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop" },
  { pseudo: "BlitzWolf", game: "Crash X", amount: 67000, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop" },
  { pseudo: "ElectraZ", game: "Baccarat Pro", amount: 9800, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop" },
];

export default function CasinoRecentWinners() {
  const [winners, setWinners] = useState(RECENT_WINNERS_SEED);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    const t = setInterval(() => {
      const newWinner = NEW_WINNERS[Math.floor(Math.random() * NEW_WINNERS.length)];
      const entry = { ...newWinner, time: "À l'instant", id: Date.now() };
      setWinners(prev => [entry, ...prev.slice(0, 7)]);
      setFlash(entry.id);
      setTimeout(() => setFlash(null), 1500);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-black text-white">Derniers Gagnants</h3>
        <span className="text-[10px] font-bold text-green-400 px-1.5 py-0.5 rounded-full flex items-center gap-1"
          style={{ background: "rgba(34,197,94,0.15)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />LIVE
        </span>
      </div>

      <div className="space-y-1.5 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
        <AnimatePresence initial={false}>
          {winners.map((w) => (
            <motion.div key={w.id || w.pseudo}
              initial={w.id ? { opacity: 0, x: -20, height: 0 } : false}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 p-2.5 rounded-xl transition"
              style={{
                background: flash === w.id ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.02)",
                border: flash === w.id ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.04)",
              }}>
              <img src={w.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{w.pseudo}</p>
                <p className="text-[10px] text-white/40 truncate">{w.game} · {w.time}</p>
              </div>
              <span className="text-xs font-mono font-bold shrink-0" style={{ color: "#22c55e" }}>+{w.amount.toLocaleString()}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}