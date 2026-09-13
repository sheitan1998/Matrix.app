import React, { useState } from "react";
import { X, Download, Check } from "lucide-react";
import { toast } from "sonner";
import { installUpdate } from "@/lib/updater";

/**
 * Modal de mise à jour avec affichage des infos et actions
 * @param {Object} update - Objet contenant les infos de mise à jour
 * @param {string} update.current_version - Version actuelle
 * @param {string} update.latest_version - Nouvelle version disponible
 * @param {string} update.body - Notes de version (optionnel)
 * @param {string} update.date - Date de la version (optionnel)
 * @param {Function} onClose - Callback quand la modal se ferme
 * @param {Function} onInstalled - Callback après installation réussie
 */
export default function UpdateModal({ update, onClose, onInstalled }) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  const handleInstallUpdate = async () => {
    setIsInstalling(true);
    setInstallProgress(10);

    try {
      // Simuler la progression pendant le téléchargement
      const progressInterval = setInterval(() => {
        setInstallProgress((prev) => {
          if (prev < 90) return prev + Math.random() * 30;
          return prev;
        });
      }, 500);

      const result = await installUpdate();

      clearInterval(progressInterval);
      setInstallProgress(100);

      if (result.success) {
        toast.success("Mise à jour installée ✨", {
          description: "L'application redémarrera automatiquement...",
        });
        setTimeout(() => {
          if (onInstalled) onInstalled();
        }, 1000);
      } else {
        toast.error("Erreur lors de l'installation", {
          description: result.message || "Impossible d'installer la mise à jour",
        });
        setIsInstalling(false);
        setInstallProgress(0);
      }
    } catch (error) {
      console.error("Erreur d'installation:", error);
      toast.error("Erreur d'installation", {
        description: error.message || "Une erreur est survenue",
      });
      setIsInstalling(false);
      setInstallProgress(0);
    }
  };

  if (!update) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-lg text-white">Mise à jour disponible</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isInstalling}
            className="p-1 hover:bg-white/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Version Info */}
          <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Version actuelle</span>
              <span className="font-mono font-bold text-slate-200">
                {update.current_version}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Nouvelle version</span>
              <span className="font-mono font-bold text-green-400">
                {update.latest_version}
              </span>
            </div>
            {update.date && (
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Date</span>
                <span>{new Date(update.date).toLocaleDateString("fr-FR")}</span>
              </div>
            )}
          </div>

          {/* Release Notes */}
          {update.body && (
            <div className="bg-slate-800/30 rounded-lg p-3 max-h-32 overflow-y-auto">
              <p className="text-xs text-slate-400 mb-2 font-semibold">Notes de version:</p>
              <div className="text-sm text-slate-300 whitespace-pre-wrap break-words">
                {update.body}
              </div>
            </div>
          )}

          {/* Installation Progress */}
          {isInstalling && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Téléchargement et installation...</span>
                <span className="text-xs font-mono text-blue-400">
                  {Math.round(installProgress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${installProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-slate-800/50 px-6 py-4 flex gap-3 border-t border-slate-700">
          <button
            onClick={onClose}
            disabled={isInstalling}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Plus tard
          </button>
          <button
            onClick={handleInstallUpdate}
            disabled={isInstalling}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isInstalling ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Installation...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Installer maintenant
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
