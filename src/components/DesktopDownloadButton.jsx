import React, { useState, useEffect, useMemo } from "react";
import { Download, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const REPO = "sheitan1998/Matrix.app";
const assetUrl = (tag, file) => `https://github.com/${REPO}/releases/download/${tag}/${file}`;

// Direct asset downloads (never a GitHub web page). Used when the API is slow
// or unreachable, so a click always starts the file transfer.
const FALLBACKS = {
  windows: {
    url: assetUrl("v1.0.3", "Matrix_1.0.3_x64-setup.exe"),
    filename: "Matrix_1.0.3_x64-setup.exe",
    version: "1.0.3",
  },
  macos: {
    url: assetUrl("v1.0.4", "Matrix_1.0.4_aarch64.dmg"),
    filename: "Matrix_1.0.4_aarch64.dmg",
    version: "1.0.4",
  },
  linux: {
    url: assetUrl("v1.0.4", "Matrix_1.0.4_amd64.AppImage"),
    filename: "Matrix_1.0.4_amd64.AppImage",
    version: "1.0.4",
  },
};

const OS_LABELS = { windows: "Windows", macos: "macOS", linux: "Linux" };

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
  const [installer, setInstaller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    resolveInstaller(os)
      .then((result) => {
        if (!cancelled) setInstaller(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [os]);

  const label = loading
    ? "Récupération de la version..."
    : installer
      ? `Télécharger pour ${OS_LABELS[os]}${installer.version ? ` (v${installer.version})` : ""}`
      : "Installer l'application";

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
      disabled={loading || !installer}
      className={`w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 tap-sm ${className}`}
      style={{
        background: "linear-gradient(135deg, #a855f7, #6d28d9)",
        boxShadow: "0 0 15px rgba(168,85,247,0.3)",
      }}
    >
      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {label}
    </button>
  );
}