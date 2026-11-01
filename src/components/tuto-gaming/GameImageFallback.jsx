import React, { useState } from "react";

export default function GameImageFallback({ src, alt, gameName, accentColor = "#BF5AF2", className, logoUrl }) {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 ${className || ""}`}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accentColor}18 0%, #0a050f 70%)`,
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={gameName}
            className="max-w-[50%] max-h-[50%] object-contain opacity-70"
            style={{ filter: `drop-shadow(0 0 12px ${accentColor}88)` }}
          />
        ) : (
          <span
            className="text-xl font-black tracking-tight"
            style={{ color: accentColor, textShadow: `0 0 20px ${accentColor}66` }}
          >
            {gameName}
          </span>
        )}
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