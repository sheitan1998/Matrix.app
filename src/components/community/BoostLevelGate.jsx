import React from "react";
import { Lock } from "lucide-react";

/**
 * Wraps a feature section. If the server's boost level is below the required
 * level, the content is greyed out and a lock overlay shows the required level.
 */
export default function BoostLevelGate({ currentLevel, requiredLevel, children, label }) {
  const isUnlocked = currentLevel >= requiredLevel;

  if (isUnlocked) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="opacity-30 pointer-events-none select-none">{children}</div>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: "rgba(10,5,15,0.55)" }}
      >
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)" }}
        >
          <Lock className="w-3.5 h-3.5 text-purple-400" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-purple-300 leading-none">
              Niveau {requiredLevel} requis
            </span>
            {label && (
              <span className="text-[9px] text-white/40 leading-none mt-0.5">{label}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}