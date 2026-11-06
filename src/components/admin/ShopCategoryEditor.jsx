import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { SECTION_KEYS } from "@/lib/shopPricing";

const inputCls = "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none focus:border-violet-400/60";

const SECTION_LABELS = {
  cosmetics: "Cosmétiques",
  trix: "Jetons Trix",
  boosts: "Boosts Flash",
  subscriptions: "Abonnements",
  vip: "VIP",
  tickets: "Tickets & Offres",
  other: "Autres Produits",
};

export default function ShopCategoryEditor({ category, onClose, onSaved }) {
  const [form, setForm] = useState({
    key: category?.key || "other",
    label: category?.label || "",
    description: category?.description || "",
    icon: category?.icon || "✨",
    image_url: category?.image_url || "",
    accent_color: category?.accent_color || "#a855f7",
    cta_label: category?.cta_label || "Voir la catégorie",
    sort_order: category?.sort_order ?? 0,
    is_active: category?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.label.trim()) {
      toast.error("Le nom de la catégorie est requis.");
      return;
    }
    setSaving(true);
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
    try {
      if (category?.id) await base44.entities.MatrixShopCategory.update(category.id, payload);
      else await base44.entities.MatrixShopCategory.create(payload);
      toast.success("Catégorie enregistrée.");
      onSaved();
      onClose();
    } catch {
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" style={{ background: "rgba(3,1,8,0.8)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl p-5" style={{ background: "#120a1f", border: "1px solid rgba(168,85,247,0.3)" }} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-black text-white">{category ? "Modifier la catégorie" : "Nouvelle catégorie"}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="h-4 w-4 text-white/50" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Nom affiché</span>
            <input value={form.label} onChange={(e) => set({ label: e.target.value })} className={inputCls} placeholder="Cosmétiques" />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Rayon (produits associés)</span>
            <select value={form.key} onChange={(e) => set({ key: e.target.value })} className={inputCls}>
              {SECTION_KEYS.map((key) => (
                <option key={key} value={key}>{SECTION_LABELS[key]}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Description</span>
            <input value={form.description} onChange={(e) => set({ description: e.target.value })} className={inputCls} placeholder="Badges et animations exclusives" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Icône (emoji)</span>
              <input value={form.icon} onChange={(e) => set({ icon: e.target.value })} className={inputCls} placeholder="🎁" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Couleur d'accent</span>
              <input type="color" value={form.accent_color} onChange={(e) => set({ accent_color: e.target.value })} className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-1" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Visuel (URL, optionnel)</span>
            <input value={form.image_url} onChange={(e) => set({ image_url: e.target.value })} className={inputCls} placeholder="https://..." />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Libellé bouton</span>
              <input value={form.cta_label} onChange={(e) => set({ cta_label: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Ordre</span>
              <input type="number" value={form.sort_order} onChange={(e) => set({ sort_order: e.target.value })} className={inputCls} />
            </label>
          </div>

          <button
            type="button"
            onClick={() => set({ is_active: !form.is_active })}
            className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-white/80"
          >
            Visible dans la boutique
            <span className={`relative h-5 w-9 rounded-full transition ${form.is_active ? "bg-violet-500" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${form.is_active ? "left-[18px]" : "left-0.5"}`} />
            </span>
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Enregistrer la catégorie
          </button>
        </div>
      </div>
    </div>
  );
}