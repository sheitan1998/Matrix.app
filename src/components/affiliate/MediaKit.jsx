import React, { useState } from "react";
import { Download, Copy, Check, ExternalLink, Film, Clapperboard } from "lucide-react";
import { toast } from "sonner";

const MEDIA_VIDEO_URL = "https://media.base44.com/videos/public/69e14a987a927963a9924d5a/cc72895cc_matrix-fond-noir.mp4";
const OFFICIAL_SITE = "https://matrix-hub.app/";

export default function MediaKit() {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(OFFICIAL_SITE);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadVideo = () => {
    const a = document.createElement("a");
    a.href = MEDIA_VIDEO_URL;
    a.download = "matrix-kit-media.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Téléchargement du Kit Média démarré !");
  };

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.18)" }}>
      {/* Header */}
      <div className="p-5 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.18)" }}>
          <Clapperboard className="w-5 h-5" style={{ color: "#a855f7" }} />
        </div>
        <div>
          <p className="text-sm font-black text-white">Kit Média Officiel</p>
          <p className="text-[11px] text-muted-foreground">Ressources de marque pour vos streams et réseaux</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Video preview */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
            <Film className="w-3 h-3" /> Animation officielle de la marque
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <video
              src={MEDIA_VIDEO_URL}
              controls
              playsInline
              className="w-full aspect-video object-contain bg-black"
              preload="metadata"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <button
              onClick={downloadVideo}
              className="flex-1 h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
            >
              <Download className="w-4 h-4" />
              Télécharger la vidéo (HD)
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            Utilisez cette animation en intro, overlay ou transition sur vos streams Twitch, YouTube et réseaux sociaux.
          </p>
        </div>

        {/* Official site link */}
        <div className="p-4 rounded-2xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.12)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Lien officiel de la plateforme</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 px-3 py-2.5 rounded-xl font-mono text-xs text-white truncate" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {OFFICIAL_SITE}
            </div>
            <button
              onClick={copyLink}
              className="h-10 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition shrink-0"
              style={copied
                ? { background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }
                : { background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copié" : "Copier"}
            </button>
            <a
              href={OFFICIAL_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-xl flex items-center justify-center transition shrink-0"
              style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.25)", color: "#a855f7" }}
              title="Ouvrir le site"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Ajoutez ce lien dans la description de vos lives, bannières et profils de réseaux sociaux.
          </p>
        </div>
      </div>
    </div>
  );
}