import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Pencil, Loader2, X, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const TYPE_LABELS = {
  nexus: { label: "Nexus", color: "#22c55e" },
  discord: { label: "Discord", color: "#5865F2" },
  both: { label: "Nexus + Discord", color: "#a855f7" },
};

const BADGE_OPTIONS = ["", "POPULAIRE", "NEW", "TENDANCE", "HOT"];

function slugify(text) {
  return text.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function ServerCategoryManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", type: "both", image_url: "", badge: "", sort_order: 0 });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ServerCategory.list("sort_order", 200);
      setItems(data || []);
    } catch {
      toast.error("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setForm((prev) => ({ ...prev, image_url: file_url }));
    } catch {
      toast.error("Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", slug: "", type: "both", image_url: "", badge: "", sort_order: 0 });
    setAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const slug = form.slug || slugify(form.name);
      const payload = { ...form, slug, sort_order: form.sort_order || items.length };

      if (editingId) {
        await base44.entities.ServerCategory.update(editingId, payload);
        toast.success("Catégorie modifiée.");
      } else {
        await base44.entities.ServerCategory.create(payload);
        toast.success("Catégorie créée.");
      }
      resetForm();
      fetchItems();
    } catch {
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setAdding(true);
    setForm({
      name: item.name || "",
      slug: item.slug || "",
      type: item.type || "both",
      image_url: item.image_url || "",
      badge: item.badge || "",
      sort_order: item.sort_order || 0,
    });
  };

  const handleReorder = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const a = items[index];
    const b = items[newIndex];
    try {
      await base44.entities.ServerCategory.update(a.id, { sort_order: newIndex });
      await base44.entities.ServerCategory.update(b.id, { sort_order: index });
      fetchItems();
    } catch {
      toast.error("Erreur lors du réordonnancement.");
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Supprimer la catégorie "${item.name}" ?`)) return;
    try {
      await base44.entities.ServerCategory.delete(item.id);
      toast.success("Catégorie supprimée.");
      fetchItems();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const inputStyle = { background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.2)" };

  return (
    <div className="space-y-3">
      {/* Add/Edit form */}
      {adding ? (
        <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.2)" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </h3>
            <button onClick={resetForm} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white tap-sm">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">Nom *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value, slug: prev.slug || slugify(e.target.value) }))}
                placeholder="Ex: GTA RP"
                className="w-full h-8 px-2 rounded text-xs text-white outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                placeholder="auto-genere"
                className="w-full h-8 px-2 rounded text-xs text-white outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full h-8 px-2 rounded text-xs text-white outline-none cursor-pointer"
                style={inputStyle}
              >
                {Object.entries(TYPE_LABELS).map(([key, val]) => (
                  <option key={key} value={key} style={{ background: "#12091c" }}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">Badge</label>
              <select
                value={form.badge}
                onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
                className="w-full h-8 px-2 rounded text-xs text-white outline-none cursor-pointer"
                style={inputStyle}
              >
                {BADGE_OPTIONS.map((b) => (
                  <option key={b} value={b} style={{ background: "#12091c" }}>{b || "Aucun"}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">Image de fond</label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded overflow-hidden shrink-0" style={{ background: "#262626" }}>
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-[8px]">N/A</div>
                )}
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-white/40 hover:text-white">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
                <span>Uploader</span>
              </label>
              {form.image_url && (
                <button
                  onClick={() => setForm((prev) => ({ ...prev, image_url: "" }))}
                  className="text-[10px] text-red-400 hover:text-red-300"
                >
                  Retirer
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving || !form.name.trim()}
            className="w-full h-8 rounded-lg text-[10px] font-black text-white transition disabled:opacity-50 tap-sm"
            style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
          >
            {saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer la catégorie"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[10px] font-bold text-white transition tap-sm"
          style={{ background: "rgba(138,79,255,0.15)", border: "1px solid rgba(138,79,255,0.2)", color: "#a855f7" }}
        >
          <Plus className="w-3.5 h-3.5" /> Ajouter une catégorie
        </button>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-white/30" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 py-8 text-center">
          <span className="text-xs text-white/30">Aucune catégorie pour le moment</span>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((item, index) => {
            const typeConfig = TYPE_LABELS[item.type] || TYPE_LABELS.both;
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{ background: "rgba(18,9,28,0.4)", border: "1px solid rgba(138,79,255,0.1)" }}
              >
                <div className="flex flex-col">
                  <button
                    onClick={() => handleReorder(index, -1)}
                    disabled={index === 0}
                    className="w-5 h-4 rounded flex items-center justify-center text-white/30 hover:text-white disabled:opacity-20 transition"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleReorder(index, 1)}
                    disabled={index === items.length - 1}
                    className="w-5 h-4 rounded flex items-center justify-center text-white/30 hover:text-white disabled:opacity-20 transition"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="w-8 h-8 rounded overflow-hidden shrink-0" style={{ background: "#262626" }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-[8px]">N/A</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-white truncate block">{item.name}</span>
                  <span className="text-[9px] text-white/30">{item.slug}</span>
                </div>

                {item.badge && (
                  <span
                    className="text-[7px] font-black px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}
                  >
                    {item.badge}
                  </span>
                )}

                <span
                  className="text-[7px] font-black px-1.5 py-0.5 rounded"
                  style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}
                >
                  {typeConfig.label}
                </span>

                <button
                  onClick={() => handleEdit(item)}
                  className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-purple-400 transition"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-red-400 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}