import React, { useState, useEffect } from "react";
import { Download, X, Plus } from "lucide-react";
import { getDeferredPrompt, isStandalone, onPWAChange, trackInstallation } from "@/lib/pwa";

const IOS_SHARE_SVG = (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2L12 2C12.5 2 13 2.5 13 3V9.5L14.5 8C14.9 7.6 15.5 7.6 15.9 8C16.3 8.4 16.3 9 15.9 9.4L12.7 12.6C12.3 13 11.7 13 11.3 12.6L8.1 9.4C7.7 9 7.7 8.4 8.1 8C8.5 7.6 9.1 7.6 9.5 8L11 9.5V3C11 2.5 11.5 2 12 2Z" />
    <path d="M5 14C5 13.4 5.4 13 6 13H18C18.6 13 19 13.4 19 14V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V14ZM7 15V19H17V15H7Z" />
  </svg>
);

const isIOS = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isNotEdgeOrChrome = !/CriOS|FxiOS|EdiOS/.test(ua);
  return isIOSDevice && isNotEdgeOrChrome;
};

export default function PWAInstallButton({ className = "" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(getDeferredPrompt());
  const [installed, setInstalled] = useState(isStandalone());
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);

  useEffect(() => {
    setDeferredPrompt(getDeferredPrompt());
    setInstalled(isStandalone());
    const unsubscribe = onPWAChange((prompt, appInstalled) => {
      if (appInstalled) {
        setInstalled(true);
        setDeferredPrompt(null);
      } else {
        setDeferredPrompt(prompt);
      }
    });
    return unsubscribe;
  }, []);

  const handleInstall = async () => {
    const prompt = getDeferredPrompt();
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        trackInstallation();
      }
      setDeferredPrompt(null);
    } else if (isIOS()) {
      setShowIOSModal(true);
    } else {
      setShowAndroidHelp(true);
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

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-5 pt-5 pb-3" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(109,40,217,0.08))" }}>
              <button
                onClick={() => setShowIOSModal(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center tap-sm"
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                <X className="w-3.5 h-3.5 text-white/80" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-5 h-5" style={{ color: "#a855f7" }} />
                <h2 className="text-base font-black text-white">Installer Matrix</h2>
              </div>
              <p className="text-xs text-white/50">Suivez ces 2 étapes sur Safari</p>
            </div>

            {/* Steps */}
            <div className="px-5 py-5 space-y-4">
              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Appuyez sur le bouton Partager</p>
                  <p className="text-xs text-white/50 mt-1">Icône carrée avec une flèche vers le haut, en bas de l'écran.</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                      {IOS_SHARE_SVG}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Sélectionnez « Sur l'écran d'accueil »</p>
                  <p className="text-xs text-white/50 mt-1">Faites défiler et touchez l'option avec l'icône « + ».</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5">
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition hover:opacity-90 tap-sm"
                style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android/Desktop fallback help */}
      {showAndroidHelp && (
        <div
          className="mt-2 p-3 rounded-xl flex items-start gap-2 text-xs text-white/80"
          style={{ background: "rgba(15,10,25,0.8)", border: "1px solid rgba(168,85,247,0.3)" }}
        >
          <span className="flex-1 leading-relaxed">
            Sur PC : cliquez sur l'icône « + » dans la barre d'adresse du navigateur. Sur Android : ouvrez le menu du navigateur et sélectionnez « Installer l'application ».
          </span>
          <button
            onClick={() => setShowAndroidHelp(false)}
            className="shrink-0 text-white/40 hover:text-white/80 tap-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}