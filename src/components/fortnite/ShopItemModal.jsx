import React from "react";
import { X, Coins } from "lucide-react";
import { getRarityStyle } from "@/components/fortnite/rarityUtils";

export default function ShopItemModal({ item, onClose }) {
  if (!item) return null;
  const style = getRarityStyle(item.rarity);
  const images = item.images || {};
  const mainImage = images.featured || images.icon || images.smallIcon || item.image;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "#0D0518", border: `1.5px solid ${style.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b sticky top-0 z-10"
          style={{ background: "#0D0518", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <span
            className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0"
            style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
          >
            {item.rarity || "common"}
          </span>
          <h2 className="text-base font-black text-white truncate flex-1 mx-3">{item.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 tap-sm"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Image */}
        <div className="relative overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
          {mainImage ? (
            <img src={mainImage} alt={item.name} className="w-full h-64 sm:h-80 object-contain p-4" />
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <span className="text-4xl opacity-20">🎮</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-5 space-y-3">
          {item.description && (
            <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-wider">Type</p>
              <p className="text-xs font-bold text-white capitalize">{item.type}</p>
            </div>
            {item.series && (
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Série</p>
                <p className="text-xs font-bold text-white">{item.series}</p>
              </div>
            )}
            {item.layout && (
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Section</p>
                <p className="text-xs font-bold text-white">{item.layout}</p>
              </div>
            )}
            {item.price > 0 && (
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Prix</p>
                <p className="text-xs font-black flex items-center gap-1" style={{ color: "#fbbf24" }}>
                  <Coins className="w-3 h-3" /> {item.price} V-Bucks
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}