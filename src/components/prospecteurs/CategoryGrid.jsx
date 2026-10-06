import React from "react";
import { Server } from "lucide-react";

const BADGE_STYLES = {
  POPULAIRE: { bg: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#fff", glow: "rgba(251,191,36,0.4)" },
  NEW: { bg: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", glow: "rgba(34,197,94,0.4)" },
  TENDANCE: { bg: "linear-gradient(135deg, #a855f7, #6d28d9)", color: "#fff", glow: "rgba(168,85,247,0.4)" },
  HOT: { bg: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", glow: "rgba(239,68,68,0.4)" },
};

export default function CategoryGrid({ categories, selectedSlug, onSelect, serverCounts = {}, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
        ))}
      </div>
    );
  }

  // "Tous" card is always first
  const allCard = (
    <button
      onClick={() => onSelect(null)}
      className={`relative h-28 rounded-xl overflow-hidden transition group text-left ${selectedSlug === null ? "ring-2" : ""}`}
      style={{
        background: selectedSlug === null
          ? "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(109,40,217,0.15))"
          : "rgba(18,9,28,0.6)",
        border: `1px solid ${selectedSlug === null ? "rgba(168,85,247,0.5)" : "rgba(138,79,255,0.15)"}`,
        boxShadow: selectedSlug === null ? "0 0 16px rgba(168,85,247,0.2)" : "none",
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
        <Server className="w-6 h-6 mb-1.5" style={{ color: "#a855f7" }} />
        <span className="text-xs font-black text-white tracking-wider uppercase">Tous</span>
        <span className="text-[9px] text-white/40 mt-0.5">{serverCounts.all || 0} serveurs</span>
      </div>
    </button>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {allCard}
      {categories.map((cat) => {
        const isSelected = selectedSlug === cat.slug;
        const badgeStyle = cat.badge ? BADGE_STYLES[cat.badge] : null;
        const count = serverCounts[cat.slug] || 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.slug)}
            className={`relative h-28 rounded-xl overflow-hidden transition group text-left ${isSelected ? "ring-2" : ""}`}
            style={{
              border: `1px solid ${isSelected ? "rgba(168,85,247,0.5)" : "rgba(138,79,255,0.15)"}`,
              boxShadow: isSelected ? "0 0 16px rgba(168,85,247,0.2)" : "none",
            }}
          >
            {/* Background image */}
            {cat.image_url ? (
              <img
                src={cat.image_url}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition group-hover:scale-105"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, rgba(138,79,255,0.15), rgba(88,28,135,0.1))" }}
              />
            )}
            {/* Dark overlay */}
            <div
              className="absolute inset-0 transition"
              style={{
                background: isSelected
                  ? "linear-gradient(180deg, rgba(18,9,28,0.3) 0%, rgba(18,9,28,0.85) 100%)"
                  : "linear-gradient(180deg, rgba(18,9,28,0.4) 0%, rgba(18,9,28,0.9) 100%)",
              }}
            />

            {/* Badge */}
            {badgeStyle && (
              <span
                className="absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{ background: badgeStyle.bg, color: badgeStyle.color, boxShadow: `0 0 8px ${badgeStyle.glow}` }}
              >
                {cat.badge}
              </span>
            )}

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-3">
              <span className="text-xs font-black text-white tracking-wide uppercase truncate">{cat.name}</span>
              <span className="text-[9px] text-white/50 mt-0.5">{count} serveur{count !== 1 ? "s" : ""}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}