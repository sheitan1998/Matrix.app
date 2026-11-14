export const FORBIDDEN_LINK_ERROR =
  "Liens interdits : TopServeur, Disboard et Serveur Privé ne sont pas autorisés sur MATRIX.";

const FORBIDDEN_TOKENS = ["topserveur", "topserveurs", "disboard", "serveurprive", "serveurprives"];

const compact = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const isForbidden = (value) => {
  if (typeof value === "string") {
    const flat = compact(value);
    return FORBIDDEN_TOKENS.some((token) => flat.includes(token));
  }
  if (Array.isArray(value)) return value.some(isForbidden);
  return false;
};

/** Renvoie le message d'erreur à afficher, ou null si tous les textes sont autorisés. */
export function findForbiddenLink(...values) {
  return values.some(isForbidden) ? FORBIDDEN_LINK_ERROR : null;
}