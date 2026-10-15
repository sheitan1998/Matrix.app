export function getFortniteVideoUrl(item) {
  const candidates = [item?.video, item?.images?.animated];
  return candidates.find((value) => (
    typeof value === "string"
    && /^https:\/\//i.test(value)
    && /\.(mp4|webm)(\?|$)/i.test(value)
  )) || "";
}
