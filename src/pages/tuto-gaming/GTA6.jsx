import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Gamepad2, Users, Car, Crosshair, Globe, BookOpen } from "lucide-react";
import GTA6DetailModal from "@/components/tuto-gaming/GTA6DetailModal";

const PLATFORMS = [
  { name: "PlayStation 5", icon: "🎮", color: "#0070D1" },
  { name: "Xbox Series X/S", icon: "🎯", color: "#107C10" },
];

const TABS = [
  { id: "presentation", label: "Présentation", icon: BookOpen },
  { id: "personnages", label: "Personnages", icon: Users },
  { id: "vehicules", label: "Véhicules", icon: Car },
  { id: "armes", label: "Armes", icon: Crosshair },
  { id: "monde", label: "Monde Ouvert", icon: Globe },
  { id: "wiki", label: "Wiki & Guide", icon: BookOpen },
];

const CHARACTERS = [
  {
    name: "Lucia",
    subtitle: "Protagoniste",
    tag: "Personnage principal",
    color: "#FF69B4",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
    desc: "Première protagoniste féminine de la série GTA, Lucia est une criminelle ambitieuse prête à tout pour s'échapper de sa vie en prison. Issue d'un milieu difficile de Vice City, elle combine charisme, détermination et instinct de survie. Son histoire avec Jason forme le cœur émotionnel de GTA VI.",
  },
  {
    name: "Jason",
    subtitle: "Protagoniste",
    tag: "Personnage principal",
    color: "#4FC3F7",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
    desc: "Le compagnon de Lucia, Jason navigue entre petites affaires et grands desseins dans le monde criminel de Leonida. Ancien militaire reconverti dans les activités illégales, il apporte une approche tactique et méthodique au duo. Sa loyauté envers Lucia est mise à l'épreuve tout au long de l'aventure.",
  },
  {
    name: "Personnages secondaires",
    subtitle: "Alliés & Antagonistes",
    tag: "Cast étendu",
    color: "#FBBF24",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
    desc: "Rockstar Games a confirmé un cast étoffé de personnages secondaires : allies, rivaux criminels, figures du milieu de Vice City et de l'État de Leonida. Chacun apportera sa propre narration, ses missions et ses dynamiques relationnelles avec Lucia et Jason.",
  },
];

const VEHICLES = [
  { name: "Voiture de sport", tag: "Véhicule", color: "#FF4444", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80", desc: "Bolides ultra-rapides pour les courses-poursuites dans les rues de Vice City. Des modèles inspirés des supercars les plus performantes, personnalisables dans les garages." },
  { name: "Berline custom", tag: "Véhicule", color: "#9333EA", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80", desc: "Berlines modifiées combinant élégance et performances. Idéales pour les déplacements discrets à travers les quartiers de Vice City et les zones rurales de Leonida." },
  { name: "4x4 tout-terrain", tag: "Véhicule", color: "#22D3EE", image: "https://images.unsplash.com/photo-1533473369114-754575531b52?w=800&q=80", desc: "Véhicules tout-terrain conçus pour les marécages, les Everglades de Leonida et les zones rurales. Robustesse et capacité de franchissement pour les escapades hors des sentiers battus." },
  { name: "Moto sportive", tag: "Véhicule", color: "#FBBF24", image: "https://images.unsplash.com/photo-1558981806-ec527faa5243?w=800&q=80", desc: "Motos de sport ultra-maniables pour se faufiler dans le trafic de Vice City. Vitesse et agilité pour les missions de livraison rapides et les courses urbaines." },
  { name: "Bateau rapide", tag: "Véhicule", color: "#10B981", image: "https://images.unsplash.com/photo-1543946207-39bd91e70ca7?w=800&q=80", desc: "Bateaux motorisés pour les courses sur l'océan et les voies navigables de Leonida. Essentiels pour les missions maritimes et les explorations côtières." },
  { name: "Voiture de police", tag: "Véhicule", color: "#3B82F6", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80", desc: "Véhicules des forces de l'ordre de Vice City, aperçus dans les trailers. Le système de wanted et les poursuites policières seront au cœur de l'expérience GTA VI." },
];

const WEAPONS = [
  { name: "Pistolet semi-automatique", tag: "Arme à feu", color: "#F87171", image: "https://images.unsplash.com/photo-1583143457540-7636778453a1?w=800&q=80", desc: "Arme de poing polyvalente, indispensable pour les combats rapprochés. Modèle standard utilisé par les criminels et les forces de l'ordre de Leonida." },
  { name: "Fusil d'assaut", tag: "Arme à feu", color: "#BF5AF2", image: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&q=80", desc: "Fusil d'assaut tactique pour les affrontements à moyenne et longue portée. Polyvalent et puissant, il sera l'arme de choix pour les missions de braquage." },
  { name: "Fusil de précision", tag: "Arme à feu", color: "#22D3EE", image: "https://images.unsplash.com/photo-1612875895099-3d8b9b1e1e1e?w=800&q=80", desc: "Fusil de sniper pour les éliminations silencieuses à longue distance. Essentiel pour les missions de reconnaissance et les assassinats ciblés." },
  { name: "Batte de baseball", tag: "Arme de mêlée", color: "#FBBF24", image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80", desc: "Arme de mêlée contondante pour les combats au corps à corps. Discrète et efficace, elle reste un classique de la série GTA." },
  { name: "Couteau tactique", tag: "Arme de mêlée", color: "#10B981", image: "https://images.unsplash.com/photo-1593618998310-3e9f1b1e8e1e?w=800&q=80", desc: "Couteau de combat pour les éliminations discrètes et les approches furtives. Silencieux et mortel, idéal pour les missions d'infiltration." },
  { name: "Explosifs", tag: "Arme lourde", color: "#EF4444", image: "https://images.unsplash.com/photo-1607124473241-3d1b1e1e1e1e?w=800&q=80", desc: "Grenades et charges explosives pour les destructions de véhicules et les assauts de bâtiments. Polyvalents pour créer le chaos lors des missions." },
];

const WORLD = [
  { name: "Vice City", tag: "Métropole", color: "#BF5AF2", image: "https://images.unsplash.com/photo-1535498730771-e73599b6f8c3?w=800&q=80", desc: "Vice City, la métropole néonée inspirée de Miami, est le décor principal de GTA VI. Plages de sable blanc, gratte-ciels scintillants, quartiers chauds et vie nocturne trépidante composent cette ville vibrante et dangereuse." },
  { name: "État de Leonida", tag: "Région", color: "#22D3EE", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", desc: "L'État de Leonida est la reconstitution de la Floride par Rockstar Games. Zones rurales, marécages des Everglades, petites villes côtières et métropoles forment un monde ouvert vaste et diversifié." },
  { name: "Système policier", tag: "Gameplay", color: "#3B82F6", image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80", desc: "Les forces de l'ordre de GTA VI bénéficient d'une IA améliorée avec tactiques coordonnées, hélicoptères, unités spéciales et poursuites dynamiques. Le système de wanted évolue selon la gravité des infractions." },
  { name: "Physique de l'eau", tag: "Moteur", color: "#10B981", image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80", desc: "Rockstar Games a développé une physique de l'eau ultra-réaliste pour GTA VI : vagues dynamiques, reflèts,écume, interaction avec les embarcations et nage des personnages. Les environnements marins sont un axe majeur." },
  { name: "Vie nocturne", tag: "Activité", color: "#FBBF24", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80", desc: "Boîtes de nuit, bars, plages et événements en plein air composent la vie nocturne trépidante de Vice City. Les activités de loisir et de divertissement sont au cœur de l'immersion." },
  { name: "Activités & loisirs", tag: "Activité", color: "#FF69B4", image: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800&q=80", desc: "Plongée sous-marine, parachute, sports nautiques, tuning de véhicules et bien plus. GTA VI propose une large gamme d'activités optionnelles pour explorer le monde de Leonida." },
];

const WIKI_SECTIONS = [
  { id: "maps", label: "Cartes & Lieux", desc: "Vice City, zones rurales, secrets cachés", color: "#22D3EE" },
  { id: "vehicles", label: "Véhicules & Armes", desc: "Collection complète des véhicules et armes", color: "#FBBF24" },
  { id: "missions", label: "Guides de Missions", desc: "Astuces, missions principales et secondaires", color: "#BF5AF2" },
];

function GalleryCard({ item, onClick }) {
  return (
    <button
      onClick={() => onClick(item)}
      className="group relative aspect-[4/3] overflow-hidden rounded-xl text-left transition-all"
      style={{
        border: `1px solid ${item.color}44`,
        boxShadow: `0 0 12px ${item.color}15`,
      }}
    >
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.9) 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span
          className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-1"
          style={{ background: `${item.color}33`, color: item.color }}
        >
          {item.tag}
        </span>
        <h3 className="text-sm font-black text-white leading-tight">{item.name}</h3>
      </div>
    </button>
  );
}

export default function GTA6() {
  const [tab, setTab] = useState("presentation");
  const [selected, setSelected] = useState(null);

  const renderGallery = (items) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-pressed={active}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition tap-sm"
                style={
                  active
                    ? { background: "linear-gradient(135deg, #BF5AF2, #9333EA)", color: "#fff", boxShadow: "0 0 15px rgba(191,90,242,0.4)" }
                    : { background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                }
              >
                <Icon className="w-3.5 h-3.5" />
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
                Grand Theft Auto VI plonge les joueurs dans l'État de Leonida, une reconstitution vibrante de la Floride,
                avec pour décor principal Vice City, sa métropole néonée inspirée de Miami. Lucia et Jason forment un couple
                criminel en quête de liberté, naviguant entre braquages, trahisons et survie dans un monde impitoyable.
                Rockstar Games promet la carte ouverte la plus immersive et détaillée de son histoire, avec des environnements
                urbains, ruraux et maritimes interconnectés.
              </p>
            </div>
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

        {/* Personnages */}
        {tab === "personnages" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-foreground">Personnages Officiels</h2>
            {renderGallery(CHARACTERS)}
          </div>
        )}

        {/* Véhicules */}
        {tab === "vehicules" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-foreground">Véhicules & Voitures</h2>
            {renderGallery(VEHICLES)}
          </div>
        )}

        {/* Armes */}
        {tab === "armes" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-foreground">Armes & Équipements</h2>
            {renderGallery(WEAPONS)}
          </div>
        )}

        {/* Monde Ouvert */}
        {tab === "monde" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-foreground">Fonctionnalités & Monde Ouvert</h2>
            {renderGallery(WORLD)}
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
              {WIKI_SECTIONS.map(section => (
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