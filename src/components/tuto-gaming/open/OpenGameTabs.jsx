import React from "react";
import { ShoppingBag, ScrollText, Users, Trophy } from "lucide-react";
import { TAB_META } from "@/lib/openGames";

const ICONS = { shopping: ShoppingBag, scroll: ScrollText, users: Users, trophy: Trophy };

export default function OpenGameTabs({ active, onChange, accent, counts = {} }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {TAB_META.map((tab) => {
        const Icon = ICONS[tab.icon] || ShoppingBag;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-2 h-10 px-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition tap-sm"
            style={{
              background: isActive ? `${accent}22` : "rgba(255,255,255,0.03)",
              color: isActive ? accent : "rgba(255,255,255,0.5)",
              border: `1px solid ${isActive ? `${accent}66` : "rgba(255,255,255,0.07)"}`,
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}