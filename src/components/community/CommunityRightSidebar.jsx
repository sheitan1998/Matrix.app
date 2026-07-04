import React from "react";
import { Calendar, TrendingUp, ChevronRight } from "lucide-react";

const UPCOMING_EVENTS = [
  { id: 1, icon: "🎮", title: "Tournoi Fortnite", date: "12 Juil", time: "18:00", color: "#a855f7" },
  { id: 2, icon: "💻", title: "Live Spécial Devs", date: "15 Juil", time: "20:30", color: "#3b82f6" },
  { id: 3, icon: "🎵", title: "Concert Matrix Live", date: "18 Juil", time: "21:00", color: "#22c55e" },
  { id: 4, icon: "🏆", title: "Finale ESL", date: "22 Juil", time: "17:00", color: "#fbbf24" },
];

const TRENDS = [
  { tag: "#Cyberpunk2077", posts: 12450 },
  { tag: "#MATRIXAI", posts: 8920 },
  { tag: "#NeoGalaxy", posts: 5230 },
  { tag: "#GameNight", posts: 3100 },
  { tag: "#TechTalk", posts: 1870 },
];

function Panel({ title, icon: Icon, accent, children }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(18,18,21,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
        <p className="text-[11px] font-black tracking-widest text-white/50 uppercase">{title}</p>
      </div>
      {children}
    </div>
  );
}

export default function CommunityRightSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 h-full overflow-y-auto scrollbar-thin p-3 gap-3"
      style={{ background: "rgba(10,10,12,0.5)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Événements à venir */}
      <Panel title="Événements à venir" icon={Calendar} accent="#a855f7">
        <div className="space-y-2">
          {UPCOMING_EVENTS.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5 transition cursor-pointer group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background: `${ev.color}20`, border: `1px solid ${ev.color}30` }}>
                {ev.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition">{ev.title}</p>
                <p className="text-[10px] text-white/40">{ev.date} · {ev.time}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition shrink-0" />
            </div>
          ))}
        </div>
        <button className="w-full mt-2 text-[10px] font-bold text-white/40 hover:text-white/70 transition">
          Voir tout
        </button>
      </Panel>

      {/* Tendances */}
      <Panel title="Tendances" icon={TrendingUp} accent="#22c55e">
        <div className="space-y-1">
          {TRENDS.map((t, i) => (
            <div key={t.tag} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5 transition cursor-pointer group">
              <span className="text-[10px] font-black text-white/20 w-4">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate group-hover:text-green-300 transition">{t.tag}</p>
                <p className="text-[9px] text-white/30">{t.posts.toLocaleString()} publications</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </aside>
  );
}