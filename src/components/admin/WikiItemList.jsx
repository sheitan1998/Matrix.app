import React, { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FARMING_SIM_CATEGORIES } from "@/components/tuto-gaming/farmingSimData";
import { toast } from "sonner";
import WikiItemEditModal from "@/components/admin/WikiItemEditModal";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";

export default function WikiItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.WikiEntry.filter({ game_slug: "farming-simulator-25" }, "sort_order", 200);
      setItems(data);
    } catch {
      toast.error("Erreur lors du chargement des éléments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const getCategoryTitle = (catId) => {
    const cat = FARMING_SIM_CATEGORIES.find((c) => c.id === catId);
    return cat?.title || catId || "—";
  };

  const getSubCategoryTitle = (catId, subId) => {
    const cat = FARMING_SIM_CATEGORIES.find((c) => c.id === catId);
    const sub = cat?.cards.find((c) => c.id === subId);
    return sub?.title || subId || "—";
  };

  const handleReorder = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setItems(updated);
    try {
      await base44.entities.WikiEntry.update(moved.id, { sort_order: newIndex });
      await base44.entities.WikiEntry.update(updated[index].id, { sort_order: index });
    } catch {
      toast.error("Erreur lors du réordonnancement.");
      fetchItems();
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await base44.entities.WikiEntry.delete(deletingItem.id);
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      toast.success("Élément supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setDeletingItem(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 py-12 text-center" style={{ background: "rgba(26,26,26,0.5)" }}>
        <p className="text-sm text-white/30">Aucun élément dans le Wiki pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-lg border border-white/5 px-4 py-3"
          style={{ background: "#1a1a1a" }}
        >
          {/* Thumbnail */}
          <div className="w-12 h-12 rounded overflow-hidden shrink-0" style={{ background: "#262626" }}>
            {item.thumbnail_url && (
              <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{item.title}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">
              {getCategoryTitle(item.category)} — {getSubCategoryTitle(item.category, item.sub_category)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleReorder(index, -1)}
              disabled={index === 0}
              className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-20"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleReorder(index, 1)}
              disabled={index === items.length - 1}
              className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-20"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingItem(item)}
              className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-[#7DA627] hover:bg-white/10 transition"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeletingItem(item)}
              className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-white/10 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {editingItem && (
        <WikiItemEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={() => { setEditingItem(null); fetchItems(); }}
        />
      )}

      {deletingItem && (
        <ConfirmDeleteModal
          title={deletingItem.title}
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
}