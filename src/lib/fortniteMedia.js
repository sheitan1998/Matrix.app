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

function directVideoValues(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(directVideoValues);
  if (!value || typeof value !== "object") return [];
  return [
    value.url, value.src, value.video, value.videoUrl, value.gameplayVideo, value.animated,
    ...(Array.isArray(value.videos) ? value.videos.flatMap(directVideoValues) : []),
  ].flatMap(directVideoValues);
}

export function getFortniteVideoCandidates(item) {
  const displayAssets = [
    item?.displayAsset, item?.newDisplayAsset,
    ...(Array.isArray(item?.displayAssets) ? item.displayAssets : []),
    ...(Array.isArray(item?.display_assets) ? item.display_assets : []),
  ];
  const candidates = [
    ...(Array.isArray(item?.video_candidates) ? item.video_candidates : []),
    item?.showcaseVideo, item?.showcase_video, item?.video, item?.gameplayItem, item?.gameplayVideo,
    item?.images?.animated, ...displayAssets.flatMap(directVideoValues),
  ];
  return [...new Set(candidates.flatMap(directVideoValues)
    .filter(isOfficialFortniteVideoUrl)
    .map(value => new URL(value.trim()).href))];
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
