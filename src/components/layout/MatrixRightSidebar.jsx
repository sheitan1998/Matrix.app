import React from "react";
import { Radio, HardDrive, Crown } from "lucide-react";

const DEFAULT_LIVE = [
  { name: "NeoGameux", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop", activity: "En montage", viewers: 1240 },
  { name: "CyberBeat", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", activity: "Création musicale", viewers: 856 },
  { name: "LunaStream", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", activity: "Live gaming", viewers: 2100 },
  { name: "SynthLord", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", activity: "Mix set", viewers: 432 },
];

export default function MatrixRightSidebar({ tools = [], liveUsers = DEFAULT_LIVE }) {
  return (
    <aside className="hidden xl:flex flex-col w-72 shrink-0 h-screen sticky top-0 p-4 gap-4 overflow-y-auto scrollbar-thin"
      style={{ background: "rgba(10,10,12,0.5)", backdropFilter: "blur(16px)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Outils */}
      <Panel title="Raccourcis outils">
        <div className="space-y-1">
          {tools.map((t) => (
            <button key={t.label} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition">
              <t.icon className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
              <span className="flex-1 text-left text-xs">{t.label}</span>
              {t.pro && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.2)", color: "#fbbf24" }}>PRO</span>}
            </button>
          ))}
        </div>
      </Panel>

      {/* Stockage */}
      <Panel title="Espace de stockage">
        <div className="mb-2 flex items-end justify-between">
          <span className="text-2xl font-black text-white">78%</span>
          <span className="text-[10px] text-white/40">78 Go / 100 Go</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full" style={{ width: "78%", background: "linear-gradient(90deg, #8b5cf6, #6d28d9)" }} />
        </div>
        <button className="w-full mt-3 h-9 rounded-xl text-xs font-bold text-white/70 hover:text-white transition"
          style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
          Gérer l'espace
        </button>
      </Panel>

      {/* Pro card */}
      <div className="rounded-2xl p-4"
        style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.05))", border: "1px solid rgba(139,92,246,0.2)" }}>
        <Crown className="w-6 h-6 mb-2" style={{ color: "#fbbf24" }} />
        <p className="text-sm font-black text-white">Passe Pro</p>
        <p className="text-[11px] text-white/50 mt-1 mb-3">Débloquez tous les outils sans limite</p>
        <button className="w-full h-9 rounded-xl text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
          Passer Pro · 4,99€/mois
        </button>
      </div>
    </aside>
  );
}

function Panel({ title, children, dotColor }) {
  return (
    <div className="rounded-2xl p-4"
      style={{ background: "rgba(18,18,20,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-3">
        {dotColor && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: dotColor }} />}
        <p className="text-[11px] font-black tracking-widest text-white/40 uppercase">{title}</p>
      </div>
      {children}
    </div>
  );
}