import React, { useState } from "react";

const FS25_LOGO = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <rect width="120" height="120" fill="#0a050f"/>
    <text x="60" y="50" font-size="14" font-weight="900" fill="#7DA627" text-anchor="middle" font-family="sans-serif">FS25</text>
    <text x="60" y="75" font-size="22" font-weight="900" fill="#7DA627" text-anchor="middle" font-family="sans-serif">MOD</text>
  </svg>`
);

export default function FarmingModImage({ src, alt, modTitle, brand, className }) {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 ${className || ""}`}
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(125,166,39,0.12) 0%, #0a050f 70%)",
        }}
      >
        <img
          src={FS25_LOGO}
          alt={modTitle || "FS25"}
          className="max-w-[55%] max-h-[55%] object-contain opacity-60"
          style={{ filter: "drop-shadow(0 0 10px rgba(125,166,39,0.5))" }}
        />
        {modTitle && (
          <span className="text-[10px] font-bold text-center px-2 truncate max-w-full" style={{ color: "#7DA627" }}>
            {modTitle}
          </span>
        )}
        {brand && brand !== "none" && (
          <span className="text-[8px] text-center px-2 truncate max-w-full text-white/40">
            {brand}
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