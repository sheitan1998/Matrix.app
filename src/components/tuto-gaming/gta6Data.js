// Données vérifiées depuis le GTA Wiki (Fandom) - sources officielles Rockstar Games
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
  { id: "wiki", label: "Wiki & Guide" },
];

export const GTA6_INFO = [
  { label: "Développeur", value: "Rockstar Games" },
  { label: "Éditeur", value: "Rockstar Games" },
  { label: "Genre", value: "Action-Aventure / Open World" },
  { label: "Moteur", value: "RAGE 9" },
  { label: "Plateformes", value: "PS5, Xbox Series X/S" },
  { label: "Date de sortie", value: "2026 (à confirmer)" },
];

export const GTA6_CHARACTERS = [
  {
    name: "Lucia Caminos",
    subtitle: "Protagoniste",
    tag: "Personnage principal",
    faction: "Criminelle indépendante",
    status: "Confirmé officiellement",
    color: "#FF69B4",
    image: `${WIKI_CDN}/f/f3/OfficialScreenshots-GTAVI-PromotionalWebsite-LuciaCaminos-SS1.jpg/revision/latest?cb=20250506161813`,
    desc: "Née à Liberty City, Lucia est la première protagoniste féminine de la série GTA avec un rôle entièrement doué. Son père lui a appris à se battre dès son plus jeune âge. Incarcérée à la Leonida Penitentiary après avoir défendu sa famille, elle est sortie de prison par chance. Elle voit en Jason une opportunité de changer sa vie et d'offrir à sa mère la vie dont elle a toujours rêvé. Inspirée de Bonnie Parker (Bonnie & Clyde).",
    quote: "La seule chose qui compte, c'est qui tu connais et ce que tu as.",
  },
  {
    name: "Jason Duval",
    subtitle: "Protagoniste",
    tag: "Personnage principal",
    faction: "Criminel indépendant",
    status: "Confirmé officiellement",
    color: "#4FC3F7",
    image: `${WIKI_CDN}/c/c9/OfficialScreenshots-GTAVI-PromotionalWebsite-JasonDuval-SS5.jpg/revision/latest?cb=20250506161810`,
    desc: "Ancien militaire de l'US Army, Jason a grandi parmi les escrocs et les petits délinquants. Après son service militaire, il s'est installé dans les Leonida Keys où il travaille pour des trafiquants de drogue locaux. Il vit gratuitement dans une propriété de Brian Heder à Key Lento en échange de services. Sa rencontre avec Lucia pourrait être la meilleure ou la pire chose qui lui soit arrivée. Rockstar décrit Lucia comme le 'moteur' et Jason comme le 'frein' de leur partenariat.",
    quote: "S'il arrive quoi que ce soit, je suis juste derrière toi.",
  },
  {
    name: "Cal Hampton",
    subtitle: "Personnage secondaire",
    tag: "Allié",
    faction: "Réseau criminel",
    status: "Confirmé officiellement",
    color: "#FBBF24",
    image: `${WIKI_CDN}/9/9a/OfficialScreenshots-GTAVI-PromotionalWebsite-CalHampton-SS4.jpg/revision/latest?cb=20250506161757`,
    desc: "Personnage secondaire confirmé dans les screenshots officiels de GTA VI. Cal Hampton fait partie du réseau d'alliés et de contacts de Lucia et Jason dans l'État de Leonida. Détails supplémentaires à venir dès la sortie du jeu.",
  },
  {
    name: "Boobie Ike",
    subtitle: "Personnage secondaire",
    tag: "Contact",
    faction: "Vice City",
    status: "Confirmé officiellement",
    color: "#9333EA",
    image: `${WIKI_CDN}/e/e6/OfficialScreenshots-GTAVI-PromotionalWebsite-BoobieIke-SS3.jpg/revision/latest?cb=20250506161747`,
    desc: "Personnage secondaire confirmé par Rockstar Games dans les screenshots officiels de mai 2025. Boobie Ike évolue dans le milieu criminel de Vice City et croise le chemin de Lucia et Jason.",
  },
  {
    name: "Dre'Quan Priest",
    subtitle: "Personnage secondaire",
    tag: "Contact",
    faction: "Vice City",
    status: "Confirmé officiellement",
    color: "#22D3EE",
    image: `${WIKI_CDN}/b/b9/OfficialScreenshots-GTAVI-PromotionalWebsite-DreQuanPriest-SS2.jpg/revision/latest?cb=20250506161800`,
    desc: "Personnage secondaire confirmé dans les visuels officiels de GTA VI. Dre'Quan Priest fait partie du cast étendu de personnages rencontrés dans l'aventure de Leonida.",
  },
  {
    name: "Real Dimez",
    subtitle: "Personnage secondaire",
    tag: "Contact",
    faction: "Vice City",
    status: "Confirmé officiellement",
    color: "#10B981",
    image: `${WIKI_CDN}/a/a4/OfficialScreenshots-GTAVI-PromotionalWebsite-RealDimez-SS4.jpg/revision/latest?cb=20250506161828`,
    desc: "Personnage secondaire confirmé par Rockstar Games. Real Dimez fait partie de l'écosystème de personnages de Vice City et de l'État de Leonida.",
  },
  {
    name: "Raul Bautista",
    subtitle: "Personnage secondaire",
    tag: "Allié",
    faction: "Réseau criminel",
    status: "Confirmé officiellement",
    color: "#F87171",
    image: `${WIKI_CDN}/3/39/OfficialScreenshots-GTAVI-PromotionalWebsite-RaulBautista-SS3.jpg/revision/latest?cb=20250506161821`,
    desc: "Personnage secondaire confirmé dans les screenshots officiels. Raul Bautista fait partie du réseau criminel de GTA VI et interagit avec Lucia et Jason.",
  },
  {
    name: "Brian Heder",
    subtitle: "Personnage secondaire",
    tag: "Allié",
    faction: "Leonida Keys",
    status: "Confirmé officiellement",
    color: "#A78BFA",
    image: `${WIKI_CDN}/b/b1/OfficialScreenshots-GTAVI-PromotionalWebsite-BrianHeder-SS1.jpg/revision/latest?cb=20250506161750`,
    desc: "Vétéran du trafic de drogue dans les Leonida Keys. Brian Heder permet à Jason de vivre gratuitement dans une de ses propriétés à Key Lento en échange de services de 'shakedown' (extorsion locale). Il est le lien de Jason avec le monde criminel des Keys avant sa rencontre avec Lucia.",
  },
];

export const GTA6_VEHICLES = [
  { name: "Voiture de sport", tag: "Véhicule", category: "Sport", status: "Aperçu dans les trailers", color: "#FF4444", image: "", desc: "Bolides ultra-rapides pour les courses-poursuites dans les rues de Vice City. Inspirés des supercars les plus performantes, personnalisables dans les garages de l'État de Leonida." },
  { name: "Berline custom", tag: "Véhicule", category: "Berline", status: "Aperçu dans les trailers", color: "#9333EA", image: "", desc: "Berlines modifiées combinant élégance et performances. Idéales pour les déplacements discrets à travers les quartiers de Vice City et les zones rurales de Leonida." },
  { name: "4x4 tout-terrain", tag: "Véhicule", category: "SUV", status: "Aperçu dans les trailers", color: "#22D3EE", image: "", desc: "Véhicules tout-terrain conçus pour les marécages, les Everglades de Leonida et les zones rurales. Robustesse et capacité de franchissement pour les escapades hors des sentiers battus." },
  { name: "Moto sportive", tag: "Véhicule", category: "Moto", status: "Aperçu dans les trailers", color: "#FBBF24", image: "", desc: "Motos de sport ultra-maniables pour se faufiler dans le trafic de Vice City. Vitesse et agilité pour les missions de livraison rapides et les courses urbaines." },
  { name: "Bateau rapide", tag: "Véhicule", category: "Maritime", status: "Aperçu dans les trailers", color: "#10B981", image: "", desc: "Bateaux motorisés pour les courses sur l'océan et les voies navigables de Leonida. Essentiels pour les missions maritimes et l'exploration côtière des Leonida Keys." },
  { name: "Hélicoptère", tag: "Véhicule", category: "Aérien", status: "Aperçu dans les trailers", color: "#3B82F6", image: "", desc: "Hélicoptères confirmés dans l'État de Leonida pour les déplacements aériens rapides à travers la carte. Utilisés par les forces de l'ordre et les criminels." },
];

export const GTA6_WEAPONS = [
  { name: "Pistolet semi-automatique", tag: "Arme à feu", category: "Arme de poing", status: "Confirmé (série GTA)", color: "#F87171", image: "", desc: "Arme de poing polyvalente, indispensable pour les combats rapprochés. Modèle standard utilisé par les criminels et les forces de l'ordre de Leonida." },
  { name: "Fusil d'assaut", tag: "Arme à feu", category: "Fusil", status: "Confirmé (série GTA)", color: "#BF5AF2", image: "", desc: "Fusil d'assaut tactique pour les affrontements à moyenne et longue portée. Polyvalent et puissant, arme de choix pour les missions de braquage." },
  { name: "Fusil de précision", tag: "Arme à feu", category: "Sniper", status: "Confirmé (série GTA)", color: "#22D3EE", image: "", desc: "Fusil de sniper pour les éliminations silencieuses à longue distance. Essentiel pour les missions de reconnaissance et les assassinats ciblés." },
  { name: "Batte de baseball", tag: "Arme de mêlée", category: "Contondante", status: "Confirmé (série GTA)", color: "#FBBF24", image: "", desc: "Arme de mêlée contondante pour les combats au corps à corps. Discrète et efficace, classique de la série GTA." },
  { name: "Couteau tactique", tag: "Arme de mêlée", category: "Lame", status: "Confirmé (série GTA)", color: "#10B981", image: "", desc: "Couteau de combat pour les éliminations discrètes et les approches furtives. Silencieux et mortel, idéal pour les missions d'infiltration." },
  { name: "Explosifs", tag: "Arme lourde", category: "Grenade", status: "Confirmé (série GTA)", color: "#EF4444", image: "", desc: "Grenades et charges explosives pour les destructions de véhicules et les assauts de bâtiments. Polyvalents pour créer le chaos lors des missions." },
];

export const GTA6_LOCATIONS = [
  { name: "Vice City", tag: "Métropole", category: "Ville principale", status: "Confirmé officiellement", color: "#BF5AF2", image: `${WIKI_CDN}/f/fa/OfficialScreenshots-GTAVI-PromotionalWebsite-ViceCity-SS8.jpg/revision/latest?cb=20250506164301`, desc: "Vice City, la métropole néonée inspirée de Miami, est le décor principal de GTA VI. Plages de sable blanc, gratte-ciels scintillants, quartiers chauds et vie nocturne trépidante composent cette ville vibrante et dangereuse. C'est le cœur de l'action de l'État de Leonida." },
  { name: "État de Leonida", tag: "Région", category: "État", status: "Confirmé officiellement", color: "#22D3EE", image: `${WIKI_CDN}/f/fa/OfficialScreenshots-GTAVI-PromotionalWebsite-ViceCity-SS8.jpg/revision/latest?cb=20250506164301`, desc: "L'État de Leonida est la reconstitution de la Floride par Rockstar Games. Zones rurales, marécages des Everglades, petites villes côtières et métropoles forment un monde ouvert vaste et diversifié. C'est le cadre global de GTA VI." },
  { name: "Leonida Keys", tag: "Archipel", category: "Îles", status: "Confirmé officiellement", color: "#10B981", image: `${WIKI_CDN}/9/9a/OfficialScreenshots-GTAVI-PromotionalWebsite-LeonidaKeys-SS1.jpg/revision/latest?cb=20250506164232`, desc: "Les Leonida Keys, inspirées des Florida Keys, sont un archipel tropical où Jason Duval travaille pour des trafiquants de drogue locaux. Key Lento, la résidence de Jason chez Brian Heder, se trouve dans cette région." },
  { name: "Port Gellhorn", tag: "Ville", category: "Zone urbaine", status: "Confirmé officiellement", color: "#FBBF24", image: `${WIKI_CDN}/0/0d/OfficialScreenshots-GTAVI-PromotionalWebsite-PortGellhorn-SS1.jpg/revision/latest?cb=20250506164248`, desc: "Port Gellhorn est l'une des villes confirmées dans les screenshots officiels de mai 2025. Cette zone urbaine fait partie de l'État de Leonida et propose ses propres activités et missions." },
  { name: "Ambrosia", tag: "Lieu", category: "Zone rurale", status: "Confirmé officiellement", color: "#9333EA", image: `${WIKI_CDN}/4/40/OfficialScreenshots-GTAVI-PromotionalWebsite-Ambrosia-SS1.jpg/revision/latest?cb=20250506164219`, desc: "Ambrosia est une zone confirmée dans les screenshots officiels de GTA VI. Située dans l'État de Leonida, elle fait partie des environnements ruraux et naturels explorables." },
  { name: "Grassrivers", tag: "Lieu", category: "Zone naturelle", status: "Confirmé officiellement", color: "#3B82F6", image: `${WIKI_CDN}/6/61/OfficialScreenshots-GTAVI-PromotionalWebsite-Grassrivers-SS4.jpg/revision/latest?cb=20250506164231`, desc: "Grassrivers est une zone naturelle confirmée dans les visuels officiels. Inspirée des Everglades floridiens, elle propose des environnements marécageux navigables avec une faune et une flore riches." },
  { name: "Mount Kalaga National Park", tag: "Parc national", category: "Zone naturelle", status: "Confirmé officiellement", color: "#F87171", image: `${WIKI_CDN}/e/e2/OfficialScreenshots-GTAVI-PromotionalWebsite-MountKalaga-SS6.jpg/revision/latest?cb=20250506164245`, desc: "Le Mount Kalaga National Park est un parc national confirmé dans les screenshots officiels. Zone naturelle protégée de l'État de Leonida, offrant des paysages montagneux et forestiers." },
];

export const GTA6_WIKI_SECTIONS = [
  { id: "maps", label: "Cartes & Lieux", desc: "Vice City, Leonida Keys, Port Gellhorn, Ambrosia, Grassrivers, Mount Kalaga", color: "#22D3EE" },
  { id: "vehicles", label: "Véhicules & Armes", desc: "Collection complète des véhicules et armes confirmés", color: "#FBBF24" },
  { id: "missions", label: "Guides de Missions", desc: "Astuces, missions principales et secondaires", color: "#BF5AF2" },
];