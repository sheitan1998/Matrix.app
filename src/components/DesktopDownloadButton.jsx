import React, { useState, useEffect } from "react";
import { Download, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const RELEASES_API = "https://api.github.com/repos/sheitan1998/Matrix.app/releases?per_page=20";

/** Picks the newest Windows installer (exe/msi) from the app's releases. */
async function resolveInstaller() {
  try {
    const resp = await base44.functions.invoke("getLatestRelease", {});
    const data = resp?.data || resp;
    if (data?.download_url && /\.(exe|msi)(\?|$)/i.test(data.download_url)) {
      return { url: data.download_url, version: data.version || null };
    }
  } catch {
    /* fall through to the public GitHub API */
  }

  try {
    const res = await fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) return null;
    const releases = await res.json();
    if (!Array.isArray(releases)) return null;
    for (const release of releases) {
      if (release.draft) continue;
      const assets = release.assets || [];
      const asset =
        assets.find((a) => /-setup\.exe$/i.test(a.name || "")) ||
        assets.find((a) => /\.msi$/i.test(a.name || "")) ||
        assets.find((a) => /\.exe$/i.test(a.name || ""));
      if (asset?.browser_download_url) {
        return {
          url: asset.browser_download_url,
          version: (release.tag_name || "").replace(/^v/i, "") || null,
        };
      }
    }
  } catch {
    /* no installer found */
  }
  return null;
}

export default function DesktopDownloadButton({ className = "" }) {
  const [version, setVersion] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    resolveInstaller()
      .then((result) => {
        if (cancelled) return;
        setDownloadUrl(result?.url || null);
        setVersion(result?.version || null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const label = loading
    ? "Récupération de la version..."
    : downloadUrl
      ? `Télécharger l'application${version ? ` (v${version})` : ""}`
      : "Installer l'application";

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.rel = "noopener";
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading || !downloadUrl}
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