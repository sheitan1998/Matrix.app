import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Check, Zap, Star, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const VIP_PLANS = [
  {
    id: "vip_bronze",
    name: "VIP Bronze",
    priceCents: 499,
    priceLabel: "4,99€",
    period: "/mois",
    color: "#cd7f32",
    icon: Shield,
    badge: "🥉",
    perks: [
      { label: "Badge VIP Bronze", detail: "Affiché sur ton profil" },
      { label: "2 Boosts Flash", detail: "Pour booster des serveurs Nexus" },
      { label: "+10% XP", detail: "Sur toutes tes activités" },
      { label: "5 000 jetons Nexus Game", detail: "Crédités immédiatement" },
    ],
    xpBonus: 10,
    tokens: 5000,
    flashBoosts: 2,
  },
  {
    id: "vip_silver",
    name: "VIP Silver",
    priceCents: 999,
    priceLabel: "9,99€",
    period: "/mois",
    color: "#c0c0c0",
    icon: Star,
    badge: "🥈",
    popular: true,
    perks: [
      { label: "Badge VIP Silver", detail: "Affiché sur ton profil" },
      { label: "5 Boosts Flash", detail: "Pour booster des serveurs Nexus" },
      { label: "+25% XP", detail: "Sur toutes tes activités" },
      { label: "15 000 jetons Nexus Game", detail: "Crédités immédiatement" },
      { label: "Accès prioritaire", detail: "Salons et événements VIP" },
    ],
    xpBonus: 25,
    tokens: 15000,
    flashBoosts: 5,
  },
  {
    id: "vip_gold",
    name: "VIP Gold",
    priceCents: 1999,
    priceLabel: "19,99€",
    period: "/mois",
    color: "#ffd700",
    icon: Crown,
    badge: "🥇",
    perks: [
      { label: "Badge VIP Gold", detail: "Affiché sur ton profil" },
      { label: "15 Boosts Flash", detail: "Pour booster des serveurs Nexus" },
      { label: "+50% XP", detail: "Sur toutes tes activités" },
      { label: "40 000 jetons Nexus Game", detail: "Crédités immédiatement" },
      { label: "Accès prioritaire", detail: "Salons et événements VIP" },
      { label: "Cosmétique exclusif", detail: "Animation d'avatar Gold" },
    ],
    xpBonus: 50,
    tokens: 40000,
    flashBoosts: 15,
  },
];

export default function NexusVIPShop({ user }) {
  const [loading, setLoading] = useState(null);

  const subscribe = async (plan) => {
    if (!user) {
      toast.error("Connecte-toi pour t'abonner");
      return;
    }
    setLoading(plan.id);
    try {
      const res = await base44.functions.invoke("stripePayment", {
        action: "createVIPSubscription",
        plan: plan.id,
      });
      const url = res?.data?.url;
      if (!url) {
        toast.error(res?.data?.error || "Erreur lors de la création du paiement");
        return;
      }
      window.location.replace(url);
    } catch (err) {
      toast.error(err?.message || "Erreur");
    }
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
          style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)" }}>
          <Crown className="w-4 h-4" style={{ color: "#ffd700" }} />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#ffd700" }}>Boutique VIP</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white">Abonnements VIP Nexus Game</h2>
        <p className="text-sm text-white/50 mt-2 max-w-lg mx-auto">
          Booste ton expérience avec un abonnement VIP. Badge exclusif, boosts Flash, bonus d'XP et jetons Nexus Game crédités dès le premier paiement.
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {VIP_PLANS.map((plan, i) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: "#101015",
                border: `2px solid ${plan.popular ? plan.color + "60" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black text-black whitespace-nowrap"
                  style={{ background: plan.color }}>
                  ⭐ POPULAIRE
                </div>
              )}

              {/* Plan header */}
              <div className="p-5 text-center" style={{ background: `linear-gradient(135deg, ${plan.color}15, transparent)` }}>
                <div className="text-3xl mb-2">{plan.badge}</div>
                <h3 className="text-lg font-black text-white">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mt-2">
                  <span className="text-3xl font-black" style={{ color: plan.color }}>{plan.priceLabel}</span>
                  <span className="text-xs text-white/40">{plan.period}</span>
                </div>
              </div>

              {/* Perks */}
              <div className="flex-1 p-4 space-y-2">
                {plan.perks.map((perk, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: plan.color + "20" }}>
                      <Check className="w-2.5 h-2.5" style={{ color: plan.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{perk.label}</p>
                      <p className="text-[10px] text-white/40">{perk.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subscribe button */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => subscribe(plan)}
                  disabled={loading === plan.id}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-black transition hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: plan.color }}
                >
                  {loading === plan.id ? (
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4" fill="currentColor" />
                      S'abonner
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-white/30">
        🔒 Paiement sécurisé via Stripe. Renouvellement mensuel automatique. Résiliable à tout moment.
        Les jetons, boosts Flash et l'XP sont recrédités à chaque renouvellement.
      </p>
    </div>
  );
}