import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "badge", label: "Badge" },
  { value: "avatar_animation", label: "Animation d'avatar" },
  { value: "profile_cover", label: "Couverture de profil" },
];

const RARITIES = [
  { value: "common", label: "Commun" },
  { value: "rare", label: "Rare" },
  { value: "epic", label: "Épique" },
  { value: "legendary", label: "Légendaire" },
];

export default function CosmeticEditModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!item) return;
    const cfg = item.anim_config || {};
    setForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "badge",
      rarity: item.rarity || "common",
      price_euros: String(item.price_euros || ""),
      icon: item.icon || "",
      preview_image: item.preview_image || "",
      video_url: item.video_url || "",
      is_active: item.is_active !== false,
      anim_scale: String(cfg.scale ?? 2),
      anim_offset_x: String(cfg.offset_x ?? 0),
      anim_offset_y: String(cfg.offset_y ?? 0),
      anim_mask_radius: String(cfg.mask_radius ?? 0.52),
    });
  }, [item]);

  if (!item || !form) return null;

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Le nom est requis."); return; }
    setSaving(true);
    try {
      const anim_config = form.category === "avatar_animation" ? {
        scale: parseFloat(form.anim_scale) || 2,
        offset_x: parseFloat(form.anim_offset_x) || 0,
        offset_y: parseFloat(form.anim_offset_y) || 0,
        mask_radius: parseFloat(form.anim_mask_radius) || 0.52,
      } : undefined;

      const res = await base44.functions.invoke("cosmeticShop", {
        action: "updateItem",
        itemId: item.id,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        rarity: form.rarity,
        price_euros: parseFloat(form.price_euros) || undefined,
        icon: form.icon.trim(),
        preview_image: form.preview_image,
        video_url: form.video_url,
        is_active: form.is_active,
        anim_config,
      });

      if (res?.data?.error) { toast.error(res.data.error); return; }
      toast.success("Cosmétique mis à jour !");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors de la modification.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "#0f0a19", border: "1px solid rgba(168,85,247,0.2)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sticky top-0 z-10" style={{ background: "#0f0a19", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 className="text-sm font-black text-white uppercase">Modifier le cosmétique</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 tap-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Nom *</label>
              <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2} className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 outline-none resize-none" style={{ background: "#1a1a1a" }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Catégorie</label>
              <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Rareté</label>
              <select value={form.rarity} onChange={e => setForm(prev => ({ ...prev, rarity: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }}>
                {RARITIES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Prix (€)</label>
              <input type="number" step="0.50" min="0.50" value={form.price_euros}
                onChange={e => setForm(prev => ({ ...prev, price_euros: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Icône (emoji ou URL)</label>
              <input type="text" value={form.icon} onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Image d'aperçu (URL)</label>
              <input type="text" value={form.preview_image} onChange={e => setForm(prev => ({ ...prev, preview_image: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Vidéo d'animation (URL)</label>
              <input type="text" value={form.video_url} onChange={e => setForm(prev => ({ ...prev, video_url: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
            </div>
          </div>

          {/* Animation display config */}
          {form.category === "avatar_animation" && (
            <div className="rounded-lg p-4 space-y-3" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
              <p className="text-[10px] font-black uppercase text-white/60">Dimensions & position de l'animation</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/50 mb-1">Échelle</label>
                  <input type="number" step="0.1" min="1" max="4" value={form.anim_scale}
                    onChange={e => setForm(prev => ({ ...prev, anim_scale: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
                  <p className="text-[9px] text-white/30 mt-1">2 = 200% de l'avatar</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/50 mb-1">Rayon du masque</label>
                  <input type="number" step="0.01" min="0" max="0.95" value={form.anim_mask_radius}
                    onChange={e => setForm(prev => ({ ...prev, anim_mask_radius: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
                  <p className="text-[9px] text-white/30 mt-1">0.52 = bordure du cadre</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/50 mb-1">Décalage X (px)</label>
                  <input type="number" step="1" value={form.anim_offset_x}
                    onChange={e => setForm(prev => ({ ...prev, anim_offset_x: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/50 mb-1">Décalage Y (px)</label>
                  <input type="number" step="1" value={form.anim_offset_y}
                    onChange={e => setForm(prev => ({ ...prev, anim_offset_y: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${form.is_active ? "text-green-400" : "text-white/40"}`}
              style={{ background: form.is_active ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${form.is_active ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}` }}
            >
              {form.is_active ? "✓ Visible" : "Masqué"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 sticky bottom-0" style={{ background: "#0f0a19", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={onClose} className="flex-1 h-11 rounded-lg text-sm font-bold text-white/60" style={{ background: "rgba(255,255,255,0.05)" }}>
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-11 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}