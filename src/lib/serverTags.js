/**
 * Étiquettes (tags) des serveurs de l'annuaire Best Serveur.
 * Un serveur peut porter jusqu'à 5 étiquettes (prédéfinies ou personnalisées).
 */

export const MAX_SERVER_TAGS = 5;

export const SERVER_TAGS = [
  "Roleplay",
  "Semi-RP",
  "Free-Access",
  "Whitelist",
  "Chill",
  "Communauté",
  "Entraide",
  "Compétitif",
  "Esport",
  "Tournois",
  "PvP",
  "PvE",
  "Survie",
  "Créatif",
  "Moddé",
  "Vanilla",
  "Multigaming",
  "Vocal actif",
  "Rencontres amicales",
  "Musique",
  "Anime",
  "Manga",
  "Cinéma",
  "Tech",
  "Développement",
  "Graphisme",
  "Streaming",
  "YouTube",
  "Twitch",
  "Giveaways",
  "Événements",
  "Recrutement",
  "Débutants bienvenus",
  "Tryhard",
  "Fun",
  "Mini-jeux",
  "Économie",
  "Factions",
  "Skyblock",
  "FiveM",
  "DarkRP",
  "FR",
  "QC",
  "BE",
  "CH",
  "International",
  "18+",
  "Sans prise de tête",
  "Actif 24/7",
  "Staff actif",
  "Gaming",
  "Détente",
  "Hardcore",
  "RPG",
  "MMORPG",
  "Sandbox",
  "Course",
  "Simulation",
  "Horreur",
  "Nostalgie",
  "Anti-cheat",
  "Saisonnier",
];

/** Nettoie une étiquette : sans #, espaces normalisés, 24 caractères max. */
export function normalizeTag(raw) {
  return String(raw || "")
    .replace(/^#+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

/** Étiquettes d'un serveur (tableau propre, 5 maximum). */
export function serverTags(server) {
  const raw = Array.isArray(server?.tags)
    ? server.tags
    : typeof server?.tags === "string"
      ? server.tags.split(",")
      : [];
  return raw.map(normalizeTag).filter(Boolean).slice(0, MAX_SERVER_TAGS);
}

/** true si le serveur porte l'étiquette demandée (insensible à la casse). */
export function serverHasTag(server, tag) {
  const clean = normalizeTag(tag);
  if (!clean) return true;
  const q = clean.toLowerCase();
  return serverTags(server).some((item) => item.toLowerCase() === q);
}