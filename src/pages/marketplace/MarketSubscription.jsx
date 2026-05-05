import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, Crown, Rocket, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free", label: "Gratuit", price: "0 €", color: "hsl(0 0% 60%)",
    boosts: 0,
    perks: ["5 annonces actives max", "Photos standard", "Visibilité normale"],
  },
  {
    id: "starter", label: "Starter", price: "3,99 €/mois", color: "hsl(135 100% 50%)",
    boosts: 2,
    perks: ["20 annonces actives", "Jusqu'à 8 photos/annonce", "2 mises en avant / mois", "Badge Vendeur vérifié"],
  },
  {
    id: "pro", label: "Pro", price: "9,99 €/mois", color: "hsl(25 100% 55%)",
    boosts: 8, popular: true,
    perks: ["Annonces illimitées", "10 photos/annonce", "8 mises en avant / mois", "Priorité dans les résultats", "Statistiques de vente"],
  },
  {
    id: "business", label: "Business", price: "24,99 €/mois", color: "hsl(45 100% 55%)",
    boosts: 30,
    perks: ["Annonces illimitées", "15 photos/annonce", "30 mises en avant / mois", "Boutique personnalisée", "Export CSV des ventes", "Support prioritaire"],
  },
];

export default function MarketSubscription() {
  const [user, setUser] = useState(null);
  const [activePlan, setActivePlan] = useState("free");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setActivePlan(u?.market_plan || "free");
    }).catch(() => {});
  }, []);

  const subscribe = async (plan) => {
    if (!user) return;
    await base44.auth.updateMe({ market_plan: plan.id });
    setActivePlan(plan.id);
    toast.success(`Abonnement ${plan.label} activé !`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
        <Link to="/market" className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-black text-lg">Abonnements Market</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2">Boostez vos ventes</h1>
          <p className="text-muted-foreground">Mettez vos articles en avant et vendez plus vite</p>
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
                {plan.boosts > 0 && (
                  <p className="text-xs font-semibold mt-1 flex items-center gap-1" style={{ color: plan.color }}>
                    <Rocket className="w-3 h-3" /> {plan.boosts} boost{plan.boosts > 1 ? "s" : ""}/mois
                  </p>
                )}
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
                <Button onClick={() => subscribe(plan)} size="sm" className="w-full font-bold rounded-full" style={{ background: plan.color, color: plan.id === "free" ? "#fff" : "#000" }}>
                  {plan.id === "free" ? "Continuer gratuitement" : "Choisir"}
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Rocket className="w-5 h-5 text-orange-500" /> Comment fonctionne la mise en avant ?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Les articles mis en avant apparaissent en tête de liste et dans la section "Articles mis en avant" de la page d'accueil. 
            Chaque boost dure 7 jours et multiplie la visibilité de ton article par 5.
          </p>
        </div>
      </div>
    </div>
  );
}