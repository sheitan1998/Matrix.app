import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import AuthModal from "@/components/landing/AuthModal";
import AffiliatePartners from "@/components/landing/AffiliatePartners";
import Sidebar from "@/components/layout/Sidebar";
import LandingFooter from "@/components/landing/LandingFooter";
import FaqPanel from "@/components/landing/FaqPanel";
import ThemeModal from "@/components/landing/ThemeModal";
import LandingSEO from "@/components/landing/LandingSEO";
import PlatformCard from "@/components/landing/PlatformCard";
import { User, Sparkles } from "lucide-react";

const PLATFORM_CARDS = [
  { path: "/stream", label: "YouTube", desc: "Vidéos, lives, shorts. Crée ta chaîne et partage ton contenu.", iconUrl: "/media/tuto-gaming/c4e71cf23_yt_icon_red_digital.png", color: "#FF0000" },
  { path: "/twitch", label: "Twitch", desc: "Streams en direct, clips, discussions et rencontres.", color: "#9146FF" },
  { path: "/nexus", label: "Nexus", desc: "Discute, réagis, commente. Rejoins ou crée des salons vocaux.", color: "#3B82F6", logoUrl: "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/8756642f5_b119924b0_EmblmecosmiquefuturisteNEXUS1.png" },
  { path: "/casino", label: "Nexus Game", desc: "Roulette, machines à sous, blackjack et plus encore.", color: "#F59E0B", badge: "18+", logoUrl: "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/9556b64f1_bc107644a_EmblmedorNexusGamefuturiste.png" },
  { path: "/best-serveurs", label: "Best Serveur", desc: "Trouve des joueurs, recrute ou explore des serveurs de jeu.", color: "#8a4fff", logoUrl: "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/994590848_a2c9d5d40_BadgenonfuturisteBestServeur.png" },
  { path: "/tuto-gaming", label: "Tuto Gaming Entraide", desc: "Guides, astuces, entraide et base de connaissances pour tous les jeux.", color: "#BF5AF2", logoUrl: "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/8f647df05_0706208c7_EmblmenonTutosGamingunerquicklich.png" },
];

const BEST_CREATOR_CARD = {
  path: "/best-creator",
  label: "Best Creator",
  desc: "Explore et vote pour les meilleurs créateurs de contenu.",
  color: "#a855f7",
  Icon: Sparkles,
};

const BEST_SERVEUR_CARD = PLATFORM_CARDS.find((card) => card.path === "/best-serveurs");
const TUTO_GAMING_CARD = PLATFORM_CARDS.find((card) => card.path === "/tuto-gaming");
const MAIN_PLATFORM_CARDS = PLATFORM_CARDS.filter(
  (card) => card.path !== "/best-serveurs" && card.path !== "/tuto-gaming"
);

export default function Landing() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden flex bg-transparent">
      {/* The global body background is the only wallpaper layer. */}
      {/* Sidebar */}
      <Sidebar noTopbar />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 px-4 sm:px-6 lg:px-8 py-4">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="lg:hidden">
            <h1 className="text-2xl font-black text-foreground">MATRIX</h1>
            <p className="text-[9px] tracking-[0.25em] uppercase text-foreground/40 font-mono">Explorez la plateforme</p>
          </div>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            {!user && (
              <motion.button
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full tap-sm shrink-0"
                style={{ border: "1.5px solid hsl(var(--border))", background: "hsl(var(--card))" }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--muted))" }}>
                  <User className="w-3.5 h-3.5" style={{ color: "hsl(var(--muted-foreground))" }} />
                </div>
                <span className="text-xs font-bold text-foreground">Se connecter</span>
              </motion.button>
            )}
          </div>
        </header>

        {/* Content grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-8">
          {/* Platform list (center) */}
          <div className="space-y-3">
            <h2 className="text-lg font-black text-foreground mb-2 hidden lg:block">Plateformes</h2>
            {MAIN_PLATFORM_CARDS.map((card, i) => (
              <PlatformCard key={card.path} item={card} index={i} onClick={() => nav(card.path)} />
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PlatformCard item={BEST_SERVEUR_CARD} index={4} compact onClick={() => nav(BEST_SERVEUR_CARD.path)} />
              <PlatformCard item={BEST_CREATOR_CARD} index={5} compact onClick={() => nav(BEST_CREATOR_CARD.path)} />
            </div>

            <PlatformCard item={TUTO_GAMING_CARD} index={6} onClick={() => nav(TUTO_GAMING_CARD.path)} />
          </div>

          {/* Affiliate partners (top right) */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-3 flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
                <span className="text-base">🌌</span>
              </div>
              <h2 className="text-base font-black text-foreground">Nos offres chez nos partenaires affiliés</h2>
            </motion.div>
            <div className="grid grid-cols-2 gap-3">
              <AffiliatePartners compact />
            </div>
          </div>
        </div>

        {/* SEO content */}
        <LandingSEO />

        {/* Footer */}
        <LandingFooter />

        {/* Legal footer */}
        <footer className="mt-6 flex flex-col items-center gap-3 pt-4">
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-[11px] text-foreground/40 hover:text-foreground/70 transition tap-sm">À propos</Link>
            <Link to="/contact" className="text-[11px] text-foreground/40 hover:text-foreground/70 transition tap-sm">Contact</Link>
            <Link to="/privacy" className="text-[11px] text-foreground/40 hover:text-foreground/70 transition tap-sm">Politique de Confidentialité</Link>
          </div>
          <p className="text-[10px] text-foreground/30 font-mono">© 2026 MATRIX. TOUS DROITS RÉSERVÉS.</p>
        </footer>
      </div>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <FaqPanel open={showFaq} onClose={() => setShowFaq(false)} />
      <ThemeModal open={showTheme} onClose={() => setShowTheme(false)} />
    </div>
  );
}