import React from "react";
import { ArrowRight } from "lucide-react";

export default function ShopCategoryCard({ category, onClick }) {
  const accent = category.accent_color || "#a855f7";
  const hasImage = !!category.image_url;

  return (
    <button
      onClick={onClick}
      className="group relative flex min-h-[172px] flex-col overflow-hidden rounded-2xl p-4 text-left transition hover:-translate-y-0.5"
      style={{
        background: hasImage ?
        "#0b0616" :
        "linear-gradient(160deg, rgba(28,14,44,0.95), rgba(9,5,14,0.96))",
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 0 1px ${accent}10, 0 12px 30px rgba(0,0,0,0.45)`
      }}>

      {hasImage ?
      <>
          <img
          src={category.image_url}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />

          <span
          className="pointer-events-none absolute inset-0"
          style={{
            background:
            "linear-gradient(90deg, rgba(6,3,12,0.95) 0%, rgba(6,3,12,0.86) 45%, rgba(6,3,12,0.52) 100%)"
          }} />

          <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: "linear-gradient(180deg, rgba(6,3,12,0), rgba(6,3,12,0.85))" }} />

        </> :

      <>
          <div
          className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition group-hover:opacity-80"
          style={{ background: accent, opacity: 0.22 }} />

          <div
          className="relative mb-3 flex h-16 items-center justify-center overflow-hidden rounded-xl"
          style={{ background: `${accent}14`, border: `1px solid ${accent}25` }}>

            <span className="text-3xl leading-none" aria-hidden="true">{category.icon || "✨"}</span>
          </div>
        </>
      }

      <div className="relative z-10 flex h-full flex-1 flex-col">
        <h3
          className="text-sm font-black text-white"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>

          {category.label}
        </h3>
        <p
          className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/70"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>

          {category.description}
        </p>

        <span className="mt-auto flex items-center gap-1 pt-3 text-[11px] font-bold" style={{ color: accent }}>
          {category.cta_label || "Voir la catégorie"}
          <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>);

}