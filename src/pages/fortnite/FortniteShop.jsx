import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShoppingBag, Coins, Loader2, ArrowLeft, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { getRarityStyle } from "@/components/fortnite/rarityUtils";
import ShopItemModal from "@/components/fortnite/ShopItemModal";
import usePageSEO from "@/hooks/usePageSEO";

export default function FortniteShop() {
  usePageSEO({
    title: "Boutique Fortnite du Jour | MATRIX",
    description: "Découvrez la boutique Fortnite du jour avec tous les objets, skins, pioches et emotes disponibles.",
    path: "/fortnite-shop",
  });

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

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

  // Group entries by layout
  const grouped = {};
  if (shop?.entries) {
    for (const entry of shop.entries) {
      const layout = entry.layout || "Autres";
      if (!grouped[layout]) grouped[layout] = [];
      grouped[layout].push(entry);
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto pb-12">
      {/* Back */}
      <Link to="/fortnite-maps" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition mb-5 tap-sm">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold">Cartes Fortnite</span>
      </Link>

      {/* Title */}
      <div className="flex items-center gap-2 mb-1">
        <ShoppingBag className="w-5 h-5" style={{ color: "#f59e0b" }} />
        <h1 className="text-2xl font-black text-white">Boutique du Jour</h1>
      </div>
      <p className="text-xs text-white/40 mb-4">Tous les objets disponibles dans la boutique Fortnite d'aujourd'hui</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      ) : !shop || shop.error || !shop.entries || shop.entries.length === 0 ? (
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

          {Object.entries(grouped).map(([layout, items]) => (
            <div key={layout} className="mb-8">
              <h2 className="text-sm font-black text-white uppercase tracking-tight mb-3">{layout}</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                {items.map((item, i) => (
                  <ShopCard key={item.id || i} item={item} index={i} onClick={() => setSelectedItem(item)} />
                ))}
              </div>
            </div>
          ))}
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
      transition={{ delay: index * 0.02, duration: 0.3 }}
      onClick={onClick}
      className="rounded-lg overflow-hidden flex flex-col cursor-pointer transition hover:scale-105"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <div className="relative aspect-square overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
        {mainImage ? (
          <img src={mainImage} alt={item.name} className="w-full h-full object-contain p-2" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl opacity-20">🎮</span>
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