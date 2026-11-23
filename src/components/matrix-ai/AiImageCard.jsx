import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function AiImageCard({ url, prompt }) {
  const [downloading, setDownloading] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("download");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `matrix-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Repli si le CDN bloque la lecture cross-origin : ouverture dans un nouvel onglet.
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  if (!url || failed) {
    return <p className="text-[11px] text-white/40">L'image n'est plus disponible.</p>;
  }

  return (
    <div className="space-y-2">
      <img
        src={url}
        alt={prompt || "Image générée par Matrix AI"}
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full max-w-sm rounded-xl object-cover"
        style={{ border: "1px solid rgba(138,79,255,0.3)", boxShadow: "0 0 24px rgba(138,79,255,0.2)" }}
      />
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="h-8 px-3 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition hover:brightness-110 disabled:opacity-60 tap-sm"
        style={{ background: "rgba(138,79,255,0.2)", border: "1px solid rgba(138,79,255,0.4)", color: "#e9d5ff" }}
      >
        {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        Télécharger l'image
      </button>
    </div>
  );
}
