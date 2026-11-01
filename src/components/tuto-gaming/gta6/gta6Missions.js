// GTA VI - Guides de Missions & Activités
// Sources : GTA Wiki (Fandom) + site officiel Rockstar Games
// Structure prête à l'emploi pour les guides post-sortie

export const GTA6_MISSIONS = [
  {
    name: "Braquages & Heists",
    tag: "Guide",
    category: "Activités criminelles",
    status: "Structure prête",
    color: "#BF5AF2",
    desc: "Système de braquages à plusieurs étapes inspiré de GTA V mais enrichi. Lucia et Jason planifient et exécutent des braquages de banques, de convois et de magasins à travers Vice City et l'État de Leonida. Le choix du personnage actif influence l'approche (furtive ou frontale).",
    specs: {
      Type: "Braquage",
      "Mécanique": "Planification + exécution",
      "Approches": "Furtive (Stealth) / Frontale (Loud)",
      "Personnages": "Lucia (moteur) + Jason (frein)",
    },
    tips: "Préparez vos armes et véhicules de fuite avant le braquage. Le système de profil criminel de GTA VI signifie que la police vous reconnaîtra plus vite si vous avez un historique. Utilisez le changement de personnage pour couvrir plusieurs angles.",
  },
  {
    name: "Trafic & Contrebande",
    tag: "Guide",
    category: "Activités criminelles",
    status: "Structure prête",
    color: "#10B981",
    desc: "Activités de trafic de drogue dans les Leonida Keys, inspirées du background de Jason (travail pour des trafiquants locaux). Missions de livraison maritime, de transport terrestre et de gestion de territoire dans l'archipel tropical.",
    specs: {
      Type: "Trafic / Logistique",
      Zone: "Leonida Keys + Port Gellhorn",
      "Véhicules": "Bateaux, pickups, berlines",
      "Récompense": "Argent + réputation criminelle",
    },
    tips: "Utilisez les bateaux rapides pour les livraisons maritimes entre les Keys. Évitez les routes principales de Vice City avec de la contrebande. Le Port Gellhorn est idéal pour les importations discrètes.",
  },
  {
    name: "Courses-poursuites & Évasion",
    tag: "Guide",
    category: "Mécaniques de gameplay",
    status: "Structure prête",
    color: "#EF4444",
    desc: "Système de wanted level (niveau de recherche) enrichi avec le nouveau profil criminel. La police de Leonida adapte sa réponse à votre historique criminel. Les poursuites peuvent se faire en voiture, en bateau, en moto ou en hélicoptère.",
    specs: {
      Type: "Évasion / Poursuite",
      "Niveaux": "1-5 étoiles (système classique)",
      "Nouvelle mécanique": "Profil criminel adaptatif",
      "Zones de fuite": "Urbain, maritime, aérien, marécageux",
    },
    tips: "Le profil criminel influence la vitesse de reconnaissance par la police. Changez de véhicule et de zone (urbain → rural → maritime) pour semer vos poursuivants. Les Everglades (Grassrivers) sont une zone de fuite idéale en airboat.",
  },
  {
    name: "Activités Annexes",
    tag: "Guide",
    category: "Mondes ouverts",
    status: "Structure prête",
    color: "#22D3EE",
    desc: "Activités secondaires confirmées par les trailers : réseaux sociaux intégrés (tiktok/instagram-like), vie nocturne à Vice City, faune sauvage (alligators dans les Everglades), plages, sports et culture urbaine. Le Trailer 1 montre des scènes de la vie floridienne (alligator dans un supermarché, femme twerking sur une voiture, homme nu jardinant).",
    specs: {
      Type: "Activités secondaires",
      "Réseaux sociaux": "Intégré au gameplay",
      "Faune": "Alligators, oiseaux, serpents",
      "Vie nocturne": "Boîtes, plages, divertissement",
    },
    tips: "Les activités annexes rapportent de l'argent et de l'influence sociale. Explorez les plages d'Ocean Beach et les rues de Little Cuba pour des rencontres aléatoires inspirées de la culture floridienne.",
  },
  {
    name: "Système de Relation (Lucia & Jason)",
    tag: "Guide",
    category: "Mécaniques de gameplay",
    status: "Confirmé officiellement",
    color: "#FF69B4",
    desc: "Le Relationship System permet au joueur de déterminer si la relation entre Lucia et Jason est platonique ou romantique. Les choix de dialogue et d'action influencent cette dynamique. Rockstar décrit Lucia comme le 'moteur' et Jason comme le 'frein' : ils se complètent et se poussent mutuellement tout au long de l'histoire.",
    specs: {
      Type: "Relation narrative",
      "Personnages": "Lucia Caminos + Jason Duval",
      "Options": "Platonique ou romantique",
      "Influence": "Choix de dialogue + actions",
    },
    tips: "Vos choix de dialogue et d'action pendant les missions influencent la dynamique entre les deux protagonistes. Le changement de personnage à la volée permet d'aborder les situations différemment selon qui vous contrôlez.",
  },
  {
    name: "Exploration & Secrets de la Carte",
    tag: "Guide",
    category: "Mondes ouverts",
    status: "Structure prête",
    color: "#FBBF24",
    desc: "La carte de Leonida est la plus vaste de l'histoire de la série GTA. Secrets cachés dans les marécages des Everglades, les montagnes du Mount Kalaga National Park, les îles des Leonida Keys et les ruelles de Vice City. Le Trailer 1 contient 46 scènes dont 7 sont des références directes à des événements réels floridiens.",
    specs: {
      Type: "Exploration",
      "Taille de la carte": "Plus vaste de la série",
      "Zones": "Urbain, rural, maritime, marécageux, montagneux",
      "Secrets": "Références à la culture floridienne",
    },
    tips: "Utilisez les hélicoptères pour repérer les points d'intérêt depuis le ciel. Les marécages de Grassrivers cachent des secrets liés à la faune sauvage. Les Leonida Keys recèlent des trésors immergés.",
  },
];

export const GTA6_WIKI_SECTIONS = [
  { id: "maps", label: "Cartes & Lieux", desc: "Vice City, Leonida Keys, Port Gellhorn, Ambrosia, Grassrivers, Mount Kalaga", color: "#22D3EE" },
  { id: "vehicles", label: "Véhicules & Armes", desc: "Collection complète des véhicules et armes confirmés", color: "#FBBF24" },
  { id: "missions", label: "Guides de Missions", desc: "Braquages, trafic, évasion, activités annexes et secrets", color: "#BF5AF2" },
];