import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Monitor, AppWindow, Globe, X, Check } from "lucide-react";

/**
 * Custom screen-share source picker modal.
 * Wraps navigator.mediaDevices.getDisplayMedia with a user-friendly picker.
 * Lets the user switch sources without stopping the whole session.
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onStart: (stream: MediaStream) => void   — called with the chosen stream
 *   accent: string
 */
const SOURCES = [
  { key: "monitor", label: "Écran complet", icon: Monitor, desc: "Partage tout l'écran" },
  { key: "window", label: "Fenêtre d'application", icon: AppWindow, desc: "Partage une fenêtre précise" },
  { key: "tab", label: "Onglet du navigateur", icon: Globe, desc: "Partage un onglet" },
];

export default function ScreenShareModal({ open, onClose, onStart, accent = "#00ff41" }) {
  const [selected, setSelected] = useState("monitor");
  const [includeAudio, setIncludeAudio] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setSelected("monitor");
      setIncludeAudio(true);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleStart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The browser's native picker will still appear (security requirement),
      // but we pass constraints to hint at the user's preferred source type.
      const videoConstraints = {
        cursor: "always",
      };
      if (selected === "monitor") {
        videoConstraints.displaySurface = "monitor";
      } else if (selected === "window") {
        videoConstraints.displaySurface = "window";
      } else if (selected === "tab") {
        videoConstraints.displaySurface = "browser";
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: videoConstraints,
        audio: includeAudio,
      });
      onStart(stream);
      onClose();
    } catch (e) {
      if (e.name === "NotAllowedError") {
        setError("Partage d'écran refusé ou annulé.");
      } else {
        setError("Erreur lors du partage d'écran.");
      }
    } finally {
      setLoading(false);
    }
  }, [selected, includeAudio, onStart, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)" }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h3 className="text-base font-black text-white">Partage d'écran</h3>
            <p className="text-[11px] text-white/40">Choisis la source à partager</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source options */}
        <div className="p-4 space-y-2">
          {SOURCES.map((src) => {
            const Icon = src.icon;
            const isSelected = selected === src.key;
            return (
              <button
                key={src.key}
                onClick={() => setSelected(src.key)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition text-left"
                style={{
                  background: isSelected ? accent + "15" : "rgba(255,255,255,0.03)",
                  border: isSelected ? `1px solid ${accent}50` : "1px solid rgba(255,255,255,0.06)",
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: isSelected ? accent + "25" : "rgba(255,255,255,0.05)" }}>
                  <Icon className="w-5 h-5" style={{ color: isSelected ? accent : "rgba(255,255,255,0.5)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{src.label}</p>
                  <p className="text-[11px] text-white/40">{src.desc}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: accent }}>
                    <Check className="w-3 h-3 text-black" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Audio toggle */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setIncludeAudio((v) => !v)}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center transition shrink-0"
              style={{
                background: includeAudio ? accent : "transparent",
                border: `1.5px solid ${includeAudio ? accent : "rgba(255,255,255,0.3)"}`,
              }}>
              {includeAudio && <Check className="w-3 h-3 text-black" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-white">Partager l'audio du système</p>
              <p className="text-[11px] text-white/40">Inclut le son de l'onglet ou de l'écran partagé</p>
            </div>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 px-3 py-2 rounded-lg text-[11px] text-red-400"
            style={{ background: "rgba(239,68,68,0.1)" }}>
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/70 transition hover:bg-white/5">
            Annuler
          </button>
          <button onClick={handleStart} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5"
            style={{ background: accent }}>
            {loading ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Monitor className="w-4 h-4" /> Démarrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}