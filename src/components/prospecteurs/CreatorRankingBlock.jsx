import React from "react";
import { Trophy, ArrowUp, Youtube, Twitch } from "lucide-react";
import { CREATOR_PLATFORMS } from "./CreatorPlatformCards";

const RANK_STYLES = [
  { bg: "linear-gradient(135deg, #fbbf24, #f59e0b)", glow: "rgba(251,191,36,0.3)" },
  { bg: "linear-gradient(135deg, #e5e7eb, #9ca3af)", glow: "rgba(229,231,235,0.3)" },
  { bg: "linear-gradient(135deg, #d97706, #b45309)", glow: "rgba(217,119,6,0.3)" },
];

export default function CreatorRankingBlock({ title, creators, accentColor = "#a855f7", loading, emptyText = "Aucune chaîne classée" }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(18,9,28,0.6)", border: `1px solid ${accentColor}30` }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}>
          <Trophy className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <h3 className="text-xs font-black tracking-wider uppercase text-white">{title}</h3>
        <span className="text-[8px] text-white/30 ml-auto">Votes du mois</span>
      </div>

      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="py-6 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-1 text-white/10" />
          <p className="text-[10px] text-white/30">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {creators.map((creator, i) => {
            const rankStyle = i < 3 ? RANK_STYLES[i] : null;
            const platform = CREATOR_PLATFORMS[creator.platform] || CREATOR_PLATFORMS.youtube;
            const PlatformIcon = platform.icon;
            return (
              <a
                key={creator.id}
                href={creator.channel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-1.5 rounded-lg transition hover:bg-white/5"
                style={{ background: i < 3 ? `${accentColor}08` : "transparent" }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                  style={{
                    background: rankStyle ? rankStyle.bg : "rgba(138,79,255,0.1)",
                    color: rankStyle ? "#fff" : "rgba(255,255,255,0.4)",
                    boxShadow: rankStyle ? `0 0 6px ${rankStyle.glow}` : "none",
                  }}
                >
                  {i + 1}
                </div>
                <div
                  className="w-6 h-6 rounded overflow-hidden flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${platform.color}, #1a0a2e)` }}
                >
                  {creator.avatar_url ? (
                    <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    creator.name?.[0]?.toUpperCase() || "C"
                  )}
                </div>
                <span className="flex-1 text-[10px] font-bold text-white/80 truncate">{creator.name}</span>
                <PlatformIcon className="w-3 h-3 shrink-0" style={{ color: platform.color }} />
                <span className="text-[9px] font-black flex items-center gap-0.5" style={{ color: accentColor }}>
                  <ArrowUp className="w-2.5 h-2.5" />
                  {creator.votes_month || 0}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}