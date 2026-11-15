import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Radio } from "lucide-react";

export default function OpenGameHero({ game }) {
  const accent = game.accent || "#a855f7";
  return (
    <div className="relative rounded-2xl overflow-hidden mb-5" style={{ background: "#0a0512", border: `1px solid ${accent}33` }}>
      <img
        src={game.image_url}
        alt={game.name}
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        style={{ filter: "blur(1px)" }}
      />
      <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, #0a0512 10%, rgba(10,5,18,0.75) 55%, ${accent}22 100%)` }} />

      <div className="relative p-5">
        <Link to="/tuto-gaming" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition mb-4 tap-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[11px] font-bold">Tous les jeux</span>
        </Link>

        <div className="flex items-start gap-4">
          <img
            src={game.image_url}
            alt={`Jaquette ${game.name}`}
            className="hidden sm:block w-28 rounded-lg object-cover shrink-0"
            style={{ border: `1px solid ${accent}55` }}
          />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">{game.name}</h1>
            <p className="text-[11px] text-white/50 mt-1">
              {game.genre} · {game.publisher}
            </p>
            <p className="text-xs text-white/60 mt-2 max-w-xl leading-relaxed">{game.description}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.35)" }}>
                <Radio className="w-3 h-3" /> Disponible
              </span>
              <span className="px-2 py-1 rounded-full text-[9px] font-bold text-white/50" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Source : {game.source}
              </span>
              <span className="px-2 py-1 rounded-full text-[9px] font-bold text-white/50" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                0 clé API
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}