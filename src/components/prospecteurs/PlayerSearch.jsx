import React, { useState } from "react";
import { ChevronDown, Plus, Minus, Gamepad2, Medal } from "lucide-react";

const GAMES = ["Valorant", "League of Legends", "Fortnite", "CS2", "Apex Legends", "Minecraft", "Rocket League", "Autre"];
const RANKS = ["Fer", "Bronze", "Argent", "Or", "Platine", "Diamant", "Master", "Predator", "Peu importe"];

export default function PlayerSearch({ onPostClick }) {
  const [game, setGame] = useState("");
  const [rank, setRank] = useState("");
  const [availability, setAvailability] = useState(1);

  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      style={{
        background: "rgba(18, 9, 28, 0.6)",
        border: "1px solid rgba(138, 79, 255, 0.25)",
      }}
    >
      <h2 className="text-xs font-black tracking-wider uppercase text-white mb-4">
        Recherche Joueur
      </h2>

      <div className="space-y-3">
        {/* Game dropdown */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
            <Gamepad2 className="w-3 h-3" />
            Sélectionner le jeu
          </label>
          <div className="relative">
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="w-full h-10 pl-3 pr-8 rounded-lg text-xs font-medium text-white appearance-none cursor-pointer outline-none"
              style={{
                background: "rgba(138, 79, 255, 0.05)",
                border: "1px solid rgba(138, 79, 255, 0.2)",
              }}
            >
              <option value="" style={{ background: "#12091c" }}>Tous les jeux</option>
              {GAMES.map((g) => (
                <option key={g} value={g} style={{ background: "#12091c" }}>{g}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* Rank dropdown */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
            <Medal className="w-3 h-3" />
            Sélectionner le rank
          </label>
          <div className="relative">
            <select
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              className="w-full h-10 pl-3 pr-8 rounded-lg text-xs font-medium text-white appearance-none cursor-pointer outline-none"
              style={{
                background: "rgba(138, 79, 255, 0.05)",
                border: "1px solid rgba(138, 79, 255, 0.2)",
              }}
            >
              <option value="" style={{ background: "#12091c" }}>Tous les ranks</option>
              {RANKS.map((r) => (
                <option key={r} value={r} style={{ background: "#12091c" }}>{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* Availability slider */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
            Sélectionner la disponibilité
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAvailability((v) => Math.max(1, v - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition tap-sm"
              style={{ background: "rgba(138, 79, 255, 0.1)", border: "1px solid rgba(138, 79, 255, 0.2)" }}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1 relative h-8 rounded-lg overflow-hidden" style={{ background: "rgba(138, 79, 255, 0.05)", border: "1px solid rgba(138, 79, 255, 0.2)" }}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${(availability / 5) * 100}%`,
                  background: "linear-gradient(90deg, #8a4fff, #5b21b6)",
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {availability} / 5
              </span>
            </div>
            <button
              onClick={() => setAvailability((v) => Math.min(5, v + 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition tap-sm"
              style={{ background: "rgba(138, 79, 255, 0.1)", border: "1px solid rgba(138, 79, 255, 0.2)" }}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Post button */}
        <button
          onClick={onPostClick}
          className="w-full h-10 rounded-lg text-xs font-black tracking-wider uppercase transition tap-sm"
          style={{
            background: "linear-gradient(135deg, #8a4fff, #5b21b6)",
            color: "#fff",
            boxShadow: "0 0 15px rgba(138, 79, 255, 0.3)",
          }}
        >
          Poster votre annonce
        </button>
      </div>
    </div>
  );
}