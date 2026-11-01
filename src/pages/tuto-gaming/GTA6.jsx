import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Map, Car, Target, BookOpen, Play, Gamepad2 } from "lucide-react";

const TABS = [
  { id: "presentation", label: "Présentation" },
  { id: "galerie", label: "Galerie" },
  { id: "trailers", label: "Bandes-Annonces" },
  { id: "wiki", label: "Wiki & Guide" },
];

const PLATFORMS = [
  { name: "PlayStation 5", icon: "🎮", color: "#0070D1" },
  { name: "Xbox Series X/S", icon: "🎯", color: "#107C10" },
];

const CHARACTERS = [
  { name: "Lucia", role: "Protagoniste", desc: "Première protagoniste féminine de la série, Lucia est une criminelle ambitieuse prête à tout pour s'échapper de sa vie en prison.", color: "#FF69B4" },
  { name: "Jason", role: "Protagoniste", desc: "Le compagnon de Lucia, Jason navigue entre petites affaires et grands desseins dans le monde criminel de Leonida.", color: "#4FC3F7" },
];

const WIKI_SECTIONS = [
  { id: "maps", label: "Cartes & Lieux", desc: "Vice City, zones rurales, secrets cachés", icon: Map, color: "#22D3EE" },
  { id: "vehicles", label: "Véhicules & Armes", desc: "Voitures, motos, armes à feu et armes de mêlée", icon: Car, color: "#FBBF24" },
  { id: "missions", label: "Guides de Missions", desc: "Astuces, missions principales et secondaires", icon: Target, color: "#BF5AF2" },
];

const SCREENSHOTS = [
  { src: "https://img.youtube.com/vi/QdBZY2fkU-0/maxresdefault.jpg", title: "Vice City - Panorama" },
  { src: "https://img.youtube.com/vi/QdBZY2fkU-0/hqdefault.jpg", title: "Lucia & Jason" },
  { src: "https://img.youtube.com/vi/QdBZY2fkU-0/mqdefault.jpg", title: "Leonida - Vue côtière" },
  { src: "https://img.youtube.com/vi/QdBZY2fkU-0/maxresdefault.jpg", title: "Vice City - Nuit néon" },
  { src: "https://img.youtube.com/vi/QdBZY2fkU-0/hqdefault.jpg", title: "Plage et palmiers" },
  { src: "https://img.youtube.com/vi/QdBZY2fkU-0/mqdefault.jpg", title: "Downtown Vice City" },
];

const TRAILERS = [
  { id: "QdBZY2fkU-0", title: "GTA VI - Official Trailer 1", date: "Décembre 2023" },
];

export default function GTA6() {
  const [tab, setTab] = useState("presentation");
  const [lightbox, setLightbox] = useState(null);

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-12">
        {/* Back */}
        <Link to="/tuto-gaming" className="inline-flex items-center gap-1.5 text-foreground/40 hover:text-foreground transition mb-6 tap-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour au Hub</span>
        </Link>

        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-3xl mb-8 p-8 sm:p-12"
          style={{
            background: "linear-gradient(135deg, #0a050f 0%, #1a0a2e 40%, #2d0d3a 70%, #0a050f 100%)",
            border: "1px solid rgba(191,90,242,0.3)",
            boxShadow: "0 0 40px rgba(191,90,242,0.15)",
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 className="w-6 h-6" style={{ color: "#BF5AF2" }} />
              <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-foreground/50">Rockstar Games</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-2">GTA VI</h1>
            <p className="text-sm sm:text-base text-white/60 mb-4 max-w-2xl">
              Grand Theft Auto VI — L'aventure la plus ambitieuse de Rockstar Games.
            </p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <span
                  key={p.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: `${p.color}22`, border: `1px solid ${p.color}55`, color: p.color }}
                >
                  <span>{p.icon}</span>
                  {p.name}
                </span>
              ))}
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(191,90,242,0.15)", border: "1px solid rgba(191,90,242,0.4)", color: "#BF5AF2" }}
              >
                Sortie: 2026
              </span>
            </div>
          </div>
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(191,90,242,0.15) 0%, transparent 70%)" }}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className="shrink-0 rounded-full px-5 py-2 text-xs font-bold transition tap-sm"
              style={
                tab === t.id
                  ? { background: "linear-gradient(135deg, #BF5AF2, #9333EA)", color: "#fff", boxShadow: "0 0 15px rgba(191,90,242,0.4)" }
                  : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "presentation" && (
          <div className="space-y-6">
            {/* Synopsis */}
            <div className="rounded-2xl p-6" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <h2 className="text-lg font-black text-foreground mb-3">Synopsis</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Grand Theft Auto VI plonge les joueurs dans l'État de Leonida, une reconstitution vibrante de la Floride,
                avec pour décor principal Vice City, sa métropole néonée inspirée de Miami. Lucia et Jason forment un couple
                criminel en quête de liberté, naviguant entre braquages, trahisons et survie dans un monde impitoyable.
                Rockstar Games promet la carte ouverte la plus immersive et détaillée de son histoire, avec des environnements
                urbains, ruraux et maritimes interconnectés.
              </p>
            </div>

            {/* Characters */}
            <div>
              <h2 className="text-lg font-black text-foreground mb-3">Personnages Principaux</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CHARACTERS.map(char => (
                  <div
                    key={char.name}
                    className="rounded-2xl p-5 transition-all"
                    style={{
                      background: "hsl(var(--card))",
                      border: `1px solid ${char.color}55`,
                      boxShadow: `0 0 15px ${char.color}22`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black"
                        style={{ background: `${char.color}22`, color: char.color, border: `1.5px solid ${char.color}55` }}
                      >
                        {char.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-foreground">{char.name}</h3>
                        <p className="text-xs" style={{ color: char.color }}>{char.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{char.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Développeur", value: "Rockstar Games" },
                { label: "Éditeur", value: "Rockstar Games" },
                { label: "Genre", value: "Action-Aventure / Open World" },
                { label: "Moteur", value: "RAGE 9" },
                { label: "Plateformes", value: "PS5, Xbox Series X/S" },
                { label: "Date de sortie", value: "2026 (à confirmer)" },
              ].map(info => (
                <div key={info.label} className="rounded-xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{info.label}</p>
                  <p className="text-sm font-bold text-foreground">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "galerie" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-foreground">Galerie Officielle HD</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SCREENSHOTS.map((shot, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(shot)}
                  className="group relative aspect-video overflow-hidden rounded-xl"
                  style={{
                    border: "1px solid rgba(191,90,242,0.3)",
                    boxShadow: "0 0 12px rgba(191,90,242,0.1)",
                  }}
                >
                  <img
                    src={shot.src}
                    alt={shot.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <p className="absolute bottom-2 left-2 text-xs font-bold text-white">{shot.title}</p>
                </button>
              ))}
            </div>
            {lightbox && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)" }}
                onClick={() => setLightbox(null)}
              >
                <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                  <img src={lightbox.src} alt={lightbox.title} className="w-full rounded-xl" style={{ border: "1px solid rgba(191,90,242,0.4)", boxShadow: "0 0 40px rgba(191,90,242,0.2)" }} />
                  <p className="text-center mt-3 text-sm font-bold text-white">{lightbox.title}</p>
                  <button
                    onClick={() => setLightbox(null)}
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center tap-sm"
                    style={{ background: "rgba(191,90,242,0.3)", border: "1px solid rgba(191,90,242,0.5)" }}
                  >
                    <span className="text-white text-sm">✕</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "trailers" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-foreground">Bandes-Annonces & Teasers</h2>
            {TRAILERS.map(trailer => (
              <div
                key={trailer.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              >
                <div className="relative aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.id}`}
                    title={trailer.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="p-4 flex items-center gap-3">
                  <Play className="w-4 h-4 shrink-0" style={{ color: "#BF5AF2" }} />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{trailer.title}</h3>
                    <p className="text-xs text-muted-foreground">{trailer.date} · Rockstar Games officiel</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "wiki" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-foreground mb-1">Base de Connaissances</h2>
              <p className="text-sm text-muted-foreground">
                Le wiki sera enrichi dès la sortie du jeu. Découvrez les sections en préparation :
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {WIKI_SECTIONS.map(section => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    className="rounded-2xl p-6 text-center transition-all"
                    style={{
                      background: "hsl(var(--card))",
                      border: `1px solid ${section.color}44`,
                      boxShadow: `0 0 15px ${section.color}15`,
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: `${section.color}22`, border: `1px solid ${section.color}44` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: section.color }} />
                    </div>
                    <h3 className="text-sm font-black text-foreground mb-1">{section.label}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{section.desc}</p>
                    <span
                      className="inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: `${section.color}15`, color: section.color }}
                    >
                      Bientôt disponible
                    </span>
                  </div>
                );
              })}
            </div>
            <div
              className="rounded-2xl p-5 flex items-start gap-3"
              style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.2)" }}
            >
              <BookOpen className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#BF5AF2" }} />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Les guides, astuces et encyclopédie seront ajoutés progressivement après la sortie officielle de GTA VI.
                Restez connecté sur MATRIX pour les premières analyses, cartes interactives et tutoriels complets.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}