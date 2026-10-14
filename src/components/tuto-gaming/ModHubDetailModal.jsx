import React, { useState, useEffect } from "react";
import { X, Loader2, Download, Star, Cpu, Gauge, DollarSign, User, Tag, HardDrive, GitBranch, FolderTree } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ModHubDetailModal({ modId, onClose }) {
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!modId) return;
    setLoading(true);
    setMod(null);
    base44.functions.invoke("farmingModApi", { action: "getModDetails", modId })
      .then(res => setMod(res.data || res))
      .catch(() => setMod(null))
      .finally(() => setLoading(false));
  }, [modId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10"
        style={{ background: "#1a1a1a" }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#7DA627" }} />
          </div>
        ) : !mod ? (
          <div className="text-center py-20 text-white/40">
            <p>Mod introuvable.</p>
          </div>
        ) : (
          <>
            {/* HD Image */}
            <div className="relative w-full aspect-video bg-black/40 overflow-hidden rounded-t-2xl">
              {mod.img ? (
                <img
                  src={mod.img}
                  alt={mod.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">—</div>
              )}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Title + Author */}
              <h2 className="text-2xl font-bold text-white mb-1">{mod.title}</h2>
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
                  <User className="w-4 h-4" />
                  {mod.author}
                </span>
                {mod.brand && mod.brand !== 'none' && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
                    <Tag className="w-4 h-4" />
                    {mod.brand}
                  </span>
                )}
                {mod.category && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
                    <FolderTree className="w-4 h-4" />
                    {mod.category}
                  </span>
                )}
                {mod.rating > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    {mod.rating.toFixed(1)} ({mod.votes || 0} votes)
                  </span>
                )}
              </div>

              {/* Description */}
              {mod.description && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Description</h3>
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{mod.description}</p>
                </div>
              )}

              {/* Technical specs */}
              {(mod.price || mod.power || mod.speed || mod.size || mod.version) && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Caractéristiques</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {mod.price && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                        <DollarSign className="w-5 h-5" style={{ color: "#7DA627" }} />
                        <div>
                          <p className="text-[10px] text-white/40 uppercase">Prix en jeu</p>
                          <p className="text-sm font-bold text-white">{mod.price}</p>
                        </div>
                      </div>
                    )}
                    {mod.power && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                        <Cpu className="w-5 h-5" style={{ color: "#7DA627" }} />
                        <div>
                          <p className="text-[10px] text-white/40 uppercase">Puissance</p>
                          <p className="text-sm font-bold text-white">{mod.power}</p>
                        </div>
                      </div>
                    )}
                    {mod.speed && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                        <Gauge className="w-5 h-5" style={{ color: "#7DA627" }} />
                        <div>
                          <p className="text-[10px] text-white/40 uppercase">Vitesse max</p>
                          <p className="text-sm font-bold text-white">{mod.speed}</p>
                        </div>
                      </div>
                    )}
                    {mod.size && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                        <HardDrive className="w-5 h-5" style={{ color: "#7DA627" }} />
                        <div>
                          <p className="text-[10px] text-white/40 uppercase">Taille</p>
                          <p className="text-sm font-bold text-white">{mod.size}</p>
                        </div>
                      </div>
                    )}
                    {mod.version && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                        <GitBranch className="w-5 h-5" style={{ color: "#7DA627" }} />
                        <div>
                          <p className="text-[10px] text-white/40 uppercase">Version</p>
                          <p className="text-sm font-bold text-white">{mod.version}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Download button */}
              <a
                href={mod.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition w-full justify-center"
                style={{ background: "#7DA627", color: "#0a0a0a" }}
              >
                <Download className="w-4 h-4" />
                Télécharger le Mod (.zip)
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}