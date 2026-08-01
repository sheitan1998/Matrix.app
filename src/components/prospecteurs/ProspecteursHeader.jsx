import React from "react";
import { Link } from "react-router-dom";
import { Gem } from "lucide-react";

export default function ProspecteursHeader({ user, trixBalance }) {
  const pseudo = user?.pseudo || user?.full_name || user?.email?.split("@")[0] || "Joueur";

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3"
      style={{
        background: "rgba(18, 9, 28, 0.95)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(138, 79, 255, 0.2)",
      }}
    >
      {/* Left: MATRIX logo */}
      <Link to="/" className="flex items-center gap-2 tap-sm">
        <span className="text-xl font-black text-white tracking-tight">
          MATRI<span style={{ color: "#8a4fff" }}>X</span>
        </span>
      </Link>

      {/* Center: RECHERCHE PROSPECTEURS pill */}
      <div
        className="hidden sm:flex items-center px-5 py-1.5 rounded-full"
        style={{
          background: "rgba(138, 79, 255, 0.1)",
          border: "1px solid rgba(138, 79, 255, 0.3)",
        }}
      >
        <span className="text-[11px] font-black tracking-[0.2em] uppercase text-white">
          Recherche Prospecteurs
        </span>
      </div>

      {/* Right: Trix Store + User profile */}
      <div className="flex items-center gap-2">
        <Link
          to="/trix-store"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition tap-sm"
          style={{
            background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))",
            border: "1px solid rgba(251,191,36,0.3)",
          }}
        >
          <Gem className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />
          <span className="text-[10px] font-black tracking-wider uppercase hidden sm:inline" style={{ color: "#fbbf24" }}>
            Boutique
          </span>
        </Link>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={pseudo} className="w-full h-full object-cover" />
          ) : (
            pseudo[0]?.toUpperCase()
          )}
        </div>
        <div className="hidden sm:flex flex-col items-end gap-0.5">
          <span className="text-xs font-bold text-white">{pseudo}</span>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[8px] font-black px-1.5 py-0.5 rounded"
              style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#1a1505" }}
            >
              PREMIUM
            </span>
            <div className="flex items-center gap-0.5">
              <Gem className="w-3 h-3" style={{ color: "#8a4fff" }} />
              <span className="text-xs font-mono font-bold" style={{ color: "#8a4fff" }}>
                {(trixBalance || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}