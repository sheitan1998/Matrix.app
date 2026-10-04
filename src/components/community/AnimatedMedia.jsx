import React from "react";

export default function AnimatedMedia({ src, className, alt = "", autoPlay = true, ...props }) {
  if (!src) return null;
  const isVideo = /\.(webm|mp4|mov)$/i.test(src);
  if (isVideo) {
    return <video src={src} className={className} autoPlay={autoPlay} loop muted playsInline {...props} />;
  }
  return <img src={src} className={className} alt={alt} {...props} />;
}