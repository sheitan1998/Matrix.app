import React from "react";

const GREEN = "#22c55e";

/**
 * Glowing green ring shown around an avatar while its owner is speaking.
 * Place it inside a `relative` wrapper that has the avatar's size.
 */
export default function SpeakingRing({ speaking = false, width = 2 }) {
  return (
    <span
      aria-hidden
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{
        opacity: speaking ? 1 : 0,
        transition: "opacity 100ms ease-out",
        boxShadow: `0 0 0 ${width}px ${GREEN}, 0 0 10px 2px ${GREEN}aa`,
      }}
    />
  );
}