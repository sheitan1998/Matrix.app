import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Clock, ArrowRight } from "lucide-react";
import { TOURNAMENT } from "./casinoData";

export default function CasinoTournaments({ onParticipate }) {
  const [timeLeft, setTimeLeft] = useState(TOURNAMENT.timeLeft);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
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
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(12,12,16,0.9))", border: "1px solid rgba(139,92,246,0.2)" }}>

      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)", filter: "blur(20px)" }} />

      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}>
            <Trophy className="w-5 h-5" style={{ color: "#a855f7" }} />
          </div>
          <div>
            <p className="text-sm font-black text-white">{TOURNAMENT.name}</p>
            <p className="text-[10px] text-white/40">Tournoi en cours</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-wider text-white/40">Prize Pool</p>
          <p className="font-mono font-black text-lg" style={{ color: "#fbbf24" }}>{TOURNAMENT.prizePool.toLocaleString()}</p>
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
          <Clock className="w-3.5 h-3.5 mx-auto text-white/40 mb-1" />
          <p className="font-mono font-bold text-sm text-white">{fmt(timeLeft.h)}:{fmt(timeLeft.m)}:{fmt(timeLeft.s)}</p>
          <p className="text-[8px] text-white/30 uppercase">Restant</p>
        </div>
        <div className="text-center p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
          <Users className="w-3.5 h-3.5 mx-auto text-white/40 mb-1" />
          <p className="font-bold text-sm text-white">{TOURNAMENT.participants.toLocaleString()}</p>
          <p className="text-[8px] text-white/30 uppercase">Participants</p>
        </div>
        <div className="text-center p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
          <Trophy className="w-3.5 h-3.5 mx-auto text-white/40 mb-1" />
          <p className="font-bold text-sm text-white">Top 50</p>
          <p className="text-[8px] text-white/30 uppercase">Gagnants</p>
        </div>
      </div>

      {/* Mini leaderboard */}
      <div className="relative space-y-1.5 mb-4">
        {TOURNAMENT.leaderboard.map((p) => (
          <div key={p.rank} className="flex items-center gap-2 p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="w-5 text-center text-xs font-black" style={{ color: p.rank === 1 ? "#fbbf24" : p.rank === 2 ? "#c0c0c0" : "#cd7f32" }}>{p.rank}</span>
            <img src={p.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
            <span className="text-xs font-medium text-white/80 flex-1">{p.pseudo}</span>
            <span className="text-xs font-mono font-bold" style={{ color: "#fbbf24" }}>{p.score.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <button onClick={onParticipate}
        className="relative w-full h-10 rounded-xl text-sm font-bold text-white transition flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 0 20px rgba(139,92,246,0.2)" }}>
        Participer au tournoi <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}