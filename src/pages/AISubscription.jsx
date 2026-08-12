import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, Sparkles, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free", label: "Gratuit", price: "0 €", color: "hsl(0 0% 60%)",
    daily_limit: 10,
    perks: ["10 messages / jour", "6 modes créatifs", "Renouvelé chaque 24h"],
  },
  {
    id: "explorer", label: "Explorer", price: "4,99 €/mois", color: "hsl(200 100% 55%)",
    daily_limit: 100,
    perks: ["100 messages / jour", "6 modes créatifs", "Réponses prioritaires", "Historique conservé 30j"],
  },
  {
    id: "creator", label: "Creator", price: "9,99 €/mois", color: "hsl(280 100% 65%)", popular: true,
    daily_limit: 500,
    perks: ["500 messages / jour", "Tous les modes", "Modèle IA avancé", "Génération d'images incluse", "Historique illimité"],
  },
  {
    id: "pro", label: "Pro", price: "19,99 €/mois", color: "hsl(135 100% 50%)",
    daily_limit: -1,
    perks: ["Messages illimités", "Modèle IA le plus puissant", "API access", "Réponses ultra-rapides", "Support dédié"],
  },
];

export default function AISubscription() {
  const [user, setUser] = useState(null);
  const [activePlan, setActivePlan] = useState("free");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setActivePlan(u?.ai_plan || "free");
    }).catch(() => {});
  }, []);

  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");
    if (payment === "success" && sessionId) {
      base44.functions.invoke("stripePayment", { action: "verifySession", sessionId }).then(() => {
        base44.auth.me().then((u) => { setUser(u); setActivePlan(u?.ai_plan || "free"); });
        toast.success("Abonnement activé !");
        window.history.replaceState({}, "", "/ai/subscription");
      }).catch(() => toast.error("Erreur de vérification du paiement"));
    } else if (payment === "cancelled") {
      toast.error("Paiement annulé");
      window.history.replaceState({}, "", "/ai/subscription");
    }
  }, []);

  const subscribe = async (plan) => {
    if (!user || plan.id === "free") return;
    setLoadingPlan(plan.id);
    try {
      const res = await base44.functions.invoke("stripePayment", {
        action: "createAISubscription",
        planId: plan.id,
      });
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      toast.error("Erreur lors de la création du paiement");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
        <Link to="/ai" className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-black text-lg">Abonnements AI Studio</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 text-premium" /> Débloque tout le potentiel
          </h1>
          <p className="text-muted-foreground">L'IA sans limites, pour les créateurs ambitieux</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`relative rounded-3xl border p-5 flex flex-col transition ${activePlan === plan.id ? "border-2" : "border-border"}`}
              style={activePlan === plan.id ? { borderColor: plan.color, background: `${plan.color}10` } : {}}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold" style={{ background: plan.color, color: "#000" }}>
                  ⭐ POPULAIRE
                </div>
              )}
              <div className="mb-3">
                <p className="font-black text-lg" style={{ color: plan.color }}>{plan.label}</p>
                <p className="text-2xl font-black mt-1">{plan.price}</p>
                <p className="text-xs font-semibold mt-1" style={{ color: plan.color }}>
                  {plan.daily_limit === -1 ? "♾️ Illimité" : `${plan.daily_limit} msgs/jour`}
                </p>
              </div>
              <ul className="flex-1 space-y-2 mb-4">
                {plan.perks.map((p, i) => (
                  <li key={i} className="text-xs flex items-start gap-2 text-muted-foreground">
                    <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: plan.color }} /> {p}
                  </li>
                ))}
              </ul>
              {activePlan === plan.id ? (
                <div className="flex items-center justify-center gap-1 h-9 rounded-full text-xs font-bold border-2" style={{ borderColor: plan.color, color: plan.color }}>
                  <Check className="w-3.5 h-3.5" /> Plan actuel
                </div>
              ) : (
                <Button onClick={() => subscribe(plan)} disabled={loadingPlan === plan.id} size="sm" className="w-full font-bold rounded-full" style={{ background: plan.color, color: plan.id === "free" ? "#fff" : "#000" }}>
                  {loadingPlan === plan.id ? "Redirection..." : plan.id === "free" ? "Plan actuel" : "Choisir"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}