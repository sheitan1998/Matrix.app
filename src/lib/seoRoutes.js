import { pickOgImage, pickOgImageAlt, ogCategory, OG_BANNERS } from "@/lib/ogImages";

export const SITE_URL = "https://matrix-hub.app";
export const SITE_NAME = "Matrix Hub";
export const SITE_LOCALE = "fr_FR";
export const DEFAULT_IMAGE = OG_BANNERS.home.url;

/**
 * Registre SEO centralisé — une entrée unique par route publique.
 * Chaque page possède un titre, une description et un visuel Open Graph propres.
 * Aucune génération automatique de métadonnées génériques.
 */
const ROUTES = {
  "/": {
    title: "Matrix Hub — Le hub des gamers, streamers et créateurs",
    description:
      "Streaming, serveurs de jeu Nexus et Discord, annuaire Best Serveur, classement Best Creator, guides gaming et mini-jeux réunis sur une seule plateforme communautaire.",
    image: OG_BANNERS.home.url,
  },
  "/best-serveurs": {
    title: "Annuaire de serveurs Discord et Nexus gaming | Matrix Hub",
    description:
      "Trouvez un serveur Discord gaming, une communauté Nexus ou des coéquipiers : catégories, étiquettes, votes mensuels et fiches détaillées de chaque serveur.",
    image: OG_BANNERS.bestServer.url,
  },
  "/best-creator": {
    title: "Best Creator — classement et visibilité des créateurs | Matrix Hub",
    description:
      "Publiez votre chaîne YouTube, Twitch, TikTok, Instagram ou Snapchat, rejoignez le classement mensuel des créateurs et gagnez en visibilité auprès de la communauté gaming.",
    image: OG_BANNERS.bestCreator.url,
  },
  "/tuto-gaming": {
    title: "Guides et tutoriels gaming : wiki, astuces et mods | Matrix Hub",
    description:
      "Guides pas à pas, wikis collaboratifs, astuces et mods pour Farming Simulator 25, Minecraft, Dofus, Fortnite, Rust, Valheim, Valorant et bien d'autres jeux.",
  },
  "/farming": {
    title: "Farming Simulator 25 : mods, guides et catégories | Matrix Hub",
    description:
      "Téléchargez des mods Farming Simulator 25, consultez les tutoriels, les catégories de matériel et les astuces de la communauté pour progresser plus vite.",
  },
  "/minecraft": {
    title: "Minecraft : mods Modrinth, encyclopédie et recettes | Matrix Hub",
    description:
      "Catalogue de mods Modrinth, encyclopédie des blocs, recettes d'artisanat et guides Minecraft réunis dans un seul espace communautaire.",
  },
  "/dofus": {
    title: "Dofus : stuff builder, classes, quêtes et guides | Matrix Hub",
    description:
      "Optimisez votre personnage Dofus : stuff builder, caractéristiques, classes, sorts, quêtes, almanax et cartes du monde dans un outil gratuit.",
  },
  "/rocket-league": {
    title: "Rocket League : boutique, presets et statistiques | Matrix Hub",
    description:
      "Suivez la boutique Rocket League du jour, créez vos presets de voiture, parcourez le catalogue d'objets et consultez vos statistiques de rang.",
  },
  "/valheim": {
    title: "Valheim : guides, boss, équipements et seeds | Matrix Hub",
    description:
      "Guides Valheim, boss, équipements, ressources et partage de seeds : trouvez la carte idéale et progressez avec la communauté Matrix Hub.",
  },
  "/rust": {
    title: "Rust : calculateur de raid, guides et serveurs | Matrix Hub",
    description:
      "Calculez vos raids, lisez les guides de construction de base et trouvez des serveurs et des ressources pour survivre plus longtemps sur Rust.",
  },
  "/valorant": {
    title: "Valorant : agents, armes, cartes et guides | Matrix Hub",
    description:
      "Fiches d'agents, statistiques d'armes, cartes et guides Valorant pour préparer vos matchs et progresser dans les rangs compétitifs.",
  },
  "/gta-6": {
    title: "GTA VI : actualités, véhicules et guides | Matrix Hub",
    description:
      "Tout sur GTA VI : actualités, véhicules, personnages, armes, lieux et guides communautaires à l'approche de la sortie du jeu.",
  },
  "/fortnite-maps": {
    title: "Codes de maps Fortnite créatives | Matrix Hub",
    description:
      "Trouvez les meilleurs codes de maps Fortnite : tycoon, horreur, deathrun, parkour, RPG et battle royale avec statistiques et votes de la communauté.",
  },
  "/fortnite-shop": {
    title: "Boutique Fortnite du jour : skins et objets | Matrix Hub",
    description:
      "Parcourez la boutique Fortnite du jour : skins, pioches, emotes et packs de V-Bucks mis à jour chaque jour sur Matrix Hub.",
  },
  "/fortnite-cosmetics": {
    title: "Cosmétiques Fortnite : skins, pioches et emotes | Matrix Hub",
    description:
      "Explorez le catalogue complet des cosmétiques Fortnite : tenues, sacs à dos, pioches, emotes et raretés, avec recherche et votes communautaires.",
  },
  "/fortnite-stats": {
    title: "Statistiques Fortnite : profils et classements | Matrix Hub",
    description:
      "Consultez les statistiques d'un joueur Fortnite : victoires, ratio éliminations/morts, rangs et historique de carrière directement sur Matrix Hub.",
  },
  "/nexus-game": {
    title: "Nexus Game : jeux en ligne et casino virtuel | Matrix Hub",
    description:
      "Découvrez le catalogue Nexus Game : roulette, machines à sous, blackjack, cartes à gratter et des centaines de jeux HTML5 jouables avec la monnaie virtuelle TRIX.",
    image: OG_BANNERS.nexusGame.url,
  },
  "/nexus": {
    title: "Nexus — serveurs communautaires et salons vocaux | Matrix Hub",
    description:
      "Rejoignez les serveurs Nexus de Matrix Hub : salons textuels et vocaux, rôles personnalisés, forums et modération communautaire pensés pour les gamers.",
    image: OG_BANNERS.nexus.url,
  },
  "/about": {
    title: "À propos de Matrix Hub — la plateforme gaming tout-en-un",
    description:
      "Découvrez la mission de Matrix Hub : réunir le streaming, les communautés de joueurs, les jeux et les outils de création sur une seule plateforme.",
  },
  "/contact": {
    title: "Contact et support — Matrix Hub",
    description:
      "Contactez l'équipe Matrix Hub pour une question, un partenariat, un problème technique ou une demande de modération communautaire.",
  },
  "/privacy": {
    title: "Politique de confidentialité et cookies — Matrix Hub",
    description:
      "Comment Matrix Hub collecte, utilise et protège vos données personnelles : cookies, services connectés, paiements, hébergement et vos droits.",
  },
};

/** Routes membres et techniques : jamais indexées. */
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
  "/stream",
  "/twitch",
  "/shorts",
  "/community/subscription",
  "/progression",
  "/nexus/invite",
  "/auth",
  "/experience",
  "/vue",
];

function titleize(slug) {
  return String(slug || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Fiches dynamiques : métadonnées construites à partir du slug réel. */
function resolveDynamic(parts) {
  if (parts[0] === "tuto-gaming" && parts[1] && !parts[2]) {
    const game = titleize(parts[1]);
    return {
      title: `${game} — guides, wiki et astuces | Matrix Hub`,
      description: `Guides, tutoriels, wiki collaboratif et astuces ${game} partagés par la communauté gaming de Matrix Hub.`,
    };
  }
  if (parts[0] === "tuto-gaming" && parts[2] === "quest") {
    const game = titleize(parts[1]);
    return {
      title: `Quête ${game} — solution pas à pas | Matrix Hub`,
      description: `Solution complète de cette quête ${game} sur Matrix Hub : étapes, récompenses et conseils de la communauté.`,
    };
  }
  if (parts[0] === "tuto-gaming" && parts[2] === "wiki") {
    const game = titleize(parts[1]);
    return {
      title: `Wiki ${game} — fiche et données | Matrix Hub`,
      description: `Fiche wiki ${game} sur Matrix Hub : caractéristiques, statistiques, conseils et contributions de la communauté.`,
    };
  }
  if (parts[0] === "tuto-gaming" && parts[1] === "farming-simulator-25" && parts[2] === "mods") {
    return {
      title: "Mods Farming Simulator 25 — télécharger et installer | Matrix Hub",
      description:
        "Parcourez les mods Farming Simulator 25 sur Matrix Hub : tracteurs, outils, cartes et guides d'installation pour PC et console.",
    };
  }
  if (parts[0] === "tuto-gaming" && parts[1] === "farming-simulator-25" && parts[2]) {
    const category = titleize(parts[2]);
    return {
      title: `Farming Simulator 25 — mods ${category} | Matrix Hub`,
      description: `Mods ${category} pour Farming Simulator 25 : téléchargements, descriptions et notes de la communauté Matrix Hub.`,
    };
  }
  if (parts[0] === "jeu" && parts[1]) {
    const game = titleize(parts[1]);
    return {
      title: `${game} — boutique, quêtes et succès | Matrix Hub`,
      description: `Base de données ${game} sur Matrix Hub : boutique en jeu, quêtes, collections et succès alimentés par des données publiques.`,
    };
  }
  if (parts[0] === "servers" && parts[1]) {
    const name = titleize(parts[1]);
    return {
      title: `${name} — fiche serveur de jeu | Matrix Hub`,
      description: `Découvrez ${name} sur Matrix Hub : description, votes, boosts et informations pour rejoindre ce serveur communautaire.`,
      image: OG_BANNERS.bestServer.url,
    };
  }
  if (parts[0] === "best-serveurs" && parts[1] === "category" && parts[2]) {
    const category = titleize(parts[2]);
    return {
      title: `Serveurs ${category} — classement Best Serveur | Matrix Hub`,
      description: `Annuaire des serveurs ${category} classés par votes sur Matrix Hub : descriptions, liens et recrutement de joueurs.`,
      image: OG_BANNERS.bestServer.url,
    };
  }
  if (parts[0] === "creator" && parts[1]) {
    const name = titleize(parts[1]);
    return {
      title: `${name} — profil créateur | Matrix Hub`,
      description: `Profil public de ${name} sur Matrix Hub : chaînes, contenus et liens de ce créateur de la communauté gaming.`,
      image: OG_BANNERS.bestCreator.url,
    };
  }
  if (parts[0] === "fortnite-maps" && parts[1]) {
    const code = titleize(parts[1]);
    return {
      title: `Map Fortnite ${code} — code créatif et statistiques | Matrix Hub`,
      description: `Map créative Fortnite ${code} sur Matrix Hub : détails de jeu, statistiques, votes des joueurs et code pour la lancer.`,
    };
  }
  if (parts[0] === "fortnite-cosmetics" && parts[1]) {
    const name = titleize(parts[1]);
    return {
      title: `${name} — cosmétique Fortnite | Matrix Hub`,
      description: `${name}, cosmétique Fortnite sur Matrix Hub : images, rareté, détails de sortie et votes de la communauté.`,
    };
  }
  if (parts[0] === "page" && parts[1]) {
    const name = titleize(parts[1]);
    return {
      title: `${name} — Matrix Hub`,
      description: `${name} sur Matrix Hub : streaming, hubs gaming et serveurs communautaires.`,
    };
  }
  if (parts[0] === "twitch" && parts[1] === "watch" && parts[2]) {
    const channel = titleize(parts[2]);
    return {
      title: `${channel} — live Twitch | Matrix Hub`,
      description: `Regardez ${channel} en direct sur Matrix Hub avec le chat Twitch, les informations du stream et les statistiques de spectateurs.`,
      noindex: true,
    };
  }
  if (parts[0] === "twitch" && parts[1] === "channel" && parts[2]) {
    const channel = titleize(parts[2]);
    return {
      title: `${channel} — chaîne Twitch | Matrix Hub`,
      description: `${channel} sur Matrix Hub : planning des streams, dernières vidéos, clips et statistiques de la chaîne.`,
      noindex: true,
    };
  }
  if (parts[0] === "twitch" && parts[1] === "category" && parts[2]) {
    const category = titleize(parts[2]);
    return {
      title: `${category} — streams Twitch en direct | Matrix Hub`,
      description: `Regardez les streams ${category} en direct sur Matrix Hub : meilleures chaînes, spectateurs et gameplay en temps réel.`,
      noindex: true,
    };
  }
  if (parts[0] === "watch" && parts[1]) {
    return {
      title: "Regarder une vidéo — Matrix Hub",
      description: "Regardez cette vidéo sur Matrix Hub avec les commentaires, les contenus associés et les informations du créateur.",
      noindex: true,
    };
  }
  if (parts[0] === "live" && parts[1]) {
    return {
      title: "Live — Matrix Hub",
      description: "Regardez ce live sur Matrix Hub avec le chat en temps réel, les réactions et le nombre de spectateurs.",
      noindex: true,
    };
  }
  if (parts[0] === "channel" && parts[1]) {
    return {
      title: "Chaîne de créateur — Matrix Hub",
      description: "Chaîne de créateur sur Matrix Hub : vidéos, streams, playlists et informations d'abonnement.",
      noindex: true,
    };
  }
  return null;
}

/**
 * resolveSeo — métadonnées à appliquer pour un chemin donné.
 * Chaque route publique reçoit un titre, une description et une bannière uniques.
 */
export function resolveSeo(pathname) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  const parts = path.split("/").filter(Boolean);

  const finish = (seo) => ({
    image: seo.image || pickOgImage(path),
    imageAlt: pickOgImageAlt(path),
    type: "website",
    ogCategory: ogCategory(path),
    ...seo,
    path,
  });

  if (ROUTES[path]) return finish(ROUTES[path]);

  const dynamic = resolveDynamic(parts);
  if (dynamic) return finish(dynamic);

  const isPrivate = NOINDEX_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );
  if (isPrivate || parts[0] === "404") {
    return finish({
      noindex: true,
      title: "Espace membre — Matrix Hub",
      description: "Espace privé de Matrix Hub, accessible après connexion à votre compte.",
    });
  }

  const label = titleize(parts[parts.length - 1] || "Accueil");
  return finish({
    title: `${label} — Matrix Hub`,
    description: `${label} sur Matrix Hub : streaming, guides gaming, serveurs communautaires et outils pour créateurs.`,
  });
}