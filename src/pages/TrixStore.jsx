import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles, Crown, CreditCard } from "lucide-react";
import TrixIcon from "@/components/TrixIcon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatTrix } from "@/lib/format";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HeaderActions from "@/components/layout/HeaderActions";

const VIP_PLANS = [
{ plan: "monthly", label: "VIP Mensuel", price: "4,99€", perks: ["Badge VIP exclusif", "Couleur pseudo dorée", "Accès prioritaire aux salons", "2× XP sur tous les jeux"] },
{ plan: "yearly", label: "VIP Annuel", price: "49,99€", perks: ["Tout le VIP Mensuel", "2 mois offerts", "Frame animée exclusive", "Accès anticipé aux nouveautés"], tag: "Meilleure offre" }];


const PACKS = [
{ packId: "pack_500", trix: 500, priceCents: 499, price: "4,99€", bonus: 0, tag: null },
{ packId: "pack_1400", trix: 1200, priceCents: 999, price: "9,99€", bonus: 200, tag: "Populaire" },
{ packId: "pack_3750", trix: 3000, priceCents: 2499, price: "24,99€", bonus: 750, tag: null },
{ packId: "pack_9000", trix: 7000, priceCents: 4999, price: "49,99€", bonus: 2000, tag: "Meilleure offre" },
{ packId: "pack_20000", trix: 15000, priceCents: 9999, price: "99,99€", bonus: 5000, tag: null },
{ packId: "pack_55000", trix: 40000, priceCents: 24999, price: "249,99€", bonus: 15000, tag: "Whale 🐋" }];


export default function TrixStore() {
  const nav = useNavigate();
  const { user, checkUserAuth } = useAuth();
  const [loading, setLoading] = useState(null);
  const [vipLoading, setVipLoading] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // Handle Stripe redirect: verify session, credit Trix or activate VIP, then clean URL
  useEffect(() => {
    const payment = searchParams.get("payment");
    const vipSuccess = searchParams.get("vip");
    const sessionId = searchParams.get("session_id");
    const cleanUrl = () => window.history.replaceState({}, "", "/trix-store");

    if (payment === "cancelled") {
      toast.error("Paiement annulé");
      cleanUrl();
    }
    if (vipSuccess === "canceled") {
      toast.error("Abonnement VIP annulé");
      cleanUrl();
    }
    if (vipSuccess === "success" && sessionId) {
      base44.functions.invoke("stripePayment", { action: "verifySession", sessionId }).
      then((res) => {
        if (res?.data?.success) {
          toast.success("Abonnement VIP activé ! 👑", { description: "Profite de tes avantages exclusifs" });
          checkUserAuth();
        }
        cleanUrl();
      }).
      catch(() => cleanUrl());
    }
    if (payment === "success" && sessionId) {
      base44.functions.invoke("stripePayment", { action: "verifySession", sessionId }).
      then((res) => {
        if (res?.data?.success) {
          const credited = res.data.credited || 0;
          toast.success(`+${formatTrix(credited)} TRIX !`, { description: "Ton solde est mis à jour 🪙" });
          checkUserAuth();
        }
        cleanUrl();
      }).
      catch(() => cleanUrl());
    }
  }, [searchParams]);

  const buyVIP = async (plan) => {
    if (!user) return;
    setVipLoading(plan.plan);
    try {
      const res = await base44.functions.invoke("stripePayment", {
        action: "createVIPSubscription",
        plan: plan.plan
      });
      const url = res?.data?.url;
      if (!url) {
        toast.error(res?.data?.error || "Erreur lors de la création de l'abonnement");
        return;
      }
      window.location.href = url;
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Erreur");
    }
    setVipLoading(null);
  };

  const openCustomerPortal = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const res = await base44.functions.invoke("stripePayment", { action: "createCustomerPortal" });
      const url = res?.data?.url;
      if (!url) {
        toast.error(res?.data?.error || "Aucun abonnement actif trouvé");
        return;
      }
      window.location.href = url;
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Erreur");
    }
    setPortalLoading(false);
  };

  const buy = async (pack) => {
    if (!user) return;
    setLoading(pack.trix);
    try {
      const res = await base44.functions.invoke("stripePayment", {
        action: "createTrixPurchase",
        packId: pack.packId
      });
      const url = res?.data?.url;
      if (!url) {
        toast.error(res?.data?.error || "Erreur lors de la création du paiement");
        return;
      }
      window.location.href = url;
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Erreur");
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="sticky top-0 z-40 border-b border-border backdrop-blur-xl px-4 py-3 bg-gray-950/[0.9] text-gray-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => nav(-1)} className="text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-black text-lg">💎 Boutique de jetons</span>
          </div>
          <HeaderActions />
        </div>
      </div>
      <div className="px-4 lg:px-6 py-10 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 gradient-trix text-background">
        <div className="absolute inset-0 grid-bg opacity-20 bg-gray-950" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">TRIX Store</p>
            <h1 className="text-4xl md:text-5xl font-black mt-2">Achète des TRIX</h1>
            <p className="mt-3 max-w-md">Soutiens tes créateurs préférés en direct et débloquer des abonnements premium aux chaînes.</p>
          </div>
          <div className="px-6 py-4 rounded-2xl bg-background/15 backdrop-blur">
            <p className="text-xs font-semibold opacity-80">Solde actuel</p>
            <p className="text-3xl font-black font-mono flex items-center gap-2">
              <TrixIcon size={26} />
              {formatTrix(user?.trix_balance || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {PACKS.map((p) =>
          <div
            key={p.trix}
            className={cn(
              "relative rounded-2xl border-2 p-6 transition hover:scale-[1.02] bg-gray-950 text-gray-50",
              p.tag ? "border-trix/60 shadow-glow" : "border-border"
            )}>
            
            {p.tag &&
            <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full gradient-trix text-background text-xs font-bold">
                {p.tag}
              </div>
            }
            <div className="flex items-center gap-2 text-[#ffffff]">
              <TrixIcon size={24} />
              <span className="text-3xl font-black font-mono">{formatTrix(p.trix)}</span>
            </div>
            {p.bonus > 0 &&
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-trix font-semibold">
                <Sparkles className="w-3 h-3" /> +{formatTrix(p.bonus)} bonus offerts
              </div>
            }
            <p className="text-3xl font-black mt-5 bg-[hsl(var(--foreground))]">{p.price}</p>
            <Button
              onClick={() => buy(p)}
              disabled={loading === p.trix || !user}
              className="w-full mt-5 h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold">
              
              {loading === p.trix ? "Traitement..." : "Acheter"}
            </Button>
          </div>
          )}
      </div>

      {/* VIP Subscription Section */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>
            <Crown className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Abonnement VIP</h2>
            <p className="text-sm text-white/50">Débloque des avantages exclusifs sur toute la plateforme</p>
          </div>
          {user?.is_vip &&
            <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold text-black" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>
              VIP actif
            </span>
            }
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {VIP_PLANS.map((plan) =>
            <div
              key={plan.plan}
              className={cn(
                "relative rounded-2xl border-2 p-6 transition hover:scale-[1.02] bg-gray-950",
                plan.tag ? "border-trix/60 shadow-glow" : "border-border"
              )}>
              
              {plan.tag &&
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full gradient-trix text-background text-xs font-bold">
                  {plan.tag}
                </div>
              }
              <h3 className="text-xl font-black text-white">{plan.label}</h3>
              <p className="text-3xl font-black mt-3 text-white">{plan.price}</p>
              <ul className="mt-4 space-y-2">
                {plan.perks.map((perk, idx) =>
                <li key={idx} className="flex items-center gap-2 text-sm text-white/70">
                    <Sparkles className="w-3.5 h-3.5 text-trix shrink-0" />
                    {perk}
                  </li>
                )}
              </ul>
              <Button
                onClick={() => buyVIP(plan)}
                disabled={vipLoading === plan.plan || !user}
                className="w-full mt-5 h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold">
                
                {vipLoading === plan.plan ? "Traitement..." : `S'abonner — ${plan.price}`}
              </Button>
            </div>
            )}
        </div>

        {/* Customer Portal */}
        <div className="mt-6 p-4 rounded-2xl flex items-center gap-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <CreditCard className="w-5 h-5 text-white/50 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Gérer mon abonnement</p>
            <p className="text-xs text-white/50">Modifier, annuler ou télécharger vos factures via le portail Stripe</p>
          </div>
          <Button
              onClick={openCustomerPortal}
              disabled={portalLoading || !user}
              variant="outline"
              className="shrink-0 text-gray-50">
              
            {portalLoading ? "..." : "Portail Client"}
          </Button>
        </div>
      </div>
      </div>
    </div>);

}