import React from "react";
import { ArrowRight } from "lucide-react";

export default function ShopCategoryCard({ category, onClick }) {
  const accent = category.accent_color || "#a855f7";

  // Les visuels fournis contiennent déjà le titre, la description et le bouton :
  // la carte affiche uniquement l'image et reste entièrement cliquable.
  if (category.image_url) {
    return (
      <button
        onClick={onClick}
        aria-label={category.label}
        title={category.label}
        className="group relative block aspect-[16/9] w-full overflow-hidden rounded-2xl transition hover:-translate-y-0.5"
        style={{
          border: `1px solid ${accent}55`,
          boxShadow: `0 0 0 1px ${accent}10, 0 12px 30px rgba(0,0,0,0.45)`
        }}>

        <img
          src={category.image_url}
          alt={category.label}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]" />

      </button>);

  }

  return (
    <button
      onClick={onClick}
      className="group relative flex min-h-[172px] flex-col overflow-hidden rounded-2xl p-4 text-left transition hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(160deg, rgba(28,14,44,0.95), rgba(9,5,14,0.96))",
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 0 1px ${accent}10, 0 12px 30px rgba(0,0,0,0.45)`
      }}>

      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition group-hover:opacity-80"
        style={{ background: accent, opacity: 0.22 }} />

      <div
        className="relative mb-3 flex h-16 items-center justify-center overflow-hidden rounded-xl"
        style={{ background: `${accent}14`, border: `1px solid ${accent}25` }}>

        <span className="text-3xl leading-none" aria-hidden="true">{category.icon || "✨"}</span>
      </div>

      <div className="relative z-10 flex h-full flex-1 flex-col">
        <h3 className="text-sm font-black text-white">{category.label}</h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/70">{category.description}</p>

        <span className="mt-auto flex items-center gap-1 pt-3 text-[11px] font-bold" style={{ color: accent }}>
          {category.cta_label || "Voir la catégorie"}
          <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>);

}