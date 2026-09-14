import React, { useRef, useEffect, useState } from "react";
import { getCosmeticIconImageUrl, isImageAssetUrl, isVideoAssetUrl, normalizeCosmeticAssetUrl } from "@/lib/cosmeticAssetUrl";

/**
 * CosmeticProfilePreview
 * Shows a mini profile avatar with the cosmetic applied, so users can preview
 * the cosmetic on their own profile before purchasing.
 *
 * @param {object} item - The MatrixShopItem to preview
 * @param {object} user - Current user (for avatar, banner, pseudo)
 */
export default function CosmeticProfilePreview({ item, user }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  const normalizedVideoAsset = normalizeCosmeticAssetUrl(item?.video_url);
  const normalizedPreviewAsset = normalizeCosmeticAssetUrl(item?.preview_image);
  const videoUrl = isVideoAssetUrl(item?.video_url) ? normalizedVideoAsset : "";
  const previewImage = isImageAssetUrl(item?.preview_image)
    ? normalizedPreviewAsset
    : (isImageAssetUrl(item?.video_url) ? normalizedVideoAsset : "");
  const iconImage = getCosmeticIconImageUrl(item?.icon);
  const isAnimation = item?.category === "avatar_animation" && videoUrl;
  const isCover = item?.category === "profile_cover";
  const cfg = item?.anim_config || {};
  const scale = cfg.scale || 1.3;
  const offsetX = cfg.offset_x || 0;
  const offsetY = cfg.offset_y || 0;
  const layerW = cfg.width ? Number(cfg.width) : 80 * scale;
  const layerH = cfg.height ? Number(cfg.height) : 80 * scale;

  useEffect(() => {
    if (!isAnimation) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const processFrame = () => {
      if (video.readyState >= 2) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w && h && (canvas.width !== w || canvas.height !== h)) {
          canvas.width = w;
          canvas.height = h;
        }
        if (canvas.width && canvas.height) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const THRESHOLD = 20;
          const FEATHER = 10;
          for (let i = 0; i < data.length; i += 4) {
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            if (lum < THRESHOLD) data[i + 3] = 0;
            else if (lum < THRESHOLD + FEATHER) data[i + 3] = Math.round(((lum - THRESHOLD) / FEATHER) * 255);
          }
          ctx.putImageData(imageData, 0, 0);
        }
      }
      rafRef.current = requestAnimationFrame(processFrame);
    };

    const onLoaded = () => { setVideoReady(true); rafRef.current = requestAnimationFrame(processFrame); };
    if (video.readyState >= 2) onLoaded();
    else video.addEventListener("loadeddata", onLoaded);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      video.removeEventListener("loadeddata", onLoaded);
    };
  }, [videoUrl, isAnimation]);

  const avatar = user?.avatar_url;
  const banner = isCover ? (videoUrl || previewImage) : user?.banner_url;
  const pseudo = user?.pseudo || user?.full_name?.split(" ")[0] || "Vous";
  const pseudoTag = user?.pseudo_tag || "????";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)" }}>
      {/* Banner */}
      <div className="h-16 relative overflow-hidden" style={{ background: banner ? "transparent" : "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(109,40,217,0.2))" }}>
        {isCover && videoUrl ? (
          <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full" style={{ objectFit: "cover" }} />
        ) : isCover && previewImage ? (
          <img src={previewImage} alt="" className="w-full h-full object-cover" />
        ) : banner ? (
          <img src={banner} alt="" className="w-full h-full object-cover" />
        ) : null}
      </div>

      {/* Avatar + animation overlay */}
      <div className="px-4 pb-4 -mt-8 relative">
        <div className="relative inline-block overflow-visible">
          {/* Frame border (if cosmetic is a frame-like item) */}
          <div className="w-16 h-16 rounded-full p-0.5" style={{
            background: "linear-gradient(135deg, #a855f7, #6d28d9)",
            boxShadow: "0 0 12px rgba(168,85,247,0.3)",
          }}>
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
              {avatar ? (
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black text-white">{pseudo?.[0]?.toUpperCase()}</span>
              )}
            </div>
          </div>

          {/* Animation overlay */}
          {isAnimation && (
            <div
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{
                width: layerW,
                height: layerH,
                transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
                zIndex: 5,
              }}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                crossOrigin="anonymous"
                style={{ display: "none" }}
              />
              <canvas ref={canvasRef} className="w-full h-full" style={{ objectFit: "contain" }} />
            </div>
          )}

          {/* Badge preview */}
          {item?.category === "badge" && (
            <div className="absolute -top-1 -left-1 z-20 text-lg" title={item.name}>
              {iconImage ? <img src={iconImage} alt="" className="w-6 h-6 rounded-full object-cover" /> : (item.icon || "🏅")}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="mt-2">
          <p className="text-sm font-black text-white font-mono">
            {pseudo}<span className="text-white/40">#{pseudoTag}</span>
          </p>
          <p className="text-[10px] text-white/40">Aperçu du cosmétique sur votre profil</p>
        </div>

        {/* Cosmetic name */}
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
          <span className="text-xs">{iconImage ? <img src={iconImage} alt="" className="w-4 h-4 rounded-full object-cover" /> : (item?.icon || "✨")}</span>
          <span className="text-[10px] font-bold text-white/70">{item?.name}</span>
        </div>
      </div>
    </div>
  );
}