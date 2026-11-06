import React from "react";
import TrixIcon from "@/components/TrixIcon";
import { formatTrix } from "@/lib/format";
import { effectivePrices, formatEuro } from "@/lib/shopPricing";
import CosmeticPreview from "@/components/cosmetics/CosmeticPreview";

const COSMETIC_CATEGORIES = ["badge", "avatar_animation", "profile_cover"];

export default function ShopProductCard({ item, config, onOpen }) {
  const { priceEuros, priceTrix, baseEuros, discountPercent } = effectivePrices(item, config);
  const isCosmetic = COSMETIC_CATEGORIES.includes(item.category);

  return (
    <button
      onClick={() => onOpen(item)}
      className="group flex flex-col overflow-hidden rounded-2xl text-left transition hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(160deg, rgba(26,13,42,0.92), rgba(9,5,14,0.96))",
        border: "1px solid rgba(168,85,247,0.22)",
        boxShadow: "0 10px 26px rgba(0,0,0,0.4)",
      }}
    >
      <div className="relative overflow-hidden" style={{ background: "radial-gradient(circle at 50% 30%, rgba(139,92,246,0.28), rgba(10,5,16,0.9))" }}>
        {isCosmetic ? (
          <div className="p-2">
            <CosmeticPreview
              item={item}
              aspect={item.category === "profile_cover" ? "video" : "square"}
            />
          </div>
        ) : item.preview_image ? (
          <div className="aspect-[4/3]">
            <img src={item.preview_image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center text-4xl" aria-hidden="true">{item.icon || "✨"}</div>
        )}
        {discountPercent > 0 && (
          <span className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,#fde68a,#f59e0b)" }}>
            -{discountPercent}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="truncate text-sm font-black text-white">{item.name}</h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/45">{item.description || "Produit exclusif MATRIX"}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            {discountPercent > 0 && (
              <p className="text-[10px] font-bold text-white/30 line-through">{formatEuro(baseEuros)}</p>
            )}
            <p className="text-base font-black text-white">{formatEuro(priceEuros)}</p>
            {priceTrix > 0 && (
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold" style={{ color: "#fbbf24" }}>
                <TrixIcon size={12} />
                {formatTrix(priceTrix)} Trix
              </p>
            )}
          </div>
          <span
            className="rounded-lg px-3 py-1.5 text-[11px] font-black text-white"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}
          >
            Acheter
          </span>
        </div>
      </div>
    </button>
  );
}