import React, { useState, useEffect } from "react";
import { Play, Radio, Clock, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const LIVE_EVENTS = [
  {
    id: 1, sport: "⚽", league: "Ligue 1", team1: "PSG", team2: "OM", score1: 2, score2: 1,
    time: "67'", status: "live", viewers: 142000,
    events: ["⚽ But Mbappé 23'", "🟨 Carton 41'", "⚽ But Giroud 55'", "⚽ But Neymar 63'"],
  },
  {
    id: 2, sport: "🏉", league: "Top 14", team1: "Toulouse", team2: "Racing 92", score1: 18, score2: 15,
    time: "54'", status: "live", viewers: 38000,
    events: ["🏉 Essai Dupont 12'", "🥾 Transformation 14'", "🏉 Essai Ntamack 38'"],
  },
  {
    id: 3, sport: "🏀", league: "Pro B", team1: "ASVEL", team2: "Monaco", score1: 56, score2: 61,
    time: "Q3 8:22", status: "live", viewers: 22000,
    events: ["🏀 3pts Fall 3'", "🏀 Slam dunk 9'", "📢 Timeout Monaco"],
  },
  {
    id: 4, sport: "🎾", league: "Roland Garros", team1: "Nadal", team2: "Djokovic", score1: 1, score2: 2,
    time: "3ème set", status: "live", viewers: 310000,
    events: ["🎾 Ace Djokovic", "🎾 Break point Nadal"],
  },
  {
    id: 5, sport: "⚽", league: "Premier League", team1: "Arsenal", team2: "Man City", score1: 0, score2: 0,
    time: "Demain 21:00", status: "upcoming", viewers: 0,
    events: [],
  },
  {
    id: 6, sport: "🏉", league: "6 Nations", team1: "France", team2: "Angleterre", score1: 0, score2: 0,
    time: "Samedi 16:00", status: "upcoming", viewers: 0,
    events: [],
  },
];

function LiveScoreTicker({ events }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!events.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % events.length), 3000);
    return () => clearInterval(t);
  }, [events.length]);
  if (!events.length) return null;
  return (
    <div className="overflow-hidden h-5">
      <AnimatePresence mode="wait">
        <motion.p key={idx}
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-[10px] text-muted-foreground truncate">
          {events[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function SportLive({ accentColor = "#00ff41" }) {
  const [selected, setSelected] = useState(null);
  const [simulTime, setSimulTime] = useState({});

  // Simulate score updates for live events
  useEffect(() => {
    const t = setInterval(() => {
      setSimulTime((prev) => {
        const next = { ...prev };
        LIVE_EVENTS.filter((e) => e.status === "live").forEach((e) => {
          next[e.id] = (next[e.id] || 0) + 1;
        });
        return next;
      });
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const live = LIVE_EVENTS.filter((e) => e.status === "live");
  const upcoming = LIVE_EVENTS.filter((e) => e.status === "upcoming");

  if (selected) {
    const ev = LIVE_EVENTS.find((e) => e.id === selected);
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
          ← Retour
        </button>

        {/* Score board */}
        <div className="rounded-3xl p-6 text-center space-y-3 border"
          style={{ background: "rgba(255,255,255,0.04)", borderColor: accentColor + "20" }}>
          {ev.status === "live" && (
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-live-pulse inline-block" />
              <span className="text-xs font-bold text-red-400 tracking-widest">EN DIRECT</span>
              <span className="text-xs text-muted-foreground">{ev.time}</span>
            </div>
          )}
          <p className="text-sm font-bold text-muted-foreground">{ev.sport} {ev.league}</p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="font-black text-2xl text-white">{ev.team1}</p>
              {ev.status === "live" && <p className="text-5xl font-black mt-2" style={{ color: accentColor }}>{ev.score1 + (simulTime[ev.id] && ev.score1 > ev.score2 ? Math.floor(simulTime[ev.id] / 60) % 2 : 0)}</p>}
            </div>
            <span className="text-2xl text-muted-foreground font-black">VS</span>
            <div className="text-center">
              <p className="font-black text-2xl text-white">{ev.team2}</p>
              {ev.status === "live" && <p className="text-5xl font-black mt-2" style={{ color: accentColor }}>{ev.score2}</p>}
            </div>
          </div>
          {ev.status === "upcoming" && <p className="text-lg font-bold text-muted-foreground">{ev.time}</p>}
          {ev.viewers > 0 && (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="w-3 h-3" /> {ev.viewers.toLocaleString()} spectateurs
            </p>
          )}
        </div>

        {/* Events timeline */}
        {ev.events.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Événements</p>
            {ev.events.map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl border"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                <span className="text-xs font-semibold text-white/80">{e}</span>
              </div>
            ))}
          </div>
        )}

        {/* Simulated stream */}
        <div className="rounded-2xl overflow-hidden border relative aspect-video flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0a1a0a, #111)", borderColor: accentColor + "20" }}>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-3xl"
              style={{ background: accentColor + "20", border: `2px solid ${accentColor}40` }}>
              {ev.sport}
            </div>
            <p className="text-sm font-bold text-white">{ev.team1} vs {ev.team2}</p>
            {ev.status === "live" ? (
              <div className="flex items-center justify-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-xs text-red-400 font-bold">Diffusion en direct simulée</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Commence {ev.time}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="font-black text-xl text-center text-white flex items-center justify-center gap-2">
        <Radio className="w-5 h-5 text-red-400 animate-pulse" /> Sport Live
      </h3>

      {/* Live now */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
          style={{ color: accentColor }}>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-live-pulse inline-block" />
          En direct ({live.length})
        </p>
        <div className="space-y-2">
          {live.map((ev) => (
            <button key={ev.id} onClick={() => setSelected(ev.id)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border hover:scale-[1.01] transition-all text-left group"
              style={{ borderColor: accentColor + "20", background: accentColor + "08" }}>
              <span className="text-2xl shrink-0">{ev.sport}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{ev.league} · {ev.time}</p>
                <p className="font-black text-sm text-white">{ev.team1} <span style={{ color: accentColor }}>{ev.score1} – {ev.score2}</span> {ev.team2}</p>
                <LiveScoreTicker events={ev.events} />
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground">{(ev.viewers / 1000).toFixed(0)}k 👁️</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white ml-auto mt-1 transition" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" /> À venir
        </p>
        <div className="space-y-2">
          {upcoming.map((ev) => (
            <button key={ev.id} onClick={() => setSelected(ev.id)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border hover:bg-white/5 transition text-left"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <span className="text-2xl shrink-0">{ev.sport}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{ev.league}</p>
                <p className="font-bold text-sm text-white">{ev.team1} vs {ev.team2}</p>
                <p className="text-[10px] text-muted-foreground">{ev.time}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}