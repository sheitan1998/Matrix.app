import React, { useState } from "react";
import { X, Zap, Crown, Check, Infinity as InfinityIcon, Clock } from "lucide-react";
import CheckoutModal from "@/components/CheckoutModal";
import { formatCountdown } from "@/hooks/useAiQuota";

const PLANS = [
  {
    id: "plus",
    name: "Matrix Plus",
    price: "19,99 €",
    priceNote: "19,99 € / mois — sans engagement",
    icon: Zap,
    accent: "#a855f7",
    features: [
      "100 messages IA / 24 h",
      "Mémoire des discussions (souvenirs entre conversations)",
      "Connecteurs : Google Drive (connexion sécurisée OAuth)",
    ],
  },
  {
    id: "ultra",
    name: "Matrix Ultra",
    price: "89,99 €",
    priceNote: "89,99 € / mois — sans engagement",
    icon: Crown,
    accent: "#fbbf24",
    features: [
      "Tous les avantages de Matrix Plus",
      "Jusqu'à 10× plus d'utilisation que Matrix Plus chaque semaine (7 000 messages / semaine)",
      "Accès prioritaire aux réponses en période de forte affluence",
      "Accès anticipé aux nouvelles fonctionnalités avancées de Matrix",
    ],
  },
];

export default function AiUpgradeModal({ open, onClose, quota, remainingMs, onUpgraded, guest = false, onLogin }) {
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  if (!open) return null;

  const countdown = formatCountdown(remainingMs);
  const limit = quota?.limit ?? 10;
  const tier = quota?.plan_tier || "starter";
  const weekly = quota?.window === "week";
  const exhausted = !guest && quota && (quota.remaining ?? 1) <= 0;
  const windowStarted = Boolean(quota?.next_reset_at);
  const visiblePlans = PLANS.filter((plan) => !(plan.id === "plus" && tier !== "starter") && !(plan.id === "ultra" && tier === "ultra"));

  return (
    <>
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        style={{ background: "rgba(3,1,8,0.86)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg max-h-[92vh] overflow-y-auto scrollbar-thin rounded-2xl p-5"
          style={{
            background: "linear-gradient(180deg, #170d28 0%, #0b0614 100%)",
            border: "1px solid rgba(138,79,255,0.35)",
            boxShadow: "0 0 60px rgba(138,79,255,0.25)",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">Matrix AI</p>
              <h2 className="text-base sm:text-lg font-black text-white mt-1 leading-tight">
                {exhausted
                  ? weekly
                    ? `Tu as atteint ta limite hebdomadaire de ${limit.toLocaleString("fr-FR")} messages !`
                    : `Tu as atteint ta limite de ${limit} messages sur 24 h !`
                  : tier === "ultra"
                    ? "Ton abonnement Matrix Ultra"
                    : "Choisis ton abonnement Matrix AI"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white tap-sm shrink-0"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {exhausted && windowStarted && (
            <div
              className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.25)" }}
            >
              <Clock className="w-4 h-4 shrink-0" style={{ color: "#22d3ee" }} />
              <p className="text-[11px] font-bold text-white/75">
                Tes messages reviennent dans{" "}
                <span className="font-black tabular-nums" style={{ color: "#22d3ee" }}>{countdown.clock}</span>
              </p>
            </div>
          )}

          {guest && (
            <button
              onClick={onLogin}
              className="mt-3 w-full h-9 rounded-xl text-[11px] font-black text-white tap-sm"
              style={{ background: "linear-gradient(135deg, #8a4fff, #6d28d9)" }}
            >
              Se connecter pour utiliser Matrix AI
            </button>
          )}

          <div className="mt-4 space-y-2.5">
            {tier === "ultra" && (
              <p className="text-[10px] text-white/50">
                Tu profites de tous les avantages Matrix Ultra : 7 000 messages par semaine, accès prioritaire et accès anticipé.
              </p>
            )}
            {visiblePlans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className="rounded-xl p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${plan.accent}40` }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${plan.accent}22`, color: plan.accent }}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-black text-white">{plan.name}</p>
                      <p className="text-[9px] text-white/40">{plan.priceNote}</p>
                    </div>
                    <button
                      onClick={() => (guest ? onLogin?.() : setCheckoutPlan(plan.id))}
                      className="ml-auto h-8 px-3 rounded-lg text-[10px] font-black transition hover:brightness-110 tap-sm"
                      style={{ background: plan.accent, color: plan.id === "ultra" ? "#1a1204" : "#fff" }}
                    >
                      Débloquer
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-1.5 text-[10px] text-white/60">
                        {feature.startsWith("Jusqu'à 10×") ? (
                          <InfinityIcon className="w-3 h-3 mt-0.5 shrink-0" style={{ color: plan.accent }} />
                        ) : (
                          <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: plan.accent }} />
                        )}
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-[9px] text-white/25 text-center">
            Paiement sécurisé par Stripe. Abonnement mensuel, résiliation à tout moment : le palier repasse en Starter automatiquement.
          </p>
        </div>
      </div>

      {checkoutPlan && (
        <CheckoutModal
          functionName="stripePayment"
          params={{ action: "createMatrixAiSubscription", planId: checkoutPlan }}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={() => {
            setCheckoutPlan(null);
            onUpgraded?.();
          }}
        />
      )}
    </>
  );
}