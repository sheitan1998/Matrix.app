import React from "react";
import { Trophy, ArrowUp } from "lucide-react";
import { CREATOR_PLATFORMS } from "./CreatorPlatformCards";
import { resolveCreatorVisuals } from "@/lib/creatorDefaults";

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
            <div key={i} className="h-[60px] rounded-lg animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="py-6 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-1 text-white/10" />
          <p className="text-[10px] text-white/30">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {creators.map((creator, i) => {
            const rankStyle = i < 3 ? RANK_STYLES[i] : null;
            const platform = CREATOR_PLATFORMS[creator.platform] || CREATOR_PLATFORMS.youtube;
            const PlatformIcon = platform.icon;
            const visuals = resolveCreatorVisuals(creator);
            return (
              <a
                key={creator.id}
                href={creator.channel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center gap-2.5 px-2.5 h-[60px] rounded-lg overflow-hidden transition hover:brightness-110"
                style={{
                                  background: `linear-gradient(135deg, #1a0a2e, ${accentColor}33)`,
                                  border: `1px solid ${platform.color}40`,
                }}
              >
                {visuals.banner_url && (
                  <div
                    className="absolute inset-y-0 right-0 w-[70%] pointer-events-none"
                    style={{
                      WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 35%, #000 100%)",
                      maskImage: "linear-gradient(90deg, transparent 0%, #000 35%, #000 100%)",
                    }}
                  >
                    <img
                      src={visuals.banner_url}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="w-full h-full object-contain object-right"
                    />
                  </div>
                )}
                <div
                  className="absolute inset-0 pointer-events-none"
                                  style={{ background: "linear-gradient(90deg, rgba(10,5,15,0.65) 0%, rgba(10,5,15,0.2) 55%, rgba(10,5,15,0.05) 100%)" }}
                />
                <div
                  className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                  style={{
                    background: rankStyle ? rankStyle.bg : "rgba(138,79,255,0.1)",
                    color: rankStyle ? "#fff" : "rgba(255,255,255,0.4)",
                    boxShadow: rankStyle ? `0 0 6px ${rankStyle.glow}` : "none",
                  }}
                >
                  {i + 1}
                </div>
                <div
                  className="relative z-10 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${platform.color}, #1a0a2e)`,
                    border: `1.5px solid ${platform.color}`,
                    boxShadow: `0 0 8px ${platform.color}bb`,
                  }}
                >
                  {visuals.avatar_url ? (
                    <img src={visuals.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    creator.name?.[0]?.toUpperCase() || "C"
                  )}
                </div>
                <span className="relative z-10 flex-1 min-w-0 text-sm font-bold text-white truncate" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>{creator.name}</span>
                <PlatformIcon className="relative z-10 w-3.5 h-3.5 shrink-0" style={{ color: platform.color }} />
                <span
                  className="relative z-10 shrink-0 text-xs font-black flex items-center gap-1 px-2.5 py-0.5 rounded-full"
                                    style={{ color: accentColor, background: "rgba(18,9,28,0.85)", border: `1px solid ${accentColor}80`, boxShadow: `0 0 8px ${accentColor}55` }}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
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