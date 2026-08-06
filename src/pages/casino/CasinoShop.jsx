import React, { useState } from "react";
import { X, Coins, Crown, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// casinoAddCoins removed for security — purchases require verified payment flow

const COIN_PACKS = [
  { id: "starter", label: "Starter", coins: 500, price: "1,99 €", bonus: "" },
  { id: "popular", label: "Populaire", coins: 2000, price: "4,99 €", bonus: "+400 BONUS", popular: true },
  { id: "pro", label: "Pro", coins: 5000, price: "9,99 €", bonus: "+1500 BONUS" },
  { id: "vip", label: "VIP", coins: 15000, price: "24,99 €", bonus: "+6000 BONUS" },
];

const PLANS = [
  {
    id: "silver", label: "Silver", price: "4,99 €/mois", color: "hsl(220 20% 70%)",
    coins: 1000, perks: ["1 000 🪙 / mois", "Accès à tous les jeux", "Historique des mises"],
  },
  {
    id: "gold", label: "Gold", price: "9,99 €/mois", color: "hsl(45 100% 55%)", popular: true,
    coins: 3000, perks: ["3 000 🪙 / mois", "Accès VIP aux tables", "Statistiques avancées", "Badge Gold"],
  },
  {
    id: "diamond", label: "Diamond", price: "19,99 €/mois", color: "hsl(200 100% 65%)",
    coins: 8000, perks: ["8 000 🪙 / mois", "Tables privées exclusives", "Cashback 5%", "Badge Diamond", "Support prioritaire"],
  },
];

export default function CasinoShop({ balance, setBalance, onClose }) {
  const [tab, setTab] = useState("coins");
  const [activePlan, setActivePlan] = useState(null);

  const buyCoinPack = (pack) => {
    toast.info("Les achats de pièces seront bientôt disponibles avec un paiement sécurisé.");
  };

  const subscribePlan = (plan) => {
    toast.info("Les abonnements seront bientôt disponibles avec un paiement sécurisé.");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-black text-xl">🪙 Boutique Casino</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 bg-secondary/30 mx-6 mt-4 rounded-2xl shrink-0">
          <button onClick={() => setTab("coins")} className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${tab === "coins" ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}>
            <Coins className="w-4 h-4 inline mr-1" /> Pièces
          </button>
          <button onClick={() => setTab("sub")} className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${tab === "sub" ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}>
            <Crown className="w-4 h-4 inline mr-1" /> Abonnements
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {tab === "coins" && (
            <>
              <p className="text-sm text-muted-foreground">Solde actuel : <span className="font-black text-trix">{balance.toLocaleString()} 🪙</span></p>
              <div className="grid grid-cols-2 gap-3">
                {COIN_PACKS.map((pack) => (
                  <div key={pack.id} className={`relative p-4 rounded-2xl border transition ${pack.popular ? "border-trix/50 bg-trix/10" : "border-border bg-secondary/30"}`}>
                    {pack.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold" style={{ background: "hsl(45 100% 55%)", color: "#000" }}>⭐ POPULAIRE</div>}
                    <Zap className="w-6 h-6 text-trix mb-2" />
                    <p className="font-black text-lg">{pack.coins.toLocaleString()}</p>
                    <p className="text-sm font-bold text-trix">🪙 pièces</p>
                    {pack.bonus && <p className="text-xs text-primary font-semibold mt-1">{pack.bonus}</p>}
                    <Button onClick={() => buyCoinPack(pack)} className="w-full mt-3 h-9 text-sm font-bold" style={{ background: "hsl(45 100% 55%)", color: "#000" }}>
                      {pack.price}
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "sub" && (
            <div className="grid gap-4">
              {PLANS.map((plan) => (
                <div key={plan.id} className={`relative p-5 rounded-2xl border transition ${activePlan === plan.id ? "border-2" : "border-border"}`}
                  style={activePlan === plan.id ? { borderColor: plan.color, background: `${plan.color}12` } : {}}>
                  {plan.popular && <div className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full text-xs font-bold" style={{ background: plan.color, color: "#000" }}>⭐ RECOMMANDÉ</div>}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-black text-lg" style={{ color: plan.color }}>{plan.label}</span>
                      <p className="text-sm text-muted-foreground">{plan.price}</p>
                    </div>
                    {activePlan === plan.id
                      ? <span className="flex items-center gap-1 text-xs font-bold" style={{ color: plan.color }}><Check className="w-4 h-4" /> Actif</span>
                      : <Button onClick={() => subscribePlan(plan)} size="sm" className="font-bold" style={{ background: plan.color, color: "#000" }}>S'abonner</Button>
                    }
                  </div>
                  <ul className="space-y-1">
                    {plan.perks.map((p, i) => (
                      <li key={i} className="text-sm flex items-center gap-2 text-muted-foreground">
                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: plan.color }} /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}