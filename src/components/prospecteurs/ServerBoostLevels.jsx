import React from "react";
import { Zap } from "lucide-react";

const BOOST_LEVELS = [
  {
    level: 1,
    requiredBoosts: 2,
    color: "#FF4081",
    crystalColor: "#F472B6",
    perks: [
      { icon: "🙂", text: "100 emplacements d'émojis" },
      { icon: "🔊", text: "24 emplacements de Soundboard" },
      { icon: "🗄️", text: "Icône de serveur animée" },
      { icon: "🎧", text: "Meilleure qualité audio" },
      { icon: "✨", text: "... et bien plus !" },
    ],
  },
  {
    level: 2,
    requiredBoosts: 10,
    color: "#9C27B0",
    crystalColor: "#C084FC",
    perks: [
      { icon: "📺", text: "Streaming haute définition" },
      { icon: "⬆️", text: "Jusqu'à 50 Mo d'uploads de fichier" },
      { icon: "🛡️", text: "Icônes de rôle personnalisées" },
      { icon: "🖼️", text: "Bannière du serveur" },
      { icon: "✨", text: "... et bien plus !" },
    ],
  },
  {
    level: 3,
    requiredBoosts: 20,
    color: "#6A1B9A",
    crystalColor: "#A855F7",
    perks: [
      { icon: "⭐", text: "Lien d'invitation au serveur personnalisé" },
      { icon: "⬆️", text: "Jusqu'à 100 Mo d'uploads de fichier" },
      { icon: "🎧", text: "Qualité audio maximale" },
      { icon: "🗄️", text: "Bannière de serveur animée" },
      { icon: "✨", text: "... et bien plus !" },
    ],
  },
];

export default function ServerBoostLevels({ currentBoosts = 0 }) {
  return (
    <div className="space-y-3">
      {BOOST_LEVELS.map((lvl) => {
        const isUnlocked = currentBoosts >= lvl.requiredBoosts;
        const progress = Math.min(100, (currentBoosts / lvl.requiredBoosts) * 100);
        return (
          <div
            key={lvl.level}
            className="rounded-2xl overflow-hidden"
            style={{ background: "#161616", border: `1px solid ${isUnlocked ? lvl.color + "40" : "rgba(255,255,255,0.05)"}` }}
          >
            {/* Header bar with progress */}
            <div className="relative h-1.5" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: lvl.color }}
              />
              <div
                className="absolute -top-1.5 left-2 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: lvl.crystalColor, boxShadow: `0 0 8px ${lvl.color}80` }}
              >
                <Zap className="w-2 h-2 text-white" fill="white" />
              </div>
              {/* Badge: required boosts */}
              <div
                className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1"
                style={{ background: "#202020", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Zap className="w-2.5 h-2.5" fill={lvl.color} style={{ color: lvl.color }} />
                {lvl.requiredBoosts} boosts
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <h3 className="text-base font-black text-white mb-2.5">Niveau {lvl.level}</h3>
              <ul className="space-y-1.5">
                {lvl.perks.map((perk, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-white/70">
                    <span className="text-sm">{perk.icon}</span>
                    <span>{perk.text}</span>
                  </li>
                ))}
              </ul>
              {isUnlocked && (
                <div
                  className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ background: lvl.color + "20", color: lvl.color }}
                >
                  <Zap className="w-2.5 h-2.5" fill="currentColor" />
                  Débloqué
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}