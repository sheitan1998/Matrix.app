import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles } from "lucide-react";
import TrixIcon from "@/components/TrixIcon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatTrix } from "@/lib/format";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HeaderActions from "@/components/layout/HeaderActions";

const PACKS = [
  { trix: 500, priceCents: 499, price: "4,99€", bonus: 0, tag: null },
  { trix: 1200, priceCents: 999, price: "9,99€", bonus: 200, tag: "Populaire" },
  { trix: 3000, priceCents: 2499, price: "24,99€", bonus: 750, tag: null },
  { trix: 7000, priceCents: 4999, price: "49,99€", bonus: 2000, tag: "Meilleure offre" },
  { trix: 15000, priceCents: 9999, price: "99,99€", bonus: 5000, tag: null },
  { trix: 40000, priceCents: 24999, price: "249,99€", bonus: 15000, tag: "Whale 🐋" },
];

export default function TrixStore() {
  const nav = useNavigate();
  const { user, checkUserAuth } = useAuth();
  const [loading, setLoading] = useState(null);
  const [searchParams] = useSearchParams();

  // Handle Stripe redirect: verify session and credit Trix
  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");
    const canceled = searchParams.get("canceled");
    if (canceled === "true") {
      toast.error("Paiement annulé");
    }
    if (success === "true" && sessionId) {
      base44.functions.invoke("stripePayment", { action: "verifySession", sessionId })
        .then(res => {
          if (res?.data?.success) {
            const credited = res.data.credited || 0;
            toast.success(`+${formatTrix(credited)} TRIX !`, { description: "Ton solde est mis à jour 🪙" });
            checkUserAuth();
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const buy = async (pack) => {
    if (!user) return;
    setLoading(pack.trix);
    try {
      const total = pack.trix + pack.bonus;
      const res = await base44.functions.invoke("stripePayment", {
        action: "createTrixPurchase",
        priceCents: pack.priceCents,
        trixTotal: total,
        packLabel: `Pack ${formatTrix(pack.trix)} TRIX`,
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
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-3">
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
        <div className="absolute inset-0 grid-bg opacity-20" />
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
        {PACKS.map((p) => (
          <div
            key={p.trix}
            className={cn(
              "relative rounded-2xl border-2 p-6 bg-card transition hover:scale-[1.02]",
              p.tag ? "border-trix/60 shadow-glow" : "border-border"
            )}
          >
            {p.tag && (
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full gradient-trix text-background text-xs font-bold">
                {p.tag}
              </div>
            )}
            <div className="flex items-center gap-2">
              <TrixIcon size={24} />
              <span className="text-3xl font-black font-mono">{formatTrix(p.trix)}</span>
            </div>
            {p.bonus > 0 && (
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-trix font-semibold">
                <Sparkles className="w-3 h-3" /> +{formatTrix(p.bonus)} bonus offerts
              </div>
            )}
            <p className="text-3xl font-black mt-5">{p.price}</p>
            <Button
              onClick={() => buy(p)}
              disabled={loading === p.trix || !user}
              className="w-full mt-5 h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold"
            >
              {loading === p.trix ? "Traitement..." : "Acheter"}
            </Button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}