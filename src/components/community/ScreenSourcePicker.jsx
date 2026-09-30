import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Monitor, AppWindow, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SOURCES = [
  {
    key: "monitor",
    label: "Écran entier",
    desc: "Partage tout votre écran",
    icon: Monitor,
    constraint: { displaySurface: "monitor" },
  },
  {
    key: "window",
    label: "Une fenêtre",
    desc: "Partage une application",
    icon: AppWindow,
    constraint: { displaySurface: "window" },
  },
  {
    key: "browser",
    label: "Un onglet",
    desc: "Partage un onglet du navigateur",
    icon: Globe,
    constraint: { displaySurface: "browser" },
  },
];

export default function ScreenSourcePicker({ open, accent = "#00ff41", onSelect, onClose }) {
  const [loading, setLoading] = useState(null);

  if (!open) return null;

  const handlePick = async (source) => {
    setLoading(source.key);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { ...source.constraint, cursor: "always" },
        audio: source.key === "browser" ? false : true,
      });
      onSelect(stream, source.key);
    } catch (e) {
      if (e?.name !== "NotAllowedError" && e?.name !== "AbortError") {
        console.error("Screen share error:", e);
      }
    } finally {
      setLoading(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#13101a", border: "1px solid " + accent + "30" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between" style={{ background: accent + "0a" }}>
          <div>
            <h2 className="font-black text-white text-lg">Partager votre écran</h2>
            <p className="text-xs text-white/50 mt-0.5">Choisissez ce que vous souhaitez partager</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition tap-sm">
            <span className="text-white/60 text-xl leading-none">×</span>
          </button>
        </div>

        {/* Source cards */}
        <div className="p-6 grid grid-cols-3 gap-4">
          {SOURCES.map((s) => {
            const Icon = s.icon;
            const isLoading = loading === s.key;
            return (
              <button
                key={s.key}
                onClick={() => handlePick(s)}
                disabled={!!loading}
                className={cn(
                  "group relative flex flex-col items-center gap-3 p-5 rounded-xl border transition text-center",
                  isLoading
                    ? "border-white/30 bg-white/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/5"
                )}
                style={isLoading ? { borderColor: accent + "60", background: accent + "08" } : {}}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center transition group-hover:scale-110"
                  style={{ background: accent + "12", color: accent }}
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Icon className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{s.label}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/20">
          <p className="text-[11px] text-white/40 text-center">
            🔒 Le navigateur vous demandera de confirmer votre choix pour des raisons de sécurité.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}