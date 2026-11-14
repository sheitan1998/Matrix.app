import React, { useEffect, useRef, useState } from "react";
import { X, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { buildGameEmbedUrl, ensureGameDistributionSdk } from "@/lib/gameDistributionSdk";

export default function NexusGamePlayer({ game, onClose }) {
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!game) return;
    setLoading(true);
    ensureGameDistributionSdk(game.url);
    const onKey = (event) => {
      if (event.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [game, onClose]);

  if (!game) return null;

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen?.().catch(() => {});
      setFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col" style={{ background: "#07030c" }}>
      <div
        className="flex items-center gap-3 px-4 h-14 shrink-0"
        style={{ background: "rgba(15,8,24,0.95)", borderBottom: "1px solid rgba(168,85,247,0.25)" }}
      >
        <div className="min-w-0">
          <p className="text-sm font-black text-white truncate">{game.title}</p>
          <p className="text-[10px] text-white/40 truncate">
            {game.category} · HTML5{game.instructions ? ` · ${game.instructions.slice(0, 60)}` : ""}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition tap-sm"
            style={{ background: "rgba(255,255,255,0.06)" }}
            title={fullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white transition tap-sm"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
            title="Fermer le jeu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="relative flex-1 min-h-0" style={{ background: "#000" }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#a855f7" }} />
            <p className="text-xs text-white/50">Chargement du jeu...</p>
          </div>
        )}
        <iframe
          src={buildGameEmbedUrl(game.url)}
          title={game.title}
          onLoad={() => setLoading(false)}
          allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope; clipboard-write"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}