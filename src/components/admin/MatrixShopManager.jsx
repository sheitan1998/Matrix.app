import React from "react";
import ShopPromoPanel from "@/components/admin/ShopPromoPanel";
import ShopCategoryManager from "@/components/admin/ShopCategoryManager";
import ShopProductsPanel from "@/components/admin/ShopProductsPanel";

export default function MatrixShopManager() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(15,10,25,0.6)" }}>
        <h3 className="mb-1 text-sm font-black uppercase tracking-tight text-white">Offre spéciale & promotions</h3>
        <p className="mb-4 text-[10px] text-white/40">
          Activez une réduction globale ou mettez en avant un produit. Les prix affichés et facturés sont recalculés automatiquement.
        </p>
        <ShopPromoPanel />
      </div>

      <div className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(15,10,25,0.6)" }}>
        <h3 className="mb-1 text-sm font-black uppercase tracking-tight text-white">Catégories de la boutique</h3>
        <p className="mb-4 text-[10px] text-white/40">Nom, visuel, description, couleur et ordre des cartes de la vue d'ensemble.</p>
        <ShopCategoryManager />
      </div>

      <div className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(15,10,25,0.6)" }}>
        <h3 className="mb-1 text-sm font-black uppercase tracking-tight text-white">Produits</h3>
        <p className="mb-4 text-[10px] text-white/40">Prix, visuels, rayon et promotions individuelles de chaque produit.</p>
        <ShopProductsPanel />
      </div>
    </div>
  );
}