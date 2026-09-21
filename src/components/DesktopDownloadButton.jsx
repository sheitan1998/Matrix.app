import React, { useState, useEffect } from "react";
import { Download, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const GITHUB_LATEST_API = "https://api.github.com/repos/sheitan1998/Matrix.app/releases/latest";

function findInstallerAsset(assets) {
  if (!Array.isArray(assets) || assets.length === 0) return null;
  return (
    assets.find((a) => a.name?.endsWith("-setup.exe")) ||
    assets.find((a) => a.name?.endsWith(".msi")) ||
    assets.find((a) => a.name?.endsWith(".exe")) ||
    assets[0]
  );
}

export default function DesktopDownloadButton({ className = "" }) {
  const [version, setVersion] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchLatest = async () => {
      try {
        const resp = await fetch(GITHUB_LATEST_API, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!resp.ok) throw new Error("GitHub API error");
        const data = await resp.json();
        if (cancelled) return;
        const tag = data.tag_name?.replace(/^v/i, "") || "";
        const asset = findInstallerAsset(data.assets);
        setVersion(tag);
        setDownloadUrl(asset?.browser_download_url || data.html_url || null);
      } catch {
        if (!cancelled) setDownloadUrl(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLatest();
    return () => { cancelled = true; };
  }, []);

  const label = loading
    ? "Récupération de la version..."
    : version
    ? `⬇️ Télécharger — v${version}`
    : "⬇️ Télécharger l'application";

  const href = downloadUrl || "/downloads/matrix-setup.exe";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition hover:opacity-90 tap-sm ${className}`}
      style={{
        background: "linear-gradient(135deg, #a855f7, #6d28d9)",
        boxShadow: "0 0 15px rgba(168,85,247,0.3)",
      }}
    >
      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {label}
    </a>
  );
}