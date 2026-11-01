import React, { useEffect, useState } from "react";

const GTA6_LOGO = "https://static.wikia.nocookie.net/gtawiki/images/2/23/Logo-GTAVI.png/revision/latest?cb=20260630195129";

export default function GTA6Image({ src, alt, className, fallbackColor = "#BF5AF2" }) {
  const [errored, setErrored] = useState(false);
  useEffect(() => setErrored(false), [src]);

  if (errored || !src) {
    return (
      <div
        className={`flex items-center justify-center ${className || ""}`}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${fallbackColor}18 0%, #0a050f 70%)`,
        }}
      >
        <div className="flex flex-col items-center gap-2 p-4 text-center text-primary"><span className="text-xl font-black tracking-widest">MATRIX · GTA VI</span><span className="text-xs text-muted-foreground">{alt || 'Visuel officiel indisponible'}</span></div>
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