import React from "react";
import { Search, Users, Home } from "lucide-react";
import { Link } from "react-router-dom";
import HeaderActions from "@/components/layout/HeaderActions";

export default function CasinoTopbar({ balance, onVipClub, onSettings, playersOnline }) {
  const online = playersOnline || 18432;
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 py-2.5"
      style={{
        background: "rgba(8,8,12,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Link to="/" className="flex items-center gap-1.5 h-9 px-3 rounded-xl shrink-0 transition"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <Home className="w-4 h-4 text-white/60" />
        <span className="text-xs font-bold text-white/60 hidden sm:inline">Retour</span>
      </Link>

      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
        <input
          placeholder="Rechercher un jeu..."
          className="w-full h-9 pl-9 pr-3 rounded-xl text-xs text-white placeholder:text-white/30 outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
      </div>

      <div
        className="hidden md:flex items-center gap-1.5 px-3 h-9 rounded-xl shrink-0"
        style={{
          background: "rgba(34,197,94,0.06)",
          border: "1px solid rgba(34,197,94,0.15)",
        }}
      >
        <Users className="w-3.5 h-3.5 text-green-400" />
        <span className="text-xs font-bold text-green-400">{online.toLocaleString()}</span>
      </div>

      <div
        className="flex items-center gap-1.5 h-9 rounded-xl px-3 shrink-0"
        style={{
          background: "rgba(251,191,36,0.06)",
          border: "1px solid rgba(251,191,36,0.15)",
        }}
      >
        <span className="text-xs font-mono font-black" style={{ color: "#fbbf24" }}>
          {balance.toLocaleString()}
        </span>
        <span className="text-[10px] font-bold" style={{ color: "#fbbf24" }}>MC</span>
      </div>

      <HeaderActions />
    </header>
  );
}