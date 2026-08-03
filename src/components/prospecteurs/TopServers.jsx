import React from "react";
import { Trophy, Flame, Users, Plus } from "lucide-react";

export default function TopServers({ servers, loading, onCreateClick }) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      style={{
        background: "rgba(18, 9, 28, 0.6)",
        border: "1px solid rgba(138, 79, 255, 0.25)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4" style={{ color: "#8a4fff" }} />
        <h2 className="text-xs font-black tracking-wider uppercase text-white">
          Top 10 Serveurs
        </h2>
        <span className="text-[9px] text-white/40 ml-auto hidden sm:inline">
          Les mieux votés et boostés
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg animate-pulse"
              style={{ background: "rgba(138, 79, 255, 0.05)" }}
            />
          ))}
        </div>
      ) : servers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-white/40">Aucun serveur publié pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {servers.slice(0, 10).map((server, i) => (
            <div
              key={server.id}
              className="flex items-center gap-2 p-2 rounded-lg transition"
              style={{
                background: server.is_boosted
                  ? "rgba(138, 79, 255, 0.08)"
                  : "rgba(138, 79, 255, 0.03)",
                border: "1px solid rgba(138, 79, 255, 0.1)",
              }}
            >
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
                style={{
                  background:
                    i < 3
                      ? "linear-gradient(135deg, #8a4fff, #5b21b6)"
                      : "rgba(138, 79, 255, 0.1)",
                  color: i < 3 ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-white break-words">{server.title}</p>
                  {server.is_boosted && (
                    <Flame className="w-3 h-3 shrink-0" style={{ color: "#fbbf24" }} />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[9px] text-white/40">
                  <span>Votes: {server.votes || 0}</span>
                  <span>Boosts: {server.boosts || 0}</span>
                  {server.max_players > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Users className="w-2 h-2" />
                      {server.players_count || 0}/{server.max_players}
                    </span>
                  )}
                </div>
                {server.description && (
                  <p className="text-[9px] text-white/50 leading-relaxed mt-0.5 break-words">{server.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onCreateClick}
        className="w-full mt-4 h-9 rounded-lg text-xs font-black tracking-wider uppercase transition flex items-center justify-center gap-1.5 tap-sm"
        style={{
          background: "transparent",
          border: "1.5px solid rgba(138, 79, 255, 0.4)",
          color: "#8a4fff",
        }}
      >
        <Plus className="w-3.5 h-3.5" />
        Publier votre serveur
      </button>
    </div>
  );
}