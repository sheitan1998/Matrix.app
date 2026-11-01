import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Gamepad2, BookOpen, ShieldCheck, Images } from "lucide-react";
import GTA6DetailModal from "@/components/tuto-gaming/GTA6DetailModal";
import GTA6Image from "@/components/tuto-gaming/GTA6Image";
import {
  GTA6_LOGO, GTA6_PLATFORMS, GTA6_TABS, GTA6_INFO,
  GTA6_CHARACTERS, GTA6_VEHICLES, GTA6_WEAPONS, GTA6_LOCATIONS, GTA6_WIKI_SECTIONS,
} from "@/components/tuto-gaming/gta6Data";

function GalleryCard({ item, onClick }) {
  if (!item) return null;
  const color = item.color || "#BF5AF2";
  return (
    <button
      onClick={() => onClick(item)}
      className="group relative aspect-[4/3] overflow-hidden rounded-xl text-left transition-all"
      style={{
        border: `1px solid ${color}44`,
        boxShadow: `0 0 12px ${color}15`,
      }}
    >
      <GTA6Image
        src={item.image}
        alt={item.name}
        fallbackColor={color}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.9) 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
            style={{ background: `${color}33`, color }}
          >
            {item.tag}
          </span>
          {item.gallery?.length > 1 && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold"
              style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}
            >
              <Images className="w-2.5 h-2.5" />
              {item.gallery.length}
            </span>
          )}
        </div>
        <h3 className="text-sm font-black text-white leading-tight">{item.name}</h3>
      </div>
    </button>
  );
}

export default function GTA6() {
  const [tab, setTab] = useState("presentation");
  const [selected, setSelected] = useState(null);

  const renderGallery = (items) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <GalleryCard key={item.name} item={item} onClick={setSelected} />
      ))}
    </div>
  );

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
              {GTA6_PLATFORMS.map(p => (
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

        {/* Source badge */}
        <div
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl"
          style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.2)" }}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: "#22D3EE" }} />
          <p className="text-xs text-muted-foreground">
            Données et visuels vérifiés depuis le <span className="font-bold text-foreground">GTA Wiki (Fandom)</span> et les sources officielles Rockstar Games.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {GTA6_TABS.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-pressed={active}
                className="shrink-0 rounded-full px-4 py-2 text-xs font-bold transition tap-sm"
                style={
                  active
                    ? { background: "linear-gradient(135deg, #BF5AF2, #9333EA)", color: "#fff", boxShadow: "0 0 15px rgba(191,90,242,0.4)" }
                    : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Presentation */}
        {tab === "presentation" && (
          <div className="space-y-6">
            <div className="rounded-2xl p-6" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <h2 className="text-lg font-black text-foreground mb-3">Synopsis</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Grand Theft Auto VI se déroule dans l'État de Leonida, une reconstitution vibrante de la Floride,
                avec pour décor principal Vice City, sa métropole néonée inspirée de Miami. Lucia Caminos et Jason Duval
                forment un couple criminel en quête de liberté, inspiré de Bonnie & Clyde. Naviguant entre braquages,
                trahisons et survie, leur partenariat est décrit par Rockstar comme un duo où Lucia est le 'moteur'
                et Jason le 'frein'. Le jeu promet la carte ouverte la plus immersive de l'histoire de la série,
                avec des environnements urbains, ruraux et maritimes interconnectés.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {GTA6_INFO.map(info => (
                <div key={info.label} className="rounded-xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{info.label}</p>
                  <p className="text-sm font-bold text-foreground">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personnages */}
        {tab === "personnages" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-foreground">Personnages Officiels</h2>
            {renderGallery(GTA6_CHARACTERS)}
          </div>
        )}

        {/* Véhicules */}
        {tab === "vehicules" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-foreground">Véhicules & Voitures</h2>
            {renderGallery(GTA6_VEHICLES)}
          </div>
        )}

        {/* Armes */}
        {tab === "armes" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-foreground">Armes & Équipements</h2>
            {renderGallery(GTA6_WEAPONS)}
          </div>
        )}

        {/* Lieux & Monde */}
        {tab === "lieux" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-foreground">Lieux & Monde Ouvert</h2>
            {renderGallery(GTA6_LOCATIONS)}
          </div>
        )}

        {/* Wiki */}
        {tab === "wiki" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-foreground mb-1">Base de Connaissances</h2>
              <p className="text-sm text-muted-foreground">
                Le wiki sera enrichi dès la sortie du jeu. Découvrez les sections en préparation :
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {GTA6_WIKI_SECTIONS.map(section => (
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
                    <BookOpen className="w-6 h-6" style={{ color: section.color }} />
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
              ))}
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

      <GTA6DetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}