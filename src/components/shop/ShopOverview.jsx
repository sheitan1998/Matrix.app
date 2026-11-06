import React from "react";
import ShopCategoryCard from "@/components/shop/ShopCategoryCard";
import SpecialOfferCard from "@/components/shop/SpecialOfferCard";

export default function ShopOverview({ categories, offer, onOpenCategory, onOpenOffer }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Rayons de la boutique</h2>
        <span className="text-[10px] text-white/30">{categories.length} catégories</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <ShopCategoryCard
            key={category.key}
            category={category}
            onClick={() => onOpenCategory(category.key)}
          />
        ))}
        <SpecialOfferCard offer={offer} onClick={onOpenOffer} />
      </div>
    </section>
  );
}