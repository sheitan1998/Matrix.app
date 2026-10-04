import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Copy, Check, User, Map as MapIcon, Pencil, Eye } from "lucide-react";
import { getCategoryMeta } from "@/components/tuto-gaming/fortniteMapsData";
import { useViewTracker } from "@/hooks/useViewTracker";

export default function MapDetailModal({ map, onClose, user, onEdit }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const cat = getCategoryMeta(map?.category);

  const images = map?.gallery?.length ? map.gallery : (map?.image_url ? [map.image_url] : []);

  const goNext = useCallback((e) => {
    e.stopPropagation();
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback((e) => {
    e.stopPropagation();
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!map) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && images.length > 1) setActiveIndex((i) => (i + 1) % images.length);
      else if (e.key === "ArrowLeft" && images.length > 1) setActiveIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [map, images.length, onClose]);

  useEffect(() => {
    if (map) {
      setActiveIndex(0);
      setCopied(false);
    }
  }, [map]);

  // Count a view when the modal opens with a map
  const { trackView } = useViewTracker();
  useEffect(() => {
    if (map?.id) {
      trackView("fortnite_map", map.id, "FortniteMap");
    }
  }, [map?.id, trackView]);

  const canEdit = user && map && map.user_email === user.email;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(map.map_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  if (!map) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "#0D0518", border: "1.5px solid rgba(191,90,242,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10" style={{ background: "#0D0518", borderColor: "rgba(191,90,242,0.15)" }}>
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0"
              style={{ background: `${cat.color}25`, color: cat.color, border: `1px solid ${cat.color}40` }}
            >
              {cat.label}
            </span>
            <h2 className="text-lg font-black text-white truncate">{map.title}</h2>
          </div>
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(map)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition tap-sm shrink-0"
              style={{ background: "rgba(191,90,242,0.15)", border: "1px solid rgba(191,90,242,0.3)", color: "#BF5AF2" }}
              title="Modifier ma map"
            >
              <Pencil className="w-3.5 h-3.5" /> Modifier
            </button>
          )}
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Gallery */}
        {images.length > 0 ? (
          <div className="relative" style={{ background: "#1a0a2e" }}>
            <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
              <img
                src={images[activeIndex]}
                alt={`${map.title} — image ${activeIndex + 1}`}
                className="w-full h-full object-contain"
              />
              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition tap-sm"
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition tap-sm"
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                  {/* Counter */}
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold text-white/80" style={{ background: "rgba(0,0,0,0.6)" }}>
                    {activeIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
            {/* Thumbnails strip */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className="shrink-0 w-16 h-12 rounded-md overflow-hidden transition tap-sm"
                    style={{
                      border: activeIndex === i ? "2px solid #BF5AF2" : "1px solid rgba(255,255,255,0.1)",
                      opacity: activeIndex === i ? 1 : 0.5,
                    }}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center" style={{ background: "#1a0a2e" }}>
            <MapIcon className="w-12 h-12 text-white/10" />
          </div>
        )}

        {/* Details */}
        <div className="p-5 space-y-4">
          {/* Creator */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-white/30" />
            <span className="text-sm text-white/60">Créé par</span>
            <span className="text-sm font-bold text-white">{map.creator_name}</span>
          </div>

          {/* Views + Description */}
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Eye className="w-3.5 h-3.5" />
            <span>{map.views || 0} vue{(map.views || 0) > 1 ? "s" : ""}</span>
          </div>
          {map.description && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Description</h3>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{map.description}</p>
            </div>
          )}

          {/* Map code + copy */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Code de la map</h3>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 px-3 py-2.5 rounded-lg text-sm font-mono font-bold tracking-wider text-center"
                style={{ background: "rgba(191,90,242,0.08)", border: "1px solid rgba(191,90,242,0.15)", color: "#BF5AF2" }}
              >
                {map.map_code}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 px-4 py-2.5 rounded-lg flex items-center gap-2 transition tap-sm"
                style={{
                  background: copied ? "rgba(34,197,94,0.15)" : "rgba(191,90,242,0.1)",
                  border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(191,90,242,0.2)"}`,
                }}
              >
                {copied ? (
                  <><Check className="w-4 h-4 text-green-400" /><span className="text-xs font-bold text-green-400">Copié !</span></>
                ) : (
                  <><Copy className="w-4 h-4" style={{ color: "#BF5AF2" }} /><span className="text-xs font-bold" style={{ color: "#BF5AF2" }}>Copier</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}