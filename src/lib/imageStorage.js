import { base44 } from "@/api/base44Client";
import { optimizeImage } from "@/lib/imageOptimizer";
import { getUsagePreset } from "@/lib/imageSizing";
import { uploadToR2 } from "@/lib/r2Upload";

/**
 * Optimizes an image for its usage, then uploads it to Cloudflare R2.
 * Falls back to the platform storage (UploadPublicFile) if R2 is unavailable,
 * so an upload never fails because of R2 and existing URLs keep working.
 * Returns { file_url }.
 */
export async function uploadOptimizedImage(file, { usage = "gallery", folder } = {}) {
  const prepared = await optimizeImage(file, usage);
  const dir = folder || getUsagePreset(usage).folder;
  try {
    const file_url = await uploadToR2(prepared, dir);
    return { file_url };
  } catch {
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: prepared });
    if (!file_url) throw new Error("upload_failed");
    return { file_url };
  }
}
