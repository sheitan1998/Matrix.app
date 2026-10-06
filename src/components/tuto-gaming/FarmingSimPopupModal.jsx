import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2, Images } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { normalizeAppAssetUrl } from "@/lib/urlUtils";
import GalleryLightboxViewer from "@/components/tuto-gaming/GalleryLightboxViewer";

export default function FarmingSimPopupModal({ popupKey, title, onClose }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (!popupKey) return;
    setLoading(true);
    try {
      const data = await base44.entities.FarmingSimPopup.filter({ popup_key: popupKey });
      setCategories(data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [popupKey]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Realtime sync — works on both web and Tauri desktop
  useEffect(() => {
    if (!popupKey) return;
    const unsub = base44.entities.FarmingSimPopup.subscribe(() => fetchCategories());
    return () => { if (unsub) unsub(); };
  }, [popupKey, fetchCategories]);

  const standalone = categories
    .filter((c) => c.is_standalone && !c.parent_slug)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const topCats = categories
    .filter((c) => !c.parent_slug && !c.is_standalone)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const getSubs = (parentSlug) =>
    categories
      .filter((c) => c.parent_slug === parentSlug)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        {/* Modal container */}
        <div
          className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
          style={{ background: "#1a1a1a", border: "1px solid rgba(125,166,39,0.3)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3 shrink-0"
            style={{ background: "rgba(13,5,24,0.6)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-2">
              <span className="block w-1 h-5 rounded-full" style={{ background: "#7DA627" }} />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition tap-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-white/30" />
              </div>
            ) : topCats.length === 0 && standalone.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/10 py-12 text-center">
                <span className="text-xs text-white/30 uppercase tracking-wider">Aucun contenu pour le moment</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Standalone images (no category) */}
                {standalone.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="block w-1 h-4 rounded-full" style={{ background: "#7DA627" }} />
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">Images</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {standalone.map((img) => (
                        <button
                          key={img.id}
                          onClick={() => setLightbox(img)}
                          className="group rounded-lg overflow-hidden border border-white/10 hover:border-[#7DA627]/40 transition"
                          style={{ background: "#262626" }}
                        >
                          <div className="relative overflow-hidden">
                            <img
                              src={normalizeAppAssetUrl(img.img)}
                              alt={img.title}
                              className="w-full h-auto max-h-64 object-contain"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-end p-2">
                              <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition uppercase tracking-wider">
                                {img.title}
                              </span>
                            </div>
                          </div>
                          <div className="px-2 py-1.5 border-t border-white/5">
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider truncate block">{img.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {topCats.map((cat) => {
                  const subs = getSubs(cat.slug);
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="block w-1 h-4 rounded-full" style={{ background: "#7DA627" }} />
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                          {cat.title}
                        </h3>
                        {subs.length > 0 && (
                          <span className="text-[10px] text-white/30 ml-auto">{subs.length} entrée{subs.length > 1 ? "s" : ""}</span>
                        )}
                      </div>

                      {/* Category-level image (if it has one directly) */}
                      {cat.img && (
                        <button
                          onClick={() => setLightbox(cat)}
                          className="block w-full mb-3 rounded-lg overflow-hidden border border-white/10 hover:border-[#7DA627]/40 transition"
                        >
                          <img
                            src={normalizeAppAssetUrl(cat.img)}
                            alt={cat.title}
                            className="w-full h-auto max-h-64 object-contain"
                            style={{ background: "#262626" }}
                          />
                        </button>
                      )}

                      {/* Sub-category images */}
                      {subs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {subs.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => setLightbox(sub)}
                              className="group rounded-lg overflow-hidden border border-white/10 hover:border-[#7DA627]/40 transition text-left"
                              style={{ background: "#262626" }}
                            >
                              {sub.img ? (
                                <div className="relative overflow-hidden">
                                  <img
                                    src={normalizeAppAssetUrl(sub.img)}
                                    alt={sub.title}
                                    className="w-full h-auto max-h-48 object-contain"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-end p-2">
                                    <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition uppercase tracking-wider">
                                      {sub.title}
                                    </span>
                                  </div>
                                  {(sub.gallery?.length || 0) > 0 && (
                                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white flex items-center gap-0.5" style={{ background: "rgba(125,166,39,0.9)" }}>
                                      <Images className="w-2.5 h-2.5" />{sub.gallery.length}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="h-32 flex items-center justify-center">
                                  <span className="text-[10px] text-white/30 uppercase tracking-wider">Pas d'image</span>
                                </div>
                              )}
                              {sub.img && (
                                <div className="px-2 py-1.5 border-t border-white/5">
                                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider truncate block">
                                    {sub.title}
                                  </span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : !cat.img ? (
                        <div className="rounded-lg border border-dashed border-white/10 py-4 text-center">
                          <span className="text-xs text-white/30">Bientôt disponible</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox for full-size image view with gallery navigation */}
      {lightbox && (
        <GalleryLightboxViewer
          item={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}