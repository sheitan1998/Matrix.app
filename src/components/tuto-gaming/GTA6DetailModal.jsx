import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function GTA6DetailModal({ item, onClose }) {
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
        className="relative max-w-3xl w-full rounded-2xl overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          border: `1px solid ${accent}66`,
          boxShadow: `0 0 50px ${accent}33`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center tap-sm transition"
          style={{ background: `${accent}33`, border: `1px solid ${accent}55` }}
        >
          <X className="w-4 h-4" style={{ color: accent }} />
        </button>

        {/* Image */}
        <div className="relative aspect-video overflow-hidden" style={{ background: "#0a050f" }}>
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 50%, ${accent}11 100%)` }} />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
            >
              {item.tag || item.category}
            </span>
          </div>
          <h3 className="text-xl font-black text-foreground mb-2">{item.name}</h3>
          {item.subtitle && (
            <p className="text-xs font-bold mb-3" style={{ color: accent }}>{item.subtitle}</p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
        </div>
      </div>
    </div>
  );
}