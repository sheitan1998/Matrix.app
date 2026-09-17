import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const GITHUB_LATEST_API = "https://api.github.com/repos/sheitan1998/Matrix.app/releases/latest";

/**
 * Récupère l'URL directe du fichier .msi depuis la dernière release GitHub
 */
async function fetchLatestMsiUrl() {
  const res = await fetch(GITHUB_LATEST_API, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const release = await res.json();
  const msiAsset = (release.assets || []).find(
    (a) => a.name.toLowerCase().endsWith(".msi") && a.browser_download_url
  );
  if (!msiAsset) throw new Error("Aucun fichier .msi trouvé dans la dernière release");
  return msiAsset.browser_download_url;
}

/**
 * Bouton de téléchargement — déclenche directement le téléchargement du .msi
 */
export default function DesktopDownloadButton({ className = "" }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const url = await fetchLatestMsiUrl();
      const link = document.createElement("a");
      link.href = url;
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Téléchargement du fichier .msi démarré !");
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      toast.error("Impossible de récupérer le fichier d'installation. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
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