import React, { useEffect, useRef } from "react";

/**
 * ProfileAnimationLayer
 * Renders the equipped avatar animation as a separate absolute layer centered on the avatar.
 * Uses Canvas luminance-keying: black/dark background pixels → transparent,
 * while all bright and colored pixels are preserved at full quality (no blur, no wash-out).
 *
 * @param {object} cosmetic - The equipped UserCosmetic (category: "avatar_animation")
 * @param {number} size - Base size in px (should match avatar size, e.g. 96 for w-24)
 */
export default function ProfileAnimationLayer({ cosmetic, size = 96 }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);

  const scale = 2; // 200% of avatar — large enough for wings/flames
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
          // Luminance key: dark pixels → transparent, bright pixels → opaque
          // Threshold tuned for black-background cosmetic videos
          const THRESHOLD = 28; // below this luminance = background
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lum < THRESHOLD) {
              data[i + 3] = 0; // fully transparent
            } else if (lum < THRESHOLD + 20) {
              // soft feather at the transition edge to avoid hard artifacts
              data[i + 3] = Math.round(((lum - THRESHOLD) / 20) * 255);
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
        transform: "translate(-50%, -50%)",
        zIndex: 5,
        // No radial mask — luminance keying already makes black background transparent.
        // object-contain keeps the full video (wings/flames) visible without cropping.
      }}
    >
      {/* Hidden video source — frames are processed via canvas */}
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