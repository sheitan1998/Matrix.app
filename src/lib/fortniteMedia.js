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
const COMMUNITY_VIDEO_HOST = "fnggcdn.com";
const COSMETIC_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,199}$/;
const NUMERIC_ID_RE = /^\d{1,12}$/;

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

export function normalizeFortniteCosmeticId(value) {
  const id = typeof value === "string" ? value.trim() : "";
  return COSMETIC_ID_RE.test(id) && !id.includes("..") ? id : "";
}

export function getFortniteGgResolverUrl(value) {
  const id = normalizeFortniteCosmeticId(value);
  if (!id) return "";
  const url = new URL("https://fortnite.gg/api/item");
  url.searchParams.set("id", id);
  return url.href;
}

export function getCommunityVideoCandidates(item) {
  const cosmeticId = normalizeFortniteCosmeticId(item?.id);
  const resolvedCosmeticId = normalizeFortniteCosmeticId(item?.community_media?.cosmetic_id);
  const numericId = String(item?.community_media?.numeric_id || "");
  if (!cosmeticId || cosmeticId.toLowerCase() !== resolvedCosmeticId.toLowerCase() || !NUMERIC_ID_RE.test(numericId)) return [];
  return [
    `https://${COMMUNITY_VIDEO_HOST}/items/${numericId}/video-sd.mp4`,
    `https://${COMMUNITY_VIDEO_HOST}/items/${numericId}/video.mp4`,
  ];
}

export function isAllowedFortniteVideoUrl(value) {
  if (isOfficialFortniteVideoUrl(value)) return true;
  const candidate = directAssetUrl(value);
  try {
    const url = new URL(candidate);
    return url.protocol === "https:"
      && url.hostname.toLowerCase() === COMMUNITY_VIDEO_HOST
      && /^\/items\/\d{1,12}\/video(?:-sd)?\.mp4$/i.test(url.pathname);
  } catch {
    return false;
  }
}

export function getFortniteVideoCandidates(item, includeCommunity = false) {
  const candidates = [item?.gameplayItem, item?.video, item?.images?.animated];
  const official = candidates.map(directAssetUrl).filter(isOfficialFortniteVideoUrl).map(value => new URL(value.trim()).href);
  const community = includeCommunity ? getCommunityVideoCandidates(item) : [];
  return [...new Set([...community, ...official].filter(isAllowedFortniteVideoUrl))];
}

export function getFortniteVideoUrl(item) {
  return getFortniteVideoCandidates(item)[0] || "";
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
