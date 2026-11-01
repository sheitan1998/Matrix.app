import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Sun,
  Palette,
  HelpCircle,
  Globe,
  Tv2,
  Check,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { LANGUAGES, getPreferredLanguage, changeLanguage } from "@/lib/languagePreference";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

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

const COLLAPSE_KEY = "matrix_sidebar_collapsed";

function useCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === "1"; } catch { return false; }
  });
  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  };
  return { collapsed, toggle };
}

function navigateToSoutenir(navigate) {
  navigate("/");
  setTimeout(() => {
    const el = document.getElementById("landing-footer");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 400);
}

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
      { soutenir: true, label: "Soutenir", icon: Heart },
    ],
  },
];

function NavItem({ to, label, icon: Icon, active, collapsed, soutenir }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const glow = active || hovered;

  const handleClick = (e) => {
    if (soutenir) {
      e.preventDefault();
      navigateToSoutenir(navigate);
    }
  };

  const link = (
    <>
      <Icon
        className={cn("w-[18px] h-[18px] shrink-0 transition-colors", glow ? "text-purple-400" : "text-purple-300/70")}
        style={{ filter: glow ? NEON_ICON_GLOW : NEON_ICON_IDLE }}
      />
      <span className={cn("truncate transition-all duration-200 overflow-hidden", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
        {label}
      </span>
    </>
  );

  const className = cn(
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent",
    collapsed && "justify-center px-0",
    glow ? "text-white" : "text-muted-foreground"
  );
  const style = glow
    ? { background: NEON_ACTIVE_BG, borderLeft: collapsed ? undefined : NEON_ACTIVE_BORDER, boxShadow: NEON_ACTIVE_SHADOW, textShadow: NEON_ACTIVE_TEXT }
    : undefined;

  if (soutenir) {
    return (
      <button type="button" onClick={handleClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={className} style={style} title={collapsed ? label : undefined}>
        {link}
      </button>
    );
  }

  return (
    <Link to={to} onClick={handleClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={className} style={style} title={collapsed ? label : undefined}>
      {link}
    </Link>
  );
}

const THEME_OPTIONS = [
  { mode: "dark", label: "Sombre", icon: Moon },
  { mode: "light", label: "Clair", icon: Sun },
  { mode: "custom", label: "Personnalisé", icon: Palette, vip: true },
];

function ThemeSelectorItem({ collapsed }) {
  const { prefs, updatePrefs, hasCustomBg } = useTheme();
  const [open, setOpen] = useState(false);
  const current = THEME_OPTIONS.find((opt) => opt.mode === prefs.mode);
  const CurrentIcon = current?.icon || Moon;

  const selectTheme = (mode) => {
    if (mode === "custom" && !hasCustomBg) {
      toast.error("Le thème personnalisé est réservé aux abonnés VIP.");
      setOpen(false);
      return;
    }
    updatePrefs({ mode });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn("flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent text-muted-foreground hover:text-white hover:bg-white/5", collapsed && "justify-center px-0")}
        title={collapsed ? "Thème" : undefined}
      >
        <CurrentIcon className="w-[18px] h-[18px] shrink-0 text-purple-300/70" style={{ filter: NEON_ICON_IDLE }} />
        <span className={cn("truncate transition-all duration-200 overflow-hidden", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>Thème</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 bottom-full mb-2 w-48 rounded-xl overflow-hidden shadow-2xl z-50"
            style={{ background: "hsl(var(--popover))", border: "1px solid rgba(168, 85, 247, 0.2)" }}
          >
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-purple-300/60 border-b border-white/5">Thème</p>
            <div className="py-1">
              {THEME_OPTIONS.map((opt) => {
                const locked = opt.vip && !hasCustomBg;
                return (
                  <button
                    key={opt.mode}
                    onClick={() => selectTheme(opt.mode)}
                    className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/5 transition text-left disabled:opacity-50"
                    disabled={locked}
                  >
                    <opt.icon className="w-4 h-4 text-purple-300/70" />
                    <span className="flex-1 text-xs font-semibold text-foreground">{opt.label}</span>
                    {locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                    {prefs.mode === opt.mode && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LanguageToggleItem({ collapsed }) {
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
        className={cn("flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent text-muted-foreground hover:text-white hover:bg-white/5", collapsed && "justify-center px-0")}
        title={collapsed ? "Langue" : undefined}
      >
        <Globe className="w-[18px] h-[18px] shrink-0 text-purple-300/70" style={{ filter: NEON_ICON_IDLE }} />
        <span className={cn("truncate transition-all duration-200 overflow-hidden", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>Langue</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 bottom-full mb-2 w-44 rounded-xl overflow-hidden shadow-2xl z-50" style={{ background: "hsl(var(--popover))", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-purple-300/60 border-b border-white/5">Langue</p>
            <div className="max-h-56 overflow-y-auto no-scrollbar">
              {LANGUAGES.map((lang) => (
                <button key={lang.code} disabled={saving} onClick={() => selectLanguage(lang.code)} className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/5 transition text-left disabled:opacity-50">
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

function SectionSeparator({ title, collapsed }) {
  if (collapsed) return <div className="h-px my-3 mx-2" style={{ background: NEON_SEPARATOR }} />;
  return (
    <>
      <div className="h-px my-3" style={{ background: NEON_SEPARATOR }} />
      <p className="px-3 text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: NEON_SECTION_COLOR, textShadow: NEON_SUBTITLE_SHADOW }}>
        {title}
      </p>
    </>
  );
}

export default function Sidebar({ noTopbar = false }) {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || (to === "/stream" && pathname === "/");
  const { collapsed, toggle } = useCollapsed();

  const positionClass = noTopbar ? "top-0 h-screen" : "top-16 h-[calc(100vh-64px)]";

  return (
    <aside
      className={cn("hidden lg:flex flex-col shrink-0 border-r border-border sticky overflow-y-auto scrollbar-thin py-4 px-3 gap-0.5 transition-all duration-300", positionClass)}
      style={{ width: collapsed ? 64 : 256, background: "rgba(10, 8, 15, 0.6)", backdropFilter: "blur(12px)" }}
    >
      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggle}
        className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-lg text-purple-300/70 hover:text-white hover:bg-white/10 transition"
        title={collapsed ? "Étendre la sidebar" : "Rétracter la sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="w-4 h-4" style={{ filter: NEON_ICON_IDLE }} /> : <PanelLeftClose className="w-4 h-4" style={{ filter: NEON_ICON_IDLE }} />}
      </button>

      {/* Logo + Subtitle */}
      <div className="px-3 pb-4 mb-1">
        <h1 className="text-2xl font-black tracking-tight text-white" style={{ textShadow: NEON_TEXT_SHADOW }}>
          {collapsed ? "M" : "MATRIX"}
        </h1>
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: "#c084fc", textShadow: NEON_SUBTITLE_SHADOW }}>
            Explorez la plateforme
          </p>
        )}
      </div>

      {/* Navigation sections */}
      {SECTIONS.map((section, sIndex) => (
        <React.Fragment key={section.title}>
          {sIndex === 0 ? (
            collapsed ? <div className="h-px my-3 mx-2" style={{ background: NEON_SEPARATOR }} /> : (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: NEON_SECTION_COLOR, textShadow: NEON_SUBTITLE_SHADOW }}>
                {section.title}
              </p>
            )
          ) : (
            <SectionSeparator title={section.title} collapsed={collapsed} />
          )}
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <div key={(item.to || "soutenir") + item.label} className="group">
                <NavItem {...item} active={item.to ? isActive(item.to) : false} collapsed={collapsed} />
              </div>
            ))}
          </div>
        </React.Fragment>
      ))}

      {/* Toggles section */}
      <SectionSeparator title="Réglages" collapsed={collapsed} />
      <div className="flex flex-col gap-0.5">
        <ThemeSelectorItem collapsed={collapsed} />
        <LanguageToggleItem collapsed={collapsed} />
      </div>

      {/* Live */}
      <div className="mt-auto pt-4 space-y-3">
        <Link to="/studio" className={cn("flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition hover:opacity-80", collapsed ? "p-2" : "px-4 py-3")} style={{ background: "linear-gradient(135deg, #ff4d4d, #cc3838)", color: "#fff" }} title={collapsed ? "Lancer un direct" : undefined}>
          <Tv2 className="w-4 h-4" style={{ filter: "drop-shadow(0 0 4px rgba(255,77,77,0.8))" }} />
          {!collapsed && "Lancer un direct"}
        </Link>
      </div>
    </aside>
  );
}