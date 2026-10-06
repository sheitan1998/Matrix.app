import React, { useState, useEffect } from "react";
import { Trophy, ArrowUp, Flame, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";

const RANK_STYLES = [
  { bg: "linear-gradient(135deg, #fbbf24, #f59e0b)", glow: "rgba(251,191,36,0.3)" },
  { bg: "linear-gradient(135deg, #e5e7eb, #9ca3af)", glow: "rgba(229,231,235,0.3)" },
  { bg: "linear-gradient(135deg, #d97706, #b45309)", glow: "rgba(217,119,6,0.3)" },
];

export default function Top10Monthly({ activeTab = "nexus" }) {
  const [topNexus, setTopNexus] = useState([]);
  const [topDiscord, setTopDiscord] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const allAds = await base44.entities.ServerAd.list("-created_date", 500);
        const sortByVotes = (list) =>
          [...list].sort((a, b) => {
            const scoreA = (a.votes_month || a.votes || 0) + (a.boosts || 0) * 2;
            const scoreB = (b.votes_month || b.votes || 0) + (b.boosts || 0) * 2;
            return scoreB - scoreA;
          });

        const nexus = allAds.filter((s) => {
          const st = s.server_type;
          if (st) return st === "nexus";
          const link = (s.discord_link || "").toLowerCase();
          return !link.includes("discord.gg") && !link.includes("discord.com") && !link.includes("discordapp.com");
        });

        const discord = allAds.filter((s) => {
          const st = s.server_type;
          if (st) return st === "discord";
          const link = (s.discord_link || "").toLowerCase();
          return link.includes("discord.gg") || link.includes("discord.com") || link.includes("discordapp.com");
        });

        setTopNexus(sortByVotes(nexus).slice(0, 10));
        setTopDiscord(sortByVotes(discord).slice(0, 10));
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchTop();
  }, []);

  const renderTopBlock = (title, Icon, servers, accentColor) => (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "rgba(18,9,28,0.6)",
        border: `1px solid ${accentColor}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}
        >
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <h3 className="text-xs font-black tracking-wider uppercase text-white">{title}</h3>
        <span className="text-[8px] text-white/30 ml-auto">Ce mois-ci</span>
      </div>

      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
          ))}
        </div>
      ) : servers.length === 0 ? (
        <div className="py-6 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-1 text-white/10" />
          <p className="text-[10px] text-white/30">Aucun serveur classé</p>
        </div>
      ) : (
        <div className="space-y-1">
          {servers.map((server, i) => {
            const rankStyle = i < 3 ? RANK_STYLES[i] : null;
            const initial = server.title?.[0]?.toUpperCase() || "S";
            const logoUrl = server.logo_url || server.profile_image || server.server_icon;
            const score = (server.votes_month || server.votes || 0) + (server.boosts || 0) * 2;

            return (
              <div
                key={server.id}
                className="flex items-center gap-2 p-1.5 rounded-lg transition"
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
                  style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
                >
                  {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-cover" /> : initial}
                </div>
                <span className="flex-1 text-[10px] font-bold text-white/80 truncate">{server.title}</span>
                <span className="text-[9px] font-black flex items-center gap-0.5" style={{ color: accentColor }}>
                  <ArrowUp className="w-2.5 h-2.5" />
                  {score}
                </span>
                {server.is_boosted && (
                  <Flame className="w-2.5 h-2.5" style={{ color: "#fbbf24" }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Only render the Top 10 matching the active tab
  if (activeTab === "discord") {
    return (
      <div className="mb-5">
        {renderTopBlock("Top 10 Serveurs Discord", Crown, topDiscord, "#5865F2")}
      </div>
    );
  }

  return (
    <div className="mb-5">
      {renderTopBlock("Top 10 Serveurs Nexus", Trophy, topNexus, "#22c55e")}
    </div>
  );
}