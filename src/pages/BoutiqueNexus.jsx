import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Zap, CreditCard, Check } from "lucide-react";
import { toast } from "sonner";
import HeaderActions from "@/components/layout/HeaderActions";
import TrixIcon from "@/components/TrixIcon";
import { formatTrix } from "@/lib/format";
import { useAuth } from "@/lib/AuthContext";
import NexusVIPShop from "@/components/nexus/NexusVIPShop";

const TRIX_TO_EURO = (trix) => (trix / 100).toFixed(2).replace(".", ",") + "€";

const FLASH_PACKS = [
  { id: "flash_1", label: "Post Flash ×1", desc: "Épingle un message en haut d'un salon Nexus pendant 1 heure", trixPrice: 100, count: 1 },
  { id: "flash_3", label: "Post Flash ×3", desc: "3 posts Flash pour booster ta visibilité", trixPrice: 250, count: 3, bonus: true },
  { id: "flash_10", label: "Post Flash ×10", desc: "Pack premium — 10 posts Flash", trixPrice: 800, count: 10, bonus: true },
];

export default function BoutiqueNexus() {
  const nav = useNavigate();
  const { user, checkUserAuth } = useAuth();
  const [loading, setLoading] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "cancelled") {
      toast.error("Paiement annulé");
      window.history.replaceState({}, "", "/boutique-nexus");
    }
    if (payment === "success" && sessionId) {
      base44.functions.invoke("stripePayment", { action: "verifySession", sessionId })
        .then(res => {
          if (res?.data?.success) {
            toast.success("Article acheté ! 🎉", { description: "Ajouté à votre inventaire" });
            checkUserAuth();
          }
          window.history.replaceState({}, "", "/boutique-nexus");
        })
        .catch(() => {
          window.history.replaceState({}, "", "/boutique-nexus");
        });
    }
  }, [searchParams]);

  const buyWithTrix = async (pack) => {
    if (!user) return;
    setLoading(`trix_${pack.id}`);
    try {
      const balance = user.trix_balance || 0;
      if (balance < pack.trixPrice) {
        toast.error("Solde Trix insuffisant");
        return;
      }
      const newBalance = balance - pack.trixPrice;
      const inventory = [...(user.inventory || [])];
      inventory.push({
        item_id: pack.id,
        item_name: pack.label,
        category: "flash",
        count: pack.count,
        purchased_at: new Date().toISOString(),
      });
      await base44.auth.updateMe({ trix_balance: newBalance, inventory });
      await base44.entities.TrixTransaction.create({
        user_email: user.email,
        type: "flash_purchase",
        amount: -pack.trixPrice,
        description: `Achat ${pack.label} (-${pack.trixPrice} Trix)`,
      });
      checkUserAuth();
      toast.success(`${pack.label} acheté ! (${pack.count} posts Flash)`);
    } catch {
      toast.error("Erreur lors de l'achat");
    }
    setLoading(null);
  };

  const buyWithEuro = async (pack) => {
    if (!user) return;
    setLoading(`euro_${pack.id}`);
    try {
      const res = await base44.functions.invoke("stripePayment", {
        action: "createNexusItemPurchase",
        itemId: pack.id,
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
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden" style={{ backgroundColor: "#0a050f" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(168,85,247,0.08), transparent 60%)" }} />

      <div className="relative z-10 min-h-screen flex flex-col px-4 sm:px-6 lg:px-10 py-4 max-w-4xl mx-auto w-full">
        <header className="flex items-center justify-between mb-4">
          <button onClick={() => nav("/")} className="flex items-center gap-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">MATRIX</h1>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => nav(-1)} className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm px-3 py-2 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold">Retour</span>
            </button>
            <HeaderActions />
          </div>
        </header>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(109,40,217,0.1))", border: "1px solid rgba(168,85,247,0.2)" }}>
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)", border: "2px solid #fff" }}>
                  <Zap className="w-5 h-5" style={{ color: "#a855f7" }} fill="#a855f7" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">Boutique Nexus</p>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white">Posts Flash</h1>
              <p className="mt-3 max-w-md text-sm text-white/60">Booste ta visibilité sur Nexus. Les posts Flash apparaissent en haut des salons pendant 1 heure. Achete avec tes Trix ou directement en €.</p>
            </div>
            <div className="px-6 py-4 rounded-2xl" style={{ background: "rgba(0,0,0,0.3)" }}>
              <p className="text-xs font-semibold text-white/60">Solde actuel</p>
              <p className="text-3xl font-black font-mono flex items-center gap-2 text-white">
                <TrixIcon size={26} />
                {formatTrix(user?.trix_balance || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Packs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 pb-8">
          {FLASH_PACKS.map((p) => (
            <div key={p.id} className="relative rounded-2xl border-2 p-6 bg-card transition hover:scale-[1.02]" style={{ borderColor: p.bonus ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.06)" }}>
              {p.bonus && (
                <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                  ⚡ Populaire
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)", border: "2px solid #fff" }}>
                  <Zap className="w-4 h-4" style={{ color: "#a855f7" }} fill="#a855f7" />
                </div>
                <span className="text-2xl font-black font-mono text-white">{p.count}</span>
              </div>
              <h3 className="text-sm font-black text-white">{p.label}</h3>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">{p.desc}</p>

              {/* Dual payment buttons */}
              <div className="mt-5 space-y-2">
                {/* Trix payment */}
                <button
                  onClick={() => buyWithTrix(p)}
                  disabled={loading === `trix_${p.id}` || !user}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-40 tap-sm"
                  style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
                >
                  {loading === `trix_${p.id}` ? "..." : (
                    <>
                      <TrixIcon size={16} />
                      {p.trixPrice} Trix
                    </>
                  )}
                </button>

                {/* Euro payment */}
                <button
                  onClick={() => buyWithEuro(p)}
                  disabled={loading === `euro_${p.id}` || !user}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-40 tap-sm"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  {loading === `euro_${p.id}` ? "..." : (
                    <>
                      <CreditCard className="w-4 h-4 text-white/60" />
                      {TRIX_TO_EURO(p.trixPrice)}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Flash badge preview */}
        <div className="mt-4 p-4 rounded-2xl flex items-center gap-3" style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)", border: "2px solid #fff" }}>
            <Zap className="w-4 h-4" style={{ color: "#a855f7" }} fill="#a855f7" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Aperçu du badge Flash</p>
            <p className="text-[10px] text-white/40">Éclair violet avec contour blanc, visible sur tes posts épinglés</p>
          </div>
        </div>

        {/* VIP Subscriptions */}
        <div className="mt-10">
          <NexusVIPShop user={user} />
        </div>
      </div>
    </div>
  );
}