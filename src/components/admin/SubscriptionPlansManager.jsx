import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { CreditCard, Save } from "lucide-react";

const inputClass =
  "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-purple-400/60";

export default function SubscriptionPlansManager() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    try {
      const rows = await base44.entities.ShopSubscriptionPlan.list("sort_order", 50);
      setPlans(rows);
    } catch {
      toast.error("Impossible de charger les abonnements");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = (id, changes) =>
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));

  const save = async (plan) => {
    setSavingId(plan.id);
    try {
      await base44.entities.ShopSubscriptionPlan.update(plan.id, {
        label: plan.label,
        description: plan.description || "",
        price_cents: Math.max(0, Math.round(Number(plan.price_cents) || 0)),
        duration_days: Math.max(1, Math.round(Number(plan.duration_days) || 30)),
        is_active: !!plan.is_active,
        badge: plan.badge || "",
        perks: Array.isArray(plan.perks)
          ? plan.perks
          : String(plan.perks || "")
              .split("\n")
              .map((p) => p.trim())
              .filter(Boolean),
      });
      toast.success("Abonnement enregistré");
      await load();
    } catch {
      toast.error("Enregistrement impossible");
    }
    setSavingId(null);
  };

  if (loading) {
    return <div className="py-10 text-center text-xs text-white/40">Chargement…</div>;
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 p-6 text-center text-xs text-white/40">
        Aucun abonnement configuré.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-white/10 p-4" style={{ background: "rgba(15,10,25,0.6)" }}>
        <CreditCard className="mt-0.5 h-4 w-4 text-purple-300" />
        <p className="text-[11px] leading-relaxed text-white/50">
          Ces abonnements sont vendus dans la catégorie Abonnements de la Boutique Matrix et restent disponibles
          sur leurs pages d'origine. Le prix et la durée d'accès s'appliquent au prochain paiement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(15,10,25,0.6)" }}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-purple-300">
                {plan.key}
              </span>
              <label className="flex items-center gap-2 text-[10px] font-bold text-white/60">
                <input
                  type="checkbox"
                  checked={!!plan.is_active}
                  onChange={(e) => patch(plan.id, { is_active: e.target.checked })}
                  className="h-3.5 w-3.5 accent-purple-500"
                />
                Actif
              </label>
            </div>

            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-white/30">Nom</label>
                <input
                  className={inputClass}
                  value={plan.label || ""}
                  onChange={(e) => patch(plan.id, { label: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-white/30">Description</label>
                <input
                  className={inputClass}
                  value={plan.description || ""}
                  onChange={(e) => patch(plan.id, { description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-white/30">Prix (€ / mois)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    value={((plan.price_cents || 0) / 100).toFixed(2)}
                    onChange={(e) => patch(plan.id, { price_cents: Math.round((Number(e.target.value) || 0) * 100) })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-white/30">Durée (jours)</label>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={plan.duration_days || 30}
                    onChange={(e) => patch(plan.id, { duration_days: Number(e.target.value) || 30 })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-white/30">Avantages (un par ligne)</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={Array.isArray(plan.perks) ? plan.perks.join("\n") : plan.perks || ""}
                  onChange={(e) => patch(plan.id, { perks: e.target.value.split("\n") })}
                />
              </div>
            </div>

            <button
              onClick={() => save(plan)}
              disabled={savingId === plan.id}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-2 text-xs font-black text-white transition hover:bg-purple-500 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {savingId === plan.id ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}