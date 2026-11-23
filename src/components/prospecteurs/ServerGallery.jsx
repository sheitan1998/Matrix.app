import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

/** Galerie dédiée à la fiche détaillée d'un serveur (5 images maximum). */
export default function ServerGallery({ images = [], title = "" }) {
  const list = (Array.isArray(images) ? images : []).filter(Boolean).slice(0, 5);
  const [active, setActive] = useState(0);
  if (list.length === 0) return null;
  const current = list[Math.min(active, list.length - 1)];

  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
      <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2 flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5" style={{ color: "#a855f7" }} /> Galerie
      </h2>
      <div
        className="rounded-lg overflow-hidden aspect-video flex items-center justify-center"
        style={{ background: "#0d0814", border: "1px solid rgba(138,79,255,0.2)", boxShadow: "0 0 14px rgba(138,79,255,0.15)" }}
      >
        <img src={current} alt={`Capture du serveur ${title}`} className="w-full h-full object-contain" />
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
                border: i === active ? "1px solid #a855f7" : "1px solid rgba(138,79,255,0.15)",
                opacity: i === active ? 1 : 0.6,
                boxShadow: i === active ? "0 0 8px rgba(168,85,247,0.5)" : "none",
              }}
              aria-label={`Image ${i + 1}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
