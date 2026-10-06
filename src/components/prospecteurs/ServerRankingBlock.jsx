import React from "react";
import { Link } from "react-router-dom";
import { Trophy, ArrowUp, Flame } from "lucide-react";
import { serverScore } from "@/lib/serverDirectory";

const RANK_STYLES = [
  { bg: "linear-gradient(135deg, #fbbf24, #f59e0b)", glow: "rgba(251,191,36,0.3)" },
  { bg: "linear-gradient(135deg, #e5e7eb, #9ca3af)", glow: "rgba(229,231,235,0.3)" },
  { bg: "linear-gradient(135deg, #d97706, #b45309)", glow: "rgba(217,119,6,0.3)" },
];

export default function ServerRankingBlock({ title, icon: Icon = Trophy, servers, accentColor, loading, skeletonCount = 5, emptyText = "Aucun serveur classé" }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(18,9,28,0.6)", border: `1px solid ${accentColor}30` }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}>
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <h3 className="text-xs font-black tracking-wider uppercase text-white">{title}</h3>
        <span className="text-[8px] text-white/30 ml-auto">Votes du mois</span>
      </div>

      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
          ))}
        </div>
      ) : servers.length === 0 ? (
        <div className="py-6 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-1 text-white/10" />
          <p className="text-[10px] text-white/30">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {servers.map((server, i) => {
            const rankStyle = i < 3 ? RANK_STYLES[i] : null;
            const logoUrl = server.logo_url || server.profile_image || server.server_icon;
            return (
              <Link
                key={server.id}
                to={`/servers/${server.slug || server.id}`}
                className="flex items-center gap-2 p-1.5 rounded-lg transition hover:bg-white/5"
                style={{ background: i < 3 ? `${accentColor}08` : "transparent" }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                  style={{ background: rankStyle ? rankStyle.bg : "rgba(138,79,255,0.1)", color: rankStyle ? "#fff" : "rgba(255,255,255,0.4)", boxShadow: rankStyle ? `0 0 6px ${rankStyle.glow}` : "none" }}
                >
                  {i + 1}
                </div>
                <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}>
                  {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-cover" /> : (server.title?.[0]?.toUpperCase() || "S")}
                </div>
                <span className="flex-1 text-[10px] font-bold text-white/80 truncate">{server.title}</span>
                <span className="text-[9px] font-black flex items-center gap-0.5" style={{ color: accentColor }}>
                  <ArrowUp className="w-2.5 h-2.5" />
                  {serverScore(server)}
                </span>
                {server.is_boosted && <Flame className="w-2.5 h-2.5" style={{ color: "#fbbf24" }} />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}