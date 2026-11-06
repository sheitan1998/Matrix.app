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

export default function ShopProductEditor({ product, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    shop_section: product?.shop_section || "cosmetics",
    category: product?.category || "badge",
    price_euros: product?.price_euros ?? 0,
    price_trix: product?.price_trix ?? 0,
    discount_percent: product?.discount_percent ?? 0,
    icon: product?.icon || "",
    preview_image: product?.preview_image || "",
    sort_order: product?.sort_order ?? 0,
    is_active: product?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Le nom du produit est requis.");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price_euros: Number(form.price_euros) || 0,
      price_trix: Number(form.price_trix) || 0,
      discount_percent: Number(form.discount_percent) || 0,
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      if (product?.id) await base44.entities.MatrixShopItem.update(product.id, payload);
      else await base44.entities.MatrixShopItem.create(payload);
      toast.success("Produit enregistré.");
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
          <h3 className="text-sm font-black text-white">{product ? "Modifier le produit" : "Nouveau produit"}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="h-4 w-4 text-white/50" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Nom</span>
            <input value={form.name} onChange={(e) => set({ name: e.target.value })} className={inputCls} placeholder="Boost Flash x10" />
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Description</span>
            <input value={form.description} onChange={(e) => set({ description: e.target.value })} className={inputCls} placeholder="Description courte" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Catégorie</span>
              <select value={form.shop_section} onChange={(e) => set({ shop_section: e.target.value })} className={inputCls}>
                {SECTION_KEYS.map((key) => (
                  <option key={key} value={key}>{SECTION_LABELS[key]}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Type cosmétique</span>
              <select value={form.category} onChange={(e) => set({ category: e.target.value })} className={inputCls}>
                <option value="badge">Badge</option>
                <option value="avatar_animation">Animation</option>
                <option value="profile_cover">Couverture</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Prix €</span>
              <input type="number" step="0.01" value={form.price_euros} onChange={(e) => set({ price_euros: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Prix Trix</span>
              <input type="number" value={form.price_trix} onChange={(e) => set({ price_trix: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Promo %</span>
              <input type="number" min={0} max={90} value={form.discount_percent} onChange={(e) => set({ discount_percent: e.target.value })} className={inputCls} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Icône (emoji)</span>
              <input value={form.icon} onChange={(e) => set({ icon: e.target.value })} className={inputCls} placeholder="⚡" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Ordre</span>
              <input type="number" value={form.sort_order} onChange={(e) => set({ sort_order: e.target.value })} className={inputCls} />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">Visuel (URL)</span>
            <input value={form.preview_image} onChange={(e) => set({ preview_image: e.target.value })} className={inputCls} placeholder="https://..." />
          </label>

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
            Enregistrer le produit
          </button>
        </div>
      </div>
    </div>
  );
}