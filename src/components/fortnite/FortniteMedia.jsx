import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { getFortniteVideoUrl } from "@/lib/fortniteMedia";

export default function FortniteMedia({ item, detail = false, active = false, thumbnail = false }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [playRejected, setPlayRejected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);
  const hdImage = item.image || item.images?.featured || item.images?.icon || item.images?.smallIcon;
  const thumbImage = item.images?.smallIcon || item.images?.icon || item.images?.featured || item.image;
  const image = thumbnail ? thumbImage : hdImage;
  const video = getFortniteVideoUrl(item);
  const shouldMountVideo = !!video && !failed && (detail || (active && hoverCapable));

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
      if (player.autoplay) player.muted = true;
      await player.play();
      setPaused(false);
      setPlayRejected(false);
    } catch {
      setPaused(true);
      setPlayRejected(true);
    }
  }, []);

  useEffect(() => {
    setFailed(false);
    setPlayRejected(false);
    setPaused(false);
    setMuted(true);
  }, [item.id, video]);

  useEffect(() => {
    const player = videoRef.current;
    if (shouldMountVideo) requestPlay();
    return () => {
      if (player) {
        player.pause();
        player.currentTime = 0;
      }
    };
  }, [requestPlay, shouldMountVideo]);

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
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {shouldMountVideo ? (
        <video
          ref={videoRef}
          key={video}
          src={video}
          poster={image}
          autoPlay={muted}
          loop
          muted={muted}
          playsInline
          controls={detail}
          preload={detail ? "metadata" : "none"}
          onCanPlay={requestPlay}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
          aria-label={`Aperçu de ${item.name}`}
        >
          Votre navigateur ne prend pas en charge la lecture de cet aperçu.
        </video>
      ) : image ? (
        <img
          src={image}
          alt={item.name}
          width={512}
          height={512}
          loading={detail ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-contain p-2"
        />
      ) : (
        <span className="p-3 text-center text-sm text-muted-foreground">Aucun aperçu fourni par la source</span>
      )}

      {!detail && video && !failed && (
        <span className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-foreground" aria-label="Aperçu vidéo disponible">
          <Play className="h-3 w-3" />
        </span>
      )}

      {detail && shouldMountVideo && (
        <div className="absolute right-3 top-3 flex gap-2">
          {(paused || playRejected) && (
            <button type="button" onClick={togglePlayback} className="flex items-center gap-2 rounded-lg bg-background/90 px-3 py-2 text-xs text-foreground">
              <Play className="h-4 w-4" /> Lire l’aperçu
            </button>
          )}
          {!paused && (
            <button type="button" onClick={togglePlayback} className="rounded-lg bg-background/90 p-2 text-foreground" aria-label="Mettre l’aperçu en pause">
              <Pause className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMuted((value) => !value)}
            className="flex items-center gap-2 rounded-lg bg-background/90 px-3 py-2 text-xs text-foreground"
            aria-label={muted ? "Activer le son de la vidéo" : "Couper le son de la vidéo"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {muted ? "Activer le son" : "Couper le son"}
          </button>
        </div>
      )}

      {detail && failed && (
        <p role="status" className="absolute bottom-3 rounded bg-background/90 p-2 text-xs text-muted-foreground">
          Vidéo indisponible. L’image fixe est affichée.
        </p>
      )}
      {detail && playRejected && (
        <p role="status" className="absolute bottom-3 rounded bg-background/90 p-2 text-xs text-muted-foreground">
          La lecture automatique a été bloquée. Utilisez « Lire l’aperçu ».
        </p>
      )}
    </div>
  );
}
