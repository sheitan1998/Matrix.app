/**
 * Bannières Open Graph officielles Matrix Hub.
 * Une seule bannière par univers, sans génération automatique d'images génériques.
 * Les visuels sont hébergés sur le stockage public définitif de l'app.
 */
export const OG_BANNERS = {
  home: {
    url: "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/fc03e8ae4_home_og_banner.png",
    width: 1734,
    height: 907,
    alt: "Matrix Hub logo on a neon purple background with the tagline: the hub for gamers, streamers and creators",
  },
  bestServer: {
    url: "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/2c431e1a1_bestServer_og_banner.png",
    width: 1672,
    height: 941,
    alt: "Best Server banner with a golden crown, neon purple lighting and a grid of game logos on Matrix Hub",
  },
  nexusGame: {
    url: "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/c9ece57e1_nexusGame_og_banner.png",
    width: 2048,
    height: 768,
    alt: "Nexus Game banner with a gaming controller, casino chips, a slot machine and a golden crown",
  },
  nexus: {
    url: "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/9846ea0b1_nexus_og_banner.png",
    width: 400,
    height: 210,
    alt: "Matrix Nexus banner with guardian lions, the Matrix logo and a desktop preview of the server hub",
  },
  bestCreator: {
    url: "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/c114acce0_bestCreator_og_banner.png",
    width: 1672,
    height: 941,
    alt: "Best Creator banner with a golden crown, a studio microphone, a ring light and social platform logos",
  },
};

/** Une route → une bannière officielle (l'accueil par défaut). */
const RULES = [
  [/^\/best-creator(\/|$)/, "bestCreator"],
  [/^\/creator(\/|$)/, "bestCreator"],
  [/^\/profil-createur(\/|$)/, "bestCreator"],
  [/^\/recherche-createur(\/|$)/, "bestCreator"],
  [/^\/best-serveurs(\/|$)/, "bestServer"],
  [/^\/servers(\/|$)/, "bestServer"],
  [/^\/recherche-joueur(\/|$)/, "bestServer"],
  [/^\/nexus-game(\/|$)/, "nexusGame"],
  [/^\/(casino|roulette)(\/|$)/, "nexusGame"],
  [/^\/nexus(\/|$)/, "nexus"],
  [/^\/community(\/|$)/, "nexus"],
];

/** Clé de la bannière officielle associée à un chemin. */
export function ogBannerKey(pathname) {
  const path = (pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
  for (const [pattern, key] of RULES) {
    if (pattern.test(path)) return key;
  }
  return "home";
}

/** Bannière officielle (URL, dimensions et alt) pour un chemin. */
export function pickOgBanner(pathname) {
  return OG_BANNERS[ogBannerKey(pathname)] || OG_BANNERS.home;
}

/** URL de la bannière officielle pour un chemin. */
export function pickOgImage(pathname) {
  return pickOgBanner(pathname).url;
}

/** Alt text de la bannière officielle pour un chemin. */
export function pickOgImageAlt(pathname) {
  return pickOgBanner(pathname).alt;
}

/** Catégorie Open Graph (clé de bannière) pour un chemin. */
export function ogCategory(pathname) {
  return ogBannerKey(pathname);
}