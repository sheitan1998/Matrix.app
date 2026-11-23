// Pure helpers (no DOM, no network) shared by the browser optimizer and the batch migration script.

export const IMAGE_USAGES = {
  gallery: { maxEdge: 1600, quality: 0.82, folder: "gallery" },
  listing: { maxEdge: 1600, quality: 0.82, folder: "listings" },
  banner: { maxEdge: 1600, quality: 0.82, folder: "visuals" },
  thumbnail: { maxEdge: 400, quality: 0.8, folder: "thumbs" },
  icon: { maxEdge: 256, quality: 0.85, folder: "icons" },
};

export const DEFAULT_USAGE = "gallery";

export function getUsagePreset(usage) {
  return IMAGE_USAGES[usage] || IMAGE_USAGES[DEFAULT_USAGE];
}

/** Fits (width x height) inside a maxEdge square. Keeps the ratio and never enlarges. */
export function computeTargetSize(width, height, maxEdge) {
  const w = Number(width);
  const h = Number(height);
  if (!(w > 0) || !(h > 0)) return { width: 0, height: 0, resized: false };
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  if (scale === 1) return { width: Math.round(w), height: Math.round(h), resized: false };
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
    resized: true,
  };
}

const SKIP_MIME = /^(image\/(gif|svg\+xml)|video\/)/i;
const SKIP_EXT = /\.(gif|svg|mp4|webm|mov|m4v|ogg)(\?.*)?$/i;

/** GIF, SVG and videos are never re-encoded. `animated` comes from a binary sniff (animated WebP/APNG). */
export function shouldSkipOptimization({ type = "", name = "", animated = false } = {}) {
  return Boolean(animated) || SKIP_MIME.test(type) || SKIP_EXT.test(name);
}

/** Keep the original bytes when re-encoding would not shrink the file and nothing was resized. */
export function shouldKeepOriginal({ originalSize, optimizedSize, resized }) {
  return !resized && optimizedSize >= originalSize;
}

export function optimizedFileName(name, ext = "webp") {
  const base = String(name || "image").replace(/\.[^./\\]+$/, "").replace(/[^\w.-]+/g, "-").slice(0, 60) || "image";
  return `${base}.${ext}`;
}

export function isCloudflareUrl(url, publicBase) {
  if (!url || !publicBase) return false;
  return String(url).startsWith(String(publicBase).replace(/\/+$/, "") + "/");
}
