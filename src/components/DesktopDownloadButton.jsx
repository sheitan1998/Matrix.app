import React, { useState, useEffect } from "react";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Service pour récupérer le dernier installateur Windows depuis GitHub Releases
 */
const GitHubReleaseService = {
  /**
   * Récupère le dernier release et le lien du .exe
   */
  async getLatestInstallerUrl() {
    try {
      const response = await fetch(
        "https://api.github.com/repos/sheitan1998/Matrix.app/releases/latest",
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const release = await response.json();

      // Chercher le fichier .exe dans les assets
      const exeAsset = release.assets?.find((asset) =>
        asset.name.toLowerCase().endsWith(".exe")
      );

      if (!exeAsset) {
        throw new Error("Aucun fichier .exe trouvé dans la dernière release");
      }

      return {
        url: exeAsset.browser_download_url,
        fileName: exeAsset.name,
        version: release.tag_name,
        releaseUrl: release.html_url,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération du release GitHub:", error);
      throw error;
    }
  },
};

/**
 * Bouton de téléchargement du dernier installateur Windows
 */
export default function DesktopDownloadButton({ className = "" }) {
  const [loading, setLoading] = useState(false);
  const [installerUrl, setInstallerUrl] = useState(null);
  const [releaseInfo, setReleaseInfo] = useState(null);

  // Charger les informations du release au montage
  useEffect(() => {
    const fetchReleaseInfo = async () => {
      try {
        const info = await GitHubReleaseService.getLatestInstallerUrl();
        setInstallerUrl(info.url);
        setReleaseInfo(info);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error(
          "Impossible de récupérer l'installateur. Veuillez visiter GitHub."
        );
      }
    };

    fetchReleaseInfo();
  }, []);

  const handleDownload = async () => {
    if (!installerUrl) {
      toast.error("Lien de téléchargement indisponible");
      return;
    }

    setLoading(true);
    try {
      // Enregistrer le téléchargement via fonction Base44 (optionnel)
      try {
        const { base44 } = await import("@/api/base44Client");
        await base44.functions.invoke("desktopAppDownload", {
          version: releaseInfo?.version || "unknown",
        });
      } catch {
        // Ignorer les erreurs de tracking
      }

      // Ouvrir le lien de téléchargement
      window.location.href = installerUrl;

      toast.success("Téléchargement commencé !");
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      toast.error("Erreur lors du démarrage du téléchargement");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRelease = () => {
    if (releaseInfo?.releaseUrl) {
      window.open(releaseInfo.releaseUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-2">
      {/* Bouton principal de téléchargement */}
      <button
        onClick={handleDownload}
        disabled={!installerUrl || loading}
        className={`w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition hover:opacity-90 tap-sm disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{
          background: "linear-gradient(135deg, #a855f7, #6d28d9)",
          boxShadow: "0 0 15px rgba(168,85,247,0.3)",
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Téléchargement...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Télécharger pour Windows
          </>
        )}
      </button>

      {/* Info release et bouton secondaire */}
      {releaseInfo && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
          <div className="flex-1 text-xs">
            <p className="text-white/80 font-medium">Version {releaseInfo.version}</p>
            <p className="text-white/50">{releaseInfo.fileName}</p>
          </div>
          <button
            onClick={handleOpenRelease}
            className="p-1.5 rounded-lg hover:bg-secondary/50 transition text-white/70 hover:text-white"
            title="Voir sur GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
