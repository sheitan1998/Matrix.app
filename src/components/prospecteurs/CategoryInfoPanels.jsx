import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, BookOpen, ChevronRight, Trophy, X } from "lucide-react";
import { serverCategoryList } from "@/lib/serverCategories";

const ACCENT = "#a855f7";
const RANK_COLORS = [
  "linear-gradient(135deg, #fbbf24, #f59e0b)",
  "linear-gradient(135deg, #e5e7eb, #9ca3af)",
  "linear-gradient(135deg, #d97706, #b45309)",
];
const cardStyle = { background: "rgba(18,9,28,0.6)", border: `1px solid ${ACCENT}30` };

const createdAt = (server) => {
  const time = new Date(server.created_date || server.created_at || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const logoOf = (s) => s.logo_url || s.profile_image || s.server_icon;
const bannerOf = (s) => s.banner_url || s.cover_image;

export function LatestServerCard({ servers = [], loading }) {
  const latest = useMemo(() => {
    let best = null;
    for (const s of servers) if (!best || createdAt(s) > createdAt(best)) best = s;
    return best;
  }, [servers]);
  const target = latest ? latest.slug || latest.id : null;
  const categories = latest ? serverCategoryList(latest) : [];
  const subtitle = categories[0]?.name || latest?.category || latest?.game || "";

  return (
    <div className="rounded-2xl p-4" style={cardStyle}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>Nouveau</span>
        <h3 className="text-xs font-black tracking-wider uppercase text-white">Dernier serveur inscrit</h3>
      </div>
      {loading ? (
        <div className="h-32 rounded-xl animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
      ) : !latest || !target ? (
        <p className="text-[11px] text-white/40 py-4 text-center">Aucun serveur inscrit pour le moment</p>
      ) : (
        <Link to={`/servers/${target}`} className="block rounded-xl overflow-hidden transition hover:brightness-110" style={{ border: `1px solid ${ACCENT}30`, background: "#1a0a2e" }}>
          <div className="relative aspect-[3/1]" style={{ background: `linear-gradient(135deg, #1a0a2e, ${ACCENT}33)` }}>
            {bannerOf(latest) && <img src={bannerOf(latest)} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
          </div>
          <div className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}>
              {logoOf(latest) ? <img src={logoOf(latest)} alt={`Logo du serveur ${latest.title}`} className="w-full h-full object-cover" /> : latest.title?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white truncate">{latest.title}</p>
              {subtitle && <p className="text-[10px] font-bold text-purple-300/80 truncate">{subtitle}</p>}
            </div>
            <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold" style={{ color: ACCENT }}>
              Voir la fiche <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}

const buildGuide = (name) => ({
  quick: [
    `Prérequis : un compte Discord vérifié, une idée claire du public ${name} visé et au moins deux modérateurs de confiance.`,
    `Configuration : salons d'accueil, règles, rôles par centre d'intérêt et un salon dédié aux annonces ${name}.`,
    "Attirer des membres : une bannière et un logo soignés, une description précise, des étiquettes pertinentes et des votes réguliers.",
  ],
  sections: [
    { title: "1. Prérequis", items: [
      `Définissez en une phrase ce qui rend votre communauté ${name} unique.`,
      "Activez la vérification de Discord et l'authentification à deux facteurs pour les modérateurs.",
      "Préparez un logo carré et une bannière au format paysage, lisibles en petit.",
    ] },
    { title: "2. Configuration de base", items: [
      "Créez un salon de règles, un salon d'annonces et un salon de présentation.",
      "Utilisez des rôles pour trier les membres par jeu, niveau ou disponibilité.",
      "Mettez en place un bot de modération et un message de bienvenue court.",
    ] },
    { title: "3. Bonnes pratiques pour attirer des membres", items: [
      `Soignez votre fiche Matrix : description claire, étiquettes liées à ${name}, lien d'invitation permanent.`,
      "Organisez des événements récurrents (soirées, tournois, sessions découverte).",
      "Encouragez vos membres à voter pour remonter dans le classement.",
      "Répondez vite aux nouveaux arrivants : les premières minutes décident s'ils restent.",
    ] },
  ],
});

export function CategoryGuideCard({ categoryName }) {
  const [open, setOpen] = useState(false);
  const name = categoryName || "";
  const guide = useMemo(() => buildGuide(name), [name]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="rounded-2xl p-4" style={cardStyle}>
      <div className="flex items-start gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40` }}>
          <BookOpen className="w-4 h-4" style={{ color: ACCENT }} />
        </div>
        <h3 className="text-xs font-black tracking-wider uppercase text-white leading-snug">Guide : Créer et développer son serveur {name}</h3>
      </div>
      <ul className="space-y-2 mb-4">
        {guide.quick.map((tip) => (
          <li key={tip} className="flex gap-2 text-[11px] leading-relaxed text-white/70">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ACCENT }} />
            {tip}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition hover:brightness-125"
        style={{ background: `${ACCENT}25`, color: ACCENT, border: `1px solid ${ACCENT}50` }}
      >
        Lire le guide complet <ChevronRight className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(5,2,10,0.8)" }} onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Guide ${name}`}
            className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl p-5"
            style={{ background: "#12091c", border: `1px solid ${ACCENT}50` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="text-sm font-black text-white">Guide : Créer et développer son serveur {name}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {guide.sections.map((section) => (
              <section key={section.title} className="mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: ACCENT }}>{section.title}</h3>
                <ul className="space-y-1.5">
                  {section.items.map((item) => (
                    <li key={item} className="text-xs leading-relaxed text-white/70">• {item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CategoryTopPanel({ title, servers, loading, emptyText }) {
  return (
    <div className="rounded-2xl p-4 h-full" style={cardStyle}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40` }}>
          <Trophy className="w-4 h-4" style={{ color: ACCENT }} />
        </div>
        <h3 className="text-xs font-black tracking-wider uppercase text-white">{title}</h3>
        <span className="text-[8px] text-white/30 ml-auto">Votes du mois</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[4/1] rounded-lg animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
          ))}
        </div>
      ) : servers.length === 0 ? (
        <div className="py-6 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-1 text-white/10" />
          <p className="text-[10px] text-white/30">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {servers.map((server, i) => (
            <Link
              key={server.id}
              to={`/servers/${server.slug || server.id}`}
              className="relative flex items-center gap-2.5 px-3 aspect-[4/1] min-h-[56px] rounded-lg overflow-hidden transition hover:brightness-110"
              style={{ background: `linear-gradient(135deg, #1a0a2e, ${ACCENT}33)`, border: `1px solid ${ACCENT}30` }}
            >
              {bannerOf(server) && (
                <img src={bannerOf(server)} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
              )}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(10,5,15,0.75) 0%, rgba(10,5,15,0.4) 50%, rgba(10,5,15,0.15) 100%)" }} />
              <div
                className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                style={{ background: i < 3 ? RANK_COLORS[i] : "rgba(138,79,255,0.25)", color: "#fff" }}
              >
                {i + 1}
              </div>
              <div className="relative z-10 w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}>
                {logoOf(server) ? <img src={logoOf(server)} alt="" className="w-full h-full object-cover" /> : server.title?.[0]?.toUpperCase() || "S"}
              </div>
              <span className="relative z-10 flex-1 min-w-0 text-sm font-bold text-white truncate" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>{server.title}</span>
              <span
                className="relative z-10 shrink-0 text-xs font-black flex items-center gap-1 px-2.5 py-0.5 rounded-full"
                style={{ color: ACCENT, background: "rgba(18,9,28,0.85)", border: `1px solid ${ACCENT}80` }}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                {server.votes_month || 0}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
