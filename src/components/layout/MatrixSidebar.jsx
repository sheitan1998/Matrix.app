import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tv2, Users, Cpu, Dices, Clapperboard, ListMusic, ShoppingBag, Calendar, Trophy, Compass, MessageCircle, Send, Youtube, Music2, Instagram, Settings, HelpCircle } from "lucide-react";

const MENU = [
  { icon: Tv2, label: "Streaming", path: "/stream" },
  { icon: Users, label: "Communauté", path: "/community" },
  { icon: Cpu, label: "AI Studio", path: "/ai" },
  { icon: Dices, label: "Casino", path: "/casino", badge: "18+" },
  { icon: Clapperboard, label: "Video Studio", path: "/video-studio", badge: "NEW" },
  { icon: ListMusic, label: "Playlists", path: "/playlists", badge: "NEW" },
  { icon: ShoppingBag, label: "Marketplace", path: "/market" },
  { icon: Calendar, label: "Événements", path: "/community" },
  { icon: Trophy, label: "Arena", path: "/casino" },
  { icon: Compass, label: "Explorer", path: "/stream" },
];

const SOCIALS = [
  { icon: MessageCircle, label: "Discord" },
  { icon: Send, label: "Messenger" },
  { icon: Youtube, label: "YouTube" },
  { icon: Music2, label: "TikTok" },
  { icon: Instagram, label: "Instagram" },
];

export default function MatrixSidebar() {
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 p-4"
      style={{ background: "rgba(10,10,12,0.7)", backdropFilter: "blur(16px)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      <h1 className="text-2xl font-black tracking-tight text-white mb-6 px-2">
        <span style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 12px rgba(168,85,247,0.5))" }}>M</span>ATRIX
      </h1>

      <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-thin">
        {MENU.map((item) => {
          const active = loc.pathname === item.path;
          return (
            <button key={item.label} onClick={() => nav(item.path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition group"
              style={active
                ? { background: "rgba(139,92,246,0.15)", color: "#fff", boxShadow: "0 0 20px rgba(139,92,246,0.2)" }
                : undefined}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}>
              <item.icon className="w-4 h-4 shrink-0" style={active ? { color: "#a855f7" } : undefined} />
              <span className="flex-1 text-left" style={active ? { color: "#fff" } : { color: "rgba(255,255,255,0.5)" }}>{item.label}</span>
              {item.badge && (
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                  style={item.badge === "18+"
                    ? { background: "rgba(239,68,68,0.2)", color: "#ef4444" }
                    : { background: "rgba(139,92,246,0.2)", color: "#c4b5fd" }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="space-y-2 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1">
          {SOCIALS.map((s, i) => (
            <button key={i} className="w-8 h-8 rounded-lg flex items-center justify-center transition"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}
              title={s.label}>
              <s.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center transition"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}>
            <Settings className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center transition"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}>
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}