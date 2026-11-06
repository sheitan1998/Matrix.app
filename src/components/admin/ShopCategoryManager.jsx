import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import ShopCategoryEditor from "@/components/admin/ShopCategoryEditor";

export default function ShopCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setCategories(await base44.entities.MatrixShopCategory.list("sort_order", 100));
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const toggleActive = async (category) => {
    await base44.entities.MatrixShopCategory.update(category.id, { is_active: !category.is_active });
    fetchCategories();
  };

  const remove = async (category) => {
    if (!confirm(`Supprimer la catégorie "${category.label}" ?`)) return;
    try {
      await base44.entities.MatrixShopCategory.delete(category.id);
      toast.success("Catégorie supprimée.");
      fetchCategories();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-widest text-violet-300">Cartes de catégories</h4>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-black text-white" style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}>
          <Plus className="h-3.5 w-3.5" /> Nouvelle catégorie
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
      ) : categories.length === 0 ? (
        <p className="py-6 text-center text-xs text-white/30">Aucune catégorie personnalisée. Les catégories par défaut sont affichées sur la boutique.</p>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-3 rounded-lg border border-white/5 px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)" }}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg" style={{ background: `${category.accent_color || "#a855f7"}18` }}>
                {category.image_url ? <img src={category.image_url} alt="" className="h-full w-full object-cover" /> : <span className="text-base">{category.icon || "✨"}</span>}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-bold text-white">{category.label}</p>
                  {!category.is_active && <span className="text-[9px] font-bold uppercase text-red-400">Masquée</span>}
                </div>
                <p className="truncate text-[10px] text-white/35">{category.key} · ordre {category.sort_order ?? 0}</p>
              </div>
              <button onClick={() => toggleActive(category)} className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-white" title="Visibilité">
                {category.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => setEditing(category)} className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-violet-300" title="Modifier">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => remove(category)} className="flex h-7 w-7 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-red-400" title="Supprimer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {creating && <ShopCategoryEditor onClose={() => setCreating(false)} onSaved={fetchCategories} />}
      {editing && <ShopCategoryEditor category={editing} onClose={() => setEditing(null)} onSaved={fetchCategories} />}
    </div>
  );
}