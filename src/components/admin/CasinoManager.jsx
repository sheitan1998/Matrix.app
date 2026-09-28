import React, { useState } from "react";
import { Coins, Ticket, CircleDashed } from "lucide-react";
import SlotConfigPanel from "@/components/admin/SlotConfigPanel";
import ScratchCardConfigPanel from "@/components/admin/ScratchCardConfigPanel";
import WheelConfigPanel from "@/components/admin/WheelConfigPanel";

const SUB_TABS = [
  { id: "slots", label: "Machines à sous", icon: Coins, color: "#d4af37" },
  { id: "scratch", label: "Tickets à gratter", icon: Ticket, color: "#a855f7" },
  { id: "wheel", label: "Roue de la Fortune", icon: CircleDashed, color: "#00ffff" },
];

export default function CasinoManager() {
  const [subTab, setSubTab] = useState("slots");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(15,10,25,0.6)" }}>
        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">Gestion du Casino</h3>
        <p className="text-[10px] text-white/40">Machines à sous, tickets à gratter et roue de la fortune — assets, textes, paramètres économiques et probabilités.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {SUB_TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${subTab === t.id ? "text-white" : "text-white/40 bg-white/5"}`}
              style={subTab === t.id ? {
                background: `${t.color}20`,
                border: `1px solid ${t.color}80`,
              } : { border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: subTab === t.id ? t.color : undefined }} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {subTab === "slots" && <SlotConfigPanel />}
        {subTab === "scratch" && <ScratchCardConfigPanel />}
        {subTab === "wheel" && <WheelConfigPanel />}
      </div>
    </div>
  );
}