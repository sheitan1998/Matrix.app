import React, { useCallback, useEffect, useState } from "react";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";

const MAX_IMAGES = 5;

/**
 * Galerie des fiches (serveur et créateur) : quadrillage de 5 images maximum,
 * chaque visuel est affiché en entier (object-contain), clic pour agrandir.
 * Toutes les images sont de vraies balises <img> présentes dans le DOM (indexables).
 */
export default function ServerGallery({ images = [], title = "", kind = "serveur" }) {
  const list = (Array.isArray(images) ? images : []).filter(Boolean).slice(0, MAX_IMAGES);
  const [open, setOpen] = useState(null);
  const count = list.length;

  const altFor = (i) => (title
    ? `${title} - capture d'écran ${i + 1} sur ${count}`
    : `Capture d'écran du ${kind} ${i + 1} sur ${count}`);

  const step = useCallback((delta) => {
    setOpen((cur) => (cur === null ? cur : (cur + delta + count) % count));
  }, [count]);

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  if (count === 0) return null;

  const gridCols = count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3";

  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
      <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2 flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5" style={{ color: "#a855f7" }} /> Galerie
      </h2>
      <div className={`grid ${gridCols} gap-2`}>
        {list.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpen(i)}
            className="relative aspect-video rounded-lg overflow-hidden transition hover:brightness-110 tap-sm"
            style={{ background: "#0d0814", border: "1px solid rgba(138,79,255,0.25)", boxShadow: "0 0 12px rgba(138,79,255,0.15)" }}
            aria-label={`Agrandir l'image ${i + 1} sur ${count}`}
          >
            <img
              src={url}
              alt={altFor(i)}
              width={800}
              height={450}
              loading={i < 2 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(10,5,15,0.92)", backdropFilter: "blur(6px)" }}
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu de l'image"
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white tap-sm"
            style={{ background: "rgba(138,79,255,0.3)" }}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-3 w-10 h-10 rounded-full flex items-center justify-center text-white tap-sm"
                style={{ background: "rgba(138,79,255,0.3)" }}
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-3 w-10 h-10 rounded-full flex items-center justify-center text-white tap-sm"
                style={{ background: "rgba(138,79,255,0.3)" }}
                aria-label="Image suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <img
            src={list[open]}
            alt={altFor(open)}
            className="max-w-full max-h-full object-contain rounded-lg"
            style={{ boxShadow: "0 0 30px rgba(138,79,255,0.35)" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
