import React, { useState, useEffect, useMemo } from "react";
import { Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

const REPO = "sheitan1998/Matrix.app";
const assetUrl = (tag, file) => `https://github.com/${REPO}/releases/download/${tag}/${file}`;

// Version publiée en cours. Aucun état (fallback, squelette, libellé) ne doit
// jamais exposer une version antérieure : le bouton n'affiche que celle-ci ou
// la version renvoyée par l'API, jamais un "v1.0.3" résiduel.
const LATEST_VERSION = "1.0.4";

// Téléchargements directs (jamais une page GitHub). Utilisés si l'API est lente
// ou indisponible, pour qu'un clic démarre toujours le transfert.
const FALLBACKS = {
  windows: {
    url: assetUrl(`v${LATEST_VERSION}`, `Matrix_${LATEST_VERSION}_x64-setup.exe`),
    filename: `Matrix_${LATEST_VERSION}_x64-setup.exe`,
    version: LATEST_VERSION,
  },
  macos: {
    url: assetUrl(`v${LATEST_VERSION}`, `Matrix_${LATEST_VERSION}_aarch64.dmg`),
    filename: `Matrix_${LATEST_VERSION}_aarch64.dmg`,
    version: LATEST_VERSION,
  },
  linux: {
    url: assetUrl(`v${LATEST_VERSION}`, `Matrix_${LATEST_VERSION}_amd64.AppImage`),
    filename: `Matrix_${LATEST_VERSION}_amd64.AppImage`,
    version: LATEST_VERSION,
  },
};

const OS_LABELS = { windows: "Windows", macos: "macOS", linux: "Linux" };

// Résultat conservé entre les montages : revenir sur le profil ne relance pas
// le squelette et ne fait donc jamais réapparaître une version transitoire.
const installerCache = {};

function detectOs() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macos";
  if (/Linux|X11/i.test(ua)) return "linux";
  return "windows";
}

/** Resolves the direct installer URL for the visitor's OS. */
async function resolveInstaller(os) {
  const request = base44.functions
    .invoke("getLatestRelease", { os })
    .then((resp) => {
      const data = resp?.data || resp;
      if (data?.download_url && /\.(exe|msi|dmg|AppImage|deb|rpm|tar\.gz)(\?|$)/i.test(data.download_url)) {
        return { url: data.download_url, filename: data.filename, version: data.version };
      }
      const platform = data?.downloads?.[os];
      if (platform?.url) {
        return { url: platform.url, filename: platform.filename, version: platform.version };
      }
      return null;
    });

  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 8000));
  try {
    return (await Promise.race([request, timeout])) || FALLBACKS[os];
  } catch {
    return FALLBACKS[os];
  }
}

export default function DesktopDownloadButton({ className = "" }) {
  const os = useMemo(detectOs, []);
  const [installer, setInstaller] = useState(() => installerCache[os] || null);

  useEffect(() => {
    if (installerCache[os]) return;
    let cancelled = false;
    resolveInstaller(os).then((result) => {
      if (cancelled) return;
      installerCache[os] = result;
      setInstaller(result);
    });
    return () => { cancelled = true; };
  }, [os]);

  const loading = !installer;
  const label = `Télécharger pour ${OS_LABELS[os]}${installer?.version ? ` (v${installer.version})` : ""}`;

  const handleDownload = () => {
    if (!installer?.url) return;
    const link = document.createElement("a");
    link.href = installer.url;
    link.download = installer.filename || "";
    link.rel = "noopener";
    // Same-tab navigation is never used: the asset response is an attachment.
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      aria-busy={loading}
      aria-label={loading ? `Chargement du programme d'installation pour ${OS_LABELS[os]}` : label}
      className={`w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-70 disabled:cursor-wait tap-sm ${className}`}
      style={{
        background: "linear-gradient(135deg, #a855f7, #6d28d9)",
        boxShadow: "0 0 15px rgba(168,85,247,0.3)",
      }}
    >
      {loading ? (
        // Squelette : aucun numéro de version n'est affiché pendant le chargement.
        <span className="h-2.5 w-40 rounded-full animate-pulse bg-white/25" />
      ) : (
        <>
          <Download className="w-4 h-4 shrink-0" />
          {label}
        </>
      )}
    </button>
  );
}