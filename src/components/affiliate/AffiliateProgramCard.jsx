import React from "react";
import { Zap, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import MediaKit from "@/components/affiliate/MediaKit";
import ReferralLinkCard from "@/components/affiliate/ReferralLinkCard";

export default function AffiliateProgramCard({ affiliation, referralCode, referralCount, onActivate, activating }) {
  const isPartner = affiliation?.status === "partner";
  const isAffiliate = affiliation?.status === "affiliate" || isPartner;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
          <Zap className="w-5 h-5" style={{ color: "#3b82f6" }} />
        </div>
        <div>
          <h2 className="text-lg font-black text-white leading-tight">Programme Affilié</h2>
          <p className="text-[11px] text-white/50">Accessible à tous · inscription instantanée</p>
        </div>
        <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide" style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }}>
          Ouvert
        </span>
      </div>

      <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(59,130,246,0.18)" }}>
        {isAffiliate ? (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#22c55e" }} />
            <div>
              <p className="text-sm font-bold text-white">
                {isPartner ? "Statut Partenaire actif" : "Statut Affilié actif"}
              </p>
              <p className="text-[11px] text-white/50">
                {affiliation?.approved_at
                  ? `Depuis le ${new Date(affiliation.approved_at).toLocaleDateString("fr-FR")}`
                  : "Votre lien d'affiliation est actif."}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-bold text-white">Rejoignez le programme en un clic</p>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">
              Activez votre statut affilié immédiatement, récupérez votre lien personnel et suivez vos filleuls.
            </p>
            <button
              onClick={onActivate}
              disabled={activating}
              className="mt-4 w-full h-11 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6d28d9)" }}
            >
              {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Devenir affilié maintenant
            </button>
          </div>
        )}
      </div>

      <ReferralLinkCard code={referralCode} count={referralCount} />

      <MediaKit />
    </section>
  );
}