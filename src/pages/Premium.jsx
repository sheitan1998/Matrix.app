import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Crown, Check, Ban, Zap, Coins, Sparkles } from "lucide-react";
import { toast } from "sonner";

const PERKS = [
  { icon: Ban, title: "Zéro publicité", desc: "Regarde toutes les vidéos sans aucune interruption." },
  { icon: Coins, title: "+500 TRIX par mois", desc: "Crédit automatique pour soutenir tes créateurs favoris." },
  { icon: Sparkles, title: "Badge exclusif", desc: "Un badge Premium violet visible partout sur MATRIX." },
  { icon: Zap, title: "Qualité 4K prioritaire", desc: "Accès en priorité au streaming haute définition." },
];

export default function Premium() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const activate = async () => {
    if (!user) return;
    setLoading(true);
    const until = new Date();
    until.setMonth(until.getMonth() + 1);
    await base44.auth.updateMe({
      is_premium: true,
      premium_until: until.toISOString(),
      trix_balance: (user.trix_balance || 0) + 500,
    });
    await base44.entities.TrixTransaction.create({
      user_email: user.email,
      type: "purchase",
      amount: 500,
      description: "Bonus abonnement Premium",
    });
    setLoading(false);
    toast.success("Bienvenue dans MATRIX Premium !", { description: "+500 TRIX ajoutés à ton solde 💎" });
    base44.auth.me().then(setUser);
  };

  const cancel = async () => {
    await base44.auth.updateMe({ is_premium: false, premium_until: null });
    toast("Abonnement Premium désactivé");
    base44.auth.me().then(setUser);
  };

  return (
    <div className="px-4 lg:px-6 py-10 max-w-5xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-14 gradient-premium text-white">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5" /> Exclusivité
          </div>
          <h1 className="text-4xl md:text-6xl font-black mt-4 tracking-tight">MATRIX Premium</h1>
          <p className="text-lg md:text-xl mt-3 text-white/90 max-w-xl">
            Le streaming sans pub, avec des bonus TRIX chaque mois et des avantages exclusifs.
          </p>
          <div className="mt-8 flex items-baseline gap-2">
            <span className="text-5xl font-black font-mono">9,99€</span>
            <span className="text-white/80">/ mois</span>
          </div>

          <div className="mt-8">
            {user?.is_premium ? (
              <div className="flex flex-wrap gap-3 items-center">
                <div className="px-5 h-12 rounded-full bg-white text-premium flex items-center font-bold">
                  <Check className="w-4 h-4 mr-2" /> Abonnement actif
                </div>
                <Button onClick={cancel} variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                  Annuler
                </Button>
              </div>
            ) : (
              <Button
                onClick={activate}
                disabled={loading || !user}
                className="h-12 px-8 rounded-full bg-white text-premium hover:bg-white/90 font-bold text-base"
              >
                {loading ? "Activation..." : "Devenir Premium"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-10">
        {PERKS.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.title} className="p-6 rounded-2xl bg-card border border-border">
              <div className="w-11 h-11 rounded-xl bg-premium/15 flex items-center justify-center">
                <Icon className="w-5 h-5 text-premium" />
              </div>
              <h3 className="font-bold text-lg mt-4">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}