import React, { useState } from "react";
import { X, Zap, Crown, Check, Infinity as InfinityIcon, Clock } from "lucide-react";
import CheckoutModal from "@/components/CheckoutModal";
import { formatCountdown } from "@/hooks/useAiQuota";

const PLANS = [
  {
    id: "plus",
    name: "Matrix Plus",
    price: "4,99 €",
    icon: Zap,
    accent: "#a855f7",
    features: ["100 messages IA / 24h", "Badge Plus sur ton profil", "Mise en avant légère sur Best Serveur"],
  },
  {
    id: "ultra",
    name: "Matrix Ultra",
    price: "9,99 €",
    icon: Crown,
    accent: "#fbbf24",
    features: [
      "Messages IA illimités",
      "Badge Ultra sur ton profil",
      "Boost prioritaire Best Serveur & Best Creator",
      "Cosmétiques exclusifs",
    ],
  },
];

export default function AiUpgradeModal({ open, onClose, quota, remainingMs, onUpgraded }) {
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  if (!open) return null;

  const countdown = formatCountdown(remainingMs);
  const limit = quota?.limit ?? 10;

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
                Tu as atteint ta limite quotidienne de {limit} messages gratuits !
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

          <div
            className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.25)" }}
          >
            <Clock className="w-4 h-4 shrink-0" style={{ color: "#22d3ee" }} />
            <p className="text-[11px] font-bold text-white/75">
              Tes {limit} messages gratuits reviennent dans{" "}
              <span className="font-black tabular-nums" style={{ color: "#22d3ee" }}>{countdown.clock}</span>
            </p>
          </div>

          <div className="mt-4 space-y-2.5">
            {PLANS.map((plan) => {
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
                      <p className="text-[9px] text-white/40">{plan.price} / mois — sans engagement</p>
                    </div>
                    <button
                      onClick={() => setCheckoutPlan(plan.id)}
                      className="ml-auto h-8 px-3 rounded-lg text-[10px] font-black transition hover:brightness-110 tap-sm"
                      style={{ background: plan.accent, color: plan.id === "ultra" ? "#1a1204" : "#fff" }}
                    >
                      Débloquer
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-1.5 text-[10px] text-white/60">
                        {plan.id === "ultra" && feature.startsWith("Messages") ? (
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
            Paiement sécurisé par Stripe. Résiliation à tout moment, le palier repasse en Starter automatiquement.
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