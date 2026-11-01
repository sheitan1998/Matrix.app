import React from "react";
import GameImageFallback from "@/components/tuto-gaming/GameImageFallback";

const VALHEIM_LOGO = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#0a050f"/><text x="60" y="75" font-size="20" font-weight="900" fill="#4ADE80" text-anchor="middle" font-family="serif" style="filter:drop-shadow(0 0 8px #4ADE8088)">VALHEIM</text></svg>`);

export default function ValheimEquipmentCard({ item, onClick }) {
  return (
    <button
      onClick={() => onClick(item)}
      className="group relative aspect-square overflow-hidden rounded-xl text-left transition-all"
      style={{ border: `1px solid ${item.color}44`, boxShadow: `0 0 12px ${item.color}15` }}
    >
      <GameImageFallback
        src={item.image}
        alt={item.name}
        gameName="VALHEIM"
        accentColor={item.color}
        logoUrl={VALHEIM_LOGO}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.9) 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase mb-1" style={{ background: `${item.color}33`, color: item.color }}>
          T{item.tier}
        </span>
        <h3 className="text-xs font-black text-white leading-tight">{item.name}</h3>
        {item.damage && <p className="text-[10px] text-white/50">{item.damage} DMG</p>}
        {item.armor && <p className="text-[10px] text-white/50">{item.armor} ARM</p>}
        {item.health && <p className="text-[10px] text-white/50">+{item.health} HP</p>}
      </div>
    </button>
  );
}