import React from "react";
import { Download, Film } from "lucide-react";
import { toast } from "sonner";

export const BRAND_VIDEO_URL = "https://media.base44.com/videos/public/69e14a987a927963a9924d5a/cc72895cc_matrix-fond-noir.mp4";

export default function BrandVideo({ title = "Vidéo officielle de la marque" }) {
  const download = () => {
    const a = document.createElement("a");
    a.href = BRAND_VIDEO_URL;
    a.download = "matrix-kit-media.mp4";
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Téléchargement de la vidéo démarré");
  };

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
        <Film className="w-3 h-3" /> {title}
      </p>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <video src={BRAND_VIDEO_URL} controls playsInline preload="metadata" className="w-full aspect-video object-contain bg-black" />
      </div>
      <button
        onClick={download}
        className="mt-3 w-full h-10 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition hover:opacity-90"
        style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.3)" }}
      >
        <Download className="w-3.5 h-3.5" /> Télécharger la vidéo (HD)
      </button>
    </div>
  );
}