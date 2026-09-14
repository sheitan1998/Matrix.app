const SAFE_SCHEME_RE = /^(https?:|data:|blob:)/i;
const ANY_SCHEME_RE = /^[a-z][a-z\d+.-]*:/i;
const FILE_SUFFIX_RE = /\.(png|jpe?g|gif|webp|svg|avif|bmp|mp4|webm|mov|m4v|ogg)([?#].*)?$/i;

function toAssetPath(raw) {
  const noRelativePrefix = raw.replace(/^\.?\//, "");
  return `/${noRelativePrefix.replace(/^\/+/, "")}`;
}

export function normalizeCosmeticAssetUrl(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  if (SAFE_SCHEME_RE.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return raw;
  if (ANY_SCHEME_RE.test(raw)) return "";
  if (raw.includes("/") || FILE_SUFFIX_RE.test(raw)) return toAssetPath(raw);
  return "";
}

export function normalizeCosmeticIcon(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  return normalizeCosmeticAssetUrl(raw) || raw;
}

export function getCosmeticIconImageUrl(value) {
  return normalizeCosmeticAssetUrl(value);
}
