import React from "react";
import GameImageFallback from "@/components/tuto-gaming/GameImageFallback";

const VALORANT_LOGO = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#0f1923"/><text x="60" y="75" font-size="14" font-weight="900" fill="#FF4655" text-anchor="middle" font-family="sans-serif" style="filter:drop-shadow(0 0 8px #FF465588)">VALORANT</text></svg>`);

export default function ValorantWeaponCard({ weapon, onClick }) {
  const color = "#FF4655";
  const img = weapon.displayIcon;

  return (
    <button
      onClick={() => onClick(weapon)}
      className="group relative aspect-[4/3] overflow-hidden rounded-xl text-left transition-all"
      style={{ border: `1px solid ${color}44`, boxShadow: `0 0 12px ${color}15` }}
    >
      <GameImageFallback
        src={img}
        alt={weapon.displayName}
        gameName="VALORANT"
        accentColor={color}
        logoUrl={VALORANT_LOGO}
        className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.9) 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-1" style={{ background: `${color}33`, color }}>
          {weapon.category || "Arme"}
        </span>
        <h3 className="text-xs font-black text-white leading-tight">{weapon.displayName}</h3>
      </div>
    </button>
  );
}