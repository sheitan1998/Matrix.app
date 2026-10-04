import React from "react";
import { Zap } from "lucide-react";
import { getBoostLevelInfo, MAX_BOOSTS } from "@/lib/boostPerks";

/**
 * Compact badge showing the server's current boost level and count.
 * Displayed in the server settings header.
 */
export default function BoostLevelBadge({ boosts = 0, accent }) {
  const info = getBoostLevelInfo(boosts);
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl shrink-0"
      style={{ background: info.color + "15", border: `1px solid ${info.color}40` }}
    >
      <Zap className="w-3.5 h-3.5" fill={info.color} style={{ color: info.color }} />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold leading-none" style={{ color: info.color }}>
          {info.level > 0 ? `Niveau ${info.level} — ${info.label}` : "Aucun boost"}
        </span>
        <span className="text-[9px] text-white/40 leading-none mt-0.5">
          {boosts}/{MAX_BOOSTS} boosts
        </span>
      </div>
    </div>
  );
}