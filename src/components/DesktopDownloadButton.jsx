import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MSI_DIRECT_URL = "https://github.com/sheitan1998/Matrix.app/releases/latest/download/Matrix_x64-en-US.msi";

/**
 * Bouton de téléchargement — déclenche directement le téléchargement du .msi
 */
export default function DesktopDownloadButton({ className = "" }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);
    const link = document.createElement("a");
    link.href = MSI_DIRECT_URL;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Téléchargement du fichier .msi démarré !");
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition hover:opacity-90 tap-sm disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        background: "linear-gradient(135deg, #a855f7, #6d28d9)",
        boxShadow: "0 0 15px rgba(168,85,247,0.3)",
      }}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Préparation du téléchargement...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          ⬇️ Télécharger l'application
        </>
      )}
    </button>
  );
}