import React, { useState } from "react";
import { createPortal } from "react-dom";
import { base44 } from "@/api/base44Client";
import { Heart, X } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [2, 5, 10, 20, 50];

export default function DonationModal({ open, onClose }) {
  const [amount, setAmount] = useState(5);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleDonate = async () => {
    if (amount < 1) {
      toast.error("Montant minimum: 1€");
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("stripePayment", {
        action: "createDonation",
        amount: Math.round(amount * 100),
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
    setLoading(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-6"
        style={{
          background: "linear-gradient(135deg, rgba(15,10,25,0.95), rgba(26,14,46,0.95))",
          border: "1px solid rgba(168,85,247,0.3)",
          boxShadow: "0 0 50px rgba(168,85,247,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition tap-sm"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
          >
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Soutenir MATRIX</h2>
            <p className="text-xs text-white/40">Ton soutien aide à faire grandir la plateforme</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-white/50 mb-2 font-semibold">Montant du don</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className="px-4 h-10 rounded-xl text-sm font-mono font-bold border transition tap-sm"
                style={{
                  background: amount === a ? "linear-gradient(135deg, #a855f7, #6d28d9)" : "rgba(255,255,255,0.04)",
                  border: amount === a ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.08)",
                  color: amount === a ? "white" : "rgba(255,255,255,0.6)",
                }}
              >
                {a}€
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white font-mono font-bold outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">€</span>
          </div>
        </div>

        <div
          className="p-3 rounded-xl mb-4 text-xs text-white/50"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}
        >
          🔒 Paiement sécurisé via Stripe. Tu seras redirigé vers une page de paiement sécurisée.
        </div>

        <button
          onClick={handleDonate}
          disabled={loading || amount < 1}
          className="w-full py-3 rounded-xl text-sm font-black text-white transition hover:scale-[1.02] disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #a855f7, #6d28d9)",
            boxShadow: "0 0 25px rgba(168,85,247,0.4)",
          }}
        >
          {loading ? "Redirection..." : `Soutenir avec ${amount}€`}
        </button>
      </div>
    </div>,
    document.body
  );
}