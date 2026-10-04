/**
 * Centralized image moderation module.
 * Validates file type/size client-side, uploads to public storage,
 * then runs AI vision moderation before returning the URL.
 *
 * Usage:
 *   import { uploadImageModerated } from "@/lib/imageModeration";
 *   const { file_url } = await uploadImageModerated(file);
 *   // throws ModerationError if the image is rejected
 */

import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_SIZE_MB = 8;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export class ModerationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ModerationError";
  }
}

/**
 * Client-side validation of an image file before upload.
 * Returns true if valid, throws ModerationError otherwise.
 */
export function validateImageFile(file) {
  if (!file) throw new ModerationError("Aucun fichier fourni.");

  // Check MIME type
  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED_MIME.includes(mime)) {
    // Some browsers don't set MIME for webp, check extension as fallback
    const ext = (file.name || "").toLowerCase().match(/\.[^.]+$/)?.[0] || "";
    if (!ALLOWED_EXT.includes(ext)) {
      throw new ModerationError("Format non supporté. Utilisez JPG, PNG ou WEBP.");
    }
  }

  // Check file size
  if (file.size > MAX_SIZE_BYTES) {
    throw new ModerationError(`Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`);
  }

  return true;
}

/**
 * Upload an image and run AI moderation on it.
 * If the image is deemed inappropriate, throws ModerationError.
 * Otherwise returns { file_url }.
 *
 * @param {File} file - The image file to upload
 * @param {object} options - { skipModeration: boolean } to skip AI check (admin-only contexts)
 * @returns {Promise<{file_url: string}>}
 */
export async function uploadImageModerated(file, options = {}) {
  // Step 1: client-side validation
  validateImageFile(file);

  // Step 2: upload to public storage
  const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });

  if (options.skipModeration) {
    return { file_url };
  }

  // Step 3: AI moderation
  try {
    const res = await base44.functions.invoke("moderateImage", { file_url });
    if (res?.data?.safe === false) {
      // Image rejected — the file URL exists in storage but we don't store it anywhere
      const reason = res.data.reason || "Image non conforme aux règles de la communauté.";
      throw new ModerationError(reason);
    }
  } catch (err) {
    if (err instanceof ModerationError) throw err;
    // If moderation service is unreachable, fail open (image is allowed)
    console.warn("Image moderation service unavailable:", err);
  }

  return { file_url };
}

/**
 * Wrapper with toast notification on rejection.
 * Useful for upload handlers that already show toasts.
 */
export async function uploadImageWithToast(file, options = {}) {
  try {
    return await uploadImageModerated(file, options);
  } catch (err) {
    if (err instanceof ModerationError) {
      toast.error(err.message);
    }
    throw err;
  }
}