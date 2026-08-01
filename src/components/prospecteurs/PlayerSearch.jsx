import React from "react";
import { Gamepad2, Users, Clock, ExternalLink, Plus } from "lucide-react";

export default function PlayerSearch({ players, loading, onPostClick }) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      style={{
        background: "rgba(18, 9, 28, 0.6)",
        border: "1px solid rgba(138, 79, 255, 0.25)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Gamepad2 className="w-4 h-4" style={{ color: "#8a4fff" }} />
        <h2 className="text-xs font-black tracking-wider uppercase text-white">
          Recherche Joueur
        </h2>
        <span className="text-[9px] text-white/40 ml-auto">
          {players.length} annonce{players.length > 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-lg animate-pulse"
              style={{ background: "rgba(138, 79, 255, 0.05)" }}
            />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-white/40 mb-3">Aucune recherche de joueur publiée</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
          {players.map((p) => (
            <div
              key={p.id}
              className="rounded-lg p-3 transition"
              style={{
                background: "rgba(138, 79, 255, 0.05)",
                border: "1px solid rgba(138, 79, 255, 0.1)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
                >
                  {p.author_avatar ? (
                    <img src={p.author_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    p.author_name?.[0]?.toUpperCase() || "J"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {p.author_name || "Joueur"}
                  </p>
                  {p.game && (
                    <p className="text-[9px] text-white/40">{p.game}</p>
                  )}
                </div>
                {p.discord_link && (
                  <a
                    href={p.discord_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-6 h-6 rounded-md flex items-center justify-center transition tap-sm"
                    style={{ background: "rgba(88, 101, 242, 0.15)", color: "#5865F2" }}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2 mb-2">
                {p.description}
              </p>
              <div className="flex items-center gap-3 text-[9px] text-white/40">
                {p.player_count_needed > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Users className="w-2.5 h-2.5" />
                    {p.player_count_needed} joueur{p.player_count_needed > 1 ? "s" : ""}
                  </span>
                )}
                {p.availability_hours && (
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {p.availability_hours}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onPostClick}
        className="w-full mt-4 h-9 rounded-lg text-xs font-black tracking-wider uppercase transition flex items-center justify-center gap-1.5 tap-sm"
        style={{
          background: "linear-gradient(135deg, #8a4fff, #5b21b6)",
          color: "#fff",
          boxShadow: "0 0 15px rgba(138, 79, 255, 0.3)",
        }}
      >
        <Plus className="w-3.5 h-3.5" />
        Poster votre recherche
      </button>
    </div>
  );
}