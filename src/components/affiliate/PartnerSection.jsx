import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Star, Lock, Clock, TrendingUp, Users, FileVideo, Coins, CheckCircle2, ArrowRight } from "lucide-react";
import { PARTNER_PERKS, PARTNER_SUBSCRIBERS, PARTNER_VIEWS, PARTNER_MIN_CONTENT } from "@/lib/affiliateProgram";
import ProgramApplicationForm from "@/components/affiliate/ProgramApplicationForm";
import ReferralTracker from "@/components/affiliate/ReferralTracker";

const THRESHOLDS = [
  { icon: Users, label: "Abonnés minimum", value: PARTNER_SUBSCRIBERS },
  { icon: TrendingUp, label: "Vues cumulées", value: PARTNER_VIEWS },
  { icon: FileVideo, label: "Contenus publiés", value: PARTNER_MIN_CONTENT },
];

export default function PartnerSection({ user, affiliation, referralCode, isAffiliate, onGoAffiliate, onSubmitted }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isPartner = affiliation?.status === "partner";

  const { data: pending = false } = useQuery({
    queryKey: ["partner-pending", user?.email],
    queryFn: () => base44.entities.SupportTicket.filter(
      { user_email: user.email, program_type: "partner", status: { $in: ["open", "in_progress"] } },
      { limit: 1 }
    ).then((r) => !!r?.items?.[0]),
    enabled: !!user?.email,
  });

  const submit = async (payload) => {
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("affiliateProgram", {
        action: "applyPartner",
        name: payload.name,
        pseudo: payload.pseudo,
        platform: payload.platform,
        subscribers: payload.subscribers,
        views: payload.views,
        contents: payload.contents,
        links: payload.links,
        motivation: payload.description,
      });
      if (res?.data?.error) { toast.error(res.data.error); return; }
      toast.success("Candidature Partenaire envoyée pour validation.");
      setOpen(false);
      onSubmitted?.();
      qc.invalidateQueries({ queryKey: ["partner-pending", user.email] });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors de l'envoi de la candidature");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.3)" }}>
          <Star className="w-5 h-5" style={{ color: "#FFD700" }} />
        </div>
        <div>
          <h2 className="text-lg font-black text-white leading-tight">Programme Partenaire</h2>
          <p className="text-[11px] text-white/50">Élite · sur validation de l'équipe</p>
        </div>
        <span
          className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide shrink-0"
          style={{ background: "rgba(255,215,0,0.12)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}
        >
          {isPartner ? "Partenaire" : isAffiliate ? "Débloqué" : "Verrouillé"}
        </span>
      </div>

      {/* Seuils requis */}
      <div className="p-5 rounded-2xl" style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.18)" }}>
        <p className="text-xs font-black mb-3" style={{ color: "#FFD700" }}>Seuils d'éligibilité requis</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THRESHOLDS.map((t) => (
            <div key={t.label} className="p-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(0,0,0,0.25)" }}>
              <t.icon className="w-4 h-4 shrink-0" style={{ color: "#FFD700" }} />
              <div>
                <p className="text-base font-black text-white leading-none">{t.value.toLocaleString("fr-FR")}</p>
                <p className="text-[10px] text-white/45 mt-1">{t.label}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/40 mt-2.5">Toutes plateformes confondues : YouTube, Twitch, TikTok, Instagram…</p>
      </div>

      {!isAffiliate ? (
        <div className="p-5 rounded-2xl" style={{ background: "rgba(255,215,0,0.05)", border: "1px dashed rgba(255,215,0,0.35)" }}>
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#FFD700" }} />
            <div>
              <p className="text-sm font-black text-white">Programme Partenaire verrouillé</p>
              <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                Vous devez d'abord valider votre programme Affilié pour débloquer la candidature Partenaire.
              </p>
              <button
                onClick={onGoAffiliate}
                className="mt-4 h-10 px-4 rounded-xl text-xs font-black text-black flex items-center gap-2 transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #a855f7, #c084fc)" }}
              >
                Valider mon programme Affilié <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {isPartner ? (
            <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)" }}>
              <Star className="w-5 h-5 shrink-0" style={{ color: "#FFD700" }} />
              <p className="text-xs" style={{ color: "#FFD700" }}>Vous êtes Partenaire Matrix. Tous les avantages sont actifs.</p>
            </div>
          ) : pending ? (
            <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.25)" }}>
              <Clock className="w-5 h-5 shrink-0" style={{ color: "#FFD700" }} />
              <p className="text-xs" style={{ color: "#FFD700" }}>Votre candidature Partenaire est en cours de validation par l'équipe.</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => setOpen((v) => !v)} className="w-full p-5 flex items-center gap-3 text-left transition hover:opacity-90">
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#FFD700" }} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Postuler au programme Partenaire</p>
                  <p className="text-[11px] text-white/45">Validation manuelle par les administrateurs</p>
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: "#FFD700" }}>{open ? "Fermer" : "Postuler →"}</span>
              </button>

              {open && (
                <div className="px-5 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="pt-4">
                    <ProgramApplicationForm
                      mode="partner"
                      defaultName={user.full_name || ""}
                      defaultPseudo={user.pseudo || ""}
                      submitting={submitting}
                      onSubmit={submit}
                    />
                  </div>
                  <p className="text-[10px] text-white/40 mt-2">Les seuils sont vérifiés par l'équipe avant toute validation.</p>
                </div>
              )}
            </div>
          )}

          <ReferralTracker code={referralCode} email={user.email} variant="advanced" />
        </>
      )}

      {/* Avantages & monétisation */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Avantages Partenaire</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PARTNER_PERKS.map((perk) => (
            <div key={perk.title} className="p-4 rounded-2xl flex items-start gap-3" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,215,0,0.12)" }}>
              <span className="text-xl shrink-0">{perk.icon}</span>
              <div>
                <p className="text-sm font-bold text-white">{perk.title}</p>
                <p className="text-[11px] text-white/45 leading-relaxed">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: "rgba(255,215,0,0.06)", border: "1px dashed rgba(255,215,0,0.35)" }}>
        <Coins className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#FFD700" }} />
        <div>
          <p className="text-sm font-black text-white">Monétisation Partenaire à venir</p>
          <p className="text-[11px] text-white/50 mt-0.5">
            Revenus dédiés, versements Trix mensuels et visibilité renforcée arrivent prochainement pour les partenaires validés.
          </p>
        </div>
      </div>
    </section>
  );
}