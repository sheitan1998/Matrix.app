import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, BookOpen, Clock, Gauge } from "lucide-react";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import ProspecteursSidebar from "@/components/prospecteurs/ProspecteursSidebar";
import { CREATOR_PLATFORMS } from "@/components/prospecteurs/CreatorPlatformCards";
import usePageSEO from "@/hooks/usePageSEO";
import { CREATOR_GUIDES } from "@/lib/creatorGuides";

const ACCENT = "#a855f7";

export default function CreatorGuides() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [platform, setPlatform] = useState(null);

  usePageSEO({
    title: "Guides & Tutoriels Créateurs — Best Creator | Matrix Hub",
    description: "Guides complets pour créer et développer une chaîne YouTube, Twitch, TikTok, Instagram ou Snapchat, puis la référencer sur Best Creator.",
    path: "/guides-createurs",
  });

  useEffect(() => {
    let active = true;
    base44.auth.me().then((u) => { if (active) setUser(u); }).catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, []);

  const guides = useMemo(
    () => (platform ? CREATOR_GUIDES.filter((g) => g.platform === platform) : CREATOR_GUIDES),
    [platform]
  );

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      <ProspecteursHeader user={user} trixBalance={user?.trix_balance || 0} />
      <div className="relative z-10 flex w-full pb-12 pr-2 sm:pr-4">
        <ProspecteursSidebar active="creators" />
        <div className="flex-1 min-w-0 px-4 sm:px-6 py-5">
          <button onClick={() => navigate("/best-creator")} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition tap-sm mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">Retour à Best Creator</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40` }}>
              <BookOpen className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-foreground">Guides &amp; Tutoriels Créateurs</h1>
              <p className="text-xs text-muted-foreground">Lancez votre chaîne, optimisez-la, puis faites-la grandir.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Filtrer par plateforme">
            {[{ key: null, label: "Toutes", color: ACCENT }, ...Object.values(CREATOR_PLATFORMS)].map((p) => {
              const selected = platform === p.key;
              return (
                <button
                  key={p.key || "all"}
                  onClick={() => setPlatform(p.key)}
                  aria-pressed={selected}
                  className="h-8 px-3 rounded-full text-xs font-bold border transition"
                  style={selected ? { background: `${p.color}25`, borderColor: p.color, color: "inherit" } : { borderColor: "hsl(var(--border))" }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                to={`/guides-createurs/${guide.slug}`}
                className="rounded-2xl overflow-hidden flex flex-col transition hover:brightness-110 bg-card border"
                style={{ borderColor: `${guide.accent}40` }}
              >
                <div className="h-20 flex items-center px-4" style={{ background: `linear-gradient(135deg, #1a0a2e, ${guide.accent}55)` }}>
                  <span className="text-xl font-black text-white drop-shadow">{guide.short}</span>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <h2 className="text-sm font-black text-foreground leading-snug">{guide.title}</h2>
                  <p className="text-[11px] leading-relaxed text-muted-foreground flex-1">{guide.summary}</p>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
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
        </div>
      </div>
    </div>
  );
}
