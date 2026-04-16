import React, { useState, useEffect } from "react";
import { Radio } from "lucide-react";

export default function VideoPlayer({ video, showPreAd = false, onAdEnd }) {
  const [adSeconds, setAdSeconds] = useState(5);
  const [showingAd, setShowingAd] = useState(showPreAd);

  useEffect(() => {
    if (!showingAd) return;
    if (adSeconds <= 0) {
      setShowingAd(false);
      onAdEnd?.();
      return;
    }
    const t = setTimeout(() => setAdSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [adSeconds, showingAd, onAdEnd]);

  if (showingAd) {
    return (
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
        <div className="absolute inset-0 gradient-matrix opacity-20" />
        <div className="relative text-center">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
            Publicité
          </p>
          <p className="text-2xl md:text-4xl font-black text-foreground">
            Passe à MATRIX PREMIUM
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Sans pub. Pour toujours.
          </p>
        </div>
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur text-sm font-mono">
          Passer dans {adSeconds}s
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
      {video.video_url ? (
        <video
          src={video.video_url}
          poster={video.thumbnail_url}
          controls
          autoPlay
          className="w-full h-full"
        />
      ) : video.thumbnail_url ? (
        <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full grid-bg" />
      )}
      {video.is_live && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-live text-white rounded-md text-xs font-bold">
          <Radio className="w-3 h-3 animate-live-pulse" /> LIVE
        </div>
      )}
    </div>
  );
}