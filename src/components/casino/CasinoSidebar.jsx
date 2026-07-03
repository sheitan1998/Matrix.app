import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Heart, History, Cherry, Radio, Spade, Disc, Club, Diamond as DiamondIcon,
  Grid3x3, Ticket, TrendingUp, Bomb, Dices, Crown, Trophy, Gift, BarChart3,
  MessageSquare, LifeBuoy, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";
import { SIDEBAR_MENU, VIP_TIERS } from "./casinoData";

const ICONS = {
  Home, Heart, History, Cherry, Radio, Spade, Disc, Club, Diamond: DiamondIcon,
  Grid3x3, Ticket, TrendingUp, Bomb, Dices, Crown, Trophy, Gift, BarChart3,
  MessageSquare, LifeBuoy,
};

export default function CasinoSidebar({ active, onSelect, collapsed, onToggle, coins, vipTier }) {
  return (
    <aside className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}
      style={{ background: "rgba(10,10,14,0.7)", backdropFilter: "blur(16px)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

      {/* Toggle */}
      <button onClick={onToggle}
        className="shrink-0 h-10 flex items-center justify-center text-white/40 hover:text-white transition border-b border-white/5">
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {SIDEBAR_MENU.map((group) => (
          <div key={group.section} className="mb-3">
            {!collapsed && (
              <p className="px-4 py-1.5 text-[9px] font-black tracking-widest uppercase text-white/25">{group.section}</p>
            )}
            {group.items.map((item) => {
              const Icon = ICONS[item.icon] || Home;
              const isActive = active === item.target;
              return (
                <button key={item.target} onClick={() => onSelect(item.target, item.gameKey)}
                  className={`w-full flex items-center gap-3 transition group relative ${collapsed ? "justify-center px-2" : "px-4"} py-2`}
                  style={isActive ? { background: "rgba(139,92,246,0.1)" } : undefined}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r" style={{ background: "#a855f7" }} />}
                  <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? "#a855f7" : "rgba(255,255,255,0.45)" }} />
                  {!collapsed && (
                    <span className="text-xs font-medium flex-1 text-left transition"
                      style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.5)" }}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* VIP card */}
      {!collapsed && <VIPCard coins={coins} vipTier={vipTier} />}
      {collapsed && (
        <div className="shrink-0 p-2 flex justify-center">
          <Crown className="w-5 h-5" style={{ color: vipTier?.color || "#a855f7" }} />
        </div>
      )}
    </aside>
  );
}

function VIPCard({ coins, vipTier }) {
  const tier = vipTier || VIP_TIERS[0];
  const nextTier = VIP_TIERS.find(t => t.min > coins) || VIP_TIERS[0];
  const progress = Math.min(100, ((coins - tier.min) / (nextTier.min - tier.min)) * 100);

  return (
    <div className="shrink-0 m-3 p-3 rounded-2xl"
      style={{ background: `linear-gradient(135deg, ${tier.color}15, rgba(10,10,14,0.8))`, border: `1px solid ${tier.color}30` }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${tier.color}20` }}>
          <Crown className="w-4 h-4" style={{ color: tier.color }} />
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-white/40">Niveau VIP</p>
          <p className="text-xs font-black" style={{ color: tier.color }}>{tier.name}</p>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${tier.color}, ${nextTier.color || "#a855f7"})` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-white/40">→ {nextTier.name}</span>
        <span className="text-[10px] font-mono font-bold" style={{ color: "#fbbf24" }}>{coins.toLocaleString()}</span>
      </div>
    </div>
  );
}