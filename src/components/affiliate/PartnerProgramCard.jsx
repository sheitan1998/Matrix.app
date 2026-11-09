import React, { useState } from "react";
import { Star, Loader2, Send, CheckCircle2, Clock, TrendingUp, Users, FileVideo, Coins } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { PARTNER_PERKS, PARTNER_SUBSCRIBERS, PARTNER_VIEWS, PARTNER_MIN_CONTENT } from "@/lib/affiliateProgram";
import ReferralLinkCard from "@/components/affiliate/ReferralLinkCard";
import BrandVideo from "@/components/affiliate/BrandVideo";

const THRESHOLDS = [
  { icon: Users, label: "Abonnés", value: PARTNER_SUBSCRIBERS },
  { icon: TrendingUp, label: "Vues cumulées", value: PARTNER_VIEWS },
  { icon: FileVideo, label: "Contenus publiés", value: PARTNER_MIN_CONTENT },
];

const PLATFORMS = ["YouTube", "Twitch", "TikTok", "Instagram", "X / Twitter", "Autre"];

const EMPTY_FORM = { platform: "YouTube", subscribers: "", views: "", contents: "", links: "", motivation: "" };

export default function PartnerProgramCard({ affiliation, referralCode, referralCount, pending, onSubmitted }) {
  const isPartner = affiliation?.status === "partner";
  const [form, setForm] = useState(EMPTY_FORM);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    const links = form.links.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!form.subscribers || !form.views || !form.contents) { toast.error("Renseignez vos statistiques"); return; }
    if (links.length === 0) { toast.error("Ajoutez au moins un lien vers vos contenus"); return; }
    if (form.motivation.trim().length < 20) { toast.error("Détaillez un peu votre motivation (20 caractères min.)"); return; }

    setSending(true);
    try {
      const res = await base44.functions.invoke("affiliateProgram", {
        action: "applyPartner",
        platform: form.platform,
        subscribers: form.subscribers,
        views: form.views,
        contents: form.contents,
        links,
        motivation: form.motivation.trim(),
      });
      if (res?.data?.error) { toast.error(res.data.error); return; }
      toast.success("Candidature Partenaire envoyée pour validation.");
      setForm(EMPTY_FORM);
      setOpen(false);
      onSubmitted?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors de l'envoi de la candidature");
    } finally {
      setSending(false);
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
        <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide" style={{ background: "rgba(255,215,0,0.12)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>
          Sur validation
        </span>
      </div>

      {/* Seuils requis */}
      <div className="p-5 rounded-2xl" style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.18)" }}>
        <p className="text-xs font-black text-yellow-400 mb-3">Seuils requis</p>
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
        <p className="text-[10px] text-white/40 mt-2.5">Sur n'importe quelle plateforme : YouTube, Twitch, TikTok, Instagram…</p>
      </div>

      {isPartner ? (
        <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)" }}>
          <Star className="w-5 h-5 shrink-0" style={{ color: "#FFD700" }} />
          <p className="text-xs text-yellow-300">Vous êtes Partenaire Matrix. Tous les avantages sont actifs.</p>
        </div>
      ) : pending ? (
        <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.25)" }}>
          <Clock className="w-5 h-5 shrink-0" style={{ color: "#FFD700" }} />
          <p className="text-xs text-yellow-300">Votre candidature Partenaire est en cours de validation par l'équipe.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => setOpen((v) => !v)} className="w-full p-5 flex items-center gap-3 text-left transition hover:opacity-90">
            <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#FFD700" }} />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Postuler au programme Partenaire</p>
              <p className="text-[11px] text-white/45">Validation manuelle par les administrateurs</p>
            </div>
            <span className="text-xs font-bold text-yellow-400">{open ? "Fermer" : "Postuler →"}</span>
          </button>

          {open && (
            <div className="px-5 pb-5 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">Plateforme principale</span>
                  <select value={form.platform} onChange={set("platform")}
                    className="mt-1 w-full h-10 px-3 rounded-xl bg-secondary border border-border text-white text-sm outline-none">
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">Abonnés</span>
                  <input value={form.subscribers} onChange={set("subscribers")} inputMode="numeric" placeholder="10 000"
                    className="mt-1 w-full h-10 px-3 rounded-xl bg-secondary border border-border text-white text-sm outline-none" />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">Vues cumulées</span>
                  <input value={form.views} onChange={set("views")} inputMode="numeric" placeholder="100 000"
                    className="mt-1 w-full h-10 px-3 rounded-xl bg-secondary border border-border text-white text-sm outline-none" />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">Contenus publiés</span>
                  <input value={form.contents} onChange={set("contents")} inputMode="numeric" placeholder="5"
                    className="mt-1 w-full h-10 px-3 rounded-xl bg-secondary border border-border text-white text-sm outline-none" />
                </label>
              </div>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-white/40">Liens vers vos contenus (un par ligne)</span>
                <textarea value={form.links} onChange={set("links")} rows={2} placeholder="https://youtube.com/@..." 
                  className="mt-1 w-full p-3 rounded-xl bg-secondary border border-border text-white placeholder:text-muted-foreground text-sm outline-none resize-none" />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-white/40">Motivation</span>
                <textarea value={form.motivation} onChange={set("motivation")} rows={3} maxLength={2000} placeholder="Votre parcours, votre audience, comment vous parlerez de Matrix…"
                  className="mt-1 w-full p-3 rounded-xl bg-secondary border border-border text-white placeholder:text-muted-foreground text-sm outline-none resize-none" />
              </label>
              <button onClick={submit} disabled={sending}
                className="w-full h-11 rounded-xl font-black text-sm text-black flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)" }}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer ma candidature
              </button>
              <p className="text-[10px] text-white/40">Les seuils sont vérifiés par l'équipe avant toute validation.</p>
            </div>
          )}
        </div>
      )}

      <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <BrandVideo />
      </div>

      <ReferralLinkCard code={referralCode} count={referralCount} variant="advanced" />

      <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: "rgba(255,215,0,0.06)", border: "1px dashed rgba(255,215,0,0.35)" }}>
        <Coins className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#FFD700" }} />
        <p className="text-sm font-black text-yellow-300">Bientôt une monétisation active pour les partenaires !</p>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Avantages exclusifs</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PARTNER_PERKS.map((p) => (
            <div key={p.title} className="p-4 rounded-2xl flex items-start gap-3" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,215,0,0.12)" }}>
              <span className="text-xl shrink-0">{p.icon}</span>
              <div>
                <p className="text-sm font-bold text-white">{p.title}</p>
                <p className="text-[11px] text-white/45 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}