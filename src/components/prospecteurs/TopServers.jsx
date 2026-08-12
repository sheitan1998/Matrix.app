import React from "react";
import { Trophy } from "lucide-react";
import ServerCard from "./ServerCard";

export default function TopServers({ servers, loading, onVote, onDelete, onEdit, currentUser, type = "all" }) {
  // Filter by server_type field (consistent with Prospecteurs filtering)
  const filtered = type === "all" ? servers : servers.filter(s =>
    type === "discord" ? s.server_type === "discord" : s.server_type !== "discord"
  );
  // Sort by combined score (votes + boosts*2) descending, take top 10
  const top10 = [...filtered]
    .sort((a, b) => ((b.votes || 0) + (b.boosts || 0) * 2) - ((a.votes || 0) + (a.boosts || 0) * 2))
    .slice(0, 10);

  const title = type === "discord" ? "Top 10 Serveurs Discord" : type === "nexus" ? "Top 10 Serveurs Nexus" : "Top 10 Serveurs";
  const accentColor = type === "discord" ? "#5865F2" : "#22c55e";

  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      style={{
        background: "rgba(18, 9, 28, 0.6)",
        border: `1px solid ${accentColor}40`,
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4" style={{ color: accentColor }} />
        <h2 className="text-xs font-black tracking-wider uppercase text-white">
          {title}
        </h2>
        <span className="text-[9px] text-white/40 ml-auto hidden sm:inline">
          Les mieux votés et boostés
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: "rgba(138, 79, 255, 0.05)" }} />
          ))}
        </div>
      ) : top10.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-white/40">Aucun serveur publié pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {top10.map((server, i) => (
            <div key={server.id} className="relative">
              {/* Rank badge */}
              <div
                className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                style={{
                  background: i < 3
                    ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                    : "linear-gradient(135deg, #8a4fff, #5b21b6)",
                  color: "#fff",
                  boxShadow: i < 3
                    ? "0 0 12px rgba(251,191,36,0.4)"
                    : "0 0 8px rgba(138,79,255,0.3)",
                  border: "2px solid #120a1f",
                }}
              >
                {i + 1}
              </div>
              <ServerCard
                server={server}
                onVote={onVote}
                onDelete={onDelete}
                onEdit={onEdit}
                currentUser={currentUser}
              />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}