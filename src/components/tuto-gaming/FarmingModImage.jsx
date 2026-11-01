import React, { useEffect, useState } from "react";

const FS25_ACCENT = "#7DA627";

const FS25_LOGO = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <rect width="120" height="120" fill="#0a050f"/>
    <text x="60" y="50" font-size="14" font-weight="900" fill="${FS25_ACCENT}" text-anchor="middle" font-family="sans-serif">MATRIX</text>
    <text x="60" y="75" font-size="22" font-weight="900" fill="${FS25_ACCENT}" text-anchor="middle" font-family="sans-serif">FS25</text>
  </svg>`
);

const GIANTS_CDN_HOSTS = ["cdn40", "cdn25", "cdn26", "cdn27", "cdn45"];

export default function FarmingModImage({ src, alt, modTitle, brand, className }) {
  const [hostIndex, setHostIndex] = useState(0);
  const [exhausted, setExhausted] = useState(false);
  useEffect(() => { setHostIndex(0); setExhausted(false); }, [src]);

  // If src is a GIANTS CDN URL, try rotating through CDN hosts on error
  const currentSrc = (() => {
    if (!src || exhausted) return null;
    if (hostIndex === 0) return src;
    // Replace the CDN host in the URL
    try {
      const url = new URL(src);
      const match = url.hostname.match(/^cdn\d+/);
      if (match) {
        url.hostname = url.hostname.replace(match[0], GIANTS_CDN_HOSTS[hostIndex]);
        return url.href;
      }
    } catch {
      return src;
    }
    return src;
  })();

  const handleError = () => {
    if (hostIndex < GIANTS_CDN_HOSTS.length - 1) {
      setHostIndex(i => i + 1);
    } else {
      setExhausted(true);
    }
  };

  if (!currentSrc) {
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
          <span className="text-[10px] font-bold text-center px-2 truncate max-w-full" style={{ color: FS25_ACCENT }}>
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
      src={currentSrc}
      alt={alt}
      loading="lazy"
      className={className}
      onError={handleError}
    />
  );
}