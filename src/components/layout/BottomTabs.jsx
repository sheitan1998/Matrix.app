import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, TrendingUp, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/stream", icon: Home, label: "Accueil" },
  { to: "/trending", icon: TrendingUp, label: "Tendances" },
  { to: "/shorts", icon: Clapperboard, label: "Shorts" },
];

// Per-tab last visited path memory (persists across tab switches in memory)
const tabMemory = {
  "/stream": "/stream",
  "/trending": "/trending",
  "/shorts": "/shorts",
};

export function updateTabMemory(pathname) {
  // Called by pages to record their path into the owning tab's memory
  for (const root of Object.keys(tabMemory)) {
    if (pathname === root || pathname.startsWith(root + "/")) {
      tabMemory[root] = pathname;
      return;
    }
  }
}

export default function BottomTabs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeTab = TABS.find(
    (t) => pathname === t.to || pathname.startsWith(t.to + "/")
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = activeTab?.to === to;
          return (
            <button
              key={to}
              onClick={() => {
                if (active) {
                  // Re-tap active tab: reset to root
                  tabMemory[to] = to;
                  navigate(to, { replace: true });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  // Switch to last remembered path in that tab
                  navigate(tabMemory[to] || to);
                }
              }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] transition-colors select-none",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}