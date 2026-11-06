import React from "react";
import { appParams, resolveAssetUrl } from "@/lib/app-params";
import {
  getCosmeticIconImageUrl,
  isImageAssetUrl,
  isVideoAssetUrl,
  normalizeCosmeticAssetUrl,
} from "@/lib/cosmeticAssetUrl";

/**
 * Miniature d'un cosmétique possédé, affichée à côté du profil du joueur
 * dans la gestion des attributions.
 */
export default function CosmeticOwnerThumb({ item, size = 46, className = "" }) {
  const videoUrl = isVideoAssetUrl(item?.video_url)
    ? resolveAssetUrl(normalizeCosmeticAssetUrl(item.video_url), appParams.appBaseUrl)
    : "";
  const previewUrl = isImageAssetUrl(item?.preview_image)
    ? resolveAssetUrl(normalizeCosmeticAssetUrl(item.preview_image), appParams.appBaseUrl)
    : isImageAssetUrl(item?.video_url)
    ? resolveAssetUrl(normalizeCosmeticAssetUrl(item.video_url), appParams.appBaseUrl)
    : "";
  const iconUrl = resolveAssetUrl(getCosmeticIconImageUrl(item?.icon), appParams.appBaseUrl);
  const emoji = item?.icon && !/^https?:\/\//i.test(item.icon) ? item.icon : "✨";

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-lg border border-white/10 flex items-center justify-center ${className}`}
      style={{ width: size, height: size, background: "rgba(168,85,247,0.08)" }}
      title={item?.item_name || item?.name || "Cosmétique"}
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          style={{ mixBlendMode: item.category === "avatar_animation" ? "screen" : "normal" }}
        />
      ) : previewUrl ? (
        <img src={previewUrl} alt="" className="w-full h-full object-cover" />
      ) : iconUrl ? (
        <img src={iconUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <span style={{ fontSize: Math.round(size * 0.42) }}>{emoji}</span>
      )}
    </div>
  );
}