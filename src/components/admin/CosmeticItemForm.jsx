import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Upload, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "badge", label: "Badge" },
  { value: "avatar_animation", label: "Animation d'avatar" },
  { value: "profile_cover", label: "Couverture de profil" },
];

const RARITIES = [
  { value: "common", label: "Commun", color: "#9ca3af" },
  { value: "rare", label: "Rare", color: "#3b82f6" },
  { value: "epic", label: "Épique", color: "#a855f7" },
  { value: "legendary", label: "Légendaire", color: "#f59e0b" },
];

export default function CosmeticItemForm({ onSaved }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "badge",
    rarity: "common",
    price_euros: "",
    icon: "",
    preview_image: "",
    video_url: "",
  });
  const [uploading, setUploading] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (file, field) => {
    if (!file) return;
    setUploading(field);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, [field]: file_url }));
      toast.success("Fichier uploadé.");
    } catch {
      toast.error("Erreur lors de l'upload.");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Le nom est requis."); return; }
    if (!form.price_euros || parseFloat(form.price_euros) < 0.5) {
      toast.error("Le prix minimum est de 0.50€."); return;
    }
    if (form.category === "avatar_animation" && !form.video_url) {
      toast.error("Une vidéo d'animation est requise pour cette catégorie."); return;
    }
    if ((form.category === "profile_cover" || form.category === "avatar_animation") && !form.preview_image && !form.video_url) {
      toast.error("Un aperçu visuel est requis."); return;
    }

    setSaving(true);
    try {
      const res = await base44.functions.invoke("cosmeticShop", {
        action: "createItem",
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        rarity: form.rarity,
        price_euros: parseFloat(form.price_euros),
        icon: form.icon.trim(),
        preview_image: form.preview_image,
        video_url: form.video_url,
      });

      if (res?.data?.error) {
        toast.error(res.data.error);
        return;
      }

      toast.success("Article créé et synchronisé avec Stripe ! 🎉");
      setForm({
        name: "", description: "", category: "badge", rarity: "common",
        price_euros: "", icon: "", preview_image: "", video_url: "",
      });
      if (onSaved) onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Nom du cosmétique *</label>
          <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Avatar Dragon Ardent" className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={2} placeholder="Description affichée dans la boutique..."
            className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 outline-none resize-none" style={{ background: "#1a1a1a" }} />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Catégorie *</label>
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
          <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Prix en € *</label>
          <div className="relative">
            <input type="number" step="0.50" min="0.50" value={form.price_euros}
              onChange={e => setForm(prev => ({ ...prev, price_euros: e.target.value }))}
              placeholder="2.99" className="w-full h-10 px-3 pr-8 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40">€</span>
          </div>
          <p className="text-[9px] text-white/30 mt-1">Un Product et un Price Stripe seront créés automatiquement.</p>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Icône (emoji ou URL)</label>
          <input type="text" value={form.icon} onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="🔥 ou https://..." className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
        </div>
      </div>

      {/* Media uploads */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Image d'aperçu</label>
          <div className="relative rounded-lg border border-dashed border-white/10 overflow-hidden" style={{ background: "#1a1a1a" }}>
            {form.preview_image ? (
              <div className="relative">
                <img src={form.preview_image} alt="" className="w-full h-28 object-contain" />
                <button type="button" onClick={() => setForm(prev => ({ ...prev, preview_image: "" }))}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-28 cursor-pointer">
                {uploading === "preview_image" ? <Loader2 className="w-4 h-4 animate-spin text-white/40" /> : <><Upload className="w-4 h-4 text-white/30 mb-1" /><span className="text-[10px] text-white/30">Image (PNG/JPG)</span></>}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files[0], "preview_image")} />
              </label>
            )}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Vidéo d'animation</label>
          <div className="relative rounded-lg border border-dashed border-white/10 overflow-hidden" style={{ background: "#1a1a1a" }}>
            {form.video_url ? (
              <div className="relative">
                <video src={form.video_url} autoPlay loop muted playsInline className="w-full h-28 object-contain" />
                <button type="button" onClick={() => setForm(prev => ({ ...prev, video_url: "" }))}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-28 cursor-pointer">
                {uploading === "video_url" ? <Loader2 className="w-4 h-4 animate-spin text-white/40" /> : <><Upload className="w-4 h-4 text-white/30 mb-1" /><span className="text-[10px] text-white/30">Vidéo (MP4/WebM)</span></>}
                <input type="file" accept="video/*" className="hidden" onChange={e => handleUpload(e.target.files[0], "video_url")} />
              </label>
            )}
          </div>
        </div>
      </div>

      <button type="submit" disabled={saving}
        className="w-full h-11 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {saving ? "Création sur Stripe..." : "Créer et synchroniser avec Stripe"}
      </button>
    </form>
  );
}