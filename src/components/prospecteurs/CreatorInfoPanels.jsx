import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUp, BookOpen, ChevronRight, Trophy } from "lucide-react";
import { CREATOR_PLATFORMS } from "./CreatorPlatformCards";
import { resolveCreatorVisuals } from "@/lib/creatorDefaults";

const ACCENT = "#a855f7";
const RANK_COLORS = [
  "linear-gradient(135deg, #fbbf24, #f59e0b)",
  "linear-gradient(135deg, #e5e7eb, #9ca3af)",
  "linear-gradient(135deg, #d97706, #b45309)",
];
const cardClass = "rounded-2xl p-4 bg-card border";
const cardStyle = { borderColor: `${ACCENT}30` };

const createdAt = (creator) => {
  const time = new Date(creator.created_date || creator.created_at || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export function CreatorTopPanel({ title, creators, loading, emptyText }) {
  return (
    <div className={`${cardClass} h-full`} style={cardStyle}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40` }}>
          <Trophy className="w-4 h-4" style={{ color: ACCENT }} />
        </div>
        <h3 className="text-xs font-black tracking-wider uppercase text-foreground">{title}</h3>
        <span className="text-[8px] text-muted-foreground ml-auto">Votes du mois</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[52px] rounded-lg animate-pulse bg-muted" />
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="py-6 text-center">
          <Trophy className="w-6 h-6 mx-auto mb-1 text-muted-foreground/40" />
          <p className="text-[10px] text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {creators.slice(0, 5).map((creator, i) => {
            const platform = CREATOR_PLATFORMS[creator.platform] || CREATOR_PLATFORMS.youtube;
            const visuals = resolveCreatorVisuals(creator);
            return (
              <a
                key={creator.id}
                href={creator.channel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center gap-2.5 px-3 h-[52px] rounded-lg overflow-hidden transition hover:brightness-110"
                style={{ background: `linear-gradient(135deg, #1a0a2e, ${platform.color}33)`, border: `1px solid ${platform.color}40` }}
              >
                {visuals.banner_url && <img src={visuals.banner_url} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(10,5,15,0.85) 0%, rgba(10,5,15,0.55) 50%, rgba(10,5,15,0.35) 100%)" }} />
                <div className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 text-white" style={{ background: i < 3 ? RANK_COLORS[i] : "rgba(138,79,255,0.35)" }}>
                  {i + 1}
                </div>
                <div className="relative z-10 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: `linear-gradient(135deg, ${platform.color}, #1a0a2e)`, border: `1.5px solid ${platform.color}` }}>
                  {visuals.avatar_url ? <img src={visuals.avatar_url} alt="" className="w-full h-full object-cover" /> : creator.name?.[0]?.toUpperCase() || "C"}
                </div>
                <span className="relative z-10 flex-1 min-w-0 text-sm font-bold text-white truncate" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>{creator.name}</span>
                <span className="relative z-10 shrink-0 text-xs font-black flex items-center gap-1 px-2.5 py-0.5 rounded-full" style={{ color: ACCENT, background: "rgba(18,9,28,0.85)", border: `1px solid ${ACCENT}80` }}>
                  <ArrowUp className="w-3.5 h-3.5" />
                  {creator.votes_month || 0}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LatestCreatorCard({ creators = [], platform, loading }) {
  const latest = useMemo(() => {
    let best = null;
    for (const c of creators) {
      if (platform && c.platform !== platform) continue;
      if (!best || createdAt(c) > createdAt(best)) best = c;
    }
    return best;
  }, [creators, platform]);

  if (!loading && !latest) return null;
  const visuals = latest ? resolveCreatorVisuals(latest) : {};
  const color = (CREATOR_PLATFORMS[latest?.platform] || CREATOR_PLATFORMS.youtube).color;

  return (
    <div className={cardClass} style={cardStyle}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>Nouveau</span>
        <h3 className="text-xs font-black tracking-wider uppercase text-foreground">Dernière chaîne inscrite</h3>
      </div>
      {loading ? (
        <div className="h-[80px] rounded-xl animate-pulse bg-muted" />
      ) : (
        <Link
          to={`/createur/${latest.slug || latest.id}`}
          className="relative flex items-center gap-3 px-3 h-[80px] rounded-xl overflow-hidden transition hover:brightness-110"
          style={{ background: `linear-gradient(135deg, #1a0a2e, ${color}44)`, border: `1px solid ${color}50` }}
        >
          {visuals.banner_url && <img src={visuals.banner_url} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(10,5,15,0.85) 0%, rgba(10,5,15,0.55) 60%, rgba(10,5,15,0.35) 100%)" }} />
          <div className="relative z-10 w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-base font-black text-white shrink-0" style={{ background: `linear-gradient(135deg, ${color}, #1a0a2e)`, border: `1.5px solid ${color}` }}>
            {visuals.avatar_url ? <img src={visuals.avatar_url} alt={`Logo de la chaîne ${latest.name}`} className="w-full h-full object-cover" /> : latest.name?.[0]?.toUpperCase() || "C"}
          </div>
          <p className="relative z-10 flex-1 min-w-0 text-sm font-black text-white truncate" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>{latest.name}</p>
          <span className="relative z-10 shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold text-white">
            Voir la fiche <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      )}
    </div>
  );
}

export function CreatorGuideCard() {
  return (
    <div className={cardClass} style={cardStyle}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40` }}>
          <BookOpen className="w-4 h-4" style={{ color: ACCENT }} />
        </div>
        <h3 className="text-xs font-black tracking-wider uppercase text-foreground">Guides &amp; Tutoriels Créateurs</h3>
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground mb-3">Créez, sécurisez et optimisez votre chaîne pas à pas, puis référencez-la sur Best Creator.</p>
      <Link
        to="/guides-createurs"
        className="w-full h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition hover:brightness-125"
        style={{ background: `${ACCENT}25`, color: ACCENT, border: `1px solid ${ACCENT}50` }}
      >
        Explorer les Guides <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
