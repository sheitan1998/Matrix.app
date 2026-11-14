import React from "react";
import { Play } from "lucide-react";

export default function NexusGameCard({ game, onPlay }) {
  return (
    <button
      onClick={() => onPlay(game)}
      className="group relative rounded-xl overflow-hidden text-left transition hover:-translate-y-0.5 tap-sm"
      style={{ background: "rgba(18,9,28,0.9)", border: "1px solid rgba(168,85,247,0.22)" }}>
      
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={game.thumb}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
        
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(10,5,15,0) 45%, rgba(10,5,15,0.9) 100%)" }} />
        
        <span
          className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
          style={{ background: "rgba(10,5,15,0.75)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.4)" }}>
          
          {game.category}
        </span>
        <span
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          style={{ background: "rgba(76,29,149,0.35)" }}>
          
          <span
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-black text-white"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", boxShadow: "0 0 18px rgba(168,85,247,0.6)" }}>
            
            <Play className="w-3.5 h-3.5 fill-current" /> Jouer
          </span>
        </span>
      </div>

      <div className="p-3">
        <p className="text-sm font-black text-white truncate">{game.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[9px] font-semibold text-white/35 truncate">{game.tags.slice(0, 2).join(" · ")}</span>
          

          
        </div>
        <span
          className="mt-2 flex items-center justify-center gap-1.5 h-8 rounded-lg text-[10px] font-black uppercase tracking-wider text-white transition group-hover:opacity-90"
          style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.85), rgba(109,40,217,0.85))" }}>
          
          <Play className="w-3 h-3 fill-current" /> Jouer
        </span>
      </div>
    </button>);

}