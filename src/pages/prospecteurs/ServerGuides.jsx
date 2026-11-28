import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, BookOpen, Clock, Gauge, Search } from "lucide-react";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import ProspecteursSidebar from "@/components/prospecteurs/ProspecteursSidebar";
import usePageSEO from "@/hooks/usePageSEO";
import { SERVER_GUIDES } from "@/lib/serverGuides";

const ACCENT = "#a855f7";

export default function ServerGuides() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");

  usePageSEO({
    title: "Guides & Tutoriels Serveurs — Best Serveur | Matrix Hub",
    description: "Guides complets pour créer un serveur Minecraft, FiveM, Discord, Farming Simulator 25, Rust ou ARK, le sécuriser et le relier à l'API de vote Best Serveur.",
    path: "/guides-serveurs",
  });

  useEffect(() => {
    let active = true;
    base44.auth.me().then((u) => { if (active) setUser(u); }).catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, []);

  const guides = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SERVER_GUIDES;
    return SERVER_GUIDES.filter((g) =>
      [g.title, g.short, g.summary, ...g.tags].some((value) => value.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.85) 0%, rgba(26,14,46,0.82) 40%, rgba(18,9,28,0.88) 100%)" }}>
      <ProspecteursHeader user={user} trixBalance={user?.trix_balance || 0} />
      <div className="relative z-10 flex w-full pb-12 pr-2 sm:pr-4">
        <ProspecteursSidebar active="servers" />
        <div className="flex-1 px-4 sm:px-6 py-5">
          <button onClick={() => navigate("/best-serveurs")} className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">Retour à Best Serveur</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40` }}>
              <BookOpen className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-white">Guides &amp; Tutoriels Serveurs</h1>
              <p className="text-xs text-white/50">Créez, sécurisez et optimisez votre serveur, puis faites-le grandir.</p>
            </div>
          </div>

          <div className="relative mb-5 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrer par jeu ou plateforme (Minecraft, FiveM, Discord...)"
              aria-label="Filtrer les guides par jeu ou plateforme"
              className="w-full h-10 pl-9 pr-3 rounded-lg text-xs text-white placeholder:text-white/30 outline-none"
              style={{ background: "rgba(18,9,28,0.6)", border: `1px solid ${ACCENT}30` }}
            />
          </div>

          {guides.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: "rgba(18,9,28,0.4)", border: "1px dashed rgba(138,79,255,0.15)" }}>
              <p className="text-xs text-white/40">Aucun guide ne correspond à votre recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  to={`/guides-serveurs/${guide.slug}`}
                  className="rounded-2xl overflow-hidden flex flex-col transition hover:brightness-110"
                  style={{ background: "rgba(18,9,28,0.6)", border: `1px solid ${guide.accent}40` }}
                >
                  <div className="h-20 flex items-center px-4" style={{ background: `linear-gradient(135deg, #1a0a2e, ${guide.accent}55)` }}>
                    <span className="text-xl font-black text-white drop-shadow">{guide.short}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <h2 className="text-sm font-black text-white leading-snug">{guide.title}</h2>
                    <p className="text-[11px] leading-relaxed text-white/60 flex-1">{guide.summary}</p>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-white/60">
                      <span className="inline-flex items-center gap-1"><Gauge className="w-3.5 h-3.5" style={{ color: guide.accent }} />{guide.difficulty}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" style={{ color: guide.accent }} />{guide.duration}</span>
                    </div>
                    <span className="h-9 rounded-lg text-xs font-bold flex items-center justify-center" style={{ background: `${ACCENT}25`, color: ACCENT, border: `1px solid ${ACCENT}50` }}>
                      Lire le guide
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
