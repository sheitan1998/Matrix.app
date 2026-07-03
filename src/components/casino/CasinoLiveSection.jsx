import React from "react";
import { motion } from "framer-motion";
import { Users, Clock, ArrowRight } from "lucide-react";
import { LIVE_TABLES } from "./casinoData";

export default function CasinoLiveSection({ onJoin }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#ef4444" }} />
        <h3 className="text-lg font-black text-white">Casino Live</h3>
        <span className="text-[10px] font-bold text-red-400 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)" }}>EN DIRECT</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {LIVE_TABLES.map((table, i) => {
          const isFull = table.status === "full";
          return (
            <motion.div key={table.name}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-4 transition group"
              style={{ background: "rgba(12,12,16,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
                    {table.dealer[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{table.name}</p>
                    <p className="text-[10px] text-white/40">{table.type} · {table.dealer}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={isFull
                    ? { background: "rgba(239,68,68,0.15)", color: "#ef4444" }
                    : { background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                  {isFull ? "PLEIN" : "OUVERT"}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3 text-[10px] text-white/40">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{table.players}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{table.wait}</span>
              </div>

              <button onClick={() => onJoin(table)}
                disabled={isFull}
                className="w-full h-8 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                style={isFull
                  ? { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.05)" }
                  : { background: "rgba(139,92,246,0.1)", color: "#a855f7", border: "1px solid rgba(139,92,246,0.2)" }}>
                {isFull ? "File d'attente" : "Rejoindre"} {!isFull && <ArrowRight className="w-3 h-3" />}
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}