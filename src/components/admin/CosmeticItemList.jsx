import React, { useState, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, Loader2, Eye, EyeOff, Pencil } from "lucide-react";
import { toast } from "sonner";
import CosmeticEditModal from "@/components/admin/CosmeticEditModal";
import CosmeticPreview from "@/components/cosmetics/CosmeticPreview";

const RARITY_COLORS = {
  common: "#9ca3af", rare: "#3b82f6", epic: "#a855f7", legendary: "#f59e0b",
};

export default function CosmeticItemList({ refreshKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const data = await base44.entities.MatrixShopItem.list("-created_date", 200);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    const unsub = base44.entities.MatrixShopItem.subscribe(() => fetchItems());
    return unsub;
  }, [fetchItems, refreshKey]);

  const handleDelete = async (item) => {
    if (!confirm(`Supprimer "${item.name}" ? Le produit Stripe sera désactivé.`)) return;
    setDeleting(item.id);
    try {
      const res = await base44.functions.invoke("cosmeticShop", { action: "deleteItem", itemId: item.id });
      if (res?.data?.error) { toast.error(res.data.error); return; }
      toast.success("Article supprimé et produit Stripe désactivé.");
      fetchItems();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors de la suppression.");
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (item) => {
    try {
      await base44.entities.MatrixShopItem.update(item.id, { is_active: !item.is_active });
      toast.success(item.is_active ? "Article masqué." : "Article visible.");
      fetchItems();
    } catch {
      toast.error("Erreur.");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-white/30 text-center py-6">Aucun cosmétique créé pour le moment.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map(item => {
        const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
        return (
          <div key={item.id} className="flex items-center gap-3 rounded-lg border border-white/5 px-3 py-2.5" style={{ background: "#1a1a1a" }}>
            {/* Preview */}
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: `${rarityColor}15` }}>
              <CosmeticPreview item={item} size="text-lg" aspect={item.category === "profile_cover" ? "video" : "square"} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0" style={{ background: `${rarityColor}20`, color: rarityColor }}>
                  {item.rarity}
                </span>
                <p className="text-sm font-bold text-white truncate">{item.name}</p>
                {!item.is_active && (
                  <span className="text-[9px] font-bold text-red-400 uppercase">Masqué</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-white/40">{item.category}</span>
                <span className="text-[10px] text-white/30">·</span>
                <span className="text-[10px] font-bold text-green-400">{item.price_euros ? `${item.price_euros}€` : `${item.price_trix / 100}€`}</span>
                {item.stripe_price_id && (
                  <>
                    <span className="text-[10px] text-white/30">·</span>
                    <span className="text-[10px] text-[#a855f7]">Stripe ✓</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggleActive(item)} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10" title={item.is_active ? "Masquer" : "Afficher"}>
                {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setEditing(item)} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-[#a855f7] hover:bg-white/10" title="Modifier">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(item)} disabled={deleting === item.id} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-white/10 disabled:opacity-30" title="Supprimer">
                {deleting === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        );
      })}
      {editing && (
        <CosmeticEditModal
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={fetchItems}
        />
      )}
    </div>
  );
}