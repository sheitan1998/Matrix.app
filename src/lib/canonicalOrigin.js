export const CANONICAL_APP_ORIGIN = "https://matrix-hub.app";

export function canonicalAppUrl(path = "/") {
  const normalizedPath = typeof path === "string" && path.trim() ? path.trim() : "/";
  return new URL(normalizedPath, CANONICAL_APP_ORIGIN).toString();
}
