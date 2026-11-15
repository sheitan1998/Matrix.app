import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, RefreshCw, PackageOpen } from "lucide-react";
import usePageSEO from "@/hooks/usePageSEO";
import useOpenGame from "@/hooks/useOpenGame";
import { OPEN_GAMES_BY_SLUG, TAB_META } from "@/lib/openGames";
import OpenGameHero from "@/components/tuto-gaming/open/OpenGameHero";
import OpenGameTabs from "@/components/tuto-gaming/open/OpenGameTabs";
import OpenGameItemCard from "@/components/tuto-gaming/open/OpenGameItemCard";
import OpenGamePlayerSearch from "@/components/tuto-gaming/open/OpenGamePlayerSearch";

export default function OpenGameDetail() {
  const { slug } = useParams();
  const game = OPEN_GAMES_BY_SLUG[slug];
  const [tab, setTab] = useState("shop");
  const { data, loading, error, reload } = useOpenGame(game ? slug : null);

  usePageSEO({
    title: game ? `${game.name} — Boutique, quêtes et succès | Matrix Hub` : "Jeu introuvable",
    description: game ? `${game.description} Données publiques en direct, sans clé API.` : undefined,
    path: `/jeu/${slug}`,
  });

  useEffect(() => {
    setTab("shop");
  }, [slug]);

  const tabs = data?.tabs || {};
  const counts = useMemo(() => {
    const out = {};
    TAB_META.forEach((t) => { out[t.id] = tabs[t.id]?.items?.length || 0; });
    return out;
  }, [tabs]);

  if (!game) {
    return (
      <div className="px-4 py-16 text-center max-w-lg mx-auto">
        <h1 className="text-xl font-black text-white mb-2">Jeu introuvable</h1>
        <p className="text-xs text-white/40 mb-4">Cette fiche n'existe pas ou n'est plus disponible.</p>
        <Link to="/tuto-gaming" className="text-xs font-bold" style={{ color: "#BF5AF2" }}>
          Retour aux jeux
        </Link>
      </div>
    );
  }

  const accent = game.accent || "#a855f7";
  const current = tabs[tab] || { items: [] };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-6xl mx-auto pb-14">
      <OpenGameHero game={game} />

      {game.supportsPlayer && (
        <OpenGamePlayerSearch slug={game.slug} accent={accent} hint={game.playerHint} />
      )}

      <OpenGameTabs active={tab} onChange={setTab} accent={accent} counts={counts} />

      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl p-8 text-center" style={{ background: "rgba(13,5,24,0.7)", border: `1px dashed ${accent}44` }}>
            <RefreshCw className="w-6 h-6 mx-auto mb-2 text-white/25" />
            <p className="text-xs text-white/50 mb-3">{error}</p>
            <button
              onClick={reload}
              className="h-9 px-4 rounded-lg text-xs font-bold text-white tap-sm"
              style={{ background: `${accent}22`, border: `1px solid ${accent}55` }}
            >
              Réessayer
            </button>
          </div>
        ) : current.items?.length ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {current.items.map((item, i) => (
                <OpenGameItemCard key={`${item.id}-${i}`} item={item} accent={accent} />
              ))}
            </div>
            {current.note && <p className="text-[10px] text-white/30 mt-3">{current.note}</p>}
          </>
        ) : (
          <div className="rounded-xl p-10 text-center" style={{ background: "rgba(13,5,24,0.6)", border: "1px dashed rgba(255,255,255,0.08)" }}>
            <PackageOpen className="w-7 h-7 mx-auto mb-2 text-white/20" />
            <p className="text-xs text-white/45">
              Cette source ouverte ne publie pas encore de données pour cet onglet.
            </p>
            {current.note && <p className="text-[10px] text-white/30 mt-2">{current.note}</p>}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-white/30">
          <Loader2 className="w-3 h-3 animate-spin" /> Synchronisation des données publiques…
        </div>
      )}
    </div>
  );
}