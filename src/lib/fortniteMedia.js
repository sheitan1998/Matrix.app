function secureAssetUrl(value, extensions) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && (!extensions.length || extensions.some(extension => url.pathname.toLowerCase().endsWith(extension)))
      ? url.href
      : "";
  } catch {
    return "";
  }
}

const OFFICIAL_VIDEO_HOSTS = [
  "fortnite-api.com",
  "fortniteapi.io",
  "epicgames.com",
  "fortnite.com",
];

function directAssetUrl(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return [value.url, value.src, value.video].find(candidate => typeof candidate === "string") || "";
}

export function isOfficialFortniteVideoUrl(value) {
  const candidate = directAssetUrl(value);
  if (!candidate.trim()) return false;
  try {
    const url = new URL(candidate.trim());
    const host = url.hostname.toLowerCase();
    const officialHost = OFFICIAL_VIDEO_HOSTS.some(domain => host === domain || host.endsWith(`.${domain}`));
    return url.protocol === "https:"
      && officialHost
      && [".mp4", ".webm"].some(extension => url.pathname.toLowerCase().endsWith(extension));
  } catch {
    return false;
  }
}

export function getFortniteVideoUrl(item) {
  const candidates = [item?.gameplayItem, item?.video, item?.images?.animated];
  const candidate = candidates.map(directAssetUrl).find(isOfficialFortniteVideoUrl);
  return candidate ? new URL(candidate.trim()).href : "";
}

export function getFortniteImageCandidates(item, thumbnail = false) {
  const images = item?.images || {};
  const candidates = thumbnail
    ? [images.smallIcon, images.icon, images.large, images.featured, item?.image]
    : [images.featured, images.large, item?.image, images.icon, images.smallIcon];
  return [...new Set(candidates.map(value => secureAssetUrl(value, [])).filter(Boolean))];
}

export function getFortniteMediaBadge(item, staticOnly = false) {
  const type = String(item?.type?.value || item?.type || "").toLowerCase();
  if (type === "outfit") return "Skin";
  if (type === "emote" || type === "dance") return "Emote";
  return staticOnly ? "Statique" : "Aperçu";
}

export const FORTNITE_MEDIA_BACKGROUND_CLASS = "bg-[#080b12]/95 backdrop-blur-xl";
