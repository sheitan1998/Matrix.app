import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, ImageOff, Maximize2, X } from "lucide-react";
import { RARITY_COLORS, cleanGameText } from "@/lib/openGames";

export default function OpenGameItemModal({ item, accent = "#a855f7", fallback, onClose }) {
  const [zoom, setZoom] = useState(false);
  if (!item) return null;

  const image = item.image || fallback || null;
  const rarity = String(item.rarity || "").toLowerCase();
  const rarityColor = RARITY_COLORS[rarity] || null;

  const facts = [
    item.tag && { label: "Catégorie", value: item.tag },
    item.rarity && { label: "Rareté", value: item.rarity, color: rarityColor },
    item.price && { label: "Prix / coût", value: item.price },
  ].filter(Boolean);

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent
        className="max-w-3xl p-0 border-0 bg-transparent overflow-hidden max-h-[92vh] overflow-y-auto scrollbar-thin"
        style={{ boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}
      >
        <DialogTitle className="sr-only">{item.name}</DialogTitle>

        <div className="rounded-2xl overflow-hidden" style={{ background: "#0a0512", border: `1px solid ${accent}44` }}>
          <div className="relative flex items-center justify-center" style={{ background: `radial-gradient(circle at 50% 20%, ${accent}22, #08030f 75%)`, minHeight: 260 }}>
            {image ? (
              <img src={image} alt={item.name} className="w-full max-h-[46vh] object-contain p-4" />
            ) : (
              <ImageOff className="w-10 h-10 my-16" style={{ color: `${accent}55` }} />
            )}

            {image && (
              <button
                type="button"
                onClick={() => setZoom(true)}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[10px] font-bold tap-sm"
                style={{ background: "rgba(10,5,18,0.85)", color: accent, border: `1px solid ${accent}55` }}
              >
                <Maximize2 className="w-3 h-3" /> Agrandir
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 rounded-lg tap-sm"
              style={{ background: "rgba(10,5,18,0.85)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            <div className="flex items-start gap-3 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight flex-1 min-w-[200px]">{item.name}</h3>
              {item.tag && (
                <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider" style={{ background: `${accent}1f`, color: accent, border: `1px solid ${accent}55` }}>
                  {item.tag}
                </span>
              )}
            </div>

            {item.subtitle && <p className="text-[11px] font-bold mt-1" style={{ color: accent }}>{cleanGameText(item.subtitle, 200)}</p>}

            {facts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                {facts.map((fact) => (
                  <div key={fact.label} className="px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-[9px] uppercase tracking-wider text-white/35">{fact.label}</p>
                    <p className="text-[11px] font-bold" style={{ color: fact.color || "#ffffff" }}>{fact.value}</p>
                  </div>
                ))}
              </div>
            )}

            {item.desc && (
              <p className="text-xs text-white/60 leading-relaxed mt-4 whitespace-pre-line">
                {cleanGameText(item.desc, 1400)}
              </p>
            )}

            {item.stats?.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/40 mb-2">Statistiques & conditions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.stats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="text-[10px] uppercase tracking-wider text-white/35">{stat.label}</span>
                      <span className="text-[11px] font-bold text-white text-right">{cleanGameText(stat.value, 120)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-bold tap-sm"
                style={{ color: accent }}
              >
                <ExternalLink className="w-3.5 h-3.5" /> Voir la fiche complète
              </a>
            )}
          </div>
        </div>

        {zoom && image && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: "rgba(4,2,8,0.95)" }}
            onClick={() => setZoom(false)}
            role="presentation"
          >
            <img src={image} alt={item.name} className="max-w-full max-h-full object-contain" />
            <button
              type="button"
              onClick={() => setZoom(false)}
              className="absolute top-5 right-5 flex items-center justify-center w-10 h-10 rounded-full tap-sm"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}
              aria-label="Fermer l'aperçu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}