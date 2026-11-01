import React from "react";
import GameImageFallback from "@/components/tuto-gaming/GameImageFallback";

const VALHEIM_LOGO = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#0a050f"/><text x="60" y="55" font-size="14" font-weight="900" fill="#8B7355" text-anchor="middle" font-family="serif" style="filter:drop-shadow(0 0 6px #8B735588)">VALHEIM</text><text x="60" y="80" font-size="22" font-weight="900" fill="#4ADE80" text-anchor="middle" font-family="serif" style="filter:drop-shadow(0 0 8px #4ADE8088)">&#9876;</text></svg>`);

export default function ValheimBossCard({ boss, onClick }) {
  return (
    <button
      onClick={() => onClick(boss)}
      className="group relative aspect-[4/3] overflow-hidden rounded-xl text-left transition-all"
      style={{ border: `1px solid ${boss.color}44`, boxShadow: `0 0 12px ${boss.color}15` }}
    >
      <GameImageFallback
        src={boss.image}
        alt={boss.name}
        gameName="VALHEIM"
        accentColor={boss.color}
        logoUrl={VALHEIM_LOGO}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.9) 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-1" style={{ background: `${boss.color}33`, color: boss.color }}>
          {boss.biome}
        </span>
        <h3 className="text-sm font-black text-white leading-tight">{boss.name}</h3>
        <p className="text-[10px] text-white/50 mt-0.5">{boss.hp} HP</p>
      </div>
    </button>
  );
}