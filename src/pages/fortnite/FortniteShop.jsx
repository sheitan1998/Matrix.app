import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShoppingBag, Coins, Loader2, ArrowLeft, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { getRarityStyle } from "@/components/fortnite/rarityUtils";
import ShopItemModal from "@/components/fortnite/ShopItemModal";
import usePageSEO from "@/hooks/usePageSEO";

const PAGE_SIZE = 24;

export default function FortniteShop() {
  usePageSEO({
    title: "Boutique Fortnite du Jour | MATRIX",
    description: "Découvrez la boutique Fortnite du jour avec tous les objets, skins, pioches et emotes disponibles.",
    path: "/fortnite-shop",
  });

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const fetchShop = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("fortniteApi", { action: "getDailyShop" });
      setShop(res.data);
    } catch {
      /* silent */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  const allItems = shop?.entries || [];
  const visibleItems = allItems.slice(0, visibleCount);
  const hasMore = visibleCount < allItems.length;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto pb-12">
      <Link to="/fortnite-maps" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition mb-5 tap-sm">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold">Cartes Fortnite</span>
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <ShoppingBag className="w-5 h-5" style={{ color: "#f59e0b" }} />
        <h1 className="text-2xl font-black text-white">Boutique du Jour</h1>
      </div>
      <p className="text-xs text-white/40 mb-4">Tous les objets Battle Royale disponibles dans la boutique Fortnite d'aujourd'hui</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      ) : !shop || shop.error || allItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-sm text-white/40">Boutique indisponible pour le moment.</p>
        </div>
      ) : (
        <>
          {shop.date && (
            <div className="flex items-center gap-1.5 mb-5 text-xs text-white/40">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(shop.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          )}

          <p className="text-[10px] text-white/30 mb-3">{allItems.length} objets disponibles</p>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {visibleItems.map((item, i) => (
              <ShopCard key={item.id || i} item={item} index={i} onClick={() => setSelectedItem(item)} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="px-6 py-2.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm"
                style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}
              >
                Voir plus ({allItems.length - visibleCount} restants)
              </button>
            </div>
          )}
        </>
      )}

      <ShopItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

function ShopCard({ item, index, onClick }) {
  const style = getRarityStyle(item.rarity);
  const images = item.images || {};
  const mainImage = images.featured || images.icon || images.smallIcon || item.image;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.02, 0.4), duration: 0.3 }}
      onClick={onClick}
      className="rounded-lg overflow-hidden flex flex-col cursor-pointer transition hover:scale-105"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <div className="relative aspect-square overflow-hidden" style={{ background: style.bg }}>
        {mainImage ? (
          <img src={mainImage} alt={item.name} className="w-full h-full object-contain p-2" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl" style={{ color: style.text, opacity: 0.3 }}>🎮</span>
          </div>
        )}
      </div>
      <div className="p-1.5 sm:p-2">
        <p className="text-[9px] sm:text-[10px] font-bold text-white truncate">{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[8px] sm:text-[9px] uppercase" style={{ color: style.text }}>
            {item.type}
          </span>
          {item.price > 0 && (
            <span className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black" style={{ color: "#fbbf24" }}>
              <Coins className="w-2.5 h-2.5" />
              {item.price}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}