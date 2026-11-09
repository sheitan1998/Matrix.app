import React from "react";
import { Sparkles, Youtube, Twitch } from "lucide-react";

export const CREATOR_PLATFORMS = {
  youtube: { key: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000" },
  twitch: { key: "twitch", label: "Twitch", icon: Twitch, color: "#9146FF" },
};

const CARDS = [
  { key: null, label: "Toutes", icon: Sparkles, color: "#a855f7" },
  { key: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000" },
  { key: "twitch", label: "Twitch", icon: Twitch, color: "#9146FF" },
];

export default function CreatorPlatformCards({ selected, onSelect, counts = {}, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {CARDS.map((card) => {
        const isSelected = selected === card.key;
        const Icon = card.icon;
        const count = counts[card.key || "all"] || 0;
        return (
          <button
            key={card.label}
            onClick={() => onSelect(card.key)}
            className="relative h-28 rounded-xl overflow-hidden transition group text-left"
            style={{
              background: isSelected
                ? `linear-gradient(135deg, ${card.color}33, rgba(18,9,28,0.8))`
                : "rgba(18,9,28,0.6)",
              border: `1px solid ${isSelected ? `${card.color}aa` : "rgba(138,79,255,0.15)"}`,
              boxShadow: isSelected
                ? `0 0 20px ${card.color}45, inset 0 0 18px ${card.color}15`
                : `0 0 10px ${card.color}12`,
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
              <Icon
                className="w-6 h-6 mb-1.5 transition group-hover:scale-110"
                style={{ color: card.color, filter: `drop-shadow(0 0 6px ${card.color}aa)` }}
              />
              <span className="text-xs font-black text-white tracking-wider uppercase">{card.label}</span>
              <span className="text-[9px] text-white/40 mt-0.5">
                {count} chaîne{count !== 1 ? "s" : ""}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}