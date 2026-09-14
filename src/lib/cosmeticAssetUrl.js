const SAFE_SCHEME_RE = /^(https?:|blob:)/i;
const ANY_SCHEME_RE = /^[a-z][a-z\d+.-]*:/i;
const FILE_SUFFIX_RE = /\.(png|jpe?g|gif|webp|svg|avif|bmp|mp4|webm|mov|m4v|ogg)([?#].*)?$/i;
const VIDEO_SUFFIX_RE = /\.(mp4|webm|mov|m4v|ogg)([?#].*)?$/i;
const IMAGE_SUFFIX_RE = /\.(png|jpe?g|gif|webp|svg|avif|bmp)([?#].*)?$/i;
const SAFE_DATA_URL_RE = /^data:(image\/(?:png|jpeg|gif|webp|avif|bmp)|video\/(?:mp4|webm|ogg|quicktime))(;[^,]*)?,/i;

function toAssetPath(raw) {
  const noRelativePrefix = raw.replace(/^\.?\//, "");
  return `/${noRelativePrefix.replace(/^\/+/, "")}`;
}

export function normalizeCosmeticAssetUrl(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  if (SAFE_SCHEME_RE.test(raw)) return raw;
  if (raw.startsWith("data:")) return SAFE_DATA_URL_RE.test(raw) ? raw : "";
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

export function isVideoAssetUrl(value) {
  const normalized = normalizeCosmeticAssetUrl(value);
  return Boolean(normalized && (normalized.startsWith("data:video/") || VIDEO_SUFFIX_RE.test(normalized)));
}

export function isImageAssetUrl(value) {
  const normalized = normalizeCosmeticAssetUrl(value);
  return Boolean(normalized && (normalized.startsWith("data:image/") || IMAGE_SUFFIX_RE.test(normalized)));
}
