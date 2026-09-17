import React from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

const DOWNLOAD_PAGE_URL = "https://matrix-hub.app/downloads";

/**
 * Bouton de téléchargement — redirige vers la page de téléchargement dédiée
 */
export default function DesktopDownloadButton({ className = "" }) {
  const handleClick = () => {
    window.open(DOWNLOAD_PAGE_URL, "_blank", "noopener,noreferrer");
    toast.success("Redirection vers la page de téléchargement...");
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition hover:opacity-90 tap-sm ${className}`}
      style={{
        background: "linear-gradient(135deg, #a855f7, #6d28d9)",
        boxShadow: "0 0 15px rgba(168,85,247,0.3)",
      }}
    >
      <Download className="w-4 h-4" />
      ⬇️ Télécharger l'application
    </button>
  );
}