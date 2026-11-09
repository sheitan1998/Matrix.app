import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Zap, CheckCircle2 } from "lucide-react";
import { isActiveAffiliation } from "@/hooks/useMyAffiliation";
import ProgramApplicationForm from "@/components/affiliate/ProgramApplicationForm";
import ReferralTracker from "@/components/affiliate/ReferralTracker";

export default function AffiliateSection({ user, affiliation, referralCode, onUpdated }) {
  const [submitting, setSubmitting] = useState(false);
  const isAffiliate = isActiveAffiliation(affiliation);
  const isPartner = affiliation?.status === "partner";

  const submit = async (payload) => {
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("affiliateProgram", { action: "applyAffiliate", ...payload });
      if (res?.data?.error) { toast.error(res.data.error); return; }
      toast.success("Programme Affilié activé !");
      onUpdated?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors de l'activation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
          <Zap className="w-5 h-5" style={{ color: "#a855f7" }} />
        </div>
        <div>
          <h2 className="text-lg font-black text-white leading-tight">Programme Affilié</h2>
          <p className="text-[11px] text-white/50">Lien personnel · suivi des filleuls en temps réel</p>
        </div>
        <span
          className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide shrink-0"
          style={{
            background: isAffiliate ? "rgba(34,197,94,0.15)" : "rgba(168,85,247,0.15)",
            color: isAffiliate ? "#22c55e" : "#c4b5fd",
            border: `1px solid ${isAffiliate ? "rgba(34,197,94,0.3)" : "rgba(168,85,247,0.3)"}`,
          }}
        >
          {isAffiliate ? "Actif" : "À compléter"}
        </span>
      </div>

      {isAffiliate && (
        <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#22c55e" }} />
          <div>
            <p className="text-sm font-bold text-white">{isPartner ? "Statut Partenaire actif" : "Statut Affilié actif"}</p>
            <p className="text-[11px] text-white/50">
              {affiliation?.approved_at
                ? `Depuis le ${new Date(affiliation.approved_at).toLocaleDateString("fr-FR")}`
                : "Votre lien d'affiliation est actif."}
            </p>
          </div>
        </div>
      )}

      <ReferralTracker code={referralCode} email={user.email} />

      {!isAffiliate && (
        <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.18)" }}>
          <p className="text-sm font-black text-white">Demande d'affiliation</p>
          <p className="text-[11px] text-white/45 mb-4 mt-1">
            Renseignez votre profil et vos réseaux : votre lien est déjà actif et le compteur de filleuls se met à jour en direct.
          </p>
          <ProgramApplicationForm
            mode="affiliate"
            defaultName={user.full_name || ""}
            defaultPseudo={user.pseudo || ""}
            submitting={submitting}
            onSubmit={submit}
          />
        </div>
      )}
    </section>
  );
}