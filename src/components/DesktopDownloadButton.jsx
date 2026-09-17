import React from "react";
import { Download } from "lucide-react";

const MSI_DIRECT_URL = "https://github.com/sheitan1998/Matrix.app/releases/latest/download/Matrix_x64-en-US.msi";

export default function DesktopDownloadButton({ className = "" }) {
  return (
    <a
      href={MSI_DIRECT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition hover:opacity-90 tap-sm ${className}`}
      style={{
        background: "linear-gradient(135deg, #a855f7, #6d28d9)",
        boxShadow: "0 0 15px rgba(168,85,247,0.3)",
      }}
    >
      <Download className="w-4 h-4" />
      ⬇️ Télécharger l'application
    </a>
  );
}