import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Gauge } from "lucide-react";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import ProspecteursSidebar from "@/components/prospecteurs/ProspecteursSidebar";
import usePageSEO from "@/hooks/usePageSEO";
import { findGuide, GUIDE_SECTION_TITLES } from "@/lib/serverGuides";

const ACCENT = "#a855f7";
const cardStyle = { background: "rgba(18,9,28,0.6)", border: `1px solid ${ACCENT}30` };

export default function ServerGuideDetail() {
  const { slug } = useParams();
  const guide = findGuide(slug);
  const [user, setUser] = useState(null);

  usePageSEO({
    title: guide ? `${guide.title} — Guide Best Serveur | Matrix Hub` : "Guide introuvable — Best Serveur | Matrix Hub",
    description: guide ? guide.summary : "Ce guide n'existe pas.",
    path: `/guides-serveurs/${slug}`,
  });

  useEffect(() => {
    let active = true;
    base44.auth.me().then((u) => { if (active) setUser(u); }).catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.85) 0%, rgba(26,14,46,0.82) 40%, rgba(18,9,28,0.88) 100%)" }}>
      <ProspecteursHeader user={user} trixBalance={user?.trix_balance || 0} />
      <div className="relative z-10 flex w-full pb-12 pr-2 sm:pr-4">
        <ProspecteursSidebar active="servers" />
        <div className="flex-1 min-w-0 px-4 sm:px-6 py-5">
          <Link to="/guides-serveurs" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">Retour aux guides</span>
          </Link>

          {!guide ? (
            <div className="rounded-xl p-8 text-center" style={cardStyle}>
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-white/20" />
              <p className="text-xs text-white/50">Guide introuvable</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
              <nav aria-label="Sommaire" className="lg:sticky lg:top-20 self-start rounded-2xl p-4" style={cardStyle}>
                <h2 className="text-xs font-black tracking-wider uppercase text-white mb-3">Sommaire</h2>
                <ol className="space-y-1.5">
                  {GUIDE_SECTION_TITLES.map((title, i) => (
                    <li key={title}>
                      <a href={`#section-${i + 1}`} className="text-[11px] leading-snug text-white/60 hover:text-white transition block">
                        {i + 1}. {title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <article className="min-w-0 space-y-4">
                <header className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg, #1a0a2e, ${guide.accent}40)`, border: `1px solid ${guide.accent}50` }}>
                  <h1 className="text-lg sm:text-2xl font-black text-white mb-2">{guide.title}</h1>
                  <p className="text-xs text-white/70 mb-3">{guide.summary}</p>
                  <div className="flex items-center gap-4 text-[11px] font-bold text-white/80">
                    <span className="inline-flex items-center gap-1"><Gauge className="w-3.5 h-3.5" />{guide.difficulty}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{guide.duration}</span>
                  </div>
                </header>

                {guide.sections.map((sec, i) => (
                  <section key={GUIDE_SECTION_TITLES[i]} id={`section-${i + 1}`} className="rounded-2xl p-5 scroll-mt-20" style={cardStyle}>
                    <h2 className="text-sm font-black text-white mb-2">
                      <span style={{ color: ACCENT }}>{i + 1}.</span> {GUIDE_SECTION_TITLES[i]}
                    </h2>
                    <p className="text-xs leading-relaxed text-white/70 mb-3">{sec.intro}</p>
                    <ul className="space-y-2">
                      {sec.items.map((item) => (
                        <li key={item} className="flex gap-2 text-xs leading-relaxed text-white/70">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ACCENT }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {sec.code && (
                      <pre className="mt-3 p-3 rounded-lg overflow-x-auto text-[11px] leading-relaxed text-purple-100" style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${ACCENT}25` }}>
                        <code>{sec.code}</code>
                      </pre>
                    )}
                  </section>
                ))}

                <div className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" style={{ background: "linear-gradient(135deg, rgba(138,79,255,0.25), rgba(18,9,28,0.8))", border: `1px solid ${ACCENT}60` }}>
                  <div>
                    <h2 className="text-sm font-black text-white">Votre serveur est prêt ? Publiez-le sur Best Serveur</h2>
                    <p className="text-xs text-white/60 mt-1">Gagnez en visibilité, recevez des votes et recrutez de nouveaux joueurs.</p>
                  </div>
                  <Link to="/best-serveurs" className="h-10 px-4 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                    Publier mon serveur <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
