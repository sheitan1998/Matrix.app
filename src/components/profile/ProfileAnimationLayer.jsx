import React from "react";

/**
 * ProfileAnimationLayer
 * Renders the equipped avatar animation as a separate absolute layer centered on the avatar.
 * Uses a radial mask to fade out square edges + screen blend mode + contrast filter
 * to make the dark background fully transparent.
 *
 * @param {object} cosmetic - The equipped UserCosmetic (category: "avatar_animation")
 * @param {number} size - Base size in px (should match avatar size, e.g. 96 for w-24)
 */
export default function ProfileAnimationLayer({ cosmetic, size = 96 }) {
  if (!cosmetic || !cosmetic.video_url) return null;

  const scale = 1.5; // overflow 50% larger than avatar
  const scaled = size * scale;

  return (
    <div
      className="absolute top-1/2 left-1/2 pointer-events-none"
      style={{
        width: scaled,
        height: scaled,
        transform: "translate(-50%, -50%)",
        zIndex: 5,
        mixBlendMode: "screen",
        filter: "contrast(3) brightness(1.4)",
        // Radial mask: fully visible in center, fades to transparent at edges
        // This removes any visible square frame around the animation
        WebkitMaskImage: "radial-gradient(circle at center, #000 55%, transparent 78%)",
        maskImage: "radial-gradient(circle at center, #000 55%, transparent 78%)",
      }}
    >
      <video
        src={cosmetic.video_url}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}