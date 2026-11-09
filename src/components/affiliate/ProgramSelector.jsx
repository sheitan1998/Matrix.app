import React from "react";
import { Zap, Star, Lock, ChevronRight } from "lucide-react";

const OPTIONS = [
  {
    key: "affiliate",
    label: "Programme Affilié",
    desc: "Lien personnel · suivi des filleuls",
    icon: Zap,
    accent: "#a855f7",
  },
  {
    key: "partner",
    label: "Programme Partenaire",
    desc: "Élite · seuils d'audience requis",
    icon: Star,
    accent: "#FFD700",
  },
];

export default function ProgramSelector({ active, onChange, locked }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {OPTIONS.map((option) => {
        const isActive = active === option.key;
        const isLocked = option.key === "partner" && locked;
        return (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className="relative text-left p-5 rounded-3xl transition hover:opacity-95"
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${option.accent}33, rgba(15,10,25,0.92))`
                : "rgba(15,10,25,0.6)",
              border: `1px solid ${isActive ? `${option.accent}aa` : "rgba(255,255,255,0.08)"}`,
              boxShadow: isActive ? `0 0 30px ${option.accent}33` : "none",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `${option.accent}1f`, border: `1px solid ${option.accent}55` }}
              >
                {isLocked
                  ? <Lock className="w-5 h-5" style={{ color: option.accent }} />
                  : <option.icon className="w-5 h-5" style={{ color: option.accent }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-white leading-tight">{option.label}</p>
                <p className="text-[11px] text-white/50 mt-0.5">{option.desc}</p>
                {isLocked && (
                  <p className="text-[10px] font-bold mt-1.5" style={{ color: "#fbbf24" }}>
                    Verrouillé — validez d'abord le programme Affilié
                  </p>
                )}
              </div>
              <ChevronRight
                className="w-4 h-4 shrink-0 mt-1 transition"
                style={{ color: isActive ? option.accent : "rgba(255,255,255,0.25)" }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}