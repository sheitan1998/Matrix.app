import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, X, Check, Crown, Zap } from "lucide-react";
import { toast } from "sonner";
import CheckoutModal from "@/components/CheckoutModal";

const PLANS = [
  {
    id: "monthly",
    name: "Nitro Mensuel",
    price: "4,99€",
    period: "/mois",
    features: ["Pseudo coloré", "Badge exclusif", "Boosts de serveur", "Emojis animés", "Uploads 100MB"],
  },
  {
    id: "yearly",
    name: "Nitro Annuel",
    price: "49,99€",
    period: "/an",
    features: ["Tout du plan mensuel", "2 mois offerts", "Badge Nitro doré", "Priorité support", "Stickers exclusifs"],
    popular: true,
  },
];

export default function NitroModal({ open, onClose }) {
  const [loading, setLoading] = useState(null);
  const [checkout, setCheckout] = useState(null);
  if (!open) return null;

  const subscribe = (planId) => {
    setLoading(planId);
    setCheckout({
      functionName: "stripePayment",
      params: { action: "createNitroSubscription", plan: planId },
    });
    setLoading(null);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl p-6"
        style={{
          background: "linear-gradient(135deg, rgba(15,10,25,0.98), rgba(26,14,46,0.98))",
          border: "1px solid rgba(168,85,247,0.3)",
          boxShadow: "0 0 60px rgba(168,85,247,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition tap-sm"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
            <Crown className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">MATRIX Nitro</h2>
          <p className="text-sm text-white/40 mt-1">Débloque des fonctionnalités exclusives sur toute la plateforme</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="relative rounded-2xl p-5"
              style={{
                background: plan.popular ? "rgba(168,85,247,0.08)" : "rgba(255,255,255,0.02)",
                border: plan.popular ? "1.5px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black text-white"
                  style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                  POPULAIRE
                </div>
              )}
              <h3 className="text-sm font-black text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-white">{plan.price}</span>
                <span className="text-xs text-white/40">{plan.period}</span>
              </div>
              <div className="space-y-2 mb-5">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "#22c55e" }} />
                    {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => subscribe(plan.id)}
                disabled={loading === plan.id}
                className="w-full py-2.5 rounded-xl text-sm font-black text-white transition hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: plan.popular ? "linear-gradient(135deg, #a855f7, #6d28d9)" : "rgba(255,255,255,0.06)",
                  boxShadow: plan.popular ? "0 0 20px rgba(168,85,247,0.3)" : "none",
                }}
              >
                {loading === plan.id ? "Redirection..." : "S'abonner"}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-white/30 mt-4 flex items-center justify-center gap-1">
          <Zap className="w-3 h-3" /> Paiement sécurisé via Stripe · Non remboursable après achat
        </p>
      </div>

      {checkout && (
        <CheckoutModal
          functionName={checkout.functionName}
          params={checkout.params}
          onClose={() => setCheckout(null)}
          onSuccess={() => {
            base44.auth.me().then(() => {});
            toast.success("Abonnement Nitro activé !");
            onClose?.();
          }}
        />
      )}
    </div>
  );
}