import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

export default function VoiceMessagePlayer({ src, accent = "hsl(135 100% 50%)", transcript }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onLoadedMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => { setPlaying(false); setProgress(0); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio * 100);
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-1 mb-1 max-w-[280px]">
      <div
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <audio ref={audioRef} src={src} preload="metadata" />
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110 shrink-0"
          style={{ background: accent, color: "#000" }}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-[80px]">
          <div
            className="h-1.5 rounded-full cursor-pointer relative"
            style={{ background: "rgba(255,255,255,0.15)" }}
            onClick={seek}
          >
            <div
              className="h-full rounded-full absolute top-0 left-0"
              style={{ width: `${progress}%`, background: accent, transition: "width 0.1s linear" }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[9px] text-white/40 font-mono">
              {formatTime(playing || progress > 0 ? (progress / 100) * duration : 0)}
            </span>
            <span className="text-[9px] text-white/40 font-mono">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      {transcript && (
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="text-[10px] text-white/40 hover:text-white/70 transition text-left px-1"
        >
          {showTranscript ? "Masquer la transcription" : "📄 Voir la transcription"}
        </button>
      )}
      {transcript && showTranscript && (
        <p className="text-[11px] text-white/60 leading-relaxed px-3 py-2 rounded-xl italic" style={{ background: "rgba(255,255,255,0.04)" }}>
          "{transcript}"
        </p>
      )}
    </div>
  );
}