import React, { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FARMING_SIM_CATEGORIES } from "@/components/tuto-gaming/farmingSimData";
import { toast } from "sonner";

export default function ReorderManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [wikiItems, farmCats] = await Promise.all([
        base44.entities.WikiEntry.filter({ game_slug: "farming-simulator-25" }, "sort_order", 200),
        base44.entities.FarmingSimCategory.list('sort_order', 200),
      ]);
      setItems(wikiItems);
      setCategories(farmCats);
    } catch {
      toast.error("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const topCategories = categories.filter((c) => !c.parent_slug).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const getCategoryTitle = (catId) => {
    const cat = FARMING_SIM_CATEGORIES.find((c) => c.id === catId);
    return cat?.title || catId || "—";
  };

  const handleReorderItem = async (index, direction) => {
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
      fetchData();
    }
  };

  const handleReorderCategory = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= topCategories.length) return;
    const a = topCategories[index];
    const b = topCategories[newIndex];
    try {
      await base44.entities.FarmingSimCategory.update(a.id, { sort_order: newIndex });
      await base44.entities.FarmingSimCategory.update(b.id, { sort_order: index });
      fetchData();
    } catch {
      toast.error("Erreur lors du réordonnancement.");
    }
  };

  const handleReorderSub = async (parentSlug, index, direction) => {
    const subs = categories.filter((c) => c.parent_slug === parentSlug).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= subs.length) return;
    const a = subs[index];
    const b = subs[newIndex];
    try {
      await base44.entities.FarmingSimCategory.update(a.id, { sort_order: newIndex });
      await base44.entities.FarmingSimCategory.update(b.id, { sort_order: index });
      fetchData();
    } catch {
      toast.error("Erreur lors du réordonnancement.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Wiki items reorder */}
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-white/60 mb-3">
          Éléments Wiki
        </h3>
        {items.length === 0 ? (
          <p className="text-xs text-white/30 py-4">Aucun élément à réorganiser.</p>
        ) : (
          <div className="space-y-1.5">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border border-white/5 px-4 py-2.5" style={{ background: "#1a1a1a" }}>
                <div className="w-10 h-10 rounded overflow-hidden shrink-0" style={{ background: "#262626" }}>
                  {item.thumbnail_url && <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{item.title}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">{getCategoryTitle(item.category)}</p>
                </div>
                <button onClick={() => handleReorderItem(index, -1)} disabled={index === 0}
                  className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-20">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => handleReorderItem(index, 1)} disabled={index === items.length - 1}
                  className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-20">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categories reorder */}
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-white/60 mb-3">
          Catégories & Sous-catégories
        </h3>
        <div className="space-y-2">
          {topCategories.map((cat, index) => {
            const subs = categories.filter((c) => c.parent_slug === cat.slug).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            return (
              <div key={cat.id} className="rounded-lg border border-white/5 overflow-hidden" style={{ background: "#1a1a1a" }}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                  <button onClick={() => handleReorderCategory(index, -1)} disabled={index === 0}
                    className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-20">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleReorderCategory(index, 1)} disabled={index === topCategories.length - 1}
                    className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-20">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-sm font-bold text-white uppercase tracking-tight">{cat.title}</span>
                </div>
                {subs.length > 0 && (
                  <div className="px-4 py-1.5 space-y-1">
                    {subs.map((sub, subIndex) => (
                      <div key={sub.id} className="flex items-center gap-2 py-1">
                        <button onClick={() => handleReorderSub(cat.slug, subIndex, -1)} disabled={subIndex === 0}
                          className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white transition disabled:opacity-20">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleReorderSub(cat.slug, subIndex, 1)} disabled={subIndex === subs.length - 1}
                          className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white transition disabled:opacity-20">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {sub.img && (
                          <div className="w-7 h-7 rounded overflow-hidden shrink-0" style={{ background: "#262626" }}>
                            <img src={sub.img} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="flex-1 text-xs text-white/70">{sub.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}