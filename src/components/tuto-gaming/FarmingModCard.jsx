import React, { useState, useEffect } from "react";
import { Download, User, ChevronLeft, ChevronRight, X } from "lucide-react";
import VoteButtons from "@/components/tuto-gaming/VoteButtons";
import { useViewTracker } from "@/hooks/useViewTracker";

const CATEGORY_LABELS = {
  vehicles: "Véhicules",
  maps: "Maps",
  tools: "Outils",
  factories: "Usines",
  animals: "Animaux",
  scripts: "Scripts",
  others: "Autres",
};

export default function FarmingModCard({ mod, onDownload, user }) {
  const images = mod.images || [];
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const { trackView } = useViewTracker();

  const hasImages = images.length > 0;

  // Count a view when the lightbox opens (afficher en grand)
  useEffect(() => {
    if (lightbox !== null && mod?.id) {
      trackView("farming_mod", mod.id, "FarmingMod");
    }
  }, [lightbox, mod?.id, trackView]);

  return (
    <div
      className="rounded-xl overflow-hidden border border-white/10 flex flex-col"
      style={{ background: "#1e1e1e" }}
    >
      {/* Image gallery */}
      {hasImages && (
        <div className="relative w-full h-40 bg-black overflow-hidden">
          <img
            src={images[galleryIdx]}
            alt=""
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setLightbox(galleryIdx)}
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setGalleryIdx((i) => (i === 0 ? images.length - 1 : i - 1))}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white/80 hover:text-white transition tap-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGalleryIdx((i) => (i === images.length - 1 ? 0 : i + 1))}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white/80 hover:text-white transition tap-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-black/60 text-[9px] font-bold text-white">
                {galleryIdx + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <div className="p-3 border-b border-white/5 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{mod.title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            {mod.creator_avatar ? (
              <img src={mod.creator_avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-2.5 h-2.5 text-white/50" />
              </div>
            )}
            <span className="text-[10px] text-white/50 truncate">{mod.creator_name || "Créateur"}</span>
          </div>
        </div>
        <span
          className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
          style={{
            background: mod.is_free ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            color: mod.is_free ? "#4ade80" : "#f87171",
          }}
        >
          {mod.is_free ? "Libre de droit" : "Droits réservés"}
        </span>
      </div>

      {/* Description */}
      <div className="p-3 flex-1">
        <p className="text-xs text-white/60 line-clamp-3">
          {mod.description || "Aucune description"}
        </p>
      </div>

      {/* Footer */}
      <div className="p-3 pt-0 space-y-2">
        <VoteButtons
          contentType="farming_mod"
          contentId={mod.id}
          likes={mod.likes || 0}
          dislikes={mod.dislikes || 0}
          user={user}
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">
            {CATEGORY_LABELS[mod.category] || "Autres"} · {mod.views || 0} vues
          </span>
          <button
            onClick={() => onDownload(mod)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition tap-sm"
            style={{ background: "#7DA627", color: "#0a0a0a" }}
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition tap-sm"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={images[lightbox]}
            alt=""
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === 0 ? images.length - 1 : i - 1)); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition tap-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === images.length - 1 ? 0 : i + 1)); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition tap-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}