import React, { useEffect } from "react";
import { X, ShieldCheck } from "lucide-react";
import GameImageFallback from "@/components/tuto-gaming/GameImageFallback";

export default function GameItemModal({ item, onClose, gameName = "JEU", logoUrl, extraFields = [] }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;
  const accent = item.color || "#BF5AF2";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: "hsl(var(--card))", border: `1px solid ${accent}66`, boxShadow: `0 0 50px ${accent}33` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center tap-sm transition"
          style={{ background: `${accent}33`, border: `1px solid ${accent}55` }}
        >
          <X className="w-4 h-4" style={{ color: accent }} />
        </button>

        <div className="relative aspect-video overflow-hidden shrink-0" style={{ background: "#0a050f" }}>
          <GameImageFallback
            src={item.image || item.displayIcon}
            alt={item.name || item.displayName}
            gameName={gameName}
            accentColor={accent}
            logoUrl={logoUrl}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 50%, ${accent}11 100%)` }} />
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {item.tag && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}>
                {item.tag}
              </span>
            )}
            {item.status && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(34,211,238,0.1)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.3)" }}>
                <ShieldCheck className="w-3 h-3" />
                {item.status}
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-foreground mb-1">{item.name || item.displayName}</h3>
          {item.subtitle && <p className="text-xs font-bold mb-2" style={{ color: accent }}>{item.subtitle}</p>}
          {extraFields.map((field) => (
            item[field.key] != null && item[field.key] !== "" && (
              <p key={field.key} className="text-xs text-muted-foreground mb-1">
                <span className="font-bold">{field.label} :</span> {field.format ? field.format(item[field.key]) : String(item[field.key])}
              </p>
            )
          ))}
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{item.desc || item.description}</p>
          {item.quote && (
            <div className="mt-4 pl-3 py-2 text-sm italic font-medium" style={{ borderLeft: `3px solid ${accent}`, color: "hsl(var(--foreground))" }}>
              "{item.quote}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}