import React, { useState, useEffect } from "react";
import { X, Coins, Calendar, Tag, Layers, Clock } from "lucide-react";
import { getRarityStyle } from "@/components/fortnite/rarityUtils";
import CosmeticReactionBar from "@/components/fortnite/CosmeticReactionBar";
import { base44 } from "@/api/base44Client";

export default function ShopItemModal({ item, onClose, user }) {
  const [voteCounts, setVoteCounts] = useState(null);
  const [setItems, setSetItems] = useState([]);

  useEffect(() => {
    if (!item?.id) return;
    base44.functions.invoke("fortniteApi", { action: "getCosmeticVoteCounts", cosmetic_ids: [item.id] })
      .then((res) => setVoteCounts(res.data?.[item.id] || null)).catch(() => {});
    if (item.series || item.set_display) {
      base44.functions.invoke("fortniteApi", { action: "getSetItems", set: item.series || item.set_display })
        .then((res) => setSetItems((res.data || []).filter(s => s.id !== item.id))).catch(() => {});
    }
  }, [item?.id]);

  if (!item) return null;
  const style = getRarityStyle(item.rarity);
  const images = item.images || {};
  const mainImage = images.featured || images.icon || images.smallIcon || item.image;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl flex flex-col md:flex-row" style={{ background: "#0a0512", border: `1.5px solid ${style.border}` }} onClick={(e) => e.stopPropagation()}>
        {/* Left: Media */}
        <div className="md:w-1/2 relative overflow-hidden flex items-center justify-center" style={{ background: style.bg, minHeight: "280px" }}>
          <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center md:hidden" style={{ background: "rgba(0,0,0,0.5)" }}>
            <X className="w-4 h-4 text-white" />
          </button>
          {item.video ? (
            <video src={item.video} autoPlay loop muted playsInline className="w-full h-full max-h-[50vh] object-contain p-4" />
          ) : mainImage ? (
            <img src={mainImage} alt={item.name} className="w-full h-full max-h-[50vh] object-contain p-4" />
          ) : (
            <div className="h-64 flex items-center justify-center"><span className="text-5xl" style={{ opacity: 0.2 }}>🎮</span></div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider" style={{ background: "rgba(0,0,0,0.5)", color: style.text, border: `1px solid ${style.border}` }}>
              {item.rarity_display || item.rarity || "common"}
            </span>
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:w-1/2 flex flex-col overflow-y-auto max-h-[92vh]">
          <div className="flex items-center justify-between p-4 border-b sticky top-0 z-10" style={{ background: "#0a0512", borderColor: "rgba(255,255,255,0.06)" }}>
            <h2 className="text-lg font-black text-white truncate flex-1">{item.name}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 tap-sm hidden md:flex" style={{ background: "rgba(255,255,255,0.05)" }}>
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {item.description && <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>}

            <div className="grid grid-cols-2 gap-3">
              {item.price > 0 && (
                <div className="rounded-lg p-2.5" style={{ background: "rgba(251,191,36,0.08)" }}>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider flex items-center gap-1"><Coins className="w-2.5 h-2.5" /> Prix</p>
                  <p className="text-sm font-black flex items-center gap-1" style={{ color: "#fbbf24" }}>{item.price} V-Bucks</p>
                </div>
              )}
              <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-[9px] text-white/40 uppercase tracking-wider flex items-center gap-1"><Tag className="w-2.5 h-2.5" /> Type</p>
                <p className="text-sm font-bold text-white capitalize">{item.type}</p>
              </div>
              {item.layout && (
                <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider flex items-center gap-1"><Layers className="w-2.5 h-2.5" /> Section</p>
                  <p className="text-sm font-bold text-white truncate">{item.layout}</p>
                </div>
              )}
              {item.chapter && (
                <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider">Chapitre</p>
                  <p className="text-sm font-bold text-white">Ch. {item.chapter}{item.season ? ` · S. ${item.season}` : ""}</p>
                </div>
              )}
              {item.added && (
                <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> Ajouté</p>
                  <p className="text-sm font-bold text-white">{new Date(item.added).toLocaleDateString("fr-FR")}</p>
                </div>
              )}
              <div className="rounded-lg p-2.5" style={{ background: "rgba(34,197,94,0.08)" }}>
                <p className="text-[9px] text-white/40 uppercase tracking-wider flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Dispo</p>
                <p className="text-sm font-bold text-green-400">Boutique du jour</p>
              </div>
            </div>

            {item.audio && !item.video && (
              <audio src={item.audio} controls className="w-full h-8" />
            )}

            {/* Reactions */}
            <div className="pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Réactions</p>
              <CosmeticReactionBar cosmetic={item} user={user} counts={voteCounts} />
            </div>

            {/* Same set items */}
            {setItems.length > 0 && (
              <div className="pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Même ensemble ({item.series || item.set_display})</p>
                <div className="flex flex-wrap gap-2">
                  {setItems.map((s) => {
                    const sStyle = getRarityStyle(s.rarity);
                    const sImg = s.images?.featured || s.images?.icon || s.image;
                    return (
                      <div key={s.id} className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: sStyle.bg, border: `1px solid ${sStyle.border}` }} title={s.name}>
                        {sImg ? <img src={sImg} alt={s.name} className="w-full h-full object-contain p-0.5" /> : <span className="text-xs">🎮</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}