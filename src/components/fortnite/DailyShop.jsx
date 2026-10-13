import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ShoppingBag, Coins } from "lucide-react";
import { motion } from "framer-motion";

const RARITY_COLORS = {
  common: { bg: "rgba(158,158,158,0.15)", border: "rgba(158,158,158,0.4)", text: "#9e9e9e" },
  uncommon: { bg: "rgba(76,175,80,0.15)", border: "rgba(76,175,80,0.4)", text: "#4caf50" },
  rare: { bg: "rgba(33,150,243,0.15)", border: "rgba(33,150,243,0.4)", text: "#2196f3" },
  epic: { bg: "rgba(156,39,176,0.15)", border: "rgba(156,39,176,0.4)", text: "#9c27b0" },
  legendary: { bg: "rgba(255,152,0,0.15)", border: "rgba(255,152,0,0.4)", text: "#ff9800" },
  mythic: { bg: "rgba(244,67,54,0.15)", border: "rgba(244,67,54,0.4)", text: "#f44336" },
  marvel: { bg: "rgba(233,30,99,0.15)", border: "rgba(233,30,99,0.4)", text: "#e91e63" },
  dc: { bg: "rgba(63,81,181,0.15)", border: "rgba(63,81,181,0.4)", text: "#3f51b5" },
  icon: { bg: "rgba(0,188,212,0.15)", border: "rgba(0,188,212,0.4)", text: "#00bcd4" },
  starwars: { bg: "rgba(255,235,59,0.15)", border: "rgba(255,235,59,0.4)", text: "#ffeb3b" },
  gaminglegends: { bg: "rgba(139,195,74,0.15)", border: "rgba(139,195,74,0.4)", text: "#8bc34a" },
};

function getRarityStyle(rarity) {
  const key = (rarity || "common").toLowerCase().replace(/\s/g, "");
  return RARITY_COLORS[key] || RARITY_COLORS.common;
}

export default function DailyShop() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchShop = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("fortniteApi", { action: "getDailyShop" });
      setShop(res.data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShop();
    const interval = setInterval(fetchShop, 60 * 60 * 1000); // refresh every 60 min
    return () => clearInterval(interval);
  }, [fetchShop]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (!shop || shop.error || !shop.entries || shop.entries.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-4 h-4" style={{ color: "#f59e0b" }} />
        <h2 className="text-sm font-black text-white uppercase tracking-tight">Boutique du Jour</h2>
        {shop.date && <span className="text-[9px] text-white/30 ml-auto">{shop.date}</span>}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {shop.entries.map((item, i) => (
          <ShopItem key={item.id || i} item={item} index={i} />
        ))}
      </div>

      {shop.total > shop.entries.length && (
        <p className="text-[10px] text-white/30 text-center mt-3">
          +{shop.total - shop.entries.length} autres objets disponibles
        </p>
      )}
    </div>
  );
}

function ShopItem({ item, index = 0 }) {
  const style = getRarityStyle(item.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      className="rounded-lg overflow-hidden flex flex-col"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <div className="relative aspect-square overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl opacity-20">🎮</span>
          </div>
        )}
      </div>
      <div className="p-1.5 sm:p-2">
        <p className="text-[9px] sm:text-[10px] font-bold text-white truncate">{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[8px] sm:text-[9px] uppercase" style={{ color: style.text }}>{item.type}</span>
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