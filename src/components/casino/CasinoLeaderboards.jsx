import React, { useState } from "react";
import { motion } from "framer-motion";
import { LEADERBOARD_TABS } from "./casinoData";

const MOCK_DATA = [
  { rank: 1, pseudo: "NeoBlaze", value: 4582000, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop" },
  { rank: 2, pseudo: "VoidWalker", value: 3210000, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop" },
  { rank: 3, pseudo: "QuantumAce", value: 2985000, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop" },
  { rank: 4, pseudo: "CyberQueen", value: 1875000, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop" },
  { rank: 5, pseudo: "LunaFox", value: 1250000, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop" },
  { rank: 6, pseudo: "SynthKing", value: 670000, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop" },
  { rank: 7, pseudo: "BlitzWolf", value: 432000, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=40&h=40&fit=crop" },
  { rank: 8, pseudo: "PhantomX", value: 298000, avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=40&h=40&fit=crop" },
];

export default function CasinoLeaderboards() {
  const [tab, setTab] = useState("winnings");
  const data = MOCK_DATA; // same mock for all tabs — real data comes from WalletTransaction in production

  return (
    <section>
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-thin">
        {LEADERBOARD_TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className="shrink-0 h-7 px-3 rounded-lg text-[11px] font-bold transition whitespace-nowrap"
            style={tab === t.value
              ? { background: "rgba(139,92,246,0.15)", color: "#fff", border: "1px solid rgba(139,92,246,0.3)" }
              : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {data.map((p, i) => (
          <motion.div key={p.pseudo}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-2.5 rounded-xl transition"
            style={{ background: p.rank <= 3 ? "rgba(251,191,36,0.04)" : "rgba(255,255,255,0.02)", border: p.rank <= 3 ? "1px solid rgba(251,191,36,0.1)" : "1px solid rgba(255,255,255,0.04)" }}>
            <span className="w-6 text-center text-sm font-black"
              style={{ color: p.rank === 1 ? "#fbbf24" : p.rank === 2 ? "#c0c0c0" : p.rank === 3 ? "#cd7f32" : "rgba(255,255,255,0.3)" }}>
              {p.rank}
            </span>
            <img src={p.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
            <span className="text-xs font-bold text-white flex-1">{p.pseudo}</span>
            <span className="text-xs font-mono font-bold" style={{ color: "#fbbf24" }}>{p.value.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}