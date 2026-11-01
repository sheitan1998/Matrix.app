// GTA VI - Données centrales (infos, plateformes, onglets)
// Sources : GTA Wiki (Fandom) + site officiel Rockstar Games
// https://gta.fandom.com/wiki/Grand_Theft_Auto_VI

const WIKI_CDN = "https://static.wikia.nocookie.net/gtawiki/images";

export const GTA6_LOGO = `${WIKI_CDN}/2/23/Logo-GTAVI.png/revision/latest?cb=20260630195129`;

export const GTA6_PLATFORMS = [
  { name: "PlayStation 5", icon: "🎮", color: "#0070D1" },
  { name: "Xbox Series X/S", icon: "🎯", color: "#107C10" },
];

export const GTA6_TABS = [
  { id: "presentation", label: "Présentation" },
  { id: "personnages", label: "Personnages" },
  { id: "vehicules", label: "Véhicules" },
  { id: "armes", label: "Armes" },
  { id: "lieux", label: "Lieux & Monde" },
  { id: "missions", label: "Missions & Guides" },
  { id: "wiki", label: "Wiki" },
];

export const GTA6_INFO = [
  { label: "Développeur", value: "Rockstar Games" },
  { label: "Éditeur", value: "Rockstar Games" },
  { label: "Genre", value: "Action-Aventure / Open World" },
  { label: "Moteur", value: "RAGE 9" },
  { label: "Plateformes", value: "PS5, Xbox Series X/S" },
  { label: "Date de sortie", value: "2026" },
  { label: "Univers", value: "HD Universe" },
  { label: "Cadre", value: "État de Leonida (Floride)" },
];

export const GTA6_HIGHLIGHTS = [
  {
    icon: "👥",
    title: "Double protagoniste",
    desc: "Lucia Caminos et Jason Duval, inspirés de Bonnie & Clyde. Système de relation évolutive (platonique ou romantique) et changement de personnage à la volée.",
    color: "#FF69B4",
  },
  {
    icon: "🗺️",
    title: "Carte la plus vaste",
    desc: "L'État de Leonida, reconstitution de la Floride : Vice City, Leonida Keys, Everglades, zones rurales et industrielles interconnectées.",
    color: "#22D3EE",
  },
  {
    icon: "🚗",
    title: "Monde vivant",
    desc: "PNJ autonomes, vie nocturne, trafic maritime, faune sauvage (alligators) et réseaux sociaux intégrés au gameplay.",
    color: "#BF5AF2",
  },
  {
    icon: "🎯",
    title: "Système de profil criminel",
    desc: "Le jeu suit votre identité criminelle : le profil influence les réactions de la police et l'expérience de jeu.",
    color: "#FBBF24",
  },
];

export const GTA6_SYNOPSIS = `Grand Theft Auto VI se déroule dans l'État de Leonida, une reconstitution vibrante de la Floride, avec pour décor principal Vice City, sa métropole néonée inspirée de Miami. Lucia Caminos et Jason Duval forment un couple criminel en quête de liberté, inspiré de Bonnie & Clyde. Naviguant entre braquages, trahisons et survie, leur partenariat est décrit par Rockstar comme un duo où Lucia est le "moteur" et Jason le "frein". Le jeu promet la carte ouverte la plus immersive de l'histoire de la série, avec des environnements urbains, ruraux et maritimes interconnectés, un système de relation évolutive entre les deux protagonistes, et un changement de personnage à la volée.`;

export { WIKI_CDN };