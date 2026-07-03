import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Plus, Headphones, Play, MoreHorizontal, Music, ListMusic, TrendingUp, Star, Clock, Upload, Wand2, Activity, Sliders, Share2 } from "lucide-react";
import SpaceBackground from "@/components/SpaceBackground";
import MatrixSidebar from "@/components/layout/MatrixSidebar";
import MatrixTopbar from "@/components/layout/MatrixTopbar";
import MatrixRightSidebar from "@/components/layout/MatrixRightSidebar";

const TABS = [
  { icon: ListMusic, label: "Mes playlists" },
  { icon: Music, label: "Playlists publiques" },
  { icon: TrendingUp, label: "Tendances" },
  { icon: Star, label: "Favoris" },
  { icon: Clock, label: "Historique" },
];

const POPULAR = [
  { title: "Cyber Nights", author: "NeoGameux", tracks: 24, duration: "1h 32min", cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop" },
  { title: "Space Beats", author: "LunaStream", tracks: 18, duration: "1h 05min", cover: "https://images.unsplash.com/photo-1465225314224-587cd83d322b?w=300&h=300&fit=crop" },
  { title: "Neon Vibes", author: "CyberBeat", tracks: 32, duration: "2h 15min", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop" },
  { title: "Retro Wave", author: "SynthLord", tracks: 15, duration: "55min", cover: "https://images.unsplash.com/photo-1571974599782-87624638275a?w=300&h=300&fit=crop" },
  { title: "Deep Focus", author: "MatrixAI", tracks: 40, duration: "2h 48min", cover: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&h=300&fit=crop" },
];

const MY_PLAYLISTS = [
  { title: "Workout Mix", tracks: 12, duration: "45min", cover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop" },
  { title: "Chill Gaming", tracks: 8, duration: "32min", cover: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=300&fit=crop" },
  { title: "Code Flow", tracks: 20, duration: "1h 20min", cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop" },
];

const TOOLS = [
  { icon: Upload, label: "Importation musicale" },
  { icon: Wand2, label: "Smart Mix IA" },
  { icon: Activity, label: "Analyse d'ambiance" },
  { icon: Sliders, label: "Égaliseur avancé", pro: true },
  { icon: Share2, label: "Export & Partage" },
];

export default function Playlists() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SpaceBackground overlay={0.6}>
      <div className="flex">
        <MatrixSidebar />
        <main className="flex-1 min-h-screen">
          <MatrixTopbar title="Playlists" searchPlaceholder="Rechercher une playlist..." />

          <div className="px-6 py-6 space-y-8 max-w-5xl mx-auto">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="rounded-3xl p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(10,10,12,0.6))", border: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)" }} />
              <div className="relative flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 40px rgba(139,92,246,0.3)" }}>
                  <Music className="w-10 h-10" style={{ color: "#a855f7" }} />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-black text-white">Playlists</h1>
                  <p className="text-sm text-purple-300 font-medium mt-1">Créez. Organisez. Partagez.</p>
                  <p className="text-xs text-white/50 mt-2 max-w-md">Votre univers musical intégré. Créez des playlists, découvez des sons, partagez avec la communauté.</p>
                </div>
                <div className="hidden sm:flex gap-2">
                  <button onClick={() => toast("Nouvelle playlist")} className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
                    <Plus className="w-4 h-4" /> Créer
                  </button>
                  <button onClick={() => toast("Découvrir")} className="h-10 px-5 rounded-xl text-sm font-bold text-white/70 hover:text-white transition"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                    Découvrir
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {TABS.map((t, i) => (
                <button key={t.label} onClick={() => setActiveTab(i)}
                  className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold transition"
                  style={activeTab === i
                    ? { background: "rgba(139,92,246,0.15)", color: "#fff", border: "1px solid rgba(139,92,246,0.3)" }
                    : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Popular playlists */}
            <Section title="Playlists populaires" action="Voir tout">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {POPULAR.map((p, i) => (
                  <motion.div key={p.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                    className="rounded-2xl overflow-hidden cursor-pointer group"
                    style={{ background: "rgba(18,18,20,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="relative aspect-square">
                      <img src={p.cover} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" style={{ background: "rgba(0,0,0,0.4)" }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.9)", boxShadow: "0 0 20px rgba(139,92,246,0.5)" }}>
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-white truncate">{p.title}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">Par {p.author}</p>
                      <p className="text-[10px] text-white/30 mt-1">{p.tracks} titres · {p.duration}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* Your playlists */}
            <Section title="Vos playlists" action="Voir tout">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Create card */}
                <button onClick={() => toast("Créer une playlist")}
                  className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition group"
                  style={{ border: "2px dashed rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.03)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)"; e.currentTarget.style.background = "rgba(139,92,246,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; e.currentTarget.style.background = "rgba(139,92,246,0.03)"; }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}>
                    <Plus className="w-6 h-6" style={{ color: "#a855f7" }} />
                  </div>
                  <p className="text-xs font-bold text-white/60">Créer une playlist</p>
                </button>

                {MY_PLAYLISTS.map((p, i) => (
                  <motion.div key={p.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                    className="rounded-2xl overflow-hidden cursor-pointer group"
                    style={{ background: "rgba(18,18,20,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="relative aspect-square">
                      <img src={p.cover} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" style={{ background: "rgba(0,0,0,0.4)" }}>
                        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.9)", boxShadow: "0 0 20px rgba(139,92,246,0.5)" }}>
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      <button className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                        <MoreHorizontal className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-white truncate">{p.title}</p>
                      <p className="text-[10px] text-white/30 mt-1">{p.tracks} titres · {p.duration}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </main>
        <MatrixRightSidebar tools={TOOLS} />
      </div>
    </SpaceBackground>
  );
}

function Section({ title, action, children }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <h3 className="text-lg font-black text-white">{title}</h3>
        {action && <button className="text-xs font-bold text-purple-400 hover:text-purple-300 transition">{action}</button>}
      </div>
      {children}
    </section>
  );
}

function toast(msg) { import("sonner").then(({ toast }) => toast.info(msg)); }