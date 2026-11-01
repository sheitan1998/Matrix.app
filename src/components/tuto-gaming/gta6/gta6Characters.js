// GTA VI - Personnages confirmés
// Sources : GTA Wiki (Fandom) + site officiel Rockstar Games
// https://gta.fandom.com/wiki/Lucia_Caminos
// https://gta.fandom.com/wiki/Jason_Duval

import { WIKI_CDN } from "./gta6Core";

const SS = (path, cb) =>
  `${WIKI_CDN}/${path}/revision/latest?cb=${cb}`;

export const GTA6_CHARACTERS = [
  {
    name: "Lucia Caminos",
    subtitle: "Protagoniste",
    tag: "Personnage principal",
    faction: "Criminelle indépendante",
    status: "Confirmé officiellement",
    color: "#FF69B4",
    image: SS("f/f3/OfficialScreenshots-GTAVI-PromotionalWebsite-LuciaCaminos-SS1.jpg", "20250506161813"),
    gallery: [
      SS("f/f3/OfficialScreenshots-GTAVI-PromotionalWebsite-LuciaCaminos-SS1.jpg", "20250506161813"),
      SS("f/fa/OfficialScreenshots-GTAVI-PromotionalWebsite-ViceCity-SS8.jpg", "20250506164301"),
    ],
    desc: `Née à Liberty City, Lucia est la première protagoniste féminine de la série GTA avec un rôle entièrement doué. Son père lui a appris à se battre dès son plus jeune âge ("Life has been coming at her swinging ever since"). Incarcérée à la Leonida Penitentiary après avoir défendu sa famille, elle est sortie de prison par chance ("Sheer luck got her out"). Elle voit en Jason une opportunité de changer sa vie et d'offrir à sa mère la vie dont elle a toujours rêvé depuis leurs jours à Liberty City. Inspirée de Bonnie Parker (Bonnie & Clyde).`,
    quote: "La seule chose qui compte, c'est qui tu connais et ce que tu as.",
    specs: {
      Origine: "Liberty City",
      Rôle: "Protagoniste",
      Inspiration: "Bonnie Parker",
      Doublage: "Confirmé (VO)",
      Incarcération: "Leonida Penitentiary",
    },
  },
  {
    name: "Jason Duval",
    subtitle: "Protagoniste",
    tag: "Personnage principal",
    faction: "Criminel indépendant",
    status: "Confirmé officiellement",
    color: "#4FC3F7",
    image: SS("c/c9/OfficialScreenshots-GTAVI-PromotionalWebsite-JasonDuval-SS5.jpg", "20250506161810"),
    gallery: [
      SS("c/c9/OfficialScreenshots-GTAVI-PromotionalWebsite-JasonDuval-SS5.jpg", "20250506161810"),
      SS("9/9a/OfficialScreenshots-GTAVI-PromotionalWebsite-LeonidaKeys-SS1.jpg", "20250506164232"),
    ],
    desc: `Ancien militaire de l'US Army, Jason a grandi parmi les escrocs et les petits délinquants ("Jason grew up around grifters and crooks"). Après son service militaire pour échapper à son adolescence troublée, il s'est installé dans les Leonida Keys où il travaille pour des trafiquants de drogue locaux. Il vit gratuitement dans une propriété de Brian Heder à Key Lento en échange de services de "shakedown" (extorsion locale). Sa rencontre avec Lucia pourrait être la meilleure ou la pire chose qui lui soit arrivée. Rockstar décrit Lucia comme le "moteur" et Jason comme le "frein" de leur partenariat. Le joueur peut déterminer si leur relation est platonique ou romantique via le Relationship System.`,
    quote: "S'il arrive quoi que ce soit, je suis juste derrière toi.",
    specs: {
      Origine: "Leonida Keys",
      Rôle: "Protagoniste",
      "Ancien métier": "US Army",
      Résidence: "Key Lento (chez Brian Heder)",
      Inspiration: "Clyde Barrow",
    },
  },
  {
    name: "Cal Hampton",
    subtitle: "Personnage secondaire",
    tag: "Allié",
    faction: "Réseau criminel",
    status: "Confirmé officiellement",
    color: "#FBBF24",
    image: SS("9/9a/OfficialScreenshots-GTAVI-PromotionalWebsite-CalHampton-SS4.jpg", "20250506161757"),
    gallery: [
      SS("9/9a/OfficialScreenshots-GTAVI-PromotionalWebsite-CalHampton-SS4.jpg", "20250506161757"),
    ],
    desc: `Personnage secondaire confirmé dans les screenshots officiels de GTA VI. Cal Hampton fait partie du réseau d'alliés et de contacts de Lucia et Jason dans l'État de Leonida. Son rôle exact n'a pas encore été détaillé par Rockstar Games, mais il apparaît dans le matériel promotionnel officiel de mai 2025.`,
    specs: {
      Rôle: "Allié",
      Faction: "Réseau criminel",
      "Source": "Screenshot officiel (mai 2025)",
    },
  },
  {
    name: "Boobie Ike",
    subtitle: "Personnage secondaire",
    tag: "Contact",
    faction: "Vice City",
    status: "Confirmé officiellement",
    color: "#9333EA",
    image: SS("e/e6/OfficialScreenshots-GTAVI-PromotionalWebsite-BoobieIke-SS3.jpg", "20250506161747"),
    gallery: [
      SS("e/e6/OfficialScreenshots-GTAVI-PromotionalWebsite-BoobieIke-SS3.jpg", "20250506161747"),
    ],
    desc: `Personnage secondaire confirmé par Rockstar Games dans les screenshots officiels de mai 2025. Boobie Ike évolue dans le milieu criminel de Vice City et croise le chemin de Lucia et Jason. Son design suggère un personnage lié au monde du divertissement ou de la nuit à Vice City.`,
    specs: {
      Rôle: "Contact",
      Faction: "Vice City",
      "Source": "Screenshot officiel (mai 2025)",
    },
  },
  {
    name: "Dre'Quan Priest",
    subtitle: "Personnage secondaire",
    tag: "Contact",
    faction: "Vice City",
    status: "Confirmé officiellement",
    color: "#22D3EE",
    image: SS("b/b9/OfficialScreenshots-GTAVI-PromotionalWebsite-DreQuanPriest-SS2.jpg", "20250506161800"),
    gallery: [
      SS("b/b9/OfficialScreenshots-GTAVI-PromotionalWebsite-DreQuanPriest-SS2.jpg", "20250506161800"),
    ],
    desc: `Personnage secondaire confirmé dans les visuels officiels de GTA VI. Dre'Quan Priest fait partie du cast étendu de personnages rencontrés dans l'aventure de Leonida. Son apparence suggère un lien avec le monde de la rue et de la culture urbaine de Vice City.`,
    specs: {
      Rôle: "Contact",
      Faction: "Vice City",
      "Source": "Screenshot officiel (mai 2025)",
    },
  },
  {
    name: "Real Dimez",
    subtitle: "Personnage secondaire",
    tag: "Contact",
    faction: "Vice City",
    status: "Confirmé officiellement",
    color: "#10B981",
    image: SS("a/a4/OfficialScreenshots-GTAVI-PromotionalWebsite-RealDimez-SS4.jpg", "20250506161828"),
    gallery: [
      SS("a/a4/OfficialScreenshots-GTAVI-PromotionalWebsite-RealDimez-SS4.jpg", "20250506161828"),
    ],
    desc: `Personnage secondaire confirmé par Rockstar Games. Real Dimez fait partie de l'écosystème de personnages de Vice City et de l'État de Leonida. Détails sur son rôle exact à venir dès la sortie du jeu.`,
    specs: {
      Rôle: "Contact",
      Faction: "Vice City",
      "Source": "Screenshot officiel (mai 2025)",
    },
  },
  {
    name: "Raul Bautista",
    subtitle: "Personnage secondaire",
    tag: "Allié",
    faction: "Réseau criminel",
    status: "Confirmé officiellement",
    color: "#F87171",
    image: SS("3/39/OfficialScreenshots-GTAVI-PromotionalWebsite-RaulBautista-SS3.jpg", "20250506161821"),
    gallery: [
      SS("3/39/OfficialScreenshots-GTAVI-PromotionalWebsite-RaulBautista-SS3.jpg", "20250506161821"),
    ],
    desc: `Personnage secondaire confirmé dans les screenshots officiels. Raul Bautista fait partie du réseau criminel de GTA VI et interagit avec Lucia et Jason. Son apparence suggère un personnage expérimenté dans le monde du braquage et du crime organisé.`,
    specs: {
      Rôle: "Allié",
      Faction: "Réseau criminel",
      "Source": "Screenshot officiel (mai 2025)",
    },
  },
  {
    name: "Brian Heder",
    subtitle: "Personnage secondaire",
    tag: "Allié",
    faction: "Leonida Keys",
    status: "Confirmé officiellement",
    color: "#A78BFA",
    image: SS("b/b1/OfficialScreenshots-GTAVI-PromotionalWebsite-BrianHeder-SS1.jpg", "20250506161750"),
    gallery: [
      SS("b/b1/OfficialScreenshots-GTAVI-PromotionalWebsite-BrianHeder-SS1.jpg", "20250506161750"),
    ],
    desc: `Vétéran du trafic de drogue dans les Leonida Keys. Brian Heder permet à Jason de vivre gratuitement dans une de ses propriétés à Key Lento en échange de services de "shakedown" (extorsion locale). Il est le lien de Jason avec le monde criminel des Keys avant sa rencontre avec Lucia. Son rôle s'apparente à un mentor criminel pour Jason dans la région des Keys.`,
    specs: {
      Rôle: "Allié / Mentor",
      Faction: "Leonida Keys",
      Activité: "Trafic de drogue",
      Résidence: "Key Lento",
    },
  },
];