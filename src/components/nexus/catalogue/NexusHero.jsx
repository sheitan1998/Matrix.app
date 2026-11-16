import React from "react";
import { Search, Wifi } from "lucide-react";

export default function NexusHero({ bannerUrl, search, onSearchChange, onSubmit, online }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ border: "1px solid rgba(168,85,247,0.35)", boxShadow: "0 0 30px rgba(168,85,247,0.18)" }}>
      
      <img
        src={bannerUrl}
        alt="Nexus Game online catalogue with thousands of playable games on one platform"
        className="w-full h-[240px] sm:h-[300px] object-cover" />
      
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(10,5,15,0.1) 30%, rgba(10,5,15,0.85) 100%)" }} />
      

      <div className="absolute top-3 right-3">
        <span
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider"
          style={{
            background: "rgba(10,5,15,0.7)",
            border: `1px solid ${online ? "rgba(34,197,94,0.45)" : "rgba(239,68,68,0.45)"}`,
            color: online ? "#4ade80" : "#f87171",
            backdropFilter: "blur(8px)"
          }}>
          
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: online ? "#22c55e" : "#ef4444", boxShadow: `0 0 8px ${online ? "#22c55e" : "#ef4444"}` }} />
          
          {online ? "Catalogue connecté" : "Catalogue hors ligne"}
        </span>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.();
        }}
        className="absolute left-1/2 bottom-5 -translate-x-1/2 w-[min(92%,560px)]">
        
        <div
          className="flex items-center gap-2 h-12 rounded-xl px-4"
          style={{
            background: "rgba(12,6,22,0.85)",
            border: "1px solid rgba(168,85,247,0.5)",
            boxShadow: "0 0 24px rgba(168,85,247,0.25)",
            backdropFilter: "blur(10px)"
          }}>
          
          <Search className="w-4 h-4 shrink-0" style={{ color: "#c084fc" }} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Rechercher un jeu..."
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-white placeholder:text-white/40" />
          
          <button
            type="submit"
            className="h-9 px-4 rounded-lg text-xs font-black uppercase tracking-wider text-white transition hover:opacity-90 tap-sm shrink-0"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
            
            Chercher
          </button>
        </div>
        <p className="flex items-center justify-center gap-1.5 mt-2 text-[10px] font-semibold text-white/45">
          <Wifi className="w-3 h-3" style={{ color: "#4ade80" }} />
          Catalogue synchronisé en direct
        </p>
      </form>
    </div>);

}