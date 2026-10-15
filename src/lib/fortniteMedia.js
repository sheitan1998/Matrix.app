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

export function getFortniteVideoUrl(item) {
  const candidates = [item?.video, item?.images?.animated];
  return candidates.map(value => secureAssetUrl(value, [".mp4", ".webm"])).find(Boolean) || "";
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
