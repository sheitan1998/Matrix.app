import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Pencil, Loader2, X, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import { normalizeAppAssetUrl } from "@/lib/urlUtils";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [addingSubFor, setAddingSubFor] = useState(null);
  const [newSubTitle, setNewSubTitle] = useState("");
  const [newSubImg, setNewSubImg] = useState("");
  const [uploadingSubImg, setUploadingSubImg] = useState(false);
  const [addingCat, setAddingCat] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState("");
  const [deletingCat, setDeletingCat] = useState(null);
  const [deletingSub, setDeletingSub] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.FarmingSimCategory.list('sort_order', 200);
      setCategories(data);
    } catch {
      toast.error("Erreur lors du chargement des catégories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const topCategories = categories.filter((c) => !c.parent_slug).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const getSubs = (parentSlug) => categories.filter((c) => c.parent_slug === parentSlug).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const handleUploadSubImg = async (file) => {
    if (!file) return;
    setUploadingSubImg(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setNewSubImg(normalizeAppAssetUrl(file_url));
    } catch {
      toast.error("Erreur lors de l'upload.");
    } finally {
      setUploadingSubImg(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatTitle.trim()) return;
    const slug = newCatTitle.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    try {
      await base44.entities.FarmingSimCategory.create({
        title: newCatTitle.trim(),
        slug,
        parent_slug: null,
        sort_order: topCategories.length,
        game_slug: "farming-simulator-25",
      });
      toast.success("Catégorie ajoutée.");
      setNewCatTitle("");
      setAddingCat(false);
      fetchCategories();
    } catch {
      toast.error("Erreur lors de l'ajout.");
    }
  };

  const handleAddSubCategory = async (parentSlug) => {
    if (!newSubTitle.trim()) return;
    const slug = newSubTitle.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const subs = getSubs(parentSlug);
    try {
      await base44.entities.FarmingSimCategory.create({
        title: newSubTitle.trim(),
        slug,
        parent_slug: parentSlug,
        img: newSubImg || "",
        sort_order: subs.length,
        game_slug: "farming-simulator-25",
      });
      toast.success("Sous-catégorie ajoutée.");
      setNewSubTitle("");
      setNewSubImg("");
      setAddingSubFor(null);
      fetchCategories();
    } catch {
      toast.error("Erreur lors de l'ajout.");
    }
  };

  const handleRenameCat = async (cat) => {
    if (!editingTitle.trim()) return;
    try {
      await base44.entities.FarmingSimCategory.update(cat.id, { title: editingTitle.trim() });
      toast.success("Catégorie renommée.");
      setEditingCat(null);
      fetchCategories();
    } catch {
      toast.error("Erreur lors du renommage.");
    }
  };

  const handleReorderCat = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= topCategories.length) return;
    const a = topCategories[index];
    const b = topCategories[newIndex];
    try {
      await base44.entities.FarmingSimCategory.update(a.id, { sort_order: newIndex });
      await base44.entities.FarmingSimCategory.update(b.id, { sort_order: index });
      fetchCategories();
    } catch {
      toast.error("Erreur lors du réordonnancement.");
    }
  };

  const handleReorderSub = async (parentSlug, index, direction) => {
    const subs = getSubs(parentSlug);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= subs.length) return;
    const a = subs[index];
    const b = subs[newIndex];
    try {
      await base44.entities.FarmingSimCategory.update(a.id, { sort_order: newIndex });
      await base44.entities.FarmingSimCategory.update(b.id, { sort_order: index });
      fetchCategories();
    } catch {
      toast.error("Erreur lors du réordonnancement.");
    }
  };

  const handleDeleteCat = async () => {
    if (!deletingCat) return;
    try {
      const subs = getSubs(deletingCat.slug);
      for (const sub of subs) {
        await base44.entities.FarmingSimCategory.delete(sub.id);
      }
      await base44.entities.FarmingSimCategory.delete(deletingCat.id);
      toast.success("Catégorie supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setDeletingCat(null);
      fetchCategories();
    }
  };

  const handleDeleteSub = async () => {
    if (!deletingSub) return;
    try {
      await base44.entities.FarmingSimCategory.delete(deletingSub.id);
      toast.success("Sous-catégorie supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setDeletingSub(null);
      fetchCategories();
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
    <div className="space-y-3">
      {/* Add category button */}
      {addingCat ? (
        <div className="rounded-lg border border-white/10 p-4" style={{ background: "#1a1a1a" }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatTitle}
              onChange={(e) => setNewCatTitle(e.target.value)}
              placeholder="Nom de la nouvelle catégorie"
              className="flex-1 h-10 px-3 rounded-lg text-sm text-white border border-white/10 focus:border-[#7DA627] outline-none placeholder:text-white/20"
              style={{ background: "#0d0518" }}
            />
            <button onClick={handleAddCategory} className="h-10 px-4 rounded-lg text-xs font-bold text-white" style={{ background: "#7DA627" }}>Ajouter</button>
            <button onClick={() => { setAddingCat(false); setNewCatTitle(""); }} className="w-10 h-10 rounded-lg flex items-center justify-center text-white/40 hover:text-white border border-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingCat(true)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white border border-white/10 hover:bg-white/5 transition tap-sm"
        >
          <Plus className="w-4 h-4" /> Ajouter une catégorie
        </button>
      )}

      {/* Categories list */}
      {topCategories.map((cat, index) => {
        const subs = getSubs(cat.slug);
        return (
          <div key={cat.id} className="rounded-lg border border-white/5 overflow-hidden" style={{ background: "#1a1a1a" }}>
            {/* Category header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <button onClick={() => handleReorderCat(index, -1)} disabled={index === 0} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-20">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button onClick={() => handleReorderCat(index, 1)} disabled={index === topCategories.length - 1} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-20">
                <ChevronDown className="w-4 h-4" />
              </button>
              {editingCat === cat.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 h-8 px-2 rounded text-sm text-white border border-white/10 outline-none"
                    style={{ background: "#0d0518" }}
                  />
                  <button onClick={() => handleRenameCat(cat)} className="h-8 px-3 rounded text-xs font-bold text-white" style={{ background: "#7DA627" }}>OK</button>
                  <button onClick={() => setEditingCat(null)} className="w-8 h-8 rounded flex items-center justify-center text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm font-bold text-white uppercase tracking-tight">{cat.title}</span>
                  <span className="text-[10px] text-white/30">{subs.length} sous-cat.</span>
                  <button onClick={() => { setEditingCat(cat.id); setEditingTitle(cat.title); }} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-[#7DA627] hover:bg-white/10 transition">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeletingCat(cat)} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-white/10 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Sub-categories */}
            <div className="px-4 py-2 space-y-1">
              {subs.map((sub, subIndex) => (
                <div key={sub.id} className="flex items-center gap-2 py-1.5">
                  <button onClick={() => handleReorderSub(cat.slug, subIndex, -1)} disabled={subIndex === 0} className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white transition disabled:opacity-20">
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleReorderSub(cat.slug, subIndex, 1)} disabled={subIndex === subs.length - 1} className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white transition disabled:opacity-20">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {sub.img && (
                    <div className="w-8 h-8 rounded overflow-hidden shrink-0" style={{ background: "#262626" }}>
                      <img src={normalizeAppAssetUrl(sub.img)} alt={sub.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className="flex-1 text-xs text-white/70">{sub.title}</span>
                  <button onClick={() => setDeletingSub(sub)} className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-red-500 transition">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add sub-category */}
              {addingSubFor === cat.slug ? (
                <div className="flex flex-col gap-2 py-2">
                  <input
                    type="text"
                    value={newSubTitle}
                    onChange={(e) => setNewSubTitle(e.target.value)}
                    placeholder="Nom de la sous-catégorie"
                    className="w-full h-8 px-2 rounded text-xs text-white border border-white/10 outline-none placeholder:text-white/20"
                    style={{ background: "#0d0518" }}
                  />
                  <div className="flex gap-2 items-center">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-white/40 hover:text-white">
                      {newSubImg ? (
                        <div className="w-8 h-8 rounded overflow-hidden">
                          <img src={normalizeAppAssetUrl(newSubImg)} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : uploadingSubImg ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadSubImg(e.target.files[0])} />
                      <span>Image</span>
                    </label>
                    <button onClick={() => handleAddSubCategory(cat.slug)} className="h-8 px-3 rounded text-[10px] font-bold text-white" style={{ background: "#7DA627" }}>Ajouter</button>
                    <button onClick={() => { setAddingSubFor(null); setNewSubTitle(""); setNewSubImg(""); }} className="w-8 h-8 rounded flex items-center justify-center text-white/40 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingSubFor(cat.slug)}
                  className="inline-flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition py-1"
                >
                  <Plus className="w-3 h-3" /> Ajouter une sous-catégorie
                </button>
              )}
            </div>
          </div>
        );
      })}

      {deletingCat && (
        <ConfirmDeleteModal
          title={deletingCat.title}
          onConfirm={handleDeleteCat}
          onCancel={() => setDeletingCat(null)}
        />
      )}
      {deletingSub && (
        <ConfirmDeleteModal
          title={deletingSub.title}
          onConfirm={handleDeleteSub}
          onCancel={() => setDeletingSub(null)}
        />
      )}
    </div>
  );
}