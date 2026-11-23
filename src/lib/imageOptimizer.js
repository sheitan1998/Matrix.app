import {
  computeTargetSize,
  getUsagePreset,
  optimizedFileName,
  shouldKeepOriginal,
  shouldSkipOptimization,
} from "@/lib/imageSizing";

async function sniffAnimated(file) {
  const type = (file.type || "").toLowerCase();
  if (!/image\/(webp|png|apng)/.test(type)) return false;
  const head = new TextDecoder("latin1").decode(await file.slice(0, 65536).arrayBuffer());
  return head.includes("ANIM") || head.includes("acTL");
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Resizes (ratio kept, never enlarged) and re-encodes an image to WebP for the given usage.
 * Returns the original file untouched for GIF/SVG/video/animated images or on any failure.
 */
export async function optimizeImage(file, usage = "gallery") {
  try {
    if (!file || typeof createImageBitmap !== "function") return file;
    const animated = await sniffAnimated(file);
    if (shouldSkipOptimization({ type: file.type, name: file.name, animated })) return file;

    const preset = getUsagePreset(usage);
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const target = computeTargetSize(bitmap.width, bitmap.height, preset.maxEdge);
    if (!target.width) return file;

    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, target.width, target.height);
    bitmap.close?.();

    let blob = await canvasToBlob(canvas, "image/webp", preset.quality);
    let ext = "webp";
    if (!blob || blob.type !== "image/webp") {
      blob = await canvasToBlob(canvas, "image/jpeg", preset.quality);
      ext = "jpg";
    }
    if (!blob) return file;
    if (shouldKeepOriginal({ originalSize: file.size, optimizedSize: blob.size, resized: target.resized })) return file;

    return new File([blob], optimizedFileName(file.name, ext), { type: blob.type });
  } catch {
    return file;
  }
}
