import React from "react";
import { RefreshCw } from "lucide-react";

export default function PullToRefreshIndicator({ pullY, threshold = 72, pulling }) {
  const progress = Math.min(pullY / threshold, 1);
  const ready = progress >= 1;

  if (!pulling && pullY === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ transform: `translateY(${Math.min(pullY - 20, 60)}px)`, opacity: progress }}
    >
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-lg text-xs font-semibold transition-colors ${ready ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}>
        <RefreshCw className="w-3.5 h-3.5" style={{ transform: `rotate(${progress * 360}deg)`, transition: "transform 0.1s" }} />
        {ready ? "Relâcher pour actualiser" : "Tirer pour actualiser"}
      </div>
    </div>
  );
}