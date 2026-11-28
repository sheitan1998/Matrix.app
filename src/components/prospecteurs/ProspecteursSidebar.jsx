import React from "react";
import { Link } from "react-router-dom";
import { Server, Users, Sparkles, Zap } from "lucide-react";

export default function ProspecteursSidebar({ active = "servers", user, onConfigureVoteAuto }) {

  const hasVoteAuto = !!user?.has_vote_auto &&
  (!user?.vote_auto_until || new Date(user.vote_auto_until).getTime() > Date.now());

  return (
    <div className="w-24 sm:w-32 shrink-0 sticky top-16 self-start flex flex-col gap-1 p-2">
      <Link
        to="/best-serveurs"
        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition ${active === "servers" ? "text-white" : "text-white/40 hover:text-white"}`}
        style={active === "servers" ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.02)" }}>
        
        <Server className="w-5 h-5" />
        <span className="text-[9px] font-bold text-center">Serveurs</span>
      </Link>
      <Link
        to="/recherche-joueur"
        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition ${active === "players" ? "text-white" : "text-white/40 hover:text-white"}`}
        style={active === "players" ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.02)" }}>
        
        <Users className="w-5 h-5" />
        <span className="text-[9px] font-bold text-center">Joueurs</span>
      </Link>
      <Link
        to="/best-creator"
        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition ${active === "creators" ? "text-white" : "text-white/40 hover:text-white"}`}
        style={active === "creators" ? { background: "rgba(168,85,247,0.18)", border: "1px solid rgba(236,72,153,0.45)", boxShadow: "0 0 16px rgba(168,85,247,0.35)" } : { background: "rgba(255,255,255,0.02)" }}>
        
        <Sparkles
          className="w-5 h-5"
          style={{
            color: active === "creators" ? "#f0abfc" : undefined,
            filter: active === "creators"
              ? "drop-shadow(0 0 5px rgba(236,72,153,0.95)) drop-shadow(0 0 12px rgba(168,85,247,0.75))"
              : "drop-shadow(0 0 5px rgba(168,85,247,0.45))",
          }} />
        <span className="text-[9px] font-bold text-center leading-tight">Best<br />Creator</span>
      </Link>

      {/* Bouton de configuration Vote Auto — visible si Vote Auto actif */}
      {hasVoteAuto && (
        <button
          onClick={() => onConfigureVoteAuto?.()}
          className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition text-white hover:opacity-90 tap-sm"
          style={{ background: "rgba(191,0,255,0.15)", border: "1px solid rgba(191,0,255,0.3)" }}
          title="Configurer tes serveurs en Vote Auto"
        >
          <Zap className="w-5 h-5" style={{ color: "#d946ef" }} />
          <span className="text-[9px] font-bold text-center">Configurer Vote Auto</span>
        </button>
      )}

    </div>);

}