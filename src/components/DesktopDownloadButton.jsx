import React, { useState, useEffect } from "react";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

const GITHUB_RELEASES_URL = "https://github.com/sheitan1998/Matrix.app/releases/latest";
const GITHUB_LATEST_RELEASE_API = "https://api.github.com/repos/sheitan1998/Matrix.app/releases/latest";
const PLATFORM_LABELS = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  unknown: "votre plateforme",
};

function detectPlatform() {
  if (typeof navigator === "undefined") return "unknown";

  const platform =
    navigator.userAgentData?.platform ||
    navigator.platform ||
    navigator.userAgent ||
    "";
  const normalized = platform.toLowerCase();

  if (normalized.includes("win")) return "windows";
  if (
    normalized.includes("mac") ||
    normalized.includes("darwin") ||
    normalized.includes("iphone") ||
    normalized.includes("ipad")
  ) {
    return "macos";
  }
  if (normalized.includes("linux") || normalized.includes("x11")) return "linux";
  return "unknown";
}

const PLATFORM_ASSET_RULES = {
  windows: [
    { extension: /\.msi$/i },
    { extension: /\.exe$/i, marker: /(setup|installer|nsis|windows|win)/i },
    { extension: /\.exe$/i },
    { extension: /\.zip$/i, marker: /(\.msi|\.exe|setup|installer|nsis|windows|win)/i },
  ],
  macos: [
    { extension: /\.dmg$/i },
    { extension: /\.pkg$/i },
    { extension: /\.app\.tar\.gz$/i },
    { extension: /\.zip$/i, marker: /(mac|macos|darwin|osx)/i },
  ],
  linux: [
    { extension: /\.appimage$/i },
    { extension: /\.deb$/i },
    { extension: /\.rpm$/i },
    { extension: /\.tar\.gz$/i, marker: /(linux|appimage|deb|rpm|ubuntu|amd64|x86_64)/i },
    { extension: /\.zip$/i, marker: /(linux|appimage|deb|rpm|ubuntu|amd64|x86_64)/i },
  ],
};

function isInstallerAsset(assetName) {
  const name = assetName.toLowerCase();
  if (name === "latest.json" || name.endsWith(".sig")) return false;
  return /\.(exe|msi|dmg|pkg|appimage|deb|rpm|tar\.gz|zip)$/.test(name);
}

function findInstallerAsset(assets, platform) {
  const installerAssets = (assets || []).filter(
    (asset) => asset?.browser_download_url && isInstallerAsset(asset.name || "")
  );

  for (const rule of PLATFORM_ASSET_RULES[platform] || []) {
    const asset = installerAssets.find(({ name = "" }) => {
      if (!rule.extension.test(name)) return false;
      return rule.marker ? rule.marker.test(name) : true;
    });
    if (asset) return asset;
  }

  if (platform === "unknown") {
    return installerAssets[0] || null;
  }

  return null;
}

/**
 * Service pour récupérer le meilleur installateur disponible depuis GitHub Releases
 */
const GitHubReleaseService = {
  /**
   * Récupère la dernière release et le meilleur asset installateur pour la plateforme courante
   */
  async getLatestInstallerUrl() {
    const platform = detectPlatform();

    try {
      const response = await fetch(GITHUB_LATEST_RELEASE_API, {
        headers: {
          Accept: "application/vnd.github+json",
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const release = await response.json();
      const installerAsset = findInstallerAsset(release.assets, platform);
      const releaseUrl = release.html_url || GITHUB_RELEASES_URL;

      return {
        url: installerAsset?.browser_download_url || releaseUrl,
        fileName: installerAsset?.name || null,
        version: release.tag_name || "latest",
        releaseUrl,
        platform,
        hasDirectAsset: Boolean(installerAsset),
      };
    } catch (error) {
      console.error("Erreur lors de la récupération du release GitHub:", error);
      return {
        url: GITHUB_RELEASES_URL,
        fileName: null,
        version: null,
        releaseUrl: GITHUB_RELEASES_URL,
        platform,
        hasDirectAsset: false,
        error,
      };
    }
  },
};

/**
 * Bouton de téléchargement du dernier installateur publié
 */
export default function DesktopDownloadButton({ className = "" }) {
  const [loading, setLoading] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState(null);

  // Charger les informations du release au montage
  useEffect(() => {
    const fetchReleaseInfo = async () => {
      const info = await GitHubReleaseService.getLatestInstallerUrl();
      setReleaseInfo(info);

      if (info.error) {
        toast.error("Impossible de charger l'installateur automatiquement. Ouverture des releases GitHub disponible.");
      } else if (!info.hasDirectAsset) {
        toast.info(`Aucun installateur ${PLATFORM_LABELS[info.platform]} n'a été trouvé dans la dernière release.`);
      }
    };

    fetchReleaseInfo();
  }, []);

  const handleDownload = async () => {
    if (!releaseInfo?.url) {
      toast.error("Lien de téléchargement indisponible");
      return;
    }

    setLoading(true);
    try {
      if (releaseInfo.hasDirectAsset) {
        try {
          const { base44 } = await import("@/api/base44Client");
          await base44.functions.invoke("desktopAppDownload", {
            version: releaseInfo.version || "unknown",
          });
        } catch {
          // Ignorer les erreurs de tracking
        }

        const downloadLink = document.createElement("a");
        downloadLink.href = releaseInfo.url;
        downloadLink.rel = "noopener noreferrer";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        toast.success("Téléchargement commencé !");
      } else {
        window.open(releaseInfo.releaseUrl, "_blank", "noopener,noreferrer");
        toast.info("Aucun installateur direct trouvé pour cette plateforme. Ouverture des releases GitHub.");
      }
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

  const platformLabel = PLATFORM_LABELS[releaseInfo?.platform || "unknown"];
  const buttonLabel = releaseInfo?.hasDirectAsset
    ? `Télécharger pour ${platformLabel}`
    : "Voir les releases GitHub";

  return (
    <div className="space-y-2">
      {/* Bouton principal de téléchargement */}
      <button
        onClick={handleDownload}
        disabled={!releaseInfo?.url || loading}
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
            {buttonLabel}
          </>
        )}
      </button>

      {/* Info release et bouton secondaire */}
      {releaseInfo && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
          <div className="flex-1 text-xs">
            <p className="text-white/80 font-medium">
              {releaseInfo.version ? `Version ${releaseInfo.version}` : "Dernière release GitHub"}
            </p>
            <p className="text-white/50">
              {releaseInfo.fileName || `Aucun binaire ${platformLabel} détecté automatiquement`}
            </p>
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
