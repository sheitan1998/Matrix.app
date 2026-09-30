import React, { useState, useMemo } from "react";
import { Search, X, Gamepad2 } from "lucide-react";

// Liste des jeux populaires proposés en accès rapide
const GAME_PICKER_GAMES = [
  { label: "Farming Simulator 25", icon: "🚜" },
  { label: "Farming Simulator 22", icon: "🚜" },
  { label: "Minecraft", icon: "⛏️" },
  { label: "Fortnite", icon: "🏗️" },
  { label: "Valorant", icon: "🎯" },
  { label: "League of Legends", icon: "🏆" },
  { label: "Counter-Strike 2", icon: "🔫" },
  { label: "GTA V", icon: "🚗" },
  { label: "Red Dead Redemption 2", icon: "🤠" },
  { label: "Rocket League", icon: "⚽" },
  { label: "Genshin Impact", icon: "⚔️" },
  { label: "Elden Ring", icon: "⚔️" },
  { label: "Baldur's Gate 3", icon: "🐉" },
  { label: "Cyberpunk 2077", icon: "🌃" },
  { label: "The Witcher 3", icon: "⚔️" },
  { label: "Forza Horizon 5", icon: "🏎️" },
  { label: "EA FC 25", icon: "⚽" },
  { label: "Roblox", icon: "🎮" },
  { label: "World of Warcraft", icon: "⚔️" },
  { label: "Overwatch 2", icon: "🦸" },
  { label: "Diablo IV", icon: "😈" },
  { label: "Hearthstone", icon: "🃏" },
  { label: "Dota 2", icon: "⚔️" },
  { label: "Apex Legends", icon: "🎯" },
  { label: "Among Us", icon: "👨‍🚀" },
  { label: "Microsoft Flight Simulator", icon: "✈️" },
];

export default function GamePicker({ value, onChange, disabled }) {
  const [search, setSearch] = useState("");

  const filteredGames = useMemo(() => {
    if (!search.trim()) return GAME_PICKER_GAMES;
    const q = search.toLowerCase();
    return GAME_PICKER_GAMES.filter((g) => g.label.toLowerCase().includes(q));
  }, [search]);

  const selectGame = (label) => {
    onChange(label);
    setSearch("");
  };

  return (
    <div className="space-y-3">
      {/* Custom input + search */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
            placeholder="Rechercher un jeu..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder:text-white/30 outline-none disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="ou saisir un jeu personnalisé"
          maxLength={80}
          className="flex-1 px-3 py-2 rounded-xl text-xs text-white placeholder:text-white/30 outline-none disabled:opacity-40"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.3)" }}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            disabled={disabled}
            className="px-2.5 py-2 rounded-xl text-xs font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-40 tap-sm"
            title="Effacer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick-pick grid */}
      <div className="flex flex-wrap gap-1.5">
        {filteredGames.map((game) => {
          const isActive = value === game.label;
          return (
            <button
              key={game.label}
              onClick={() => selectGame(game.label)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition disabled:opacity-40"
              style={{
                background: isActive ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
                border: isActive ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
                color: isActive ? "#fbbf24" : "rgba(255,255,255,0.7)",
              }}
            >
              <span className="text-sm">{game.icon}</span>
              {game.label}
            </button>
          );
        })}
        {filteredGames.length === 0 && (
          <p className="text-[11px] text-white/30 py-2">Aucun jeu trouvé pour « {search} »</p>
        )}
      </div>

      {/* Current status preview */}
      {value && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <Gamepad2 className="w-3.5 h-3.5 shrink-0" style={{ color: "#3b82f6" }} />
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-white/80 truncate">Joue à {value}</p>
            <p className="text-[9px] text-white/40">Visible par les membres de vos serveurs</p>
          </div>
        </div>
      )}
    </div>
  );
}