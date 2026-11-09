import React from "react";
import { Sparkles, Youtube, Twitch, Music2, Instagram } from "lucide-react";

export const CREATOR_PLATFORMS = {
  youtube: { key: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000" },
  twitch: { key: "twitch", label: "Twitch", icon: Twitch, color: "#9146FF" },
  tiktok: { key: "tiktok", label: "TikTok", icon: Music2, color: "#25F4EE" },
  instagram: { key: "instagram", label: "Instagram", icon: Instagram, color: "#E1306C" },
};

export const CREATOR_PLATFORM_KEYS = Object.keys(CREATOR_PLATFORMS);

const CARDS = [
  { key: null, label: "Toutes", icon: Sparkles, color: "#a855f7" },
  ...CREATOR_PLATFORM_KEYS.map((key) => CREATOR_PLATFORMS[key]),
];

export default function CreatorPlatformCards({ selected, onSelect, counts = {}, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
      {CARDS.map((card) => {
        const isSelected = selected === card.key;
        const Icon = card.icon;
        const count = counts[card.key || "all"] || 0;
        return (
          <button
            key={card.label}
            onClick={() => onSelect(card.key)}
            className="relative h-24 rounded-xl overflow-hidden transition group text-left"
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
            <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
              <Icon
                className="w-5 h-5 mb-1 transition group-hover:scale-110"
                style={{ color: card.color, filter: `drop-shadow(0 0 6px ${card.color}aa)` }}
              />
              <span className="text-[11px] font-black text-white tracking-wider uppercase">{card.label}</span>
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