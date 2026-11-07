import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Flame, Radio, Rss, Clapperboard, Search, Youtube } from "lucide-react";

const TABS = [
  { to: "/stream", label: "Accueil", icon: Home },
  { to: "/trending", label: "Tendances", icon: Flame },
  { to: "/live", label: "En direct", icon: Radio },
  { to: "/subscriptions", label: "Abonnements", icon: Rss },
  { to: "/shorts", label: "Shorts", icon: Clapperboard },
  { to: "/search", label: "Recherche", icon: Search },
];

const isActive = (pathname, to) =>
  pathname === to || (to !== "/stream" && pathname.startsWith(`${to}/`));

export default function StreamNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="sticky top-16 z-40 h-12 flex items-center gap-1 px-4 lg:px-6 overflow-x-auto no-scrollbar bg-background/85 backdrop-blur-xl border-b border-border"
      aria-label="Navigation YouTube"
    >
      <span className="flex items-center gap-1.5 pr-3 mr-1 shrink-0">
        <Youtube className="w-4 h-4" style={{ color: "#FF0000" }} />
        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">YouTube</span>
      </span>

      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(pathname, tab.to);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex items-center gap-1.5 h-12 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
              active
                ? "text-foreground border-[#FF0000]"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}