import React from "react";
import { cn } from "@/lib/utils";

/**
 * Navigation du profil.
 * variant "desktop" : panneau vertical dédié (bord droit de l'écran)
 * variant "mobile"  : grille à deux colonnes
 */
export default function ProfileTabPanel({ tabs, active, onChange, variant = "desktop" }) {
  const isMobile = variant === "mobile";

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl", isMobile ? "p-1.5 grid grid-cols-2 gap-1.5" : "p-2.5 flex flex-col gap-1")}
      style={{
        background: "linear-gradient(160deg, rgba(26,13,44,0.94), rgba(10,5,15,0.94))",
        border: "1px solid rgba(168,85,247,0.22)",
        boxShadow: "0 0 32px rgba(168,85,247,0.14), inset 0 1px 0 rgba(255,255,255,0.04)",
        backdropFilter: "blur(14px)",
      }}
    >
      {/* Accents cyberpunk */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,242,255,0.7), rgba(168,85,247,0.9), transparent)" }}
      />
      <div
        className="pointer-events-none absolute -right-8 -top-8 w-24 h-24 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.22), transparent 70%)" }}
      />

      {!isMobile && (
        <p className="relative px-2 pt-1 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/35" style={{ fontFamily: "var(--font-mono)" }}>
          Navigation
        </p>
      )}

      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              "relative flex items-center rounded-xl font-bold transition-all tap-sm",
              isMobile ? "gap-2 px-2.5 py-2 text-[11px]" : "gap-2.5 px-2.5 py-2.5 text-sm text-left",
              isActive ? "text-white" : "text-white/45 hover:text-white/80"
            )}
            style={{
              background: isActive ? "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(109,40,217,0.18))" : "transparent",
              border: `1px solid ${isActive ? "rgba(168,85,247,0.55)" : "transparent"}`,
              boxShadow: isActive ? "0 0 18px rgba(168,85,247,0.25)" : "none",
            }}
          >
            {isActive && !isMobile && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                style={{ background: "#a855f7", boxShadow: "0 0 10px #a855f7" }}
              />
            )}
            <t.icon
              className={cn("shrink-0", isMobile ? "w-3.5 h-3.5" : "w-4 h-4")}
              style={{ color: isActive ? "#c084fc" : undefined }}
            />
            <span className="truncate">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}