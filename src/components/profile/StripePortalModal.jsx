import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, Loader2, X, ArrowUpRight, ShieldCheck, FileText, RefreshCw, Ban } from "lucide-react";
import { toast } from "sonner";

export default function StripePortalModal({ open, onClose, user }) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("stripePayment", { action: "createCustomerPortal" });
      const url = res?.data?.url;
      if (!url) {
        toast.error(res?.data?.error || "Aucun abonnement actif trouvé");
        setLoading(false);
        return;
      }
      window.location.href = url;
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Erreur");
      setLoading(false);
    }
  };

  const features = [
    { icon: ArrowUpRight, label: "Modifier mon abonnement", desc: "Upgrade ou downgrade de plan" },
    { icon: Ban, label: "Annuler mon abonnement", desc: "Résilier à tout moment" },
    { icon: CreditCard, label: "Mettre à jour mes moyens de paiement", desc: "Carte bancaire, IBAN" },
    { icon: FileText, label: "Télécharger mes factures", desc: "Historique complet" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden" style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.25)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)" }}>
              <CreditCard className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Gestion des abonnements</h3>
              <p className="text-[10px] text-white/40">Portail client sécurisé Stripe</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition tap-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Security badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
            <p className="text-[11px] text-green-400/90">Connexion sécurisée via Stripe — vos données bancaires ne transitent jamais par MATRIX.</p>
          </div>

          {/* Features list */}
          <div className="space-y-2.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.1)" }}>
                  <f.icon className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{f.label}</p>
                  <p className="text-[10px] text-white/40">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white transition" style={{ background: "rgba(255,255,255,0.05)" }}>
            Annuler
          </button>
          <button
            onClick={openPortal}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Accéder au portail
          </button>
        </div>
      </div>
    </div>
  );
}