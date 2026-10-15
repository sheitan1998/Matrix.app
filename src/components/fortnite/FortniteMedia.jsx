import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import {
  FORTNITE_MEDIA_BACKGROUND_CLASS,
  getFortniteImageCandidates,
  getFortniteMediaBadge,
  getFortniteVideoCandidates,
} from "@/lib/fortniteMedia";

export default function FortniteMedia({ item, detail = false, active = false, thumbnail = false }) {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const images = useMemo(() => getFortniteImageCandidates(item, thumbnail), [item, thumbnail]);
  const image = images[imageIndex] || "";
  const videos = useMemo(
    () => thumbnail ? [] : getFortniteVideoCandidates(item, detail),
    [detail, item, thumbnail],
  );
  const [videoIndex, setVideoIndex] = useState(0);
  const video = videos[videoIndex] || "";
  const shouldMountVideo = !!video && (detail || (active && hoverCapable));
  const badge = getFortniteMediaBadge(item, !video);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHoverCapable(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  const requestPlay = useCallback(async () => {
    const player = videoRef.current;
    if (!player) return;
    try {
      player.muted = true;
      await player.play();
      setPaused(false);
    } catch {
      if (videoRef.current === player) setVideoIndex(index => index + 1);
    }
  }, []);

  useEffect(() => {
    setVideoIndex(0);
    setVideoReady(false);
    setPaused(false);
    setImageIndex(0);
  }, [item.id, videos.join("|")]);

  const advanceVideoCandidate = useCallback(() => {
    setVideoReady(false);
    setPaused(false);
    setVideoIndex(index => index + 1);
  }, []);

  useEffect(() => {
    const player = videoRef.current;
    return () => {
      if (player) {
        player.pause();
        player.currentTime = 0;
      }
    };
  }, [shouldMountVideo]);

  useEffect(() => {
    if (!shouldMountVideo || videoReady) return undefined;
    const timer = window.setTimeout(advanceVideoCandidate, 10000);
    return () => window.clearTimeout(timer);
  }, [advanceVideoCandidate, shouldMountVideo, videoReady]);

  const togglePlayback = async () => {
    const player = videoRef.current;
    if (!player) return;
    if (player.paused) await requestPlay();
    else {
      player.pause();
      setPaused(true);
    }
  };

  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden ${FORTNITE_MEDIA_BACKGROUND_CLASS}`}>
      {image ? (
        <img
          src={image}
          alt={item.name}
          width={512}
          height={512}
          loading={detail ? "eager" : "lazy"}
          decoding="async"
          onError={() => setImageIndex(index => index + 1)}
          className="h-full w-full object-contain p-2 transition-transform duration-500 ease-out group-hover/media:scale-105"
        />
      ) : (
        <span className="p-3 text-center text-sm text-muted-foreground">Aucun aperçu fourni par la source</span>
      )}

      {shouldMountVideo && (
        <video
          ref={videoRef}
          key={video}
          src={video}
          poster={image}
          autoPlay
          loop
          muted
          playsInline
          preload={detail ? "metadata" : "none"}
          onLoadedData={requestPlay}
          onPlaying={() => {
            setVideoReady(true);
            setPaused(false);
          }}
          onPause={() => setPaused(true)}
          onError={advanceVideoCandidate}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${videoReady ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-label={`Aperçu de ${item.name}`}
        >
          Votre navigateur ne prend pas en charge la lecture de cet aperçu.
        </video>
      )}

      {!detail && video && (
        <span className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-foreground" aria-label="Aperçu vidéo disponible">
          <Play className="h-3 w-3" />
        </span>
      )}

      <span
        className="absolute bottom-2 left-2 rounded-md border border-white/10 bg-background/80 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-foreground backdrop-blur-sm"
        aria-label={`Type de média : ${badge}`}
      >
        {badge}
      </span>

      {detail && shouldMountVideo && (
        <div className="absolute right-3 top-3 flex gap-2">
          {paused && videoReady && (
            <button type="button" onClick={togglePlayback} className="flex items-center gap-2 rounded-lg bg-background/90 px-3 py-2 text-xs text-foreground">
              <Play className="h-4 w-4" /> Lire l’aperçu
            </button>
          )}
          {!paused && videoReady && (
            <button type="button" onClick={togglePlayback} className="rounded-lg bg-background/90 p-2 text-foreground" aria-label="Mettre l’aperçu en pause">
              <Pause className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

    </div>
  );
}
