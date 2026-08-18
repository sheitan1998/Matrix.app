import React, { useEffect, useRef } from "react";

/**
 * ProfileAnimationLayer
 * Renders the equipped avatar animation as a separate absolute layer centered on the avatar.
 * Uses Canvas luminance-keying: black/dark background pixels → fully transparent,
 * while all bright and colored pixels are preserved at full quality.
 *
 * The video wraps around the outer profile frame border: the radial mask clears the
 * avatar + frame interior, so the animation appears from the frame edge outward.
 *
 * Reads anim_config from the cosmetic (scale, offset_x, offset_y, mask_radius).
 *
 * @param {object} cosmetic - The equipped UserCosmetic (category: "avatar_animation")
 * @param {number} size - Base size in px (should match avatar size, e.g. 96 for w-24)
 */
export default function ProfileAnimationLayer({ cosmetic, size = 96 }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);

  const cfg = cosmetic?.anim_config || {};
  const scale = cfg.scale || 2;
  const offsetX = cfg.offset_x || 0;
  const offsetY = cfg.offset_y || 0;
  // mask_radius: 0-1, fraction of the container radius that stays transparent.
  // 0.52 = clears avatar + frame border, video starts just outside the frame edge.
  const maskR = Math.max(0, Math.min(0.95, cfg.mask_radius ?? 0.5));
  const maskRFeather = Math.min(0.99, maskR + 0.02);

  const scaled = size * scale;

  useEffect(() => {
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
          // Luminance keying: only pure black background → transparent, animation preserved.
          const THRESHOLD = 20;
          const FEATHER = 10;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lum < THRESHOLD) {
              data[i + 3] = 0;
            } else if (lum < THRESHOLD + FEATHER) {
              data[i + 3] = Math.round(((lum - THRESHOLD) / FEATHER) * 255);
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }
      }
      rafRef.current = requestAnimationFrame(processFrame);
    };

    const onLoaded = () => {
      rafRef.current = requestAnimationFrame(processFrame);
    };

    if (video.readyState >= 2) {
      onLoaded();
    } else {
      video.addEventListener("loadeddata", onLoaded);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      video.removeEventListener("loadeddata", onLoaded);
    };
  }, [cosmetic?.video_url]);

  if (!cosmetic || !cosmetic.video_url) return null;

  return (
    <div
      className="absolute top-1/2 left-1/2 pointer-events-none"
      style={{
        width: scaled,
        height: scaled,
        transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
        zIndex: 5,
      }}
    >
      <video
        ref={videoRef}
        src={cosmetic.video_url}
        autoPlay
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}