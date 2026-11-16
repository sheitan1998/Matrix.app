/**
 * Alt text anglais global pour toutes les images de Matrix Hub.
 * Utilisé par <ImageAltEnforcer /> : toute image sans alt (ou avec un alt
 * générique / encore en français) reçoit une description anglaise pertinente
 * construite depuis la route courante.
 */

const SECTION_LABELS = [
  [/^\/twitch\/watch/, "a Twitch live stream on Matrix Hub"],
  [/^\/twitch\/channel/, "a Twitch channel page on Matrix Hub"],
  [/^\/twitch/, "Twitch live streams on Matrix Hub"],
  [/^\/(stream|watch|live|shorts|trending|channel|search|playlists|subscriptions)/, "video streaming on Matrix Hub"],
  [/^\/fortnite-maps/, "the Fortnite creative maps directory on Matrix Hub"],
  [/^\/fortnite-shop/, "the daily Fortnite item shop on Matrix Hub"],
  [/^\/fortnite-cosmetics/, "the Fortnite cosmetics catalogue on Matrix Hub"],
  [/^\/fortnite-stats/, "Fortnite player statistics on Matrix Hub"],
  [/^\/fortnite/, "Fortnite gaming content on Matrix Hub"],
  [/^\/minecraft/, "the Minecraft mods and encyclopedia on Matrix Hub"],
  [/^\/farming/, "Farming Simulator mods and guides on Matrix Hub"],
  [/^\/dofus/, "the Dofus stuff builder and quest guides on Matrix Hub"],
  [/^\/rocket-league/, "Rocket League items and stats on Matrix Hub"],
  [/^\/valheim/, "Valheim guides, bosses and seeds on Matrix Hub"],
  [/^\/rust/, "Rust raid calculators and servers on Matrix Hub"],
  [/^\/valorant/, "Valorant agents and weapon guides on Matrix Hub"],
  [/^\/gta-6/, "GTA VI news, vehicles and guides on Matrix Hub"],
  [/^\/tuto-gaming/, "the Matrix Hub gaming guides and wiki"],
  [/^\/(nexus-game|casino|roulette)/, "Nexus Game online casino games on Matrix Hub"],
  [/^\/(best-serveurs|servers)/, "the Matrix Hub gaming server directory"],
  [/^\/best-creator/, "the Matrix Hub creator leaderboard"],
  [/^\/creator/, "a Matrix Hub creator profile"],
  [/^\/nexus/, "Nexus community servers and voice channels on Matrix Hub"],
  [/^\/(boutique-matrix|boutique-nexus|market|trix-store)/, "the Matrix Hub shop"],
  [/^\/affiliate/, "the Matrix Hub affiliate programme"],
  [/^\/progression/, "Matrix Hub levels, achievements and progression"],
  [/^\/mon-profil/, "a Matrix Hub player profile"],
  [/^\/live-bot/, "the Matrix Live bot configuration dashboard"],
  [/^\/admin/, "the Matrix Hub administration panel"],
];

const GENERIC = new Set([
  "",
  "image",
  "img",
  "photo",
  "picture",
  "avatar",
  "logo",
  "icon",
  "thumbnail",
  "thumb",
  "preview",
  "cover",
  "banner",
  "background",
  "upload",
  "uploaded",
  "file",
  "media",
  "visual",
  "placeholder",
  "vignette",
  "aperçu",
  "aperçu titre",
  "fiche technique",
  "fond",
  "trophée",
  "bannière",
  "logo de la chaîne",
  "chaîne",
  "carte",
  "image du jeu",
]);

const FRENCH_ALT = {
  vignette: "Thumbnail",
  "aperçu": "Preview",
  "aperçu titre": "Title preview",
  "fiche technique": "Spec sheet",
  fond: "Background artwork",
  "trophée": "Achievement trophy",
  "bannière": "Channel banner",
  "logo de la chaîne": "Channel logo",
  "croupière nexus": "Nexus casino dealer",
  "roulette royale, la croupière vous attend à la table":
    "Roulette Royale dealer waiting at the casino table",
  "nexus game — des milliers de jeux, une seule plateforme":
    "Nexus Game online games catalogue",
  "affiche officielle grand theft auto vi": "Official Grand Theft Auto VI poster",
  "partenariat & affiliation": "Partnership and affiliation programme",
  "roue de la fortune": "Wheel of Fortune game",
  "carte fortnite": "Fortnite creative map",
  "matrix token": "Matrix virtual token",
  "v-bucks": "V-Bucks currency icon",
  "uploaded": "Uploaded image",
};

export function sectionLabel(pathname) {
  const path = (pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
  for (const [pattern, label] of SECTION_LABELS) {
    if (pattern.test(path)) return label;
  }
  return "the Matrix Hub gaming and live streaming platform";
}

/**
 * Renvoie l'alt anglais à appliquer, ou null quand l'alt existant
 * est déjà descriptif et peut être conservé.
 */
export function contextualAlt(pathname, currentAlt) {
  const raw = String(currentAlt || "").trim();
  const key = raw.toLowerCase();
  const label = sectionLabel(pathname);

  if (!GENERIC.has(key)) {
    const translated = FRENCH_ALT[key];
    if (!translated) return null;
    return `${translated} from ${label}`;
  }

  if (FRENCH_ALT[key] && key) return `${FRENCH_ALT[key]} from ${label}`;
  return `Screenshot of ${label}`;
}