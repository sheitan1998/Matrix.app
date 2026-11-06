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
  Wrench,
  Moon,
  Sun,
  Palette,
  HelpCircle,
  Globe,
  Tv2,
  Check,
  Lock,
  Crown,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck } from
"lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { LANGUAGES, getPreferredLanguage, changeLanguage } from "@/lib/languagePreference";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ThemeModal from "@/components/landing/ThemeModal";
import FaqPanel from "@/components/landing/FaqPanel";
import SidebarQuickActions from "@/components/layout/SidebarQuickActions";
import { useRegisterSidebar } from "@/hooks/useSidebarPresence";
import { useAuth } from "@/lib/AuthContext";

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

// Light mode overrides — clean, high-contrast, no neon glow
const LIGHT_SIDEBAR_BG = "#ffffff";
const LIGHT_SIDEBAR_TEXT = "#111827";
const LIGHT_SIDEBAR_MUTED = "#6b7280";
const LIGHT_SECTION_COLOR = "#7c3aed";
const LIGHT_SEPARATOR = "linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)";
const LIGHT_ACTIVE_BG = "rgba(124,58,237,0.08)";
const LIGHT_ACTIVE_BORDER = "2px solid #7c3aed";

const COLLAPSE_KEY = "matrix_sidebar_collapsed";

function useCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    try {return localStorage.getItem(COLLAPSE_KEY) === "1";} catch {return false;}
  });
  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");} catch {}
      return next;
    });
  };
  return { collapsed, toggle };
}

const SECTIONS = [
{
  title: "Navigation",
  items: [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/video-studio", label: "Montage Vidéo", icon: Clapperboard },
  { to: "/sondages", label: "Sondage", icon: BarChart3 },
  { to: "/progression", label: "Niveaux/Progressions", icon: TrendingUp }]

},
{
  title: "Mes Outils",
  items: [
  { to: "/boutique-matrix", label: "Boutique", icon: ShoppingBag },
  { to: "/outils", label: "Outils", icon: Wrench },
  { faq: true, label: "FAQ", icon: HelpCircle }]

},
{
  title: "Mon compte",
  quickActions: true,
  items: [
  { to: "/mon-profil", label: "Mon profil", icon: User },
  { to: "/progression", label: "Classement", icon: Trophy }]

}];


function NavItem({ to, label, icon: Icon, active, collapsed, faq, onFaq, isLight }) {
  const [hovered, setHovered] = useState(false);
  const glow = active || hovered;

  const handleClick = (e) => {
    if (faq) {
      e.preventDefault();
      onFaq?.();
    }
  };

  const iconColor = isLight
    ? (glow ? "#6d28d9" : "#7c3aed")
    : (glow ? "rgb(192 132 252)" : "rgba(216,180,254,0.7)");
  const iconFilter = isLight ? "none" : (glow ? NEON_ICON_GLOW : NEON_ICON_IDLE);

  const link =
  <>
      <Icon
      className="w-[18px] h-[18px] shrink-0 transition-colors"
      style={{ color: iconColor, filter: iconFilter }} />

      <span className={cn("truncate transition-all duration-200 overflow-hidden", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
        {label}
      </span>
    </>;

  const className = cn(
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent",
    collapsed && "justify-center px-0",
    isLight
      ? (glow ? "text-gray-900" : "text-gray-600")
      : (glow ? "text-white" : "text-muted-foreground")
  );
  const style = glow
    ? isLight
      ? { background: LIGHT_ACTIVE_BG, borderLeft: collapsed ? undefined : LIGHT_ACTIVE_BORDER }
      : { background: NEON_ACTIVE_BG, borderLeft: collapsed ? undefined : NEON_ACTIVE_BORDER, boxShadow: NEON_ACTIVE_SHADOW, textShadow: NEON_ACTIVE_TEXT }
    : isLight
      ? { background: hovered ? "rgba(0,0,0,0.04)" : undefined }
      : undefined;

  if (faq) {
    return (
      <button type="button" onClick={handleClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={className} style={style} title={collapsed ? label : undefined}>
        {link}
      </button>);
  }

  return (
    <Link to={to} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={className} style={style} title={collapsed ? label : undefined}>
      {link}
    </Link>);

}

const THEME_ICONS = { original: Palette, dark: Moon, light: Sun, custom: Crown };

function ThemeSelectorItem({ collapsed, isLight }) {
  const { prefs } = useTheme();
  const [open, setOpen] = useState(false);
  const CurrentIcon = THEME_ICONS[prefs.mode] || Palette;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent", isLight ? "text-gray-600 hover:text-gray-900 hover:bg-black/5" : "text-muted-foreground hover:text-white hover:bg-white/5", collapsed && "justify-center px-0")}
        title={collapsed ? "Thème" : undefined}>
        <CurrentIcon className="w-[18px] h-[18px] shrink-0" style={{ color: isLight ? "#7c3aed" : "rgba(216,180,254,0.7)", filter: isLight ? "none" : NEON_ICON_IDLE }} />
        <span className={cn("truncate transition-all duration-200 overflow-hidden", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>Thème</span>
      </button>
      <ThemeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function LanguageToggleItem({ collapsed, isLight }) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getPreferredLanguage);
  const [saving, setSaving] = useState(false);

  const selectLanguage = async (code) => {
    if (saving || code === currentLang) {setOpen(false);return;}
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
        className={cn("flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent", isLight ? "text-gray-600 hover:text-gray-900 hover:bg-black/5" : "text-muted-foreground hover:text-white hover:bg-white/5", collapsed && "justify-center px-0")}
        title={collapsed ? "Langue" : undefined}>

        <Globe className="w-[18px] h-[18px] shrink-0" style={{ color: isLight ? "#7c3aed" : "rgba(216,180,254,0.7)", filter: isLight ? "none" : NEON_ICON_IDLE }} />
        <span className={cn("truncate transition-all duration-200 overflow-hidden", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>Langue</span>
      </button>
      {open &&
      <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 bottom-full mb-2 w-44 rounded-xl overflow-hidden shadow-2xl z-50" style={{ background: "hsl(var(--popover))", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest border-b border-white/5" style={{ color: isLight ? "#7c3aed" : "rgba(216,180,254,0.6)" }}>Langue</p>
            <div className="max-h-56 overflow-y-auto no-scrollbar">
              {LANGUAGES.map((lang) =>
            <button key={lang.code} disabled={saving} onClick={() => selectLanguage(lang.code)} className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/5 transition text-left disabled:opacity-50">
                  <span className="text-base">{lang.flag}</span>
                  <span className="flex-1 text-xs font-semibold text-foreground">{lang.label}</span>
                  {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
            )}
            </div>
          </div>
        </>
      }
    </div>);

}

function SectionSeparator({ title, collapsed, isLight }) {
  const separatorBg = isLight ? LIGHT_SEPARATOR : NEON_SEPARATOR;
  const sectionColor = isLight ? LIGHT_SECTION_COLOR : NEON_SECTION_COLOR;
  const sectionShadow = isLight ? "none" : NEON_SUBTITLE_SHADOW;
  if (collapsed) return <div className="h-px my-3 mx-2" style={{ background: separatorBg }} />;
  return (
    <>
      <div className="h-px my-3" style={{ background: separatorBg }} />
      <p className="px-3 text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: sectionColor, textShadow: sectionShadow }}>
        {title}
      </p>
    </>);

}

export default function Sidebar({ noTopbar = false }) {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to;
  const { collapsed, toggle } = useCollapsed();
  const [faqOpen, setFaqOpen] = useState(false);
  useRegisterSidebar();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { prefs } = useTheme();
  const isLight = prefs.mode === "light" || (prefs.mode === "custom" && (() => {
    const color = prefs.customColor || "#1a0a2e";
    const channels = color.slice(1).match(/.{2}/g).map((c) => parseInt(c, 16) / 255);
    const l = (0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]);
    return l > 0.179;
  })());

  const positionClass = noTopbar ? "top-0 h-screen" : "top-16 h-[calc(100vh-64px)]";
  const sidebarBg = isLight ? LIGHT_SIDEBAR_BG : "rgba(10, 8, 15, 0.6)";
  const logoColor = isLight ? "#111827" : "#ffffff";
  const logoShadow = isLight ? "none" : NEON_TEXT_SHADOW;
  const subtitleColor = isLight ? "#6b7280" : "#c084fc";
  const subtitleShadow = isLight ? "none" : NEON_SUBTITLE_SHADOW;
  const collapseBtnColor = isLight ? "#6b7280" : "rgba(216,180,254,0.7)";
  const collapseBtnHoverBg = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.1)";
  const collapseBtnHoverColor = isLight ? "#111827" : "#ffffff";
  const collapseIconFilter = isLight ? "none" : NEON_ICON_IDLE;

  return (
    <aside
      className={cn("hidden lg:flex flex-col shrink-0 border-r border-border sticky overflow-y-auto scrollbar-thin py-4 px-3 gap-0.5 transition-all duration-300", positionClass)}
      style={{ width: collapsed ? 64 : 256, background: sidebarBg, backdropFilter: isLight ? "none" : "blur(12px)" }}>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggle}
        className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-lg transition"
        style={{ color: collapseBtnColor }}
        onMouseEnter={(e) => { e.currentTarget.style.background = collapseBtnHoverBg; e.currentTarget.style.color = collapseBtnHoverColor; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = collapseBtnColor; }}
        title={collapsed ? "Étendre la sidebar" : "Rétracter la sidebar"}>

        {collapsed ? <PanelLeftOpen className="w-4 h-4" style={{ filter: collapseIconFilter }} /> : <PanelLeftClose className="w-4 h-4" style={{ filter: collapseIconFilter }} />}
      </button>

      {/* Logo + Subtitle */}
      <div className="px-3 pb-4 mb-1">
        <h1 className="text-2xl font-black tracking-tight" style={{ color: logoColor, textShadow: logoShadow }}>
          {collapsed ? "M" : "MATRIX"}
        </h1>
        {!collapsed &&
        <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: subtitleColor, textShadow: subtitleShadow }}>
            Explorez la plateforme
          </p>
        }
      </div>

      {/* Navigation sections */}
      {SECTIONS.map((section, sIndex) =>
      <React.Fragment key={section.title}>
          {sIndex === 0 ?
        collapsed ? <div className="h-px my-3 mx-2" style={{ background: isLight ? LIGHT_SEPARATOR : NEON_SEPARATOR }} /> :
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: isLight ? LIGHT_SECTION_COLOR : NEON_SECTION_COLOR, textShadow: isLight ? "none" : NEON_SUBTITLE_SHADOW }}>
                {section.title}
              </p> :


        <SectionSeparator title={section.title} collapsed={collapsed} isLight={isLight} />
        }
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) =>
          <div key={(item.to || item.label) + (item.faq ? "_faq" : "")} className="group">
                <NavItem {...item} active={item.to ? isActive(item.to) : false} collapsed={collapsed} faq={item.faq} onFaq={() => setFaqOpen(true)} isLight={isLight} />
              </div>
          )}
            {section.quickActions && <SidebarQuickActions collapsed={collapsed} isLight={isLight} />}
          </div>
        </React.Fragment>
      )}

      {/* Toggles section */}
      <SectionSeparator title="Réglages" collapsed={collapsed} isLight={isLight} />
      <div className="flex flex-col gap-0.5">
        <ThemeSelectorItem collapsed={collapsed} isLight={isLight} />
        <LanguageToggleItem collapsed={collapsed} isLight={isLight} />
      </div>

      {/* Live */}
      <div className="mt-auto pt-4 space-y-3">
        {isAdmin &&
        <NavItem
          to="/admin"
          label="Panel Admin"
          icon={ShieldCheck}
          active={isActive("/admin")}
          collapsed={collapsed}
          isLight={isLight} />

        }




      </div>

      <FaqPanel open={faqOpen} onClose={() => setFaqOpen(false)} />
    </aside>);

}