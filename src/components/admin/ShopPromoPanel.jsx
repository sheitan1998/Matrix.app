import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, Save, Flame } from "lucide-react";

const inputCls = "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none focus:border-violet-400/60";

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-white/25">{hint}</span>}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-white/80"
    >
      {label}
      <span className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-violet-500" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export default function ShopPromoPanel() {
  const [config, setConfig] = useState(null);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.MatrixShopConfig.list("-created_date", 1).then((rows) => setConfig(rows[0] || {})).catch(() => setConfig({}));
    base44.entities.MatrixShopItem.list("sort_order", 200).then(setItems).catch(() => setItems([]));
  }, []);

  if (!config) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>;
  }

  const set = (patch) => setConfig((c) => ({ ...c, ...patch }));

  const save = async () => {
    setSaving(true);
    const payload = {
      global_promo_enabled: !!config.global_promo_enabled,
      global_discount_percent: Number(config.global_discount_percent) || 0,
      special_offer_enabled: !!config.special_offer_enabled,
      special_offer_product_id: config.special_offer_product_id || "",
      special_offer_title: config.special_offer_title || "",
      special_offer_description: config.special_offer_description || "",
      special_offer_image: config.special_offer_image || "",
      special_offer_discount_percent: Number(config.special_offer_discount_percent) || 0,
      special_offer_old_price: Number(config.special_offer_old_price) || 0,
      special_offer_price: Number(config.special_offer_price) || 0,
      special_offer_cta: config.special_offer_cta || "Profiter de l'offre",
    };
    try {
      if (config.id) await base44.entities.MatrixShopConfig.update(config.id, payload);
      else {
        const created = await base44.entities.MatrixShopConfig.create(payload);
        setConfig(created);
      }
      toast.success("Réglages boutique enregistrés.");
    } catch {
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-white/8 p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
          <h4 className="text-xs font-black uppercase tracking-widest text-violet-300">Promotion globale</h4>
          <Toggle
            label="Appliquer une réduction à toute la boutique"
            checked={!!config.global_promo_enabled}
            onChange={(v) => set({ global_promo_enabled: v })}
          />
          <Field label="Pourcentage de réduction" hint="Appliqué à tous les produits sans promo individuelle (0-90).">
            <input
              type="number"
              min={0}
              max={90}
              value={config.global_discount_percent ?? 0}
              onChange={(e) => set({ global_discount_percent: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="space-y-3 rounded-xl border border-amber-400/15 p-4" style={{ background: "rgba(245,158,11,0.05)" }}>
          <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-300">
            <Flame className="h-3.5 w-3.5" /> Offre spéciale
          </h4>
          <Toggle
            label="Afficher le bloc Offre Spéciale"
            checked={!!config.special_offer_enabled}
            onChange={(v) => set({ special_offer_enabled: v })}
          />
          <Field label="Produit mis en avant">
            <select
              value={config.special_offer_product_id || ""}
              onChange={(e) => set({ special_offer_product_id: e.target.value })}
              className={inputCls}
            >
              <option value="">Aucun produit (offre libre)</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Réduction de l'offre (%)">
            <input
              type="number"
              min={0}
              max={90}
              value={config.special_offer_discount_percent ?? 50}
              onChange={(e) => set({ special_offer_discount_percent: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Titre de l'offre">
          <input value={config.special_offer_title || ""} onChange={(e) => set({ special_offer_title: e.target.value })} className={inputCls} placeholder="Boost x10 + 1 Ticket" />
        </Field>
        <Field label="Libellé du bouton">
          <input value={config.special_offer_cta || ""} onChange={(e) => set({ special_offer_cta: e.target.value })} className={inputCls} placeholder="Profiter de l'offre" />
        </Field>
        <Field label="Description">
          <input value={config.special_offer_description || ""} onChange={(e) => set({ special_offer_description: e.target.value })} className={inputCls} placeholder="Boostez votre serveur dès maintenant" />
        </Field>
        <Field label="Visuel (URL)">
          <input value={config.special_offer_image || ""} onChange={(e) => set({ special_offer_image: e.target.value })} className={inputCls} placeholder="https://..." />
        </Field>
        <Field label="Ancien prix (€)" hint="Utilisé uniquement sans produit associé.">
          <input type="number" step="0.01" value={config.special_offer_old_price ?? 0} onChange={(e) => set({ special_offer_old_price: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Prix promo (€)" hint="Laisser 0 pour calculer automatiquement avec la réduction.">
          <input type="number" step="0.01" value={config.special_offer_price ?? 0} onChange={(e) => set({ special_offer_price: e.target.value })} className={inputCls} />
        </Field>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black text-white disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        Enregistrer
      </button>
    </div>
  );
}