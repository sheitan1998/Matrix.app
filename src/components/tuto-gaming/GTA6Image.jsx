import React, { useState } from "react";

const GTA6_LOGO = "https://static.wikia.nocookie.net/gtawiki/images/2/23/Logo-GTAVI.png/revision/latest?cb=20260630195129";

export default function GTA6Image({ src, alt, className, fallbackColor = "#BF5AF2" }) {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div
        className={`flex items-center justify-center ${className || ""}`}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${fallbackColor}18 0%, #0a050f 70%)`,
        }}
      >
        <img
          src={GTA6_LOGO}
          alt="GTA VI"
          className="max-w-[60%] max-h-[60%] object-contain opacity-80"
          style={{ filter: `drop-shadow(0 0 12px ${fallbackColor}66)` }}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setErrored(true)}
    />
  );
}