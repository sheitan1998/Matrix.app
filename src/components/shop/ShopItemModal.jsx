import React, { useState } from "react";
import { X, Check, Eye, CreditCard, AlertCircle } from "lucide-react";
import TrixIcon from "@/components/TrixIcon";
import { formatTrix } from "@/lib/format";
import { formatEuro } from "@/lib/shopPricing";
import CosmeticPreview from "@/components/cosmetics/CosmeticPreview";
import CosmeticProfilePreview from "@/components/cosmetics/CosmeticProfilePreview";

const RARITY_COLORS = { common: "#9ca3af", rare: "#3b82f6", epic: "#a855f7", legendary: "#f59e0b" };
const COSMETIC_CATEGORIES = ["badge", "avatar_animation", "profile_cover"];

export default function ShopItemModal({ item, prices, user, owned, quantity, buying, onClose, onBuyTrix, onBuyEuro }) {
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const isCosmetic = COSMETIC_CATEGORIES.includes(item.category);
  const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: "rgba(3,1,8,0.78)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl"
        style={{ background: "#120a1f", border: `1.5px solid ${rarityColor}40` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-black text-white">{item.name}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="h-4 w-4 text-white/50" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 w-full">
            {isCosmetic ? (
              <CosmeticPreview item={item} size="text-5xl" forcePlay />
            ) : item.preview_image ? (
              <img src={item.preview_image} alt={item.name} className="mx-auto max-h-48 w-full rounded-2xl object-cover" />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-2xl text-5xl" style={{ background: "rgba(168,85,247,0.1)" }}>
                {item.icon || "✨"}
              </div>
            )}
          </div>

          {isCosmetic && (
            <span className="mb-2 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ background: `${rarityColor}20`, color: rarityColor }}>
              {item.rarity}
            </span>
          )}
          {item.description && <p className="mb-4 text-xs leading-relaxed text-white/60">{item.description}</p>}

          <div className="mb-4 flex flex-col items-center gap-1">
            {prices.discountPercent > 0 && (
              <span className="text-xs font-bold text-white/30 line-through">{formatEuro(prices.baseEuros)}</span>
            )}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-base font-bold" style={{ color: "#fbbf24" }}>
                <TrixIcon size={18} />
                {formatTrix(prices.priceTrix)}
              </span>
              <span className="text-xs text-white/30">ou</span>
              <span className="text-base font-bold text-white">{formatEuro(prices.priceEuros)}</span>
            </div>
            {prices.discountPercent > 0 && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,#fde68a,#f59e0b)" }}>
                -{prices.discountPercent}% promo
              </span>
            )}
          </div>

          {owned && (
            <div className="mb-2 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-green-400" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <Check className="h-3.5 w-3.5" /> Possédé{quantity > 1 ? ` (x${quantity})` : ""}
            </div>
          )}

          <div className="space-y-2">
            {isCosmetic && (
              <>
                <button
                  onClick={() => setShowProfilePreview((v) => !v)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white/70 transition hover:text-white"
                  style={{
                    background: showProfilePreview ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
                    border: showProfilePreview ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {showProfilePreview ? "Masquer l'aperçu profil" : "Aperçu sur mon profil"}
                </button>
                {showProfilePreview && (
                  <div className="pb-1">
                    <CosmeticProfilePreview item={item} user={user} />
                  </div>
                )}
              </>
            )}

            {prices.priceTrix > 0 && (
              <button
                onClick={() => onBuyTrix(item)}
                disabled={!!buying}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-white transition disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#a855f7,#6d28d9)" }}
              >
                {buying === "trix" ? (
                  "Traitement..."
                ) : (
                  <>
                    <TrixIcon size={16} />
                    {owned ? "Racheter" : "Payer"} {formatTrix(prices.priceTrix)} Trix
                  </>
                )}
              </button>
            )}

            {prices.priceEuros > 0 && (
              <button
                onClick={() => onBuyEuro(item)}
                disabled={!!buying}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-white transition disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <CreditCard className="h-4 w-4 text-white/60" />
                {owned ? "Racheter" : "Payer"} {formatEuro(prices.priceEuros)}
              </button>
            )}
          </div>

          <p className="mt-3 flex items-center justify-center gap-1 text-[10px] text-white/30">
            <AlertCircle className="h-3 w-3" /> Non remboursable après achat
          </p>
        </div>
      </div>
    </div>
  );
}