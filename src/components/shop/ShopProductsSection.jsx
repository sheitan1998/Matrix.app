import React from "react";
import { ShoppingBag } from "lucide-react";
import ShopProductCard from "@/components/shop/ShopProductCard";

export default function ShopProductsSection({ category, items, config, onOpen }) {
  return (
    <section>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: `${category.accent_color || "#a855f7"}18`, border: `1px solid ${category.accent_color || "#a855f7"}35` }}>
          {category.icon || "✨"}
        </span>
        <div>
          <h2 className="text-base font-black text-white">{category.label}</h2>
          <p className="text-[11px] text-white/45">{category.description}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl px-4 py-14 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(168,85,247,0.28)" }}>
          <ShoppingBag className="mx-auto mb-3 h-9 w-9 text-white/20" />
          <p className="text-sm font-bold text-white/60">Aucun produit dans cette catégorie pour le moment.</p>
          <p className="mt-1 text-[11px] text-white/30">De nouvelles offres arrivent très bientôt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ShopProductCard key={item.id} item={item} config={config} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}