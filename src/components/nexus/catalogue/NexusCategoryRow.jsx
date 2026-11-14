import React from "react";
import {
  Swords, Compass, Car, Trophy, Puzzle, Gamepad2, Castle, Settings2, Smile, Brain, Users,
} from "lucide-react";

const ICONS = {
  Tous: Gamepad2,
  Action: Swords,
  Aventure: Compass,
  Course: Car,
  Sport: Trophy,
  Puzzle: Puzzle,
  Arcade: Gamepad2,
  Stratégie: Castle,
  Simulation: Settings2,
  Casual: Smile,
  Réflexion: Brain,
  Multijoueur: Users,
};

export default function NexusCategoryRow({ categories, value, onChange }) {
  return (
    <section>
      <h2 className="text-xs font-black tracking-wider uppercase text-white mb-3">Explorer le catalogue</h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-6 gap-2">
        {categories.map((category) => {
          const Icon = ICONS[category] || Gamepad2;
          const active = value === category;
          return (
            <button
              key={category}
              onClick={() => onChange(category)}
              className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition tap-sm"
              style={{
                background: active ? "rgba(168,85,247,0.22)" : "rgba(18,9,28,0.85)",
                border: `1px solid ${active ? "rgba(168,85,247,0.7)" : "rgba(168,85,247,0.18)"}`,
                boxShadow: active ? "0 0 14px rgba(168,85,247,0.25)" : "none",
              }}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: active ? "#e9d5ff" : "#a855f7", filter: "drop-shadow(0 0 5px rgba(168,85,247,0.6))" }}
              />
              <span className={`text-[9px] font-bold truncate max-w-full px-1 ${active ? "text-white" : "text-white/50"}`}>
                {category}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}