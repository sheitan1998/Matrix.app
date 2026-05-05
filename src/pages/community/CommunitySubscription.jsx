import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, Zap, Globe, Lock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free", label: "Gratuit", price: "0 €", color: "hsl(0 0% 60%)",
    boosts: 0, servers: 0,
    perks: ["Rejoindre des salons publics", "Poster dans le fil", "Réactions & commentaires"],
  },
  {
    id: "booster", label: "Booster", price: "10 €/mois", color: "hsl(280 100% 65%)", popular: true,
    boosts: 2, servers: 3,
    perks: [
      "Créer jusqu'à 3 serveurs (public ou privé)",
      "2 boosts inclus / mois",
      "Badge Booster exclusif 🚀",
      "Nom coloré dans le fil",
      "Accès aux serveurs privés boostés",
      "Priorité dans la liste des salons",
    ],
  },
  {
    id: "vip", label: "VIP", price: "25 €/mois", color: "hsl(45 100% 55%)",
    boosts: 8, servers: 10,
    perks: [
      "Créer jusqu'à 10 serveurs",
      "8 boosts / mois",
      "Badge VIP ✨",
      "Personnalisation avancée des serveurs",
      "Statistiques de serveur",
      "Modération avancée",
    ],
  },
];

export default function CommunitySubscription() {
  const [user, setUser] = useState(null);
  const [activePlan, setActivePlan] = useState("free");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setActivePlan(u?.community_plan || "free");
    }).catch(() => {});
  }, []);

  const subscribe = async (plan) => {
    if (!user) return;
    await base44.auth.updateMe({ community_plan: plan.id, community_boosts_remaining: plan.boosts });
    setActivePlan(plan.id);
    toast.success(`Abonnement ${plan.label} activé ! ${plan.boosts > 0 ? `+${plan.boosts} boosts` : ""}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
        <Link to="/community" className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-black text-lg">Abonnement Communauté</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2">Booster la Communauté</h1>
          <p className="text-muted-foreground">Crée des serveurs, booste du contenu et affiche ton badge</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`relative rounded-3xl border p-5 flex flex-col transition ${activePlan === plan.id ? "border-2" : "border-border"}`}
              style={activePlan === plan.id ? { borderColor: plan.color, background: `${plan.color}10` } : {}}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold" style={{ background: plan.color, color: "#000" }}>
                  ⭐ RECOMMANDÉ
                </div>
              )}
              <div className="mb-3">
                <p className="font-black text-xl" style={{ color: plan.color }}>{plan.label}</p>
                <p className="text-2xl font-black mt-1">{plan.price}</p>
                {plan.boosts > 0 && (
                  <p className="text-xs font-semibold mt-1 flex items-center gap-1" style={{ color: plan.color }}>
                    <Zap className="w-3 h-3" /> {plan.boosts} boosts inclus
                  </p>
                )}
                {plan.servers > 0 && (
                  <p className="text-xs font-semibold flex items-center gap-1 mt-0.5" style={{ color: plan.color }}>
                    <Users className="w-3 h-3" /> {plan.servers} serveurs max
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
                  <Check className="w-3.5 h-3.5" /> Actif
                </div>
              ) : (
                <Button onClick={() => subscribe(plan)} size="sm" className="w-full font-bold rounded-full" style={{ background: plan.color, color: "#000" }}>
                  {plan.id === "free" ? "Plan gratuit" : "S'abonner"}
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border">
            <Globe className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-bold mb-1">Serveurs publics</h3>
            <p className="text-sm text-muted-foreground">Visibles par toute la communauté. Idéal pour créer une communauté autour d'une thématique.</p>
          </div>
          <div className="p-5 rounded-2xl bg-card border border-border">
            <Lock className="w-6 h-6 text-premium mb-3" />
            <h3 className="font-bold mb-1">Serveurs privés</h3>
            <p className="text-sm text-muted-foreground">Accessibles sur invitation uniquement. Parfait pour un groupe d'amis ou une équipe.</p>
          </div>
        </div>
      </div>
    </div>
  );
}