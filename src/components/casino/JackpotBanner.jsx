import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";

export default function JackpotBanner({ jackpot, onViewJackpots }) {
  const [countdown, setCountdown] = useState({ h: 4, m: 32, s: 18 });

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (n) => String(n).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="relative rounded-3xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(15,8,25,0.9), rgba(8,8,12,0.95))", border: "1px solid rgba(251,191,36,0.2)" }}>

      {/* Glow effects */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.1), transparent 70%)", filter: "blur(30px)" }} />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)", filter: "blur(30px)" }} />

      {/* Floating crystals */}
      {["💎", "💎", "💎"].map((c, i) => (
        <motion.span key={i} className="absolute text-2xl pointer-events-none opacity-30"
          style={{ right: `${15 + i * 12}%`, top: `${20 + i * 15}%` }}
          animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}>{c}</motion.span>
      ))}

      <div className="relative grid md:grid-cols-[1.5fr_1fr] gap-6 p-6 md:p-8">
        {/* Left: jackpot */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: "#fbbf24" }} />
            <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#fbbf24" }}>Jackpot Progressif</span>
          </div>

          <motion.p className="font-mono font-black leading-none mb-3"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#fff",
              textShadow: "0 0 30px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.2)" }}
            key={Math.floor(jackpot / 500)}
            initial={{ scale: 1 }} animate={{ scale: [1, 1.01, 1] }} transition={{ duration: 0.5 }}>
            {jackpot.toLocaleString()}
          </motion.p>
          <p className="text-sm text-white/40 mb-5">MATRIX Coins — Croît en temps réel avec chaque mise</p>

          <button onClick={onViewJackpots}
            className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-black transition"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 0 20px rgba(251,191,36,0.3)" }}>
            Voir les jackpots
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: countdown + chest */}
        <div className="flex flex-col items-center justify-center">
          <p className="text-[10px] font-black tracking-widest uppercase text-white/40 mb-3">Prochain tirage dans</p>
          <div className="flex items-center gap-2 mb-4">
            {[
              { val: countdown.h, label: "H" },
              { val: countdown.m, label: "M" },
              { val: countdown.s, label: "S" },
            ].map((t, i) => (
              <React.Fragment key={i}>
                <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center"
                  style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <span className="font-mono font-black text-xl text-white">{fmt(t.val)}</span>
                  <span className="text-[8px] text-white/40">{t.label}</span>
                </div>
                {i < 2 && <span className="text-xl font-black text-white/20">:</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Crystal chest */}
          <motion.div className="text-5xl" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>💎</motion.div>
        </div>
      </div>
    </motion.div>
  );
}