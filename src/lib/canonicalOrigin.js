/**
 * Origines de l'application.
 *
 * Deux origines distinctes, à ne pas confondre :
 *
 * - RUNTIME_APP_ORIGIN : origine utilisée pour les appels réseau (API Base44,
 *   fonctions, entités) et le chargement des assets (/media/...). Dans le
 *   navigateur elle est TOUJOURS identique à l'origine courante : le preview,
 *   le domaine publié (matrix-hub.base44.app) et le domaine personnalisé
 *   utilisent ainsi leurs propres routes API au lieu d'un domaine externe qui
 *   ne les sert pas. Dans la webview desktop (Tauri), l'origine courante
 *   n'est pas un serveur valide : on cible l'app publiée.
 *
 * - CANONICAL_APP_ORIGIN : origine de marque, utilisée pour les liens de
 *   partage, les redirections OAuth et les URL absolues visibles par
 *   l'utilisateur.
 */

// App publiée sur la plateforme : toujours joignable (site + API).
const PUBLISHED_APP_ORIGIN = "https://matrix-hub.base44.app";

// Domaine de marque (liens partagés, OAuth, SEO).
const SITE_ORIGIN = "https://matrix-hub.app";

const TAURI_HOST_SUFFIX = ".tauri.localhost";

export const isNativeWebview = () => {
  if (typeof window === "undefined") return false;
  const { protocol, hostname } = window.location;
  return protocol === "tauri:" || hostname === "tauri.localhost" || hostname.endsWith(TAURI_HOST_SUFFIX);
};

const resolveRuntimeOrigin = () => {
  if (typeof window === "undefined") return PUBLISHED_APP_ORIGIN;
  if (isNativeWebview()) return PUBLISHED_APP_ORIGIN;
  const { protocol, origin } = window.location;
  if (/^https?:$/.test(protocol) && origin) return origin;
  return PUBLISHED_APP_ORIGIN;
};

/** Origine des appels API et des assets pendant l'exécution. */
export const RUNTIME_APP_ORIGIN = resolveRuntimeOrigin();

/** Origine de marque, pour les liens absolus et les redirections OAuth. */
export const CANONICAL_APP_ORIGIN = SITE_ORIGIN;

/** Construit une URL absolue de marque à partir d'un chemin interne. */
export function canonicalAppUrl(path = "/") {
  const normalizedPath = typeof path === "string" && path.trim() ? path.trim() : "/";
  return new URL(normalizedPath, CANONICAL_APP_ORIGIN).toString();
}

export { PUBLISHED_APP_ORIGIN, SITE_ORIGIN };