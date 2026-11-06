import React from "react";
import { ArrowRight } from "lucide-react";

export default function ShopCategoryCard({ category, onClick }) {
  const accent = category.accent_color || "#a855f7";

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl p-4 text-left transition hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(160deg, rgba(28,14,44,0.95), rgba(9,5,14,0.96))",
        border: `1px solid ${accent}45`,
        boxShadow: `0 0 0 1px ${accent}10, 0 12px 30px rgba(0,0,0,0.45)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition group-hover:opacity-80"
        style={{ background: accent, opacity: 0.22 }}
      />

      <div className="relative mb-3 flex h-16 items-center justify-center overflow-hidden rounded-xl" style={{ background: `${accent}14`, border: `1px solid ${accent}25` }}>
        {category.image_url ? (
          <img src={category.image_url} alt={category.label} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="text-3xl leading-none" aria-hidden="true">{category.icon || "✨"}</span>
        )}
      </div>

      <h3 className="text-sm font-black text-white">{category.label}</h3>
      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/45">{category.description}</p>

      <span className="mt-3 flex items-center gap-1 text-[11px] font-bold" style={{ color: accent }}>
        {category.cta_label || "Voir la catégorie"}
        <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}