import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUp, BookOpen, ChevronRight, Trophy } from "lucide-react";
import { serverCategoryList, serverMatchesCategory } from "@/lib/serverCategories";

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

export function LatestServerCard({ servers = [], category, loading }) {
  const latest = useMemo(() => {
    let best = null;
    for (const s of servers) if (category && !serverMatchesCategory(s, category)) continue; else if (!best || createdAt(s) > createdAt(best)) best = s;
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
        <div className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
      ) : !latest || !target ? (
        <p className="text-[11px] text-white/40 py-4 text-center">Aucun serveur inscrit pour le moment</p>
      ) : (
        <Link to={`/servers/${target}`} className="block rounded-xl overflow-hidden transition hover:brightness-110" style={{ border: `1px solid ${ACCENT}30`, background: "#1a0a2e" }}>
          <div className="relative h-[80px]" style={{ background: `linear-gradient(135deg, #1a0a2e, ${ACCENT}33)` }}>
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

export function CategoryGuideCard() {
  return (
    <div className="rounded-2xl p-4" style={cardStyle}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40` }}>
          <BookOpen className="w-4 h-4" style={{ color: ACCENT }} />
        </div>
        <h3 className="text-xs font-black tracking-wider uppercase text-white">Guides &amp; Tutoriels Serveurs</h3>
      </div>
      <p className="text-[11px] leading-relaxed text-white/60 mb-3">Créez, sécurisez et optimisez votre serveur pas à pas, puis reliez-le à l'API de vote.</p>
      <Link
        to="/guides-serveurs"
        className="w-full h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition hover:brightness-125"
        style={{ background: `${ACCENT}25`, color: ACCENT, border: `1px solid ${ACCENT}50` }}
      >
        Explorer les Guides <ArrowRight className="w-4 h-4" />
      </Link>
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
            <div key={i} className="h-[52px] rounded-lg animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
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
              className="relative flex items-center gap-2.5 px-3 h-[52px] rounded-lg overflow-hidden transition hover:brightness-110"
              style={{ background: `linear-gradient(135deg, #1a0a2e, ${ACCENT}33)`, border: `1px solid ${ACCENT}30` }}
            >
              {bannerOf(server) && (
                <img src={bannerOf(server)} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
              )}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(10,5,15,0.85) 0%, rgba(10,5,15,0.6) 50%, rgba(10,5,15,0.4) 100%)" }} />
              <div
                className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                style={{ background: i < 3 ? RANK_COLORS[i] : "rgba(138,79,255,0.25)", color: "#fff" }}
              >
                {i + 1}
              </div>
              <div className="relative z-10 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}>
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
