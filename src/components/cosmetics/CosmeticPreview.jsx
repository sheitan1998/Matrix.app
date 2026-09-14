import React, { useEffect, useRef, useState } from "react";
import { appParams, resolveAssetUrl } from "@/lib/app-params";
import { getCosmeticIconImageUrl, isImageAssetUrl, isVideoAssetUrl, normalizeCosmeticAssetUrl } from "@/lib/cosmeticAssetUrl";

/**
 * CosmeticPreview
 * Shared preview used in both the boutique grid and the profile inventory.
 * Animations are FROZEN by default and only play on hover (or when `forcePlay` is true, e.g. equipped).
 */
export default function CosmeticPreview({ item, size = "text-4xl", forcePlay = false, aspect = "square" }) {
  const videoRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [mediaError, setMediaError] = useState({
    primaryVideo: false,
    fallbackVideo: false,
    image: false,
    iconImage: false,
  });
  const playing = forcePlay || hovering;
  const normalizedVideoAsset = resolveAssetUrl(
    normalizeCosmeticAssetUrl(item?.video_url),
    appParams.appBaseUrl
  );
  const normalizedPreviewAsset = resolveAssetUrl(
    normalizeCosmeticAssetUrl(item?.preview_image),
    appParams.appBaseUrl
  );
  const primaryVideo = isVideoAssetUrl(item?.video_url) ? normalizedVideoAsset : "";
  const previewImage = isImageAssetUrl(item?.preview_image)
    ? normalizedPreviewAsset
    : (isImageAssetUrl(item?.video_url) ? normalizedVideoAsset : "");
  const iconImage = resolveAssetUrl(getCosmeticIconImageUrl(item?.icon), appParams.appBaseUrl);

  useEffect(() => {
    setHovering(false);
    setMediaError({
      primaryVideo: false,
      fallbackVideo: false,
      image: false,
      iconImage: false,
    });
  }, [item?.id, item?.video_url, item?.preview_image, item?.icon, item?.category]);

  const handleEnter = () => {
    setHovering(true);
    const v = videoRef.current;
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
  };
  const handleLeave = () => {
    setHovering(false);
    const v = videoRef.current;
    if (v) { v.pause(); }
  };

  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-square";

  const renderMedia = () => {
    if (item.category === "avatar_animation" && primaryVideo && !mediaError.primaryVideo) {
      return (
        <div className={`w-full ${aspectClass} rounded-xl overflow-hidden relative flex items-center justify-center`} style={{ background: "rgba(0,0,0,0.3)" }}
          onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <video ref={videoRef} src={primaryVideo} loop muted playsInline onError={() => setMediaError(prev => ({ ...prev, primaryVideo: true }))}
            className="w-full h-full object-cover" style={{ mixBlendMode: "screen" }}
            preload="metadata" />
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded">Survolez</span>
            </div>
          )}
        </div>
      );
    }
    if (item.category === "profile_cover" && primaryVideo && !mediaError.fallbackVideo) {
      return (
        <div className={`w-full ${aspectClass} rounded-xl overflow-hidden relative flex items-center justify-center`} style={{ background: "rgba(0,0,0,0.3)" }}
          onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <video ref={videoRef} src={primaryVideo} loop muted playsInline onError={() => setMediaError(prev => ({ ...prev, fallbackVideo: true }))}
            className="w-full h-full object-cover" preload="metadata" />
        </div>
      );
    }
    if ((item.category === "profile_cover" || item.category === "avatar_animation") && previewImage && !mediaError.image) {
      return (
        <div className={`w-full ${aspectClass} rounded-xl overflow-hidden`} style={{ background: "rgba(0,0,0,0.3)" }}>
          <img src={previewImage} alt="" onError={() => setMediaError(prev => ({ ...prev, image: true }))} className="w-full h-full object-cover" />
        </div>
      );
    }
    if (iconImage && !mediaError.iconImage) {
      return (
        <div className={`w-full ${aspectClass} rounded-xl overflow-hidden`} style={{ background: "rgba(168,85,247,0.06)" }}>
          <img src={iconImage} alt="" onError={() => setMediaError(prev => ({ ...prev, iconImage: true }))} className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className={`w-full ${aspectClass} rounded-xl flex items-center justify-center`} style={{ background: "rgba(168,85,247,0.06)" }}>
        <span className={size}>{item.icon || "✨"}</span>
      </div>
    );
  };

  return renderMedia();
}