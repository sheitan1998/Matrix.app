import React, { useState, useEffect } from "react";
import { Download, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DesktopDownloadButton({ className = "" }) {
  const [version, setVersion] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchLatest = async () => {
      try {
        const resp = await base44.functions.invoke("getLatestRelease", {});
        const data = resp?.data || resp;
        if (cancelled) return;
        setVersion(data.version || null);
        setDownloadUrl(data.download_url || null);
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
    : "Télécharger l'application";

  const href = downloadUrl || "https://github.com/sheitan1998/Matrix.app/releases/latest";

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