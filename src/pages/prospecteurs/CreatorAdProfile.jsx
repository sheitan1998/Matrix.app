import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ArrowUp, ExternalLink, Loader2, Sparkles, Trophy } from "lucide-react";
import { CREATOR_PLATFORMS } from "@/components/prospecteurs/CreatorPlatformCards";
import { resolveCreatorVisuals } from "@/lib/creatorDefaults";
import SeoBreadcrumbs from "@/components/seo/SeoBreadcrumbs";
import usePageSEO from "@/hooks/usePageSEO";
import ServerGallery from "@/components/prospecteurs/ServerGallery";
import ReviewsSection from "@/components/prospecteurs/ReviewsSection";
import { SITE_URL } from "@/lib/seoRoutes";

/**
 * Fiche publique d'une annonce créateur (Best Creator).
 * Contenu texte réel, URL stable, métadonnées et données structurées propres.
 */
export default function CreatorAdProfile() {
  const { slug } = useParams();
  const [creator, setCreator] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    base44.auth.me().then((me) => { if (active) setUser(me); }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);

    const load = async () => {
      const page = await base44.entities.CreatorChannel.filter({ slug }, { limit: 1 });
      let found = page.items?.[0] || null;
      if (!found) {
        found = await base44.entities.CreatorChannel.get(slug).catch(() => null);
      }
      if (!active) return;
      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCreator(found);
      setLoading(false);

      const others = await base44.entities.CreatorChannel.filter(
        { platform: found.platform },
        { sort: "-votes_month", limit: 5 }
      );
      if (active) setSimilar((others.items || []).filter((c) => c.id !== found.id).slice(0, 4));
    };

    load().catch(() => {
      if (active) {
        setNotFound(true);
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [slug]);

  const description = (creator?.description || "").replace(/\s+/g, " ").trim();
  const platform = creator ? CREATOR_PLATFORMS[creator.platform] || CREATOR_PLATFORMS.youtube : null;
  const visuals = creator ? resolveCreatorVisuals(creator) : {};
  const path = `/createur/${creator?.slug || slug}`;

  usePageSEO(
    creator
      ? {
          title: `${creator.name} — ${platform?.label || "créateur"} | Best Creator Matrix Hub`,
          description: (
            description.length >= 60
              ? description
              : `Fiche du créateur ${creator.name} sur ${platform?.label || "sa plateforme"} : présentation, votes de la communauté et lien direct vers sa chaîne sur Best Creator Matrix Hub.`
          ).slice(0, 158),
          path,
          image: visuals.avatar_url || creator.avatar_url,
          type: "profile",
          noindex: description.length < 80 || creator.is_active === false,
          schema: {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            url: `${SITE_URL}${path}`,
            mainEntity: {
              "@type": "Person",
              name: creator.name,
              description: description || undefined,
              image: visuals.avatar_url || creator.avatar_url || undefined,
              ...(creator.channel_url ? { sameAs: [creator.channel_url] } : {}),
            },
          },
        }
      : { noindex: true }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#12091c" }}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (notFound || !creator) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: "#12091c" }}>
        <Sparkles className="w-12 h-12 text-white/20" />
        <h1 className="text-lg font-black text-white">Créateur introuvable</h1>
        <p className="text-sm text-white/50 text-center">Cette fiche créateur n'existe plus ou n'a jamais été publiée.</p>
        <Link
          to="/best-creator"
          className="h-9 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5 tap-sm"
          style={{ background: "rgba(138,79,255,0.15)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Retour au classement
        </Link>
      </div>
    );
  }

  const accent = platform?.color || "#a855f7";
  const PlatformIcon = platform?.icon;
  const isOwner = !!user && user.email === creator.owner_email;

  return (
    <div className="min-h-screen" style={{ background: "#12091c" }}>
      {visuals.banner_url ? (
        <div className="relative h-40 sm:h-56 w-full overflow-hidden">
          <img src={visuals.banner_url} alt={`Bannière de ${creator.name}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.3) 0%, rgba(18,9,28,0.9) 100%)" }} />
        </div>
      ) : (
        <div className="h-32 w-full" style={{ background: `linear-gradient(135deg, ${accent}20, rgba(18,9,28,0.8))` }} />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 relative pb-12">
        <div className="flex items-end gap-3 mb-4">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${accent}, #1a0a2e)`, border: "4px solid #12091c" }}
          >
            {visuals.avatar_url ? (
              <img src={visuals.avatar_url} alt={`Avatar de ${creator.name}`} className="w-full h-full object-cover" />
            ) : (
              creator.name?.[0]?.toUpperCase() || "C"
            )}
          </div>
          <div className="flex-1 pb-1">
            <h1 className="text-lg sm:text-2xl font-black text-white">{creator.name}</h1>
            <span
              className="inline-flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded mt-1"
              style={{ background: `${accent}20`, color: accent }}
            >
              {PlatformIcon && <PlatformIcon className="w-2.5 h-2.5" />} {platform?.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Link
            to="/best-creator"
            className="h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 tap-sm"
            style={{ background: "rgba(138,79,255,0.1)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Classement
          </Link>
          {creator.channel_url && (
            <a
              href={creator.channel_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex-1 h-9 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 tap-sm"
              style={{ background: `linear-gradient(135deg, ${accent}, #5b21b6)`, color: "#fff" }}
            >
              <ExternalLink className="w-3.5 h-3.5" /> Voir la chaîne {platform?.label}
            </a>
          )}
        </div>

        <SeoBreadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Best Creator", href: "/best-creator" },
            { label: creator.name },
          ]}
        />

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
            <ArrowUp className="w-4 h-4 mx-auto mb-1" style={{ color: accent }} />
            <p className="text-lg font-black text-white">{creator.votes || 0}</p>
            <p className="text-[8px] text-white/40 uppercase tracking-wider">Votes totaux</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
            <Trophy className="w-4 h-4 mx-auto mb-1" style={{ color: "#fbbf24" }} />
            <p className="text-lg font-black text-white">{creator.votes_month || 0}</p>
            <p className="text-[8px] text-white/40 uppercase tracking-wider">Votes ce mois</p>
          </div>
        </div>

        <section className="rounded-xl p-4 mb-4" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
          <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2">Présentation</h2>
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
            {description || `Ce créateur n'a pas encore ajouté de description à sa fiche Best Creator.`}
          </p>
        </section>

        <ServerGallery images={creator.gallery_images} title={creator.name} kind="créateur" />

        <ReviewsSection targetType="creator" targetId={creator.id} isOwner={isOwner} user={user} />

        {similar.length > 0 && (
          <section className="rounded-xl p-4" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
            <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2">
              Autres créateurs {platform?.label}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {similar.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/createur/${item.slug || item.id}`}
                    className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[10px] font-bold tap-sm"
                    style={{ background: "rgba(168,85,247,0.1)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.25)" }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}