import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { effectivePrices, formatEuro } from "@/lib/shopPricing";
import ShopProductEditor from "@/components/admin/ShopProductEditor";

const SECTION_LABELS = {
  cosmetics: "Cosmétiques",
  trix: "Jetons Trix",
  boosts: "Boosts Flash",
  subscriptions: "Abonnements",
  vip: "VIP",
  tickets: "Tickets & Offres",
  other: "Autres Produits",
};

export default function ShopProductsPanel() {
  const [items, setItems] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [products, configs] = await Promise.all([
        base44.entities.MatrixShopItem.list("sort_order", 200),
        base44.entities.MatrixShopConfig.list("-created_date", 1),
      ]);
      setItems(products);
      setConfig(configs[0] || {});
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleActive = async (item) => {
    await base44.entities.MatrixShopItem.update(item.id, { is_active: !item.is_active });
    fetchData();
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-widest text-violet-300">Produits de la boutique</h4>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-black text-white" style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}>
          <Plus className="h-3.5 w-3.5" /> Nouveau produit
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-xs text-white/30">Aucun produit pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const prices = effectivePrices(item, config);
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border border-white/5 px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg" style={{ background: "rgba(168,85,247,0.12)" }}>
                  {item.preview_image ? <img src={item.preview_image} alt="" className="h-full w-full object-cover" /> : <span className="text-base">{item.icon || "✨"}</span>}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-white">{item.name}</p>
                    {!item.is_active && <span className="text-[9px] font-bold uppercase text-red-400">Masqué</span>}
                  </div>
                  <p className="truncate text-[10px] text-white/35">
                    {SECTION_LABELS[item.shop_section || "cosmetics"]} · {formatEuro(prices.priceEuros)}
                    {item.price_trix > 0 ? ` · ${prices.priceTrix} Trix` : ""}
                    {prices.discountPercent > 0 ? ` · -${prices.discountPercent}%` : ""}
                  </p>
                </div>
                <button onClick={() => toggleActive(item)} className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-white" title="Visibilité">
                  {item.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => setEditing(item)} className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-violet-300" title="Modifier">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {creating && <ShopProductEditor onClose={() => setCreating(false)} onSaved={fetchData} />}
      {editing && <ShopProductEditor product={editing} onClose={() => setEditing(null)} onSaved={fetchData} />}
    </div>
  );
}