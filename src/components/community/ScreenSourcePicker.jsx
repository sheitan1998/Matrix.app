import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Monitor, AppWindow, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { listCaptureSources, startNativeCapture } from "@/lib/nativeScreenCapture";

const TABS = [
  { key: "screen", label: "Écrans", icon: Monitor },
  { key: "window", label: "Fenêtres", icon: AppWindow },
];

/**
 * In-app Discord-style source picker (desktop client). Shows live thumbnails of every screen and
 * window; clicking one captures it natively and hands the stream back — no browser dialog.
 * If the desktop build can't list sources, `onFallback` lets the app use the browser picker.
 */
export default function ScreenSourcePicker({ open, accent = "#00ff41", onSelect, onClose, onFallback }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("screen");
  const [startingId, setStartingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setStartingId(null);
    setTab("screen");
    listCaptureSources()
      .then((list) => { if (!cancelled) setSources(list || []); })
      .catch(() => { if (!cancelled) onFallback?.(); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const visible = sources.filter((s) => s.kind === tab);

  const handlePick = async (source) => {
    if (startingId) return;
    setStartingId(source.id);
    setError("");
    try {
      const stream = await startNativeCapture(source.id);
      onSelect(stream);
    } catch {
      setError("Impossible de capturer cette source. Elle a peut-être été fermée.");
      setStartingId(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#13101a", border: "1px solid " + accent + "30" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-6 py-4 border-b border-white/10 flex items-center justify-between" style={{ background: accent + "0a" }}>
          <div>
            <h2 className="font-black text-white text-lg">Partager votre écran</h2>
            <p className="text-xs text-white/50 mt-0.5">Clique sur ce que tu veux partager</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition tap-sm">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="shrink-0 flex gap-2 px-6 pt-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            const count = sources.filter((s) => s.kind === t.key).length;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn("h-9 px-4 rounded-xl flex items-center gap-2 text-xs font-bold border transition tap-sm",
                  active ? "text-white" : "border-white/10 text-white/50 hover:text-white hover:bg-white/5")}
                style={active ? { background: accent + "20", borderColor: accent + "60" } : {}}
              >
                <Icon className="w-4 h-4" /> {t.label}
                <span className="text-[10px] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/50">
              <Loader2 className="w-5 h-5 animate-spin" /> Chargement des aperçus…
            </div>
          ) : visible.length === 0 ? (
            <p className="py-16 text-center text-sm text-white/40">
              {tab === "screen" ? "Aucun écran détecté." : "Aucune fenêtre disponible."}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {visible.map((s) => {
                const starting = startingId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handlePick(s)}
                    disabled={!!startingId}
                    className="group text-left rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition hover:border-white/30 hover:bg-white/5 disabled:opacity-60"
                    style={starting ? { borderColor: accent } : {}}
                  >
                    <div className="relative aspect-video bg-black">
                      <img src={s.thumbnail} alt="" className="w-full h-full object-contain" />
                      {starting && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-white truncate">{s.name}</p>
                      {s.appName && s.appName !== s.name && (
                        <p className="text-[10px] text-white/40 truncate">{s.appName}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {error && <p className="mt-4 text-xs text-red-400 text-center">{error}</p>}
        </div>
      </div>
    </div>,
    document.body
  );
}