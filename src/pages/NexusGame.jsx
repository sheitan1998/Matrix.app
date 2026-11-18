import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User, ShoppingBag, Gamepad2, Loader2, RefreshCw, SearchX } from "lucide-react";
import CasinoToken from "@/components/casino/CasinoToken";
import useCasinoCoins from "@/hooks/useCasinoCoins";
import { formatBet } from "@/components/casino/slotThemes";
import usePageSEO from "@/hooks/usePageSEO";
import useGameCatalog, { GAME_CATEGORIES } from "@/hooks/useGameCatalog";
import NexusHero from "@/components/nexus/catalogue/NexusHero";
import NexusFeaturedGames from "@/components/nexus/catalogue/NexusFeaturedGames";
import NexusCategoryRow from "@/components/nexus/catalogue/NexusCategoryRow";
import NexusGameCard from "@/components/nexus/catalogue/NexusGameCard";
import NexusFilters from "@/components/nexus/catalogue/NexusFilters";
import NexusGamePlayer from "@/components/nexus/catalogue/NexusGamePlayer";
import NexusArcadePlayer from "@/components/nexus/catalogue/NexusArcadePlayer";
import SeoContentBlock from "@/components/seo/SeoContentBlock";

const BANNER_URL = "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/a9f79135d_nexus-game-banner.png";

export default function NexusGame() {
  usePageSEO({
    title: "Nexus Game : jeux en ligne et casino virtuel | Matrix Hub",
    description: "Découvrez le catalogue Nexus Game : roulette, machines à sous, blackjack, cartes à gratter et des centaines de jeux HTML5 jouables avec la monnaie virtuelle TRIX.",
    path: "/nexus-game",
  });

  const catalog = useGameCatalog();
  const [balance, setBalance, refreshBalance] = useCasinoCoins();
  const [selectedGame, setSelectedGame] = useState(null);
  const [arcadeGame, setArcadeGame] = useState(null);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("game");
    if (["slots", "wheel", "roulette", "scratch", "shop"].includes(requested)) {
      setArcadeGame(requested);
    }
  }, []);

  const online = !catalog.loading && !catalog.error;

  return (
    <div className="min-h-screen relative" style={{ background: "#0a050f" }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, rgba(168,85,247,0.12), transparent 65%)" }}
      />

      <header
        className="relative z-30 flex items-center justify-between gap-3 px-4 sm:px-6 h-16"
        style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(168,85,247,0.18)" }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition tap-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Retour</span>
          </Link>
          <div
            className="flex items-center gap-2 px-3 h-9 rounded-xl"
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)" }}
          >
            <CasinoToken size={20} />
            <span className="text-sm font-mono font-black" style={{ color: "#c084fc" }}>
              {formatBet(balance)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span
            className="text-lg font-black tracking-wider leading-none"
            style={{
              background: "linear-gradient(135deg, #e9d5ff, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 10px rgba(168,85,247,0.5))",
            }}
          >
            NEXUS GAME
          </span>
          <span className="flex items-center gap-1 text-[9px] font-bold text-white/40 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: online ? "#22c55e" : "#f59e0b", boxShadow: `0 0 6px ${online ? "#22c55e" : "#f59e0b"}` }}
            />
            {online ? "Catalogue connecté" : catalog.loading ? "Connexion..." : "Catalogue indisponible"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/mon-profil"
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-white/80 transition hover:opacity-90 tap-sm"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <User className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Profil</span>
          </Link>
          <Link
            to="/boutique-nexus"
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-white transition hover:opacity-90 tap-sm"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", boxShadow: "0 0 12px rgba(168,85,247,0.25)" }}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Boutique</span>
          </Link>
        </div>
      </header>

      <div className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 py-5 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-6">
          <h1 className="sr-only">Nexus Game — catalogue de jeux en ligne et casino virtuel Matrix Hub</h1>
          <NexusHero
            bannerUrl={BANNER_URL}
            search={catalog.search}
            onSearchChange={catalog.setSearch}
            onSubmit={() => document.getElementById("catalogue-grid")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            online={online}
          />

          <NexusFeaturedGames
            onOpen={setArcadeGame}
            balance={balance}
            onRecharge={() => setArcadeGame("shop")}
          />

          <NexusCategoryRow categories={["Tous", ...GAME_CATEGORIES]} value={catalog.category} onChange={catalog.setCategory} />

          <section id="catalogue-grid">
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 className="w-4 h-4" style={{ color: "#a855f7" }} />
              <h2 className="text-xs font-black tracking-wider uppercase text-white">Catalogue de jeux</h2>
              <span className="ml-auto text-[10px] text-white/40">
                {catalog.filtered.length} jeu{catalog.filtered.length !== 1 ? "x" : ""}
              </span>
            </div>

            {catalog.loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#a855f7" }} />
                <p className="text-xs text-white/50">Synchronisation du catalogue...</p>
              </div>
            ) : catalog.error ? (
              <div
                className="rounded-xl p-8 text-center"
                style={{ background: "rgba(18,9,28,0.7)", border: "1px dashed rgba(168,85,247,0.25)" }}
              >
                <RefreshCw className="w-7 h-7 mx-auto mb-2 text-white/30" />
                <p className="text-xs text-white/50 mb-3">{catalog.error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="h-9 px-4 rounded-lg text-xs font-bold text-white tap-sm"
                  style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
                >
                  Réessayer
                </button>
              </div>
            ) : catalog.filtered.length === 0 ? (
              <div
                className="rounded-xl p-8 text-center"
                style={{ background: "rgba(18,9,28,0.7)", border: "1px dashed rgba(168,85,247,0.25)" }}
              >
                <SearchX className="w-7 h-7 mx-auto mb-2 text-white/25" />
                <p className="text-xs text-white/50 mb-3">Aucun jeu ne correspond à ces filtres.</p>
                <button
                  onClick={catalog.resetFilters}
                  className="h-9 px-4 rounded-lg text-xs font-bold text-white tap-sm"
                  style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {catalog.visibleGames.map((game) => (
                    <NexusGameCard key={game.id} game={game} onPlay={setSelectedGame} />
                  ))}
                </div>
                {catalog.hasMore && (
                  <div className="flex justify-center mt-5">
                    <button
                      onClick={catalog.loadMore}
                      className="h-10 px-6 rounded-xl text-xs font-black uppercase tracking-wider text-white transition hover:opacity-90 tap-sm"
                      style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.4)", color: "#e9d5ff" }}
                    >
                      Afficher plus de jeux
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-4 self-start">
          <NexusFilters catalog={catalog} />
        </aside>
      </div>

      <div className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 pb-8">
        <SeoContentBlock
          eyebrow="Nexus Game"
          title="Le catalogue de jeux et le casino virtuel de Matrix Hub"
          intro="Nexus Game réunit un catalogue de centaines de jeux HTML5 jouables directement dans le navigateur et une sélection de jeux d'arcade comme la roulette, les machines à sous, le blackjack ou les tickets à gratter. Tous les jeux utilisent la monnaie virtuelle TRIX, sans argent réel : vous jouez, vous progressez et vous débloquez de nouveaux contenus au fil de vos parties."
          sections={[
            { title: "Catalogue de jeux HTML5", text: "Filtrez par catégorie, durée, difficulté ou compatibilité mobile et lancez un jeu sans installation ni téléchargement." },
            { title: "Roulette et machines à sous", text: "Retrouvez les grands classiques du casino d'arcade avec des thèmes visuels, des mises libres et des gains en TRIX." },
            { title: "Tickets à gratter et roue de la fortune", text: "Tentez votre chance sur des jeux rapides, avec des récompenses quotidiennes et des jackpots progressifs." },
            { title: "Monnaie virtuelle TRIX", text: "Rechargez votre solde TRIX depuis la boutique Nexus et suivez vos gains, vos pertes et votre historique de jeu." },
            { title: "Progression et classements", text: "Gagnez de l'expérience, débloquez des succès et comparez vos résultats aux classements de la communauté." },
            { title: "Boutique Nexus", text: "Échangez vos TRIX contre des cosmétiques, des bonus et des avantages pour personnaliser votre profil Matrix Hub." },
          ]}
          links={[
            { href: "/boutique-nexus", label: "Boutique Nexus" },
            { href: "/best-serveurs", label: "Best Serveur" },
            { href: "/best-creator", label: "Best Creator" },
            { href: "/stream", label: "Streaming" },
            { href: "/progression", label: "Progression" },
          ]}
        />
      </div>

      <NexusGamePlayer game={selectedGame} onClose={() => setSelectedGame(null)} />

      <NexusArcadePlayer
        game={arcadeGame}
        balance={balance}
        setBalance={setBalance}
        onRefreshBalance={refreshBalance}
        onClose={() => {
          setArcadeGame(null);
          refreshBalance();
        }}
      />
    </div>
  );
}