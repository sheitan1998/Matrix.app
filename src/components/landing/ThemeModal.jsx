import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, Sun, Palette, Crown, Lock, X, Upload, Image as ImageIcon,
  Check, Sparkles
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { base44 } from "@/api/base44Client";

const MODES = [
  { id: "dark", label: "Thème Sombre", desc: "Le design spatial néon par défaut", icon: Moon, preview: "linear-gradient(135deg, #0a050f, #1a0a2e)" },
  { id: "light", label: "Thème Clair", desc: "Variante lumineuse pour le jour", icon: Sun, preview: "linear-gradient(135deg, #f8f8ff, #e8e0ff)" },
  { id: "custom", label: "Personnalisé", desc: "Choisis tes couleurs et ton fond", icon: Palette, preview: "linear-gradient(135deg, #0a050f, #6200ea)" },
];

const ACCENT_PRESETS = ["#a855f7", "#8a2be2", "#ff00ff", "#ff4500", "#00ced1", "#00ff7f", "#ffd700", "#3b82f6"];

export default function ThemeModal({ open, onClose }) {
  const { prefs, updatePrefs, isVip, vipChecked } = useTheme();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!isVip) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPrivateFile({ file });
      updatePrefs({ bgImageUrl: file_url });
    } catch (err) {
      console.error("Theme upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", pointerEvents: "auto" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl"
            style={{
              background: "linear-gradient(135deg, #0e0a15 0%, #1a0a2e 100%)",
              border: "1px solid rgba(168,85,247,0.3)",
              boxShadow: "0 0 50px rgba(168,85,247,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4" style={{ borderBottom: "1px solid rgba(168,85,247,0.15)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                  <Palette className="w-5 h-5" style={{ color: "#a855f7" }} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Personnalisation du Thème</h2>
                  <p className="text-xs text-white/50">Choisis l'apparence de MATRIX</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center tap-sm hover:bg-white/10 transition">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Mode selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => updatePrefs({ mode: mode.id })}
                    className="relative rounded-2xl p-4 text-left transition-all"
                    style={{
                      background: prefs.mode === mode.id ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.02)",
                      border: prefs.mode === mode.id ? "1.5px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.06)",
                      boxShadow: prefs.mode === mode.id ? "0 0 20px rgba(168,85,247,0.2)" : "none",
                    }}
                  >
                    {prefs.mode === mode.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#a855f7" }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="w-full h-16 rounded-lg mb-3" style={{ background: mode.preview }} />
                    <div className="flex items-center gap-2 mb-1">
                      <mode.icon className="w-4 h-4" style={{ color: "#a855f7" }} />
                      <h3 className="text-sm font-bold text-white">{mode.label}</h3>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed">{mode.desc}</p>
                  </button>
                ))}
              </div>

              {/* Custom theme options */}
              <AnimatePresence>
                {prefs.mode === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-5 pt-2">
                      {/* Accent color */}
                      <div>
                        <label className="text-sm font-bold text-white mb-2 block">Couleur d'accentuation néon</label>
                        <div className="flex items-center gap-3 flex-wrap">
                          {ACCENT_PRESETS.map((color) => (
                            <button
                              key={color}
                              onClick={() => updatePrefs({ customAccent: color })}
                              className="w-9 h-9 rounded-full transition-all hover:scale-110"
                              style={{
                                background: color,
                                border: prefs.customAccent === color ? "2px solid #fff" : "2px solid transparent",
                                boxShadow: prefs.customAccent === color ? `0 0 15px ${color}` : "none",
                              }}
                            />
                          ))}
                          <label className="relative w-9 h-9 rounded-full cursor-pointer flex items-center justify-center"
                            style={{ background: "conic-gradient(red, orange, yellow, green, cyan, blue, purple, red)", border: "2px solid rgba(255,255,255,0.2)" }}>
                            <input
                              type="color"
                              value={prefs.customAccent}
                              onChange={(e) => updatePrefs({ customAccent: e.target.value })}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Palette className="w-4 h-4 text-white" style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }} />
                          </label>
                        </div>
                      </div>

                      {/* Background image (VIP) */}
                      <div className="rounded-2xl p-4" style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          {isVip ? (
                            <Crown className="w-4 h-4" style={{ color: "#ffd700" }} />
                          ) : (
                            <Lock className="w-4 h-4" style={{ color: "#b0b0b0" }} />
                          )}
                          <h3 className="text-sm font-bold text-white">Image de fond personnalisée</h3>
                          {isVip && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(255,215,0,0.15)", color: "#ffd700", border: "1px solid rgba(255,215,0,0.3)" }}>VIP</span>}
                        </div>

                        {isVip ? (
                          <div className="space-y-3">
                            {prefs.bgImageUrl && (
                              <div className="relative w-full h-24 rounded-xl overflow-hidden" style={{ background: "#0a050f" }}>
                                <img src={prefs.bgImageUrl} alt="Fond" className="w-full h-full object-cover" />
                                <button
                                  onClick={() => updatePrefs({ bgImageUrl: "" })}
                                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center tap-sm"
                                  style={{ background: "rgba(0,0,0,0.6)" }}
                                >
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            )}
                            <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl cursor-pointer transition hover:scale-[1.01]"
                              style={{ background: "linear-gradient(135deg, #6200ea, #aa00ff)", opacity: uploading ? 0.6 : 1 }}>
                              {uploading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span className="text-sm font-bold text-white">Import en cours...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 text-white" />
                                  <span className="text-sm font-bold text-white">Importer une image de fond</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploading}
                                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                              />
                            </label>
                            {prefs.bgImageUrl && (
                              <div>
                                <label className="text-xs text-white/50 mb-1 block">Opacité du fond: {Math.round((prefs.bgOpacity || 0.5) * 100)}%</label>
                                <input
                                  type="range"
                                  min="0.1"
                                  max="0.9"
                                  step="0.1"
                                  value={prefs.bgOpacity || 0.5}
                                  onChange={(e) => updatePrefs({ bgOpacity: parseFloat(e.target.value) })}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-xs text-white/50 mb-3">
                              L'image de fond personnalisée est réservée aux membres VIP (3 €/mois).
                              Soutiens MATRIX et profite de cette fonctionnalité exclusive !
                            </p>
                            <a
                              href="/premium"
                              onClick={(e) => { e.preventDefault(); window.location.href = "/premium"; }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:scale-105 tap-sm"
                              style={{
                                background: "linear-gradient(135deg, #ffd700, #ff8c00)",
                                boxShadow: "0 0 20px rgba(255,215,0,0.3)",
                              }}
                            >
                              <Crown className="w-4 h-4" />
                              Devenir VIP
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Preview note */}
              <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "rgba(168,85,247,0.05)" }}>
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#a855f7" }} />
                <p className="text-xs text-white/50">
                  Tes préférences sont sauvegardées automatiquement et conservées lors de tes prochaines visites.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}