import React from "react";
import { Gamepad2, Plus } from "lucide-react";
import PlayerAdCard from "./PlayerAdCard";

export default function PlayerSearch({ players, loading, currentUser, onDelete, onBoost, onEdit, trixBalance, onPostClick }) {
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
        <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
          {players.map((p) => (
            <PlayerAdCard
              key={p.id}
              player={p}
              currentUser={currentUser}
              onDelete={onDelete}
              onBoost={onBoost}
              onEdit={onEdit}
              trixBalance={trixBalance}
            />
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