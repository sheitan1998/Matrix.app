import { appParams, resolveAssetUrl } from "@/lib/app-params";

const SAFE_SCHEME_RE = /^(https?:|blob:)/i;
const ANY_SCHEME_RE = /^[a-z][a-z\d+.-]*:/i;

export function normalizeAppAssetUrl(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  if (SAFE_SCHEME_RE.test(raw) || raw.startsWith("data:")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (ANY_SCHEME_RE.test(raw)) return "";
  const noRelativePrefix = raw.replace(/^\.?\//, "");
  const normalizedPath = raw.startsWith("/") ? raw : `/${noRelativePrefix.replace(/^\/+/, "")}`;
  return resolveAssetUrl(normalizedPath, appParams.appBaseUrl);
}

export function toAbsoluteApiUrl(baseUrl, path) {
  const cleanPath = typeof path === "string" ? path.trim() : "";
  if (!cleanPath) return "";
  if (/^https?:\/\//i.test(cleanPath)) return cleanPath;
  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  const cleanBase = (baseUrl || "").replace(/\/+$/, "");
  return `${cleanBase}${normalizedPath}`;
}

export function normalizeExternalUrl(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return "";
}
