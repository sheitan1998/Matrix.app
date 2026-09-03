import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import CasinoToken from "@/components/casino/CasinoToken";
import { formatBet } from "@/components/casino/slotThemes";
import CheckoutModal from "@/components/CheckoutModal";

const COIN_PACKS = [
  { id: "pack_500",   coins: 500,   price: "1,99 €", priceCents: 199,  bonus: "" },
  { id: "pack_2000",  coins: 2000,  price: "4,99 €", priceCents: 499,  bonus: "+400 BONUS", popular: true },
  { id: "pack_5000",  coins: 5000,  price: "9,99 €", priceCents: 999,  bonus: "+1 500 BONUS" },
  { id: "pack_15000", coins: 15000, price: "24,99 €", priceCents: 2499, bonus: "+6 000 BONUS" },
  { id: "pack_50000", coins: 50000, price: "49,99 €", priceCents: 4999, bonus: "+25 000 BONUS" },
];

export default function CasinoShop({ balance, onBack, onPurchaseSuccess }) {
  const [loading, setLoading] = useState(null);
  const [checkout, setCheckout] = useState(null);

  const buyPack = (pack) => {
    setLoading(pack.id);
    setCheckout({
      functionName: "stripePayment",
      params: { action: "createCasinoCoinPurchase", packId: pack.id },
    });
    setLoading(null);
  };

  return (
    <div className="min-h-screen pb-16"
      style={{ background: "linear-gradient(160deg, #0a050f 0%, #1a0a2e 40%, #0a050f 100%)" }}>

      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{ background: "rgba(10,5,15,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(197,160,89,0.15)" }}>
        <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition tap-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour</span>
        </button>
        <h1 className="font-black text-lg tracking-wider" style={{
          background: "linear-gradient(135deg, #C5A059, #8B6B2B)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>BOUTIQUE NEXUS GAME</h1>
        <div className="ml-auto flex items-center gap-2 px-3 h-9 rounded-xl"
          style={{ background: "rgba(197,160,89,0.08)", border: "1px solid rgba(197,160,89,0.2)" }}>
          <CasinoToken size={20} />
          <span className="text-sm font-mono font-black" style={{ color: "#C5A059" }}>{formatBet(balance)}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-4">
          <h2 className="text-2xl font-black text-white mb-1">Achetez vos Jetons M</h2>
          <p className="text-sm text-white/50">Les jetons M sont exclusifs au Nexus Game et n'ont aucune valeur réelle.</p>
        </motion.div>

        {/* Packs grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COIN_PACKS.map((pack, i) => (
            <motion.div key={pack.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="relative p-5 rounded-2xl text-center overflow-hidden"
              style={{
                background: pack.popular
                  ? "linear-gradient(135deg, rgba(197,160,89,0.12), rgba(139,107,43,0.06))"
                  : "rgba(15,10,25,0.6)",
                border: pack.popular ? "2px solid rgba(197,160,89,0.4)" : "1px solid rgba(255,255,255,0.06)",
                boxShadow: pack.popular ? "0 0 20px rgba(197,160,89,0.15)" : "none",
              }}>
              {pack.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-b-lg text-[9px] font-black"
                  style={{ background: "linear-gradient(135deg, #C5A059, #8B6B2B)", color: "#0a050f" }}>
                  ⭐ POPULAIRE
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5 mb-2 mt-2">
                <CasinoToken size={28} />
                <span className="text-2xl font-black" style={{ color: "#C5A059" }}>{pack.coins.toLocaleString()}</span>
              </div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Jetons M</p>
              {pack.bonus && (
                <p className="text-xs font-bold mb-3" style={{ color: "#22C55E" }}>{pack.bonus}</p>
              )}
              <button onClick={() => buyPack(pack)} disabled={loading === pack.id}
                className="w-full h-11 rounded-xl text-sm font-black transition hover:opacity-90 flex items-center justify-center gap-2 tap-sm disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #C5A059, #8B6B2B)",
                  color: "#0a050f",
                  boxShadow: "0 4px 15px rgba(197,160,89,0.25)",
                }}>
                {loading === pack.id ? <Loader2 className="w-4 h-4 animate-spin" /> : pack.price}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Info */}
        <div className="p-4 rounded-2xl text-center"
          style={{ background: "rgba(15,10,25,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[11px] text-white/40 leading-relaxed">
            ⚠️ Les jetons M sont une monnaie fictive exclusive au Nexus Game. Ils n'ont aucune valeur monétaire réelle et ne peuvent pas être échangés contre des Trix ou de l'argent. Jeu réservé aux personnes de plus de 18 ans.
          </p>
        </div>
      </div>

      {checkout && (
        <CheckoutModal
          functionName={checkout.functionName}
          params={checkout.params}
          onClose={() => setCheckout(null)}
          onSuccess={() => {
            if (onPurchaseSuccess) onPurchaseSuccess();
            toast.success("Achat réussi ! Vos jetons M ont été crédités.");
          }}
        />
      )}
    </div>
  );
}