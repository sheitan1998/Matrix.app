import { base44 } from "@/api/base44Client";
import { uploadImageModerated, ModerationError } from "@/lib/imageModeration";

const VIDEO_URL_RE = /\.(webm|mp4)(\?.*)?$/i;
const VIDEO_TYPES = { "video/mp4": "mp4", "video/webm": "webm" };
const MAX_VIDEO_MB = 15;

export function isVideoUrl(url) {
  return VIDEO_URL_RE.test(url || "");
}

export function isVideoFile(file) {
  return (file?.type || "").startsWith("video/") || /\.(webm|mp4|mov)$/i.test(file?.name || "");
}

// Animated = video, GIF, animated WebP (ANIM chunk) or APNG (acTL chunk)
export async function isAnimatedFile(file) {
  if (isVideoFile(file)) return true;
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  if (type === "image/gif" || name.endsWith(".gif")) return true;
  if (/image\/(webp|png|apng)/.test(type) || /\.(webp|png|apng)$/.test(name)) {
    const head = new TextDecoder("latin1").decode(await file.slice(0, 65536).arrayBuffer());
    return head.includes("ANIM") || head.includes("acTL");
  }
  return false;
}

// Uploads a server icon/banner. Videos are re-wrapped with a clean extension so
// the stored URL is always detected and played as a looping video.
export async function uploadServerMedia(file) {
  if (!isVideoFile(file)) return uploadImageModerated(file);

  const ext = VIDEO_TYPES[(file.type || "").toLowerCase()] || (file.name.match(/\.(mp4|webm)$/i)?.[1] || "").toLowerCase();
  if (!ext) throw new ModerationError("Formats vidéo acceptés : MP4 ou WebM.");
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) throw new ModerationError(`Vidéo trop lourde (max ${MAX_VIDEO_MB} Mo).`);

  const clean = new File([file], `server-media-${Date.now()}.${ext}`, { type: ext === "mp4" ? "video/mp4" : "video/webm" });
  return base44.integrations.Core.UploadPublicFile({ file: clean });
}