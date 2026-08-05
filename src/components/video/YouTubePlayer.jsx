import { useEffect, useRef } from "react";

// Loads the YouTube IFrame Player API script once and caches the promise.
let apiPromise = null;
function loadYouTubeAPI() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return apiPromise;
}

// Module-level singleton: ensures only ONE YouTube iframe player is active at a time.
// Before creating a new player, any existing one is stopped + destroyed so no
// background audio or double audio can occur.
let activePlayer = null;
function registerPlayer(player) {
  if (activePlayer && activePlayer !== player) {
    try { activePlayer.stopVideo?.(); } catch {}
    try { activePlayer.destroy?.(); } catch {}
  }
  activePlayer = player;
}
function unregisterPlayer(player) {
  if (activePlayer === player) {
    activePlayer = null;
  }
}

/**
 * YouTube IFrame Player — embeds a YouTube video using the official
 * IFrame Player API. Pass the video ID returned by the YouTube Data API v3.
 *
 * Callbacks (onReady, onStateChange) are stored in refs so the player
 * is only re-created when `videoId` changes — never on parent re-render.
 */
export default function YouTubePlayer({ videoId, autoplay = true, onReady, onStateChange }) {
  const wrapperRef = useRef(null);
  const playerRef = useRef(null);
  const onReadyRef = useRef(onReady);
  const onStateChangeRef = useRef(onStateChange);

  // Keep callback refs current without triggering player re-creation
  onReadyRef.current = onReady;
  onStateChangeRef.current = onStateChange;

  useEffect(() => {
    let active = true;
    loadYouTubeAPI().then((YT) => {
      if (!active || !wrapperRef.current) return;
      // Destroy previous player instance if any (stopVideo first to kill audio immediately)
      if (playerRef.current) {
        try { playerRef.current.stopVideo?.(); } catch {}
        try { playerRef.current.destroy?.(); } catch {}
        playerRef.current = null;
      }
      wrapperRef.current.innerHTML = "";
      const div = document.createElement("div");
      div.className = "w-full h-full";
      wrapperRef.current.appendChild(div);
      const player = new YT.Player(div, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (e) => onReadyRef.current?.(e.target),
          onStateChange: (e) => onStateChangeRef.current?.(e.data),
        },
      });
      playerRef.current = player;
      registerPlayer(player);
    });
    return () => {
      active = false;
      if (playerRef.current) {
        try { playerRef.current.stopVideo?.(); } catch {}
        try { playerRef.current.destroy?.(); } catch {}
        unregisterPlayer(playerRef.current);
        playerRef.current = null;
      }
    };
    // Only re-create when videoId changes — callbacks are in refs
  }, [videoId]);

  return <div ref={wrapperRef} className="w-full h-full" />;
}