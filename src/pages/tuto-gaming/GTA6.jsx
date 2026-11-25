import React, { useState } from "react";
import { Link } from "react-router-dom";
import GameSeoBlock from "@/components/seo/GameSeoBlock";
import { ArrowLeft, Gamepad2, BookOpen, Target, Map as MapIcon, Users, Zap } from "lucide-react";
import GTA6DetailModal from "@/components/tuto-gaming/GTA6DetailModal";
import GTA6Catalog from "@/components/tuto-gaming/GTA6Catalog";
import { getGta6TabItems, resolveGta6Selection } from "@/components/tuto-gaming/gta6/gta6Registry";
import {
  GTA6_PLATFORMS,
  GTA6_TABS,
  GTA6_INFO,
  GTA6_HIGHLIGHTS,
  GTA6_SYNOPSIS,
  GTA6_WIKI_SECTIONS,
  GTA6_KEY_ART,
} from "@/components/tuto-gaming/gta6Data";

const HIGHLIGHT_ICONS = { "👥": Users, "🗺️": MapIcon, "🚗": Zap, "🎯": Target };

// One entry per data-driven tab; the items come from gta6Registry, so adding a record to
// the matching data file is enough to publish a new card.
const GTA6_CATALOG_SECTIONS = {
  quetes: {
    title: "Quêtes",
    intro: "Structure prête pour les quêtes principales, secondaires et activités. Rockstar n'a publié aucune liste officielle : les fiches sont à compléter après la sortie.",
  },
  missions: {
    title: "Missions",
    intro: "Les missions, leurs étapes exactes et leurs récompenses ne sont pas publiées dans les sources officielles référencées. Les fiches sont uniquement des méthodes générales de préparation, pas des solutions GTA VI confirmées.",
  },
  succes: {
    title: "Succès & Trophées",
    intro: "Rockstar Games n'a pas encore publié la liste officielle des trophées. Les fiches rassemblent des éléments prévisionnels issus des communautés, clairement identifiés comme non confirmés.",
  },
  lieux: {
    title: "Carte & Lieux",
    intro: "Régions, villes et points d'intérêt de l'État de Leonida identifiés dans les supports officiels.",
  },
  armes: {
    title: "Armes & Équipements",
    intro: "Armes et équipements identifiés dans les supports officiels Rockstar Games.",
  },
  vehicules: {
    title: "Véhicules & Cosmétiques",
    intro: "Véhicules, variantes et options de personnalisation identifiés dans les supports officiels Rockstar Games. Aucun élément non visible dans ces supports n'est ajouté.",
  },
  personnages: {
    title: "Personnages",
    intro: "Personnages officiellement présentés par Rockstar Games.",
  },
};

export default function GTA6() {
  const [tab, setTab] = useState("presentation");
  const [selectedId, setSelectedId] = useState(null);

  const items = getGta6TabItems(tab);
  const selected = resolveGta6Selection(tab, selectedId);
  const setSelected = (item) => setSelectedId(item?.id || null);

  const catalog = GTA6_CATALOG_SECTIONS[tab];

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-12">
        <Link
          to="/tuto-gaming"
          className="inline-flex items-center gap-1.5 text-foreground/40 hover:text-foreground transition mb-6 tap-sm"
        >
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
          <img
            src={GTA6_KEY_ART}
            alt="Official Grand Theft Auto VI key art poster"
            className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(10,5,15,0.94) 0%, rgba(10,5,15,0.6) 55%, rgba(10,5,15,0.9) 100%)",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 className="w-6 h-6" style={{ color: "#BF5AF2" }} />
              <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-foreground/50">
                Rockstar Games
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-2">GTA VI</h1>
            <p className="text-sm sm:text-base text-white/60 mb-4 max-w-2xl">
              Grand Theft Auto VI — L'aventure la plus ambitieuse de Rockstar Games.
            </p>
            <div className="flex flex-wrap gap-2">
              {GTA6_PLATFORMS.map((platform) => (
                <span
                  key={platform.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: `${platform.color}22`,
                    border: `1px solid ${platform.color}55`,
                    color: platform.color,
                  }}
                >
                  <span>{platform.icon}</span>
                  {platform.name}
                </span>
              ))}
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: "rgba(191,90,242,0.15)",
                  border: "1px solid rgba(191,90,242,0.4)",
                  color: "#BF5AF2",
                }}
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
          {GTA6_TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedId(null);
                  setTab(item.id);
                }}
                aria-pressed={active}
                className="shrink-0 rounded-full px-4 py-2 text-xs font-bold transition tap-sm"
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, #BF5AF2, #9333EA)",
                        color: "#fff",
                        boxShadow: "0 0 15px rgba(191,90,242,0.4)",
                      }
                    : {
                        background: "hsl(var(--card))",
                        color: "hsl(var(--muted-foreground))",
                        border: "1px solid hsl(var(--border))",
                      }
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Présentation */}
        {tab === "presentation" && (
          <div className="space-y-6">
            <div
              className="rounded-2xl p-6"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            >
              <h2 className="text-lg font-black text-foreground mb-3">Synopsis</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{GTA6_SYNOPSIS}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GTA6_HIGHLIGHTS.map((highlight) => {
                const Icon = HIGHLIGHT_ICONS[highlight.icon] || Target;
                return (
                  <div
                    key={highlight.title}
                    className="rounded-xl p-5"
                    style={{
                      background: "hsl(var(--card))",
                      border: `1px solid ${highlight.color}33`,
                      boxShadow: `0 0 12px ${highlight.color}10`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: `${highlight.color}22`,
                          border: `1px solid ${highlight.color}44`,
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: highlight.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-foreground mb-1">{highlight.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{highlight.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GTA6_INFO.map((info) => (
                <div
                  key={info.label}
                  className="rounded-xl p-4"
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    {info.label}
                  </p>
                  <p className="text-sm font-bold text-foreground">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {catalog && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-foreground">{catalog.title}</h2>
            <p className="text-sm text-muted-foreground mb-2">{catalog.intro}</p>
            <GTA6Catalog key={tab} items={items} onSelect={setSelected} label={catalog.title} />
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
              {GTA6_WIKI_SECTIONS.map((section) => (
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
                Les guides, astuces et encyclopédie seront ajoutés progressivement après la sortie officielle
                de GTA VI. Restez connecté sur MATRIX pour les premières analyses, cartes interactives et
                tutoriels complets.
              </p>
            </div>
          </div>
        )}
      </div>

      <GameSeoBlock page="gta" />

      <GTA6DetailModal
        key={`${tab}:${selectedId || ""}`}
        item={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}