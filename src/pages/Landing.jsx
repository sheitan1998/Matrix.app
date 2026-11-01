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
import { User, ArrowRight } from "lucide-react";

const PLATFORM_CARDS = [
  { path: "/stream", label: "YouTube", desc: "Vidéos, lives, shorts. Crée ta chaîne et partage ton contenu.", iconUrl: "/media/tuto-gaming/c4e71cf23_yt_icon_red_digital.png", color: "#FF0000" },
  { path: "/twitch", label: "Twitch", desc: "Streams en direct, clips, discussions et rencontres.", color: "#9146FF" },
  { path: "/nexus", label: "Nexus", desc: "Discute, réagis, commente. Rejoins ou crée des salons vocaux.", color: "#3B82F6" },
  { path: "/casino", label: "Nexus Game", desc: "Roulette, machines à sous, blackjack et plus encore.", color: "#F59E0B", badge: "18+" },
  { path: "/best-serveurs", label: "Best Serveur", desc: "Trouve des joueurs, recrute ou explore des serveurs de jeu.", color: "#8a4fff" },
  { path: "/tuto-gaming", label: "Tuto Gaming Entraide", desc: "Guides, astuces, entraide et base de connaissances pour tous les jeux.", color: "#BF5AF2" },
];

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
            {PLATFORM_CARDS.map((u, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => nav(u.path)}
                className="relative w-full rounded-2xl overflow-hidden text-left group flex items-center gap-4 p-4 transition-all"
                style={{
                  background: "hsl(var(--card))",
                  border: `1px solid ${u.color}20`,
                }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: u.color, boxShadow: `0 0 10px ${u.color}80` }} />
                {u.iconUrl ? (
                  <img src={u.iconUrl} alt={u.label} style={{ height: 28, width: "auto" }} className="shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${u.color}1a`, boxShadow: `0 0 15px ${u.color}30` }}>
                    <span className="text-lg font-black" style={{ color: u.color }}>{u.label.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-foreground">{u.label}</h3>
                  <p className="text-xs leading-relaxed text-foreground/50">{u.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: u.color }} />
              </motion.button>
            ))}
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