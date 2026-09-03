import React, { useRef, useState } from "react";
import { Download, Loader2, Film } from "lucide-react";
import { toast } from "sonner";

export default function VideoExporter({ timeline, projectName, resolution }) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportVideo = async () => {
    const clips = timeline.clips || [];
    if (clips.length === 0) { toast.error("Aucun clip à exporter"); return; }

    setExporting(true);
    setProgress(0);
    toast.info("Export vidéo en cours...");

    const dims = resolution === "4K" ? { w: 3840, h: 2160 } :
                 resolution === "720p" ? { w: 1280, h: 720 } :
                 { w: 1920, h: 1080 };

    const canvas = document.createElement("canvas");
    canvas.width = dims.w;
    canvas.height = dims.h;
    const ctx = canvas.getContext("2d");

    const stream = canvas.captureStream(30);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000 });
    const chunks = [];

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, "_")}_export.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
      setProgress(0);
      toast.success("Vidéo exportée !");
    };

    recorder.start();

    // Render each clip sequentially
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const duration = (clip.duration || 5) * 1000 / (clip.speed || 1);
      const effects = clip.effects || {};
      const filterStr = [
        `brightness(${effects.brightness ?? 100}%)`,
        `contrast(${effects.contrast ?? 100}%)`,
        `saturate(${effects.saturation ?? 100}%)`,
        effects.blur ? `blur(${effects.blur}px)` : "",
      ].filter(Boolean).join(" ");
      ctx.filter = filterStr || "none";

      if (clip.type === "image") {
        // Load image and draw for duration
        const img = await loadImage(clip.url);
        const startTime = performance.now();
        await new Promise((resolve) => {
          function drawFrame() {
            const elapsed = performance.now() - startTime;
            if (elapsed >= duration) { resolve(); return; }
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawImageCover(ctx, img, canvas.width, canvas.height);
            setProgress(Math.round(((i + elapsed / duration) / clips.length) * 100));
            requestAnimationFrame(drawFrame);
          }
          drawFrame();
        });
      } else if (clip.type === "video") {
        // Play video at speed, drawing frames
        const video = document.createElement("video");
        video.src = clip.url;
        video.muted = true;
        video.playsInline = true;
        await new Promise((res) => { video.onloadeddata = res; });
        video.playbackRate = clip.speed || 1;
        video.currentTime = 0;
        video.play();
        await new Promise((resolve) => {
          function drawFrame() {
            if (video.ended || video.currentTime >= (clip.duration || video.duration)) { resolve(); return; }
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawVideoCover(ctx, video, canvas.width, canvas.height);
            setProgress(Math.round(((i + video.currentTime / (clip.duration || video.duration)) / clips.length) * 100));
            requestAnimationFrame(drawFrame);
          }
          drawFrame();
        });
        video.pause();
      }

      // Apply transition effect between clips
      if (clip.transition && clip.transition !== "none" && i < clips.length - 1) {
        const transitionDuration = 300; // ms
        const steps = 10;
        for (let s = 0; s < steps; s++) {
          const progress = s / steps;
          ctx.filter = "none";
          const nextClip = clips[i + 1];
          if (clip.transition === "fade") {
            ctx.globalAlpha = 1 - progress;
            drawBlackFill(ctx, canvas);
          } else if (clip.transition === "flash") {
            ctx.globalAlpha = 1;
            ctx.fillStyle = `rgba(255,255,255,${progress})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (clip.transition === "slide") {
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (clip.transition === "zoom") {
            // zoom out to black
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (clip.transition === "wipe") {
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width * progress, canvas.height);
          }
          ctx.globalAlpha = 1;
          setProgress(Math.round(((i + 1) / clips.length) * 100));
          await new Promise(r => setTimeout(r, transitionDuration / steps));
        }
      }
    }

    // Stop recording after a small delay
    setTimeout(() => recorder.stop(), 200);
  };

  return (
    <button
      onClick={exportVideo}
      disabled={exporting}
      className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold text-white transition disabled:opacity-60"
      style={{ background: "linear-gradient(135deg, #ec4899, #be185d)" }}
    >
      {exporting ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> {progress}%</>
      ) : (
        <><Download className="w-4 h-4" /> Exporter</>
      )}
    </button>
  );
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawImageCover(ctx, img, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

function drawBlackFill(ctx, canvas) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVideoCover(ctx, video, w, h) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return;
  const scale = Math.max(w / vw, h / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
}