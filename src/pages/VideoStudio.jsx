import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Film, Upload, Layout, Sparkles, Music, BookOpen, Clock, MoreHorizontal, Play, Scissors, Wand2, Type, Crop, Palette, Activity } from "lucide-react";
import SpaceBackground from "@/components/SpaceBackground";
import MatrixSidebar from "@/components/layout/MatrixSidebar";
import MatrixTopbar from "@/components/layout/MatrixTopbar";
import MatrixRightSidebar from "@/components/layout/MatrixRightSidebar";

const QUICK_ACTIONS = [
  { icon: Film, label: "Nouveau projet", color: "#8b5cf6" },
  { icon: Upload, label: "Importer", color: "#06b6d4" },
  { icon: Layout, label: "Modèles", color: "#a855f7" },
  { icon: Sparkles, label: "Effets", color: "#ec4899" },
  { icon: Music, label: "Musique", color: "#f59e0b" },
  { icon: BookOpen, label: "Tutorials", color: "#10b981" },
];

const PROJECTS = [
  { title: "Matrix Intro V2", duration: "0:45", resolution: "4K", modified: "Il y a 2h", thumb: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop" },
  { title: "Gaming Highlights", duration: "5:30", resolution: "1080p", modified: "Hier", thumb: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop" },
  { title: "Tuto Montage", duration: "12:15", resolution: "4K", modified: "3 jours", thumb: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400&h=225&fit=crop" },
  { title: "Clip Tournoi", duration: "0:30", resolution: "1080p", modified: "1 sem", thumb: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=225&fit=crop" },
];

const QUICK_START = [
  { icon: Film, title: "Éditeur avancé", desc: "Timeline complète, multicouche", color: "#8b5cf6" },
  { icon: Scissors, title: "Coupe rapide", desc: "Taille et assemble en seconds", color: "#06b6d4" },
  { icon: Wand2, title: "Auto Montage", desc: "L'IA monte pour toi", color: "#ec4899" },
  { icon: Layout, title: "Templates", desc: "Démarre depuis un modèle", color: "#f59e0b" },
];

const RESOURCES = [
  { title: "Transitions néon", desc: "12 transitions cyberpunk", badge: "GRATUIT" },
  { title: "Overlays futuristes", desc: "8 overlays animés 4K", badge: "PRO" },
  { title: "Musique libre", desc: "50 tracks sans copyright", badge: "GRATUIT" },
];

const TOOLS = [
  { icon: Crop, label: "Recadrage intelligent" },
  { icon: Scissors, label: "Suppression de fond" },
  { icon: Type, label: "Sous-titres automatiques" },
  { icon: Activity, label: "Stabilisation vidéo" },
  { icon: Palette, label: "Étalonnage couleur" },
];

export default function VideoStudio() {
  const nav = useNavigate();

  return (
    <SpaceBackground overlay={0.6}>
      <div className="flex">
        <MatrixSidebar />
        <main className="flex-1 min-h-screen">
          <MatrixTopbar title="Video Studio" searchPlaceholder="Rechercher dans Video Studio..." />

          <div className="px-6 py-6 space-y-8 max-w-5xl mx-auto">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="rounded-3xl p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(10,10,12,0.6))", border: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)" }} />
              <div className="relative flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 40px rgba(139,92,246,0.3)" }}>
                  <Film className="w-10 h-10" style={{ color: "#a855f7" }} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">Video Studio</h1>
                  <p className="text-sm text-purple-300 font-medium mt-1">Éditez. Assemblez. Partagez.</p>
                  <p className="text-xs text-white/50 mt-2 max-w-md">Un studio vidéo complet pour transformer vos idées en chefs-d'œuvre. Timeline multicouche, effets IA, export 4K.</p>
                </div>
              </div>
            </motion.div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} onClick={() => toast(a.label)}
                  className="flex items-center gap-2 h-10 px-4 rounded-xl text-xs font-bold text-white transition"
                  style={{ background: `${a.color}15`, border: `1px solid ${a.color}30` }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 0 20px ${a.color}30`}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
                  <a.icon className="w-4 h-4" style={{ color: a.color }} />
                  {a.label}
                </button>
              ))}
            </div>

            {/* Recent projects */}
            <Section title="Vos projets récents" action="Voir tout">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PROJECTS.map((p, i) => (
                  <motion.div key={p.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                    className="rounded-2xl overflow-hidden cursor-pointer group"
                    style={{ background: "rgba(18,18,20,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="relative aspect-video">
                      <img src={p.thumb} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                      <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.7)" }}>{p.duration}</span>
                      <span className="absolute top-2 left-2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded" style={{ background: "rgba(139,92,246,0.8)" }}>{p.resolution}</span>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white truncate">{p.title}</p>
                        <MoreHorizontal className="w-3.5 h-3.5 text-white/30 shrink-0" />
                      </div>
                      <p className="text-[10px] text-white/40 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{p.modified}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* Quick start */}
            <Section title="Commencer rapidement" subtitle="Des outils puissants, simples à utiliser">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {QUICK_START.map((t, i) => (
                  <motion.button key={t.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
                    onClick={() => toast(t.title)}
                    className="rounded-2xl p-5 text-left group transition"
                    style={{ background: "rgba(18,18,20,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${t.color}40`; e.currentTarget.style.boxShadow = `0 0 30px ${t.color}15`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition"
                      style={{ background: `${t.color}15`, border: `1px solid ${t.color}30` }}>
                      <t.icon className="w-5 h-5" style={{ color: t.color }} />
                    </div>
                    <p className="text-sm font-bold text-white">{t.title}</p>
                    <p className="text-[11px] text-white/40 mt-1">{t.desc}</p>
                  </motion.button>
                ))}
              </div>
            </Section>

            {/* Resources */}
            <Section title="Ressources populaires">
              <div className="space-y-2">
                {RESOURCES.map((r) => (
                  <div key={r.title} className="flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:bg-white/5 transition"
                    style={{ background: "rgba(18,18,20,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(139,92,246,0.1)" }}>
                      <Sparkles className="w-5 h-5" style={{ color: "#a855f7" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{r.title}</p>
                      <p className="text-[11px] text-white/40">{r.desc}</p>
                    </div>
                    <span className="text-[9px] font-black px-2 py-1 rounded-full"
                      style={r.badge === "PRO" ? { background: "rgba(245,158,11,0.2)", color: "#fbbf24" } : { background: "rgba(139,92,246,0.2)", color: "#c4b5fd" }}>
                      {r.badge}
                    </span>
                  </div>
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

function Section({ title, subtitle, action, children }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h3 className="text-lg font-black text-white">{title}</h3>
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        {action && <button className="text-xs font-bold text-purple-400 hover:text-purple-300 transition">{action}</button>}
      </div>
      {children}
    </section>
  );
}

function toast(msg) { import("sonner").then(({ toast }) => toast.info(msg)); }