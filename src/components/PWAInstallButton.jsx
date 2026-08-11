import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

const HELP_TEXT =
  "Sur iPhone : appuyez sur Partager > Sur l'écran d'accueil. Sur PC : cliquez sur le symbole (+) dans la barre d'adresse.";

export default function PWAInstallButton({ className = "" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => setInstalled(true);
    window.addEventListener("appinstalled", installedHandler);

    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } else {
      setShowHelp(true);
    }
  };

  if (installed) return null;

  return (
    <>
      <button
        onClick={handleInstall}
        className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition hover:opacity-90 tap-sm ${className}`}
        style={{
          background: "linear-gradient(135deg, #a855f7, #6d28d9)",
          boxShadow: "0 0 15px rgba(168,85,247,0.3)",
        }}
      >
        <Download className="w-4 h-4" />
        Télécharger l'application
      </button>

      {showHelp && (
        <div
          className="mt-2 p-3 rounded-xl flex items-start gap-2 text-xs text-white/80"
          style={{
            background: "rgba(15,10,25,0.8)",
            border: "1px solid rgba(168,85,247,0.3)",
          }}
        >
          <span className="flex-1 leading-relaxed">{HELP_TEXT}</span>
          <button
            onClick={() => setShowHelp(false)}
            className="shrink-0 text-white/40 hover:text-white/80 tap-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}