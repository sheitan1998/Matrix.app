/**
 * Visuels Open Graph par univers Matrix Hub.
 * Chaque route reçoit une image pertinente (streaming, esport, guides, etc.)
 * au lieu de l'unique visuel générique.
 */
export const OG_IMAGES = {
  streaming:
    "https://media.base44.com/images/public/69e14a987a927963a9924d5a/3d5354424_generated_image.png",
  twitch:
    "https://media.base44.com/images/public/69e14a987a927963a9924d5a/00f0d12c0_generated_image.png",
  guides:
    "https://media.base44.com/images/public/69e14a987a927963a9924d5a/582538bc7_generated_image.png",
  esports:
    "https://media.base44.com/images/public/69e14a987a927963a9924d5a/e93fe67f6_generated_image.png",
  fortnite:
    "https://media.base44.com/images/public/69e14a987a927963a9924d5a/b8a2a0a7a_generated_image.png",
  casino:
    "https://media.base44.com/images/public/69e14a987a927963a9924d5a/be1c3c446_generated_image.png",
  community:
    "https://media.base44.com/images/public/69e14a987a927963a9924d5a/522afbb6e_generated_image.png",
  shop:
    "https://media.base44.com/images/public/69e14a987a927963a9924d5a/a09617db4_generated_image.png",
  survival:
    "https://media.base44.com/images/public/69e14a987a927963a9924d5a/7443b35aa_generated_image.png",
};

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Alt text anglais décrivant chaque visuel OG. */
export const OG_IMAGE_ALT = {
  streaming: "Matrix Hub video streaming interface with live channels and a neon green glowing player",
  twitch: "Gaming broadcast desk with a microphone and neon purple live stream lighting",
  guides: "Glowing treasure chest and adventure map for gaming guides and walkthroughs",
  esports: "Competitive esports arena with players facing a neon scoreboard",
  fortnite: "Colourful battle royale island with parachuting players and a flying bus",
  casino: "Virtual casino floor with a glowing roulette wheel, chips and playing cards",
  community: "Holographic gaming community network of chat bubbles and player avatars",
  shop: "Digital creator shop with holographic product cards, gold badge and game tokens",
  survival: "Survival game landscape with a lone warrior, campfire and longhouse at dusk",
};

/** Un chemin → une catégorie de visuel OG. */
const RULES = [
  [/^\/twitch(\/|$)/, "twitch"],
  [/^\/(stream|watch|live|shorts|trending|channel|search|playlists|video-studio|upload|studio|dashboard|subscriptions)(\/|$)/, "streaming"],
  [/^\/(farming|minecraft|valheim|rust)(\/|$)/, "survival"],
  [/^\/(dofus|gta-6|jeu|tuto-gaming)(\/|$)/, "guides"],
  [/^\/fortnite/, "fortnite"],
  [/^\/(valorant|rocket-league)(\/|$)/, "esports"],
  [/^\/(nexus-game|casino|roulette)(\/|$)/, "casino"],
  [/^\/(nexus|best-serveurs|best-creator|servers|creator|community|recherche-joueur|recherche-createur|progression|mon-profil)(\/|$)/, "community"],
  [/^\/(boutique-matrix|boutique-nexus|market|trix-store|wallet|affiliate|outils)(\/|$)/, "shop"],
  [/^\/(about|contact|privacy|page)(\/|$)/, "community"],
];

/** Catégorie Open Graph pour un chemin donné (streaming par défaut). */
export function ogCategory(pathname) {
  const path = (pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
  for (const [pattern, category] of RULES) {
    if (pattern.test(path)) return category;
  }
  return "streaming";
}

/** URL d'image Open Graph pertinente pour un chemin. */
export function pickOgImage(pathname) {
  return OG_IMAGES[ogCategory(pathname)] || OG_IMAGES.streaming;
}

/** Alt text Open Graph pour un chemin. */
export function pickOgImageAlt(pathname) {
  return OG_IMAGE_ALT[ogCategory(pathname)] || OG_IMAGE_ALT.streaming;
}