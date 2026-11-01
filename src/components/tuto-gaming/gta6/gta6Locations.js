// GTA VI - Lieux & Monde de l'État de Leonida
// Sources : GTA Wiki (Fandom) + site officiel Rockstar Games
// https://gta.fandom.com/wiki/Vice_City_(HD_Universe)
// https://gta.fandom.com/wiki/State_of_Leonida

import { WIKI_CDN } from "./gta6Core";

const SS = (path, cb) =>
  `${WIKI_CDN}/${path}/revision/latest?cb=${cb}`;

export const GTA6_LOCATIONS = [
  {
    name: "Vice City",
    tag: "Métropole",
    category: "Ville principale",
    status: "Confirmé officiellement",
    color: "#BF5AF2",
    image: SS("f/fa/OfficialScreenshots-GTAVI-PromotionalWebsite-ViceCity-SS8.jpg", "20250506164301"),
    gallery: [
      SS("f/fa/OfficialScreenshots-GTAVI-PromotionalWebsite-ViceCity-SS8.jpg", "20250506164301"),
      SS("f/f3/OfficialScreenshots-GTAVI-PromotionalWebsite-LuciaCaminos-SS1.jpg", "20250506161813"),
      SS("e/e6/OfficialScreenshots-GTAVI-PromotionalWebsite-BoobieIke-SS3.jpg", "20250506161747"),
    ],
    desc: `Vice City, la métropole néonée inspirée de Miami, est le décor principal de GTA VI. Description officielle Rockstar : "EVERYTHING IN EXCESS. We're a long way from the '80s, but Vice City is still the sun and fun capital of America. The glamour, hustle, and greed of America captured in a single city." Chaque quartier offre quelque chose : les hôtels art deco pastel et les plages blanches d'Ocean Beach, les panaderías animées de Little Cuba, les contrefaçons du marché aux puces Tisha-Wocka, et le VC Port, capitale mondiale des croisières. C'est le cœur de l'action de l'État de Leonida.`,
    specs: {
      Type: "Métropole",
      Inspiration: "Miami, Floride",
      Taille: "Très grande",
      Comté: "Vice-Dale County",
    },
    districts: [
      { name: "Ocean Beach", desc: "Hôtels art deco pastel, plages de sable blanc. Quartier touristique emblématique." },
      { name: "Little Cuba", desc: "Quartier cubain animé avec panaderías et culture latine. Cœur culturel de Vice City." },
      { name: "Tisha-Wocka", desc: "Marché aux puces connu pour ses contrefaçons et son commerce de rue." },
      { name: "VC Port", desc: "Port de croisière, capitale mondiale des croisières. Zone industrielle et logistique." },
    ],
    tips: "Explorez Ocean Beach pour les missions de plage et Little Cuba pour les contacts criminels. Le VC Port est idéal pour les braquages de marchandises.",
  },
  {
    name: "État de Leonida",
    tag: "Région",
    category: "État",
    status: "Confirmé officiellement",
    color: "#22D3EE",
    image: SS("f/fa/OfficialScreenshots-GTAVI-PromotionalWebsite-ViceCity-SS8.jpg", "20250506164301"),
    gallery: [
      SS("f/fa/OfficialScreenshots-GTAVI-PromotionalWebsite-ViceCity-SS8.jpg", "20250506164301"),
      SS("4/40/OfficialScreenshots-GTAVI-PromotionalWebsite-Ambrosia-SS1.jpg", "20250506164219"),
      SS("0/0d/OfficialScreenshots-GTAVI-PromotionalWebsite-PortGellhorn-SS1.jpg", "20250506164248"),
      SS("e/e2/OfficialScreenshots-GTAVI-PromotionalWebsite-MountKalaga-SS6.jpg", "20250506164245"),
    ],
    desc: `L'État de Leonida est la reconstitution de la Floride par Rockstar Games. Description officielle : "Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond." Zones urbaines, rurales, marécageuses et côtières forment un monde ouvert vaste et diversifié. C'est le cadre global de GTA VI, incluant Vice City, les Leonida Keys, Port Gellhorn, Ambrosia, Grassrivers et le Mount Kalaga National Park.`,
    specs: {
      Type: "État",
      Inspiration: "Floride, États-Unis",
      Taille: "Plus vaste carte de la série GTA",
      Comtés: "Vice-Dale County + autres",
    },
    tips: "La carte est la plus grande de l'histoire de la série GTA. Utilisez les hélicoptères et bateaux pour explorer les zones difficiles d'accès comme les marécages et les îles.",
  },
  {
    name: "Leonida Keys",
    tag: "Archipel",
    category: "Îles",
    status: "Confirmé officiellement",
    color: "#10B981",
    image: SS("9/9a/OfficialScreenshots-GTAVI-PromotionalWebsite-LeonidaKeys-SS1.jpg", "20250506164232"),
    gallery: [
      SS("9/9a/OfficialScreenshots-GTAVI-PromotionalWebsite-LeonidaKeys-SS1.jpg", "20250506164232"),
      SS("c/c9/OfficialScreenshots-GTAVI-PromotionalWebsite-JasonDuval-SS5.jpg", "20250506161810"),
    ],
    desc: `Les Leonida Keys, inspirées des Florida Keys, sont un archipel tropical où Jason Duval travaille pour des trafiquants de drogue locaux. Key Lento, la résidence de Jason chez Brian Heder, se trouve dans cette région. Les Keys sont le point de départ de l'histoire de Jason avant sa rencontre avec Lucia. Description du site officiel : "Another day in paradise, right?"`,
    specs: {
      Type: "Archipel tropical",
      Inspiration: "Florida Keys",
      Activité: "Trafic maritime de drogue",
      "Lieu clé": "Key Lento (safehouse de Jason)",
    },
    tips: "Les Keys sont idéales pour les missions maritimes. Utilisez des bateaux rapides pour échapper aux poursuites sur l'océan. Key Lento sert de point de chute initial.",
  },
  {
    name: "Port Gellhorn",
    tag: "Ville",
    category: "Zone urbaine",
    status: "Confirmé officiellement",
    color: "#FBBF24",
    image: SS("0/0d/OfficialScreenshots-GTAVI-PromotionalWebsite-PortGellhorn-SS1.jpg", "20250506164248"),
    gallery: [
      SS("0/0d/OfficialScreenshots-GTAVI-PromotionalWebsite-PortGellhorn-SS1.jpg", "20250506164248"),
    ],
    desc: `Port Gellhorn est l'une des villes confirmées dans les screenshots officiels de mai 2025. Cette zone urbaine fait partie de l'État de Leonida et propose ses propres activités et missions. Inspirée des ports industriels floridiens, c'est une zone stratégique pour le commerce et la contrebande.`,
    specs: {
      Type: "Ville portuaire",
      Inspiration: "Port industriel floridien",
      Taille: "Moyenne",
      Activité: "Commerce, contrebande",
    },
    tips: "Zone industrielle avec de nombreuses opportunités de braquages. Attention aux patrouilles de police plus denses dans le port.",
  },
  {
    name: "Ambrosia",
    tag: "Lieu",
    category: "Zone rurale",
    status: "Confirmé officiellement",
    color: "#9333EA",
    image: SS("4/40/OfficialScreenshots-GTAVI-PromotionalWebsite-Ambrosia-SS1.jpg", "20250506164219"),
    gallery: [
      SS("4/40/OfficialScreenshots-GTAVI-PromotionalWebsite-Ambrosia-SS1.jpg", "20250506164219"),
    ],
    desc: `Ambrosia est une zone confirmée dans les screenshots officiels de GTA VI. Située dans l'État de Leonida, elle fait partie des environnements ruraux et naturels explorables. Inspirée de la campagne floridienne, avec ses paysages vallonnés et ses fermes.`,
    specs: {
      Type: "Zone rurale",
      Inspiration: "Campagne floridienne",
      Taille: "Grande",
    },
    tips: "Zone idéale pour se cacher des étoiles de recherche. Les routes rurales permettent des courses-poursuites spectaculaires loin de la police urbaine.",
  },
  {
    name: "Grassrivers",
    tag: "Lieu",
    category: "Zone naturelle",
    status: "Confirmé officiellement",
    color: "#3B82F6",
    image: SS("6/61/OfficialScreenshots-GTAVI-PromotionalWebsite-Grassrivers-SS4.jpg", "20250506164231"),
    gallery: [
      SS("6/61/OfficialScreenshots-GTAVI-PromotionalWebsite-Grassrivers-SS4.jpg", "20250506164231"),
    ],
    desc: `Grassrivers est une zone naturelle confirmée dans les visuels officiels. Inspirée des Everglades floridiens, elle propose des environnements marécageux navigables avec une faune et une flore riches. Le Trailer 1 montre un alligator de 9 pieds retiré d'une piscine familiale et un alligator se promenant dans un supermarché, confirmant la présence de la faune sauvage floridienne.`,
    specs: {
      Type: "Marécage / Everglades",
      Inspiration: "Everglades, Floride",
      Faune: "Alligators, oiseaux, serpents",
      Navigation: "Bateaux à fond plat, hydroglisseurs",
    },
    tips: "Utilisez un hydroglisseur ou un bateau à fond plat. Attention à la faune sauvage dangereuse dans les marécages. Les alligators sont confirmés dans le gameplay.",
  },
  {
    name: "Mount Kalaga National Park",
    tag: "Parc national",
    category: "Zone naturelle",
    status: "Confirmé officiellement",
    color: "#F87171",
    image: SS("e/e2/OfficialScreenshots-GTAVI-PromotionalWebsite-MountKalaga-SS6.jpg", "20250506164245"),
    gallery: [
      SS("e/e2/OfficialScreenshots-GTAVI-PromotionalWebsite-MountKalaga-SS6.jpg", "20250506164245"),
    ],
    desc: `Le Mount Kalaga National Park est un parc national confirmé dans les screenshots officiels. Zone naturelle protégée de l'État de Leonida, offrant des paysages montagneux et forestiers. Inspiré des parcs nationaux floridiens et de la chaîne des Appalacholes au nord de la Floride.`,
    specs: {
      Type: "Parc national",
      Inspiration: "Parcs naturels floridiens",
      Taille: "Grande",
      Activités: "Randonnée, chasse, exploration",
    },
    tips: "Idéal pour les missions de chasse et de randonnée. Les sentiers forestiers offrent des raccourcis stratégiques et des zones de embuscade.",
  },
];