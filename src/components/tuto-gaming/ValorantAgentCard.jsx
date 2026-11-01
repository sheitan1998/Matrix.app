import React from "react";
import GameImageFallback from "@/components/tuto-gaming/GameImageFallback";

const VALORANT_LOGO = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#0f1923"/><text x="60" y="75" font-size="14" font-weight="900" fill="#FF4655" text-anchor="middle" font-family="sans-serif" style="filter:drop-shadow(0 0 8px #FF465588)">VALORANT</text></svg>`);

const ROLE_COLORS = {
  Controller: "#9333EA",
  Duelist: "#F87171",
  Initiator: "#FBBF24",
  Sentinel: "#22D3EE",
};

export default function ValorantAgentCard({ agent, onClick }) {
  const color = ROLE_COLORS[agent.role?.displayName] || "#BF5AF2";
  const img = agent.displayIcon || agent.fullPortrait;

  return (
    <button
      onClick={() => onClick(agent)}
      className="group relative aspect-[3/4] overflow-hidden rounded-xl text-left transition-all"
      style={{ border: `1px solid ${color}44`, boxShadow: `0 0 12px ${color}15` }}
    >
      <GameImageFallback
        src={img}
        alt={agent.displayName}
        gameName="VALORANT"
        accentColor={color}
        logoUrl={VALORANT_LOGO}
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.92) 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-1" style={{ background: `${color}33`, color }}>
          {agent.role?.displayName || "Agent"}
        </span>
        <h3 className="text-sm font-black text-white leading-tight">{agent.displayName}</h3>
      </div>
    </button>
  );
}