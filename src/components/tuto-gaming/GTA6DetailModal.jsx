import React, { useState, useEffect } from "react";
import { X, ShieldCheck, ChevronLeft, ChevronRight, Images } from "lucide-react";
import GTA6Image from "@/components/tuto-gaming/GTA6Image";

export default function GTA6DetailModal({ item, onClose }) {
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    if (!item) return;
    setGalleryIdx(0);
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setGalleryIdx(i => (i === 0 ? (item.gallery?.length || 1) - 1 : i - 1));
      if (e.key === "ArrowRight") setGalleryIdx(i => (i === ((item.gallery?.length || 1) - 1) ? 0 : i + 1));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;
  const accent = item.color || "#BF5AF2";
  const gallery = item.gallery?.length ? item.gallery : (item.image ? [item.image] : []);
  const currentImg = gallery[galleryIdx] || "";
  const specs = item.specs || {};
  const specEntries = Object.entries(specs);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{
          background: "hsl(var(--card))",
          border: `1px solid ${accent}66`,
          boxShadow: `0 0 50px ${accent}33`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center tap-sm transition"
          style={{ background: `${accent}33`, border: `1px solid ${accent}55` }}
        >
          <X className="w-4 h-4" style={{ color: accent }} />
        </button>

        {/* Main image with carousel */}
        <div className="relative aspect-video overflow-hidden shrink-0" style={{ background: "#0a050f" }}>
          <GTA6Image
            src={currentImg}
            alt={item.name}
            fallbackColor={accent}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 50%, ${accent}11 100%)` }} />

          {/* Gallery navigation */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={() => setGalleryIdx(i => (i === 0 ? gallery.length - 1 : i - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center tap-sm transition"
                style={{ background: "rgba(0,0,0,0.6)", border: `1px solid ${accent}44` }}
              >
                <ChevronLeft className="w-5 h-5" style={{ color: accent }} />
              </button>
              <button
                onClick={() => setGalleryIdx(i => (i === gallery.length - 1 ? 0 : i + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center tap-sm transition"
                style={{ background: "rgba(0,0,0,0.6)", border: `1px solid ${accent}44` }}
              >
                <ChevronRight className="w-5 h-5" style={{ color: accent }} />
              </button>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1" style={{ background: "rgba(0,0,0,0.7)", color: accent }}>
                <Images className="w-3 h-3" />
                {galleryIdx + 1} / {gallery.length}
              </span>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {gallery.length > 1 && (
          <div className="flex gap-1.5 px-4 py-2 overflow-x-auto no-scrollbar shrink-0" style={{ background: "hsl(var(--popover))" }}>
            {gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setGalleryIdx(idx)}
                className="shrink-0 w-16 h-10 rounded-md overflow-hidden transition"
                style={{
                  border: idx === galleryIdx ? `2px solid ${accent}` : "2px solid transparent",
                  opacity: idx === galleryIdx ? 1 : 0.5,
                }}
              >
                <GTA6Image src={img} alt="" fallbackColor={accent} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
            >
              {item.tag || item.category}
            </span>
            {item.status && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(34,211,238,0.1)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.3)" }}
              >
                <ShieldCheck className="w-3 h-3" />
                {item.status}
              </span>
            )}
            {item.rarity && (
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: `${accent}15`, color: accent }}
              >
                {item.rarity}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-foreground mb-1">{item.name}</h3>
          {item.subtitle && (
            <p className="text-xs font-bold mb-2" style={{ color: accent }}>{item.subtitle}</p>
          )}

          {/* Faction / Class / Brand */}
          {(item.faction || item.vehicleClass || item.ammoType || item.brand) && (
            <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground">
              {item.faction && (
                <span><span className="font-bold text-foreground">Faction :</span> {item.faction}</span>
              )}
              {item.vehicleClass && (
                <span><span className="font-bold text-foreground">Classe :</span> {item.vehicleClass}</span>
              )}
              {item.brand && (
                <span><span className="font-bold text-foreground">Marque :</span> {item.brand}</span>
              )}
              {item.ammoType && (
                <span><span className="font-bold text-foreground">Munitions :</span> {item.ammoType}</span>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>

          {/* Specs grid */}
          {specEntries.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              {specEntries.map(([key, val]) => (
                <div
                  key={key}
                  className="rounded-lg p-2.5"
                  style={{ background: `${accent}08`, border: `1px solid ${accent}22` }}
                >
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">{key}</p>
                  <p className="text-xs font-bold text-foreground">{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Customizations */}
          {item.customizations && (
            <div className="mt-4 p-3 rounded-lg" style={{ background: `${accent}08`, border: `1px solid ${accent}22` }}>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: accent }}>Personnalisations</p>
              <p className="text-xs text-muted-foreground">{item.customizations}</p>
            </div>
          )}

          {/* Quote */}
          {item.quote && (
            <div
              className="mt-4 pl-3 py-2 text-sm italic font-medium"
              style={{ borderLeft: `3px solid ${accent}`, color: "hsl(var(--foreground))" }}
            >
              "{item.quote}"
            </div>
          )}

          {/* Mission steps */}
          {item.steps && Array.isArray(item.steps) && item.steps.length > 0 && (
            <div className="mt-4 p-3 rounded-lg" style={{ background: `${accent}08`, border: `1px solid ${accent}22` }}>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: accent }}>Déroulement</p>
              <ol className="space-y-1.5">
                {item.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-muted-foreground">
                    <span className="font-black shrink-0" style={{ color: accent }}>{idx + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Mission rewards */}
          {item.rewards && (
            <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.2)" }}>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#FBBF24" }}>Récompenses</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.rewards}</p>
            </div>
          )}

          {/* Tips / Mission guides */}
          {item.tips && (
            <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.2)" }}>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#22D3EE" }}>Astuces</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.tips}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}