import React from "react";
import { isVideoUrl } from "@/lib/serverMedia";

export default function AnimatedMedia({ src, className, alt = "", ...props }) {
  if (!src) return null;
  if (isVideoUrl(src)) {
    return (
      <video key={src} src={src} className={className} autoPlay loop muted playsInline
        preload="auto" disablePictureInPicture {...props} />
    );
  }
  return <img src={src} className={className} alt={alt} {...props} />;
}