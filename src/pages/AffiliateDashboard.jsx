import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, ThumbsUp, Download, Package, Award, Zap, Send, Loader2, CheckCircle2, Star, Sparkles, Users } from "lucide-react";
import {
  AFFILIATE_VIEWS, PARTNER_VIEWS, PARTNER_LIKES, PARTNER_MIN_CONTENT, PARTNER_SUBSCRIBERS, PARTNER_TRIX_MONTHLY,
  PARTNER_PERKS, PARTNER_COMMITMENTS, getPartnerEligibility, getAffiliateEligibility } from
"@/lib/affiliateProgram";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import MediaKit from "@/components/affiliate/MediaKit";

const STATUS_META = {
  affiliate: { label: "Affilié", color: "#3b82f6", icon: Zap },
  partner: { label: "Partenaire", color: "#FFD700", icon: Star },
  revoked: { label: "Statut retiré", color: "#ef4444", icon: Award }
};

export default function AffiliateDashboard() {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [program, setProgram] = useState("affiliate");
  const [motivation, setMotivation] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [contentDesc, setContentDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);

  useEffect(() => {base44.auth.me().then(setUser).catch(() => {});}, []);

  const { data: affiliation } = useQuery({
    queryKey: ["my-affiliation", user?.email],
    queryFn: () => base44.entities.Affiliation.filter({ user_email: user.email }).then((r) => r?.items?.[0] || r?.[0] || null),
    enabled: !!user?.email
  });

  const { data: modAgg = { rows: [] } } = useQuery({
    queryKey: ["mod-stats", user?.email],
    queryFn: () => base44.entities.FarmingMod.aggregate({ query: { creator_email: user.email }, groupBy: "creator_email", sum: ["views", "likes", "download_count"] }),
    enabled: !!user?.email
  });
  const { data: mapAgg = { rows: [] } } = useQuery({
    queryKey: ["map-stats", user?.email],
    queryFn: () => base44.entities.FortniteMap.aggregate({ query: { user_email: user.email }, groupBy: "user_email", sum: ["views", "likes"] }),
    enabled: !!user?.email
  });
  const { data: subscriberCount = 0 } = useQuery({
    queryKey: ["subscriber-count", user?.email],
    queryFn: () => base44.entities.UserSubscription.count({ target_email: user.email }),
    enabled: !!user?.email
  });

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>);


  const modRow = modAgg?.rows?.[0] || {};
  const mapRow = mapAgg?.rows?.[0] || {};
  const stats = {
    totalViews: (modRow.sum_views || 0) + (mapRow.sum_views || 0),
    totalLikes: (modRow.sum_likes || 0) + (mapRow.sum_likes || 0),
    totalDownloads: modRow.sum_download_count || 0,
    contentCount: (modRow.count || 0) + (mapRow.count || 0),
    subscriberCount: subscriberCount || 0
  };

  const affElig = getAffiliateEligibility(stats);
  const partElig = getPartnerEligibility(stats);
  const status = affiliation?.status;
  const statusMeta = status ? STATUS_META[status] : null;
  const hasActiveStatus = status && status !== "revoked";
  const canApplyPartner = partElig.eligible && status !== "partner";
  const canApplyAffiliate = !status && affElig.eligible;

  const submit = async () => {
    if (!motivation.trim()) {toast.error("Décris ta motivation");return;}
    setSubmitting(true);
    try {
      await base44.entities.SupportTicket.create({
        user_email: user.email,
        user_name: user.full_name || user.email.split("@")[0],
        user_avatar: user.avatar_url || "",
        subject: `Candidature ${program === "partner" ? "Partenaire" : "Affilié"}`,
        category: "affiliate_partner",
        program_type: program,
        message: motivation.trim(),
        creator_description: contentDesc.trim(),
        portfolio_links: portfolio.split("\n").map((l) => l.trim()).filter(Boolean),
        status: "open"
      });
      toast.success("Candidature envoyée ! Un administrateur va l'examiner.");
      setMotivation("");setPortfolio("");setContentDesc("");
      qc.invalidateQueries({ queryKey: ["my-affiliation"] });
    } catch {toast.error("Erreur lors de l'envoi");}
    setSubmitting(false);
  };

  const submitPartner = async () => {
    setPartnerSubmitting(true);
    try {
      await base44.entities.SupportTicket.create({
        user_email: user.email,
        user_name: user.full_name || user.email.split("@")[0],
        user_avatar: user.avatar_url || "",
        subject: "Demande de statut Partenaire",
        category: "affiliate_partner",
        program_type: "partner",
        message: `Demande automatique générée depuis le Tableau de bord Affilié. Seuils Partenaire atteints : ${stats.totalViews.toLocaleString()} vues, ${stats.totalLikes.toLocaleString()} likes, ${stats.contentCount} contenus publiés, ${stats.subscriberCount.toLocaleString()} abonnés.`,
        creator_description: `Créateur avec ${stats.contentCount} contenus publiés (${stats.totalDownloads.toLocaleString()} téléchargements cumulés).`,
        portfolio_links: [],
        status: "open"
      });
      setPartnerSubmitted(true);
      toast.success("Demande transmise aux administrateurs pour validation finale.");
      qc.invalidateQueries({ queryKey: ["my-affiliation"] });
    } catch {toast.error("Erreur lors de l'envoi");}
    setPartnerSubmitting(false);
  };

  const Progress = ({ value, label, current, target, ok }) =>
  <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-bold", ok ? "text-green-400" : "text-white/60")}>{current.toLocaleString()} / {target.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, value)}%`, background: ok ? "#22c55e" : "#a855f7" }} />
      </div>
    </div>;


  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/mon-profil" className="text-muted-foreground hover:text-foreground transition"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="font-black text-xl">⭐ Programme Affiliés & Partenaires</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Status card */}
        <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: statusMeta ? `linear-gradient(135deg, ${statusMeta.color}22, ${statusMeta.color}08)` : "rgba(15,10,25,0.6)", border: `1px solid ${statusMeta ? statusMeta.color + "44" : "rgba(255,255,255,0.08)"}` }}>
          {statusMeta ?
          <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: statusMeta.color + "22" }}>
                <statusMeta.icon className="w-7 h-7" style={{ color: statusMeta.color }} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Votre statut</p>
                <p className="text-2xl font-black" style={{ color: statusMeta.color }}>{statusMeta.label}</p>
                {status === "partner" && <p className="text-xs text-white/60 mt-0.5">💎 {PARTNER_TRIX_MONTHLY} TRIX / mois • {affiliation?.last_trix_payout_at ? `Dernier versement ${new Date(affiliation.last_trix_payout_at).toLocaleDateString("fr-FR")}` : "Premier versement à venir"}</p>}
                {status === "revoked" && <p className="text-xs text-white/60 mt-0.5">Contactez un administrateur pour réactiver votre statut.</p>}
              </div>
            </div> :

          <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Programme Affiliés & Partenaires</p>
              <p className="text-lg font-black text-white mt-1">Devenez un créateur reconnu de Matrix</p>
              
            </div>
          }
        </div>

        {/* Media Kit */}
        <MediaKit />

        {/* Stats */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Vos statistiques de visibilité</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
            { icon: Eye, color: "#3b82f6", label: "Vues", value: stats.totalViews },
            { icon: ThumbsUp, color: "#22c55e", label: "Likes", value: stats.totalLikes },
            { icon: Download, color: "#f59e0b", label: "Téléchargements", value: stats.totalDownloads },
            { icon: Users, color: "#a855f7", label: "Abonnés", value: stats.subscriberCount }].
            map((s) =>
            <div key={s.label} className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <s.icon className="w-4 h-4 mb-1.5" style={{ color: s.color }} />
                <p className="text-[10px] text-white/40 uppercase">{s.label}</p>
                <p className="text-lg font-black text-white">{s.value.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress to Partner */}
        <div className="p-5 rounded-2xl space-y-4" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,215,0,0.15)" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-white flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-400" /> Progression vers le statut Partenaire</p>
            <span className="text-xs font-bold text-yellow-400">{partElig.progress}%</span>
          </div>
          <Progress value={stats.totalViews / PARTNER_VIEWS * 100} label="Vues cumulées" current={stats.totalViews} target={PARTNER_VIEWS} ok={partElig.viewsOk} />
          <Progress value={stats.totalLikes / PARTNER_LIKES * 100} label="Likes cumulés" current={stats.totalLikes} target={PARTNER_LIKES} ok={partElig.likesOk} />
          <Progress value={stats.contentCount / PARTNER_MIN_CONTENT * 100} label="Contenus publiés" current={stats.contentCount} target={PARTNER_MIN_CONTENT} ok={partElig.contentOk} />
          <Progress value={stats.subscriberCount / PARTNER_SUBSCRIBERS * 100} label="Abonnés" current={stats.subscriberCount} target={PARTNER_SUBSCRIBERS} ok={partElig.subscribersOk} />
          {partElig.eligible && status !== "partner" ? (
            partnerSubmitted ? (
              <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <p className="text-xs text-green-400">Demande transmise aux administrateurs pour validation finale. Vous serez notifié(e) dès qu'elle sera traitée.</p>
              </div>
            ) : (
              <button onClick={submitPartner} disabled={partnerSubmitting}
                className="w-full h-12 rounded-xl font-black text-sm text-black flex items-center justify-center gap-2 transition hover:scale-[1.02] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)" }}>
                {partnerSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-5 h-5" />}
                Devenir partenaire
              </button>
            )
          ) : partElig.eligible && status === "partner" ? (
            <p className="text-xs text-yellow-400 flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Vous êtes déjà Partenaire.</p>
          ) : (
            <div>
              <button disabled className="w-full h-12 rounded-xl font-black text-sm text-white/30 flex items-center justify-center gap-2 cursor-not-allowed"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Star className="w-5 h-5" /> Devenir partenaire
              </button>
              <p className="text-xs text-muted-foreground mt-2">Atteignez les 4 seuils ci-dessus pour devenir éligible au statut Partenaire.</p>
            </div>
          )}
        </div>

        {/* Partner perks */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Avantages Partenaire</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PARTNER_PERKS.map((p) =>
            <div key={p.title} className="p-4 rounded-2xl flex items-start gap-3" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,215,0,0.12)" }}>
                <span className="text-2xl shrink-0">{p.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 p-4 rounded-2xl" style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)" }}>
            <p className="text-xs font-bold text-yellow-400 mb-2">En contrepartie, le Partenaire s'engage à :</p>
            <ul className="space-y-1">
              {PARTNER_COMMITMENTS.map((c) =>
              <li key={c} className="text-xs text-white/70 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-yellow-400 shrink-0" /> {c}</li>
              )}
            </ul>
          </div>
        </div>

        {/* Application form */}
        {!hasActiveStatus &&
        <div className="p-5 rounded-2xl space-y-4" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
            <p className="text-sm font-black text-white">Soumettre ma candidature</p>
            <div className="flex gap-2">
              {[
            { key: "affiliate", label: "Affilié", desc: `≥ ${AFFILIATE_VIEWS.toLocaleString()} vues`, eligible: canApplyAffiliate || !status }].
            map((p) =>
            <button key={p.key} onClick={() => setProgram(p.key)} disabled={!p.eligible}
            className={cn("flex-1 p-3 rounded-xl text-left transition", program === p.key ? "text-white" : "text-muted-foreground")}
            style={program === p.key ? { background: "rgba(168,85,247,0.2)", border: "1px solid #a855f7" } : { border: "1px solid rgba(255,255,255,0.08)", opacity: p.eligible ? 1 : 0.4 }}>
                  <p className="text-sm font-bold">{p.label}</p>
                  <p className="text-[10px]">{p.desc}</p>
                </button>
            )}
            </div>
            {program === "affiliate" && !canApplyAffiliate && <p className="text-[10px] text-orange-400">Il vous manque {(AFFILIATE_VIEWS - stats.totalViews).toLocaleString()} vues pour être éligible.</p>}
            <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} maxLength={2000} rows={4} placeholder="Votre motivation, votre parcours de créateur..."
          className="w-full p-3 rounded-xl bg-secondary border border-border text-white placeholder:text-muted-foreground outline-none text-sm resize-none" />
            <textarea value={portfolio} onChange={(e) => setPortfolio(e.target.value)} rows={3} placeholder="Vos liens (chaîne, profil, réseaux) — un par ligne"
          className="w-full p-3 rounded-xl bg-secondary border border-border text-white placeholder:text-muted-foreground outline-none text-sm resize-none" />
            <input value={contentDesc} onChange={(e) => setContentDesc(e.target.value)} maxLength={1000} placeholder="Types de contenus créés (mods, maps, design...)"
          className="w-full h-10 px-3 rounded-xl bg-secondary border border-border text-white placeholder:text-muted-foreground outline-none text-sm" />
            <button onClick={submit} disabled={submitting}
          className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Envoyer ma candidature
            </button>
          </div>
        }
      </div>
    </div>);

}