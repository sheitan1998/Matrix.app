import React, { useRef, useState } from "react";

/**
 * CosmeticPreview
 * Shared preview used in both the boutique grid and the profile inventory.
 * Animations are FROZEN by default and only play on hover (or when `forcePlay` is true, e.g. equipped).
 */
export default function CosmeticPreview({ item, size = "text-4xl", forcePlay = false, aspect = "square" }) {
  const videoRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const playing = forcePlay || hovering;

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
    if (item.category === "avatar_animation" && item.video_url) {
      return (
        <div className={`w-full ${aspectClass} rounded-xl overflow-hidden relative flex items-center justify-center`} style={{ background: "rgba(0,0,0,0.3)" }}
          onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <video ref={videoRef} src={item.video_url} loop muted playsInline
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
    if (item.category === "profile_cover" && item.video_url) {
      return (
        <div className={`w-full ${aspectClass} rounded-xl overflow-hidden relative flex items-center justify-center`} style={{ background: "rgba(0,0,0,0.3)" }}
          onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <video ref={videoRef} src={item.video_url} loop muted playsInline
            className="w-full h-full object-cover" preload="metadata" />
        </div>
      );
    }
    if (item.category === "profile_cover" && item.preview_image) {
      return (
        <div className={`w-full ${aspectClass} rounded-xl overflow-hidden`} style={{ background: "rgba(0,0,0,0.3)" }}>
          <img src={item.preview_image} alt="" className="w-full h-full object-cover" />
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