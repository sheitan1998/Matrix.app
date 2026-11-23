import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

const MAX_IMAGES = 5;

/**
 * Galerie de la fiche serveur (5 images max, lecture seule, sans bouton d'ajout).
 * Toutes les images sont de vraies balises <img> présentes dans le DOM (indexables) :
 * la visionneuse les empile et n'affiche que l'active, sans les retirer du DOM.
 */
export default function ServerGallery({ images = [], title = "" }) {
  const list = (Array.isArray(images) ? images : []).filter(Boolean).slice(0, MAX_IMAGES);
  const [active, setActive] = useState(0);
  if (list.length === 0) return null;
  const current = Math.min(active, list.length - 1);
  const altFor = (i) => (title
    ? `${title} - capture d'écran ${i + 1} sur ${list.length}`
    : `Capture d'écran du serveur ${i + 1} sur ${list.length}`);

  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
      <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2 flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5" style={{ color: "#a855f7" }} /> Galerie
      </h2>
      <div
        className="relative rounded-lg overflow-hidden aspect-video"
        style={{ background: "#0d0814", border: "1px solid rgba(138,79,255,0.2)", boxShadow: "0 0 14px rgba(138,79,255,0.15)" }}
      >
        {list.map((url, i) => (
          <img
            key={url}
            src={url}
            alt={altFor(i)}
            width={1600}
            height={900}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            aria-hidden={i === current ? undefined : true}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          />
        ))}
      </div>
      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-1.5 mt-2">
          {list.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className="aspect-video rounded-md overflow-hidden transition tap-sm"
              style={{
                border: i === current ? "1px solid #a855f7" : "1px solid rgba(138,79,255,0.15)",
                opacity: i === current ? 1 : 0.6,
                boxShadow: i === current ? "0 0 8px rgba(168,85,247,0.5)" : "none",
              }}
              aria-label={`Afficher l'image ${i + 1} sur ${list.length}`}
              aria-pressed={i === current}
            >
              <img src={url} alt="" width={400} height={225} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
