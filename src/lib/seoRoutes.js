export const SITE_URL = "https://matrix-hub.app";
export const SITE_NAME = "Matrix Hub";
export const DEFAULT_IMAGE =
  "https://media.base44.com/images/public/69e14a987a927963a9924d5a/d423a042e_Code_Generated_Image1.png";

/**
 * Titres et descriptions uniques par route publique.
 * Format du titre : "[Nom de la page] — Matrix Hub".
 */
const ROUTES = {
  "/": {
    title: "Matrix Hub — Streaming, gaming et communauté en ligne",
    description:
      "Matrix Hub réunit streaming YouTube et Twitch, serveurs de jeu Nexus et Discord, création de contenu, mini-jeux et communauté gaming francophone sur une seule plateforme.",
  },
  "/best-serveurs": {
    title: "Best Serveur — Annuaire des serveurs de jeu | Matrix Hub",
    description:
      "Classement et annuaire des meilleurs serveurs de jeu francophones : serveurs Nexus et Discord, catégories, votes, recrutement de joueurs et petites annonces communautaires.",
  },
  "/best-creator": {
    title: "Best Creator — Classement des créateurs YouTube et Twitch | Matrix Hub",
    description:
      "Découvrez et votez pour les meilleurs créateurs de contenu YouTube, Twitch, TikTok, Instagram et Snapchat. Classements mensuels, boosts et chaînes à explorer sur Matrix Hub.",
  },
  "/nexus-game": {
    title: "Nexus Game — Jeux en ligne et casino virtuel | Matrix Hub",
    description:
      "Explorez le catalogue Nexus Game : roulette, machines à sous, blackjack, tickets à gratter et centaines de jeux HTML5 jouables directement sur Matrix Hub, avec la monnaie virtuelle TRIX.",
  },
  "/stream": {
    title: "Streaming vidéo et live | Matrix Hub",
    description:
      "Regardez des vidéos, des shorts et des streams en direct, créez votre chaîne et montez vos vidéos avec le studio intégré de Matrix Hub.",
  },
  "/twitch": {
    title: "Twitch en direct sur Matrix Hub",
    description:
      "Suivez vos streams Twitch préférés, explorez les catégories et discutez avec la communauté francophone directement sur Matrix Hub.",
  },
  "/nexus": {
    title: "Nexus — Salons et communauté gaming | Matrix Hub",
    description:
      "Rejoignez les serveurs Nexus de Matrix Hub : salons textuels et vocaux, rôles personnalisés, forums et modération communautaire pour les gamers francophones.",
  },
  "/shorts": {
    title: "Shorts — Clips courts et viraux | Matrix Hub",
    description:
      "Scrollez les Shorts Matrix Hub : clips gaming, extraits de streams et vidéos courtes de la communauté créative francophone.",
  },
  "/tuto-gaming": {
    title: "Tuto Gaming Entraide — Guides, wikis et astuces de jeux | Matrix Hub",
    description:
      "Guides, tutoriels, wikis collaboratifs et bases de données pour vos jeux préférés : Farming Simulator, Fortnite, Minecraft, Dofus et bien plus sur Matrix Hub.",
  },
  "/farming": {
    title: "Farming Simulator 25 — Mods, guides et tutoriels | Matrix Hub",
    description:
      "Téléchargez des mods Farming Simulator 25, consultez les tutoriels, catégories et astuces de la communauté Matrix Hub pour progresser dans le jeu.",
  },
  "/minecraft": {
    title: "Minecraft — Mods, encyclopédie et guides | Matrix Hub",
    description:
      "Explorez Minecraft sur Matrix Hub : catalogue de mods Modrinth, encyclopédie de blocs, recettes de fabrication et guides d'entraide communautaires.",
  },
  "/dofus": {
    title: "Dofus — Stuff builder, classes, quêtes et guides | Matrix Hub",
    description:
      "Optimisez votre personnage Dofus : bâtisseur de stuff, caractéristiques, classes, sorts, quêtes, almanax et cartes du monde sur Matrix Hub.",
  },
  "/rocket-league": {
    title: "Rocket League — Boutique, presets et statistiques | Matrix Hub",
    description:
      "Suivez la boutique Rocket League, créez vos presets de voiture, explorez le catalogue d'objets et les statistiques de rang sur Matrix Hub.",
  },
  "/valheim": {
    title: "Valheim — Guides, boss, équipement et seeds | Matrix Hub",
    description:
      "Guides Valheim, boss, équipements, ressources et partage de seeds : trouvez la carte idéale et progressez avec la communauté Matrix Hub.",
  },
  "/rust": {
    title: "Rust — Guides, raids et serveurs | Matrix Hub",
    description:
      "Calculez vos raids, consultez les guides de base, les serveurs et les ressources Rust pour survivre et progresser plus vite sur Matrix Hub.",
  },
  "/valorant": {
    title: "Valorant — Agents, armes et guides | Matrix Hub",
    description:
      "Fiches des agents, statistiques d'armes, cartes et guides Valorant pour préparer vos parties et progresser en compétition sur Matrix Hub.",
  },
  "/gta-6": {
    title: "GTA VI — Actualités, véhicules et guides | Matrix Hub",
    description:
      "Tout sur GTA VI : actualités, véhicules, personnages, armes, lieux et guides de la communauté Matrix Hub avant la sortie du jeu.",
  },
  "/fortnite-maps": {
    title: "Fortnite Maps — Codes de maps créatives | Matrix Hub",
    description:
      "Trouvez les meilleurs codes de maps Fortnite : tycoon, horreur, deathrun, parkour, RPG et Battle Royale, avec statistiques et vote communautaire.",
  },
  "/fortnite-shop": {
    title: "Boutique Fortnite du jour — Skins et objets | Matrix Hub",
    description:
      "Découvrez la boutique Fortnite du jour : skins, pioches, dances et packs VBucks, mis à jour quotidiennement sur Matrix Hub.",
  },
  "/fortnite-cosmetics": {
    title: "Cosmétiques Fortnite — Skins, pioches et emotes | Matrix Hub",
    description:
      "Parcourez le catalogue complet des cosmétiques Fortnite : skins, dos, pioches, emotes et raretés, recherchez et votez sur Matrix Hub.",
  },
  "/fortnite-stats": {
    title: "Statistiques Fortnite — Profils et classements | Matrix Hub",
    description:
      "Recherchez les statistiques Fortnite d'un joueur : victoires, K/D, rangs et historique de carrière directement sur Matrix Hub.",
  },
  "/about": {
    title: "À propos de Matrix Hub — Plateforme gaming tout-en-un",
    description:
      "Découvrez la mission de Matrix Hub : réunir streaming, communauté, jeux et outils créatifs pour les créateurs et gamers francophones.",
  },
  "/contact": {
    title: "Contact et support | Matrix Hub",
    description:
      "Contactez l'équipe Matrix Hub pour une question, un partenariat, un problème technique ou une demande liée à la modération de la communauté.",
  },
  "/privacy": {
    title: "Politique de confidentialité et de cookies | Matrix Hub",
    description:
      "Comment Matrix Hub collecte, utilise et protège vos données personnelles : cookies, services connectés, paiements, hébergement et droits des utilisateurs.",
  },
  "/progression": {
    title: "Niveaux, succès et progression | Matrix Hub",
    description:
      "Suivez votre progression Matrix Hub : niveaux, succès, XP, classements et récompenses de la communauté.",
  },
};

/** Routes membres / privées : jamais indexées. */
const NOINDEX_PREFIXES = [
  "/admin",
  "/mon-profil",
  "/profil-createur",
  "/profile",
  "/wallet",
  "/notifications",
  "/oauth",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/mfa",
  "/dashboard",
  "/upload",
  "/studio",
  "/live-bot",
  "/affiliate",
  "/boutique-matrix",
  "/boutique-nexus",
  "/market",
  "/recherche-joueur",
  "/recherche-createur",
  "/playlists",
  "/outils",
  "/video-studio",
  "/subscriptions",
  "/trending",
  "/watch",
  "/live",
  "/channel",
  "/search",
  "/nexus/invite",
  "/auth",
  "/experience",
  "/vue",
];

function titleize(slug) {
  return String(slug || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Détail jeu / serveur / page dynamique : titre construit depuis le slug. */
function resolveDynamic(pathname) {
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] === "tuto-gaming" && parts[1] && !parts[2]) {
    const game = titleize(parts[1]);
    return {
      title: `${game} — Guides, wikis et entraide | Matrix Hub`,
      description: `Guides, tutoriels, wiki collaboratif et astuces ${game} partagés par la communauté Matrix Hub.`,
    };
  }
  if (parts[0] === "tuto-gaming" && parts[2] === "quest") {
    const game = titleize(parts[1]);
    return {
      title: `Quête ${game} — Guide détaillé | Matrix Hub`,
      description: `Guide complet de la quête ${game} sur Matrix Hub : étapes, récompenses et conseils de la communauté.`,
    };
  }
  if (parts[0] === "tuto-gaming" && parts[2] === "wiki") {
    const game = titleize(parts[1]);
    return {
      title: `Wiki ${game} — Fiche et astuces | Matrix Hub`,
      description: `Fiche wiki ${game} sur Matrix Hub : informations, astuces et contributions de la communauté gaming.`,
    };
  }
  if (parts[0] === "servers" && parts[1]) {
    const name = titleize(parts[1]);
    return {
      title: `${name} — Fiche serveur de jeu | Matrix Hub`,
      description: `Découvrez ${name} sur Matrix Hub : description, votes, boosts et informations pour rejoindre ce serveur de jeu.`,
    };
  }
  if (parts[0] === "best-serveurs" && parts[1] === "category" && parts[2]) {
    const cat = titleize(parts[2]);
    return {
      title: `Serveurs ${cat} — Best Serveur | Matrix Hub`,
      description: `Annuaire des serveurs de jeu ${cat} classés par votes sur Matrix Hub : descriptions, liens et recrutement de joueurs.`,
    };
  }
  if (parts[0] === "creator" && parts[1]) {
    const name = titleize(parts[1]);
    return {
      title: `${name} — Profil créateur | Matrix Hub`,
      description: `Profil public de ${name} sur Matrix Hub : chaînes, contenus et liens de la communauté créative.`,
    };
  }
  return null;
}

/**
 * resolveSeo — renvoie les métadonnées à appliquer pour un chemin donné.
 * Un objet vide laisse simplement les métadonnées globales en place.
 */
export function resolveSeo(pathname) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";

  if (ROUTES[path]) return { ...ROUTES[path], path };

  const dynamic = resolveDynamic(path);
  if (dynamic) return { ...dynamic, path };

  const isPrivate = NOINDEX_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );
  if (isPrivate) {
    return {
      noindex: true,
      path,
      title: "Espace membre — Matrix Hub",
      description: "Espace privé de Matrix Hub, accessible après connexion à votre compte.",
    };
  }

  return {};
}