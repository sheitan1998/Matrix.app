import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Download, Star, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ModHubGrid() {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchMods = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("farmingModApi", {
        action: "getMods",
        page: p,
        limit: 24,
        filter: "latest",
      });
      const data = res.data || res;
      setMods(data.items || []);
      setHasMore(data.has_more || false);
      setPage(p);
    } catch {
      setMods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMods(); }, [fetchMods]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">ModHub & Téléchargements</h2>
          <p className="text-xs text-white/50">Mods officiels GIANTS Software — Farming Simulator 25</p>
        </div>
        <button
          onClick={() => fetchMods(1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition"
          style={{ background: "#7DA627", color: "#0a0a0a" }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#7DA627" }} />
        </div>
      ) : mods.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          <p>ModHub temporairement indisponible.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {mods.map((mod) => (
              <div
                key={mod.id}
                className="group rounded-xl bg-white/5 border border-white/10 hover:border-[#7DA627]/40 transition overflow-hidden flex flex-col"
              >
                <div className="aspect-square overflow-hidden bg-black/30">
                  {mod.img ? (
                    <img
                      src={mod.img}
                      alt={mod.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">—</div>
                  )}
                </div>
                <div className="p-2 flex-1 flex flex-col">
                  <p className="text-xs font-bold text-white line-clamp-2 mb-1">{mod.title}</p>
                  <p className="text-[10px] text-white/40 truncate mb-1">Par {mod.author}</p>
                  {mod.rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-[10px] text-white/60">{mod.rating.toFixed(1)} ({mod.votes})</span>
                    </div>
                  )}
                  <a
                    href={mod.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition"
                    style={{ background: "#7DA627", color: "#0a0a0a" }}
                  >
                    <Download className="w-3 h-3" />
                    Télécharger
                  </a>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => fetchMods(page + 1)}
                className="px-6 py-2 rounded-lg text-sm font-bold transition"
                style={{ background: "rgba(125,166,39,0.15)", color: "#7DA627", border: "1px solid rgba(125,166,39,0.3)" }}
              >
                Charger plus de mods
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}