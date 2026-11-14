/**
 * Règles de liens pour les annonces de serveurs.
 * Les plateformes concurrentes de référencement sont interdites sur MATRIX.
 */

export const FORBIDDEN_LINK_ERROR =
  "Liens interdits : TopServeur, Disboard et Serveur Privé ne sont pas autorisés sur MATRIX.";

// Comparaison sur une version compacte (minuscules, sans accents ni ponctuation)
// pour bloquer aussi les variantes du type "top serveur" ou "Top-Serveur.fr".
const FORBIDDEN_TOKENS = [
  "topserveur",
  "topserveurs",
  "disboard",
  "serveurprive",
  "serveurprives",
];

function compact(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function isForbidden(value: unknown): boolean {
  if (typeof value === "string") {
    const flat = compact(value);
    return FORBIDDEN_TOKENS.some((token) => flat.includes(token));
  }
  if (Array.isArray(value)) return value.some(isForbidden);
  return false;
}

/** Renvoie true si l'une des valeurs contient un lien de plateforme interdite. */
export function hasForbiddenLink(...values: unknown[]): boolean {
  return values.some(isForbidden);
}

/** Renvoie le message d'erreur à afficher, ou null si tout est autorisé. */
export function validateServerLinks(...values: unknown[]): string | null {
  return hasForbiddenLink(...values) ? FORBIDDEN_LINK_ERROR : null;
}