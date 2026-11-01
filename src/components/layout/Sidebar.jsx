import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Clapperboard,
  BarChart3,
  TrendingUp,
  ShoppingBag,
  User,
  Trophy,
  Heart,
  Wrench,
  Moon,
  HelpCircle,
  Globe,
  Crown,
  Zap,
  Tv2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { LANGUAGES, getPreferredLanguage, changeLanguage } from "@/lib/languagePreference";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import CheckoutModal from "@/components/CheckoutModal";

const NEON_TEXT_SHADOW = "0 0 8px rgba(168, 85, 247, 1), 0 0 16px rgba(168, 85, 247, 0.8), 0 0 32px rgba(168, 85, 247, 0.6)";
const NEON_SUBTITLE_SHADOW = "0 0 6px rgba(168, 85, 247, 1), 0 0 12px rgba(168, 85, 247, 0.7)";
const NEON_ICON_GLOW = "drop-shadow(0 0 4px rgba(168, 85, 247, 1)) drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))";
const NEON_ACTIVE_BG = "linear-gradient(90deg, rgba(147, 51, 234, 0.35) 0%, rgba(88, 28, 135, 0.12) 100%)";
const NEON_ACTIVE_BORDER = "2px solid rgba(168, 85, 247, 1)";
const NEON_ACTIVE_SHADOW = "0 0 16px rgba(168, 85, 247, 0.4), inset 0 0 12px rgba(168, 85, 247, 0.08)";
const NEON_ACTIVE_TEXT = "0 0 6px rgba(168, 85, 247, 0.9), 0 0 12px rgba(168, 85, 247, 0.5)";
const NEON_SEPARATOR = "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.4), transparent)";
const NEON_SECTION_COLOR = "rgba(168, 85, 247, 0.85)";
const NEON_ICON_IDLE = "drop-shadow(0 0 3px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 6px rgba(168, 85, 247, 0.4))";

const SECTIONS = [
  {
    title: "Navigation",
    items: [
      { to: "/stream", label: "Accueil", icon: Home },
      { to: "/video-studio", label: "Montage Vidéo", icon: Clapperboard },
      { to: "/sondages", label: "Sondage", icon: BarChart3 },
      { to: "/progression", label: "Niveaux/Progressions", icon: TrendingUp },
    ],
  },
  {
    title: "Mes Outils",
    items: [
      { to: "/boutique-matrix", label: "Boutique", icon: ShoppingBag },
      { to: "/outils", label: "Outils", icon: Wrench },
      { to: "/about", label: "FAQ", icon: HelpCircle },
    ],
  },
  {
    title: "Compte",
    items: [
      { to: "/mon-profil", label: "Mon profil", icon: User },
      { to: "/progression", label: "Classement", icon: Trophy },
      { to: "/premium", label: "Soutenir", icon: Heart },
    ],
  },
];

function NavItem({ to, label, icon: Icon, active }) {
  const [hovered, setHovered] = useState(false);
  const glow = active || hovered;
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent",
        glow ? "text-white" : "text-muted-foreground"
      )}
      style={glow
        ? {
            background: NEON_ACTIVE_BG,
            borderLeft: NEON_ACTIVE_BORDER,
            boxShadow: NEON_ACTIVE_SHADOW,
            textShadow: NEON_ACTIVE_TEXT,
          }
        : undefined}
    >
      <Icon
        className={cn("w-[18px] h-[18px] shrink-0 transition-colors", glow ? "text-purple-400" : "text-purple-300/70")}
        style={{ filter: glow ? NEON_ICON_GLOW : NEON_ICON_IDLE }}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function ThemeToggleItem() {
  const { prefs, updatePrefs } = useTheme();
  const isDark = prefs.mode === "dark";
  return (
    <button
      type="button"
      onClick={() => updatePrefs({ mode: isDark ? "original" : "dark" })}
      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent text-muted-foreground hover:text-white hover:bg-white/5"
    >
      <Moon
        className="w-[18px] h-[18px] shrink-0 text-purple-300/70"
        style={{ filter: isDark ? NEON_ICON_GLOW : NEON_ICON_IDLE }}
      />
      <span className="truncate">Thème sombre</span>
      <span
        className={cn("ml-auto h-4 w-7 rounded-full transition-all relative", isDark ? "bg-purple-500/60" : "bg-muted")}
        style={isDark ? { boxShadow: "0 0 10px rgba(168, 85, 247, 0.7)" } : undefined}
      >
        <span className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all", isDark ? "left-3.5" : "left-0.5")} />
      </span>
    </button>
  );
}

function LanguageToggleItem() {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getPreferredLanguage);
  const [saving, setSaving] = useState(false);

  const selectLanguage = async (code) => {
    if (saving || code === currentLang) { setOpen(false); return; }
    setSaving(true);
    try {
      if (await base44.auth.isAuthenticated()) await base44.auth.updateMe({ interface_language: code });
      setCurrentLang(code);
      changeLanguage(code);
      setOpen(false);
    } catch {
      toast.error("Impossible de changer la langue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent text-muted-foreground hover:text-white hover:bg-white/5"
      >
        <Globe className="w-[18px] h-[18px] shrink-0 text-purple-300/70" style={{ filter: NEON_ICON_IDLE }} />
        <span className="truncate">Langue</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 bottom-full mb-2 w-44 rounded-xl overflow-hidden shadow-2xl z-50"
            style={{ background: "hsl(var(--popover))", border: "1px solid rgba(168, 85, 247, 0.2)" }}
          >
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-purple-300/60 border-b border-white/5">Langue</p>
            <div className="max-h-56 overflow-y-auto no-scrollbar">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  disabled={saving}
                  onClick={() => selectLanguage(lang.code)}
                  className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/5 transition text-left disabled:opacity-50"
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="flex-1 text-xs font-semibold text-foreground">{lang.label}</span>
                  {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SectionSeparator({ title }) {
  return (
    <>
      <div className="h-px my-3" style={{ background: NEON_SEPARATOR }} />
      <p
        className="px-3 text-[10px] font-bold uppercase tracking-wider mb-1"
        style={{ color: NEON_SECTION_COLOR, textShadow: NEON_SUBTITLE_SHADOW }}
      >
        {title}
      </p>
    </>
  );
}

export default function Sidebar() {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || (to === "/stream" && pathname === "/");
  const [showVipCheckout, setShowVipCheckout] = useState(false);

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border h-[calc(100vh-64px)] sticky top-16 overflow-y-auto scrollbar-thin py-4 px-3 gap-0.5"
      style={{ background: "rgba(10, 8, 15, 0.6)", backdropFilter: "blur(12px)" }}
    >
      {/* Logo + Subtitle */}
      <div className="px-3 pb-4 mb-1">
        <h1
          className="text-2xl font-black tracking-tight text-white"
          style={{ textShadow: NEON_TEXT_SHADOW }}
        >
          MATRIX
        </h1>
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mt-0.5"
          style={{ color: "#c084fc", textShadow: NEON_SUBTITLE_SHADOW }}
        >
          Explorez la plateforme
        </p>
      </div>

      {/* Navigation sections */}
      {SECTIONS.map((section, sIndex) => (
        <React.Fragment key={section.title}>
          {sIndex === 0 ? (
            <p
              className="px-3 text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: NEON_SECTION_COLOR, textShadow: NEON_SUBTITLE_SHADOW }}
            >
              {section.title}
            </p>
          ) : (
            <SectionSeparator title={section.title} />
          )}
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <div key={item.to + item.label} className="group">
                <NavItem {...item} active={isActive(item.to)} />
              </div>
            ))}
          </div>
        </React.Fragment>
      ))}

      {/* Toggles section */}
      <SectionSeparator title="Réglages" />
      <div className="flex flex-col gap-0.5">
        <ThemeToggleItem />
        <LanguageToggleItem />
      </div>

      {/* VIP Subscription + Live */}
      <div className="mt-auto pt-4 space-y-3">
        <button
          onClick={() => setShowVipCheckout(true)}
          className="w-full rounded-xl p-3 transition hover:opacity-90 text-left"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(109,40,217,0.1))",
            border: "1px solid rgba(168,85,247,0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
              <Crown className="w-3.5 h-3.5" style={{ color: "#a855f7", filter: NEON_ICON_GLOW }} />
            </div>
            <span className="text-xs font-black text-white">VIP Prospecteur</span>
          </div>
          <p className="text-[10px] text-white/50 leading-tight mb-1.5">
            Cooldown de vote réduit à <span className="font-bold text-purple-400">1h</span> au lieu de 2h
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-white">2,99€<span className="text-[10px] font-normal text-white/40">/mois</span></span>
            <span className="text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", color: "#fff" }}>
              <Zap className="w-2.5 h-2.5" /> S'abonner
            </span>
          </div>
        </button>

        <Link
          to="/studio"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition hover:opacity-80"
          style={{ background: "linear-gradient(135deg, #ff4d4d, #cc3838)", color: "#fff" }}
        >
          <Tv2 className="w-4 h-4" style={{ filter: "drop-shadow(0 0 4px rgba(255,77,77,0.8))" }} />
          Lancer un direct
        </Link>
      </div>

      {showVipCheckout && (
        <CheckoutModal
          functionName="stripePayment"
          params={{ action: "createVIPSubscription", plan: "vip_vote" }}
          onClose={() => setShowVipCheckout(false)}
          onSuccess={() => {
            setShowVipCheckout(false);
            window.location.reload();
          }}
        />
      )}
    </aside>
  );
}