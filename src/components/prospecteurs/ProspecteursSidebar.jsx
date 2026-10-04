import React from "react";
import { Link } from "react-router-dom";
import { Server, Users, Search } from "lucide-react";

export default function ProspecteursSidebar({ active = "servers" }) {
  return (
    <div className="w-16 sm:w-20 shrink-0 sticky top-16 self-start flex flex-col gap-1 p-2">
      <Link
        to="/prospecteurs"
        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition ${active === "servers" ? "text-white" : "text-white/40 hover:text-white"}`}
        style={active === "servers" ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.02)" }}
      >
        <Server className="w-5 h-5" />
        <span className="text-[9px] font-bold text-center">Serveurs</span>
      </Link>
      <Link
        to="/recherche-joueur"
        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition ${active === "players" ? "text-white" : "text-white/40 hover:text-white"}`}
        style={active === "players" ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.02)" }}
      >
        <Users className="w-5 h-5" />
        <span className="text-[9px] font-bold text-center">Joueurs</span>
      </Link>
      <Link
        to="/recherche-createur"
        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition ${active === "creators" ? "text-white" : "text-white/40 hover:text-white"}`}
        style={active === "creators" ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.02)" }}
      >
        <Search className="w-5 h-5" />
        <span className="text-[9px] font-bold text-center">Créateurs</span>
      </Link>
    </div>
  );
}