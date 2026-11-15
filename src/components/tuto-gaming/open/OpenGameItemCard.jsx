import React, { useEffect, useState } from "react";
import { ImageOff, Maximize2 } from "lucide-react";
import { cleanGameText, rarityMeta } from "@/lib/openGames";

// Carte cliquable : visuel officiel obligatoire, jamais d'initiales de secours.
export default function OpenGameItemCard({ item, accent, fallback, onSelect }) {
  const initial = item.image || fallback || null;
  const [src, setSrc] = useState(initial);

  useEffect(() => {
    setSrc(item.image || fallback || null);
  }, [item.id, item.image, fallback]);

  const rarity = rarityMeta(item.rarity);
  const desc = cleanGameText(item.subtitle || item.desc, 90);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className="text-left rounded-xl overflow-hidden flex flex-col group transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2"
      style={{ background: "rgba(13,5,24,0.85)", border: `1px solid ${accent}33` }}
    >
      <div
        className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
        style={{ background: `radial-gradient(circle at 50% 30%, ${accent}18, #0a0512 70%)` }}
      >
        {src ? (
          <img
            src={src}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-contain p-2.5 transition-transform duration-300 group-hover:scale-105"
            onError={() => setSrc((prev) => (prev && prev !== fallback ? fallback : null))}
          />
        ) : (
          <ImageOff className="w-7 h-7" style={{ color: `${accent}55` }} />
        )}

        <span className="absolute inset-x-0 bottom-0 h-12 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent, rgba(8,3,16,0.75))" }} />

        {item.tag && (
          <span
            className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
            style={{ background: "rgba(10,5,18,0.85)", color: accent, border: `1px solid ${accent}55` }}
          >
            {item.tag}
          </span>
        )}

        <span
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
          style={{ background: `${rarity.color}22`, color: rarity.color, border: `1px solid ${rarity.color}66` }}
        >
          {rarity.label}
        </span>

        {item.price && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(10,5,18,0.85)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.35)" }}>
            {item.price}
          </span>
        )}

        <span className="absolute bottom-2 left-2 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition" style={{ background: "rgba(10,5,18,0.85)", color: accent, border: `1px solid ${accent}55` }}>
          <Maximize2 className="w-3 h-3" />
        </span>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-1">
        <h4 className="text-xs font-black text-white leading-tight" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.name}
        </h4>
        {desc && (
          <p className="text-[10px] text-white/40 leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {desc}
          </p>
        )}
      </div>
    </button>
  );
}