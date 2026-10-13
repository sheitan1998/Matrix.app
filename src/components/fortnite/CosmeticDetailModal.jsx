import React from "react";
import { X } from "lucide-react";
import { getRarityStyle } from "@/components/fortnite/rarityUtils";
import CosmeticVoteButtons from "@/components/fortnite/CosmeticVoteButtons";

export default function CosmeticDetailModal({ cosmetic, onClose, user }) {
  if (!cosmetic) return null;
  const style = getRarityStyle(cosmetic.rarity);
  const images = cosmetic.images || {};
  const mainImage = images.featured || images.icon || images.smallIcon || cosmetic.image;

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
            {cosmetic.rarity_display || cosmetic.rarity || "common"}
          </span>
          <h2 className="text-base font-black text-white truncate flex-1 mx-3">{cosmetic.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 tap-sm"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Media */}
        <div className="relative overflow-hidden" style={{ background: style.bg }}>
          {cosmetic.video ? (
            <video src={cosmetic.video} autoPlay loop muted playsInline className="w-full h-64 sm:h-80 object-contain p-4" />
          ) : mainImage ? (
            <img src={mainImage} alt={cosmetic.name} className="w-full h-64 sm:h-80 object-contain p-4" />
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <span className="text-4xl" style={{ color: style.text, opacity: 0.2 }}>🎨</span>
            </div>
          )}
        </div>

        {/* Audio */}
        {cosmetic.audio && !cosmetic.video && (
          <div className="px-5 pt-3">
            <audio src={cosmetic.audio} controls className="w-full h-8" />
          </div>
        )}

        {/* Details */}
        <div className="p-5 space-y-3">
          {cosmetic.description && (
            <p className="text-sm text-white/70 leading-relaxed">{cosmetic.description}</p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-wider">Type</p>
              <p className="text-xs font-bold text-white capitalize">{cosmetic.type}</p>
            </div>
            {cosmetic.series && (
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Série</p>
                <p className="text-xs font-bold text-white">{cosmetic.series}</p>
              </div>
            )}
            {cosmetic.season && (
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Saison</p>
                <p className="text-xs font-bold text-white">Ch. {cosmetic.season}</p>
              </div>
            )}
            {cosmetic.added && (
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Ajouté le</p>
                <p className="text-xs font-bold text-white">{new Date(cosmetic.added).toLocaleDateString("fr-FR")}</p>
              </div>
            )}
          </div>

          {/* Vote buttons */}
          <div className="pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Vote communautaire</p>
            <CosmeticVoteButtons cosmetic={cosmetic} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}