import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, Sun, Palette, Crown, Lock, X, Upload,
  Check, Sparkles, Loader2, Image as ImageIcon
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { base44 } from "@/api/base44Client";
import CheckoutModal from "@/components/CheckoutModal";

const MODES = [
  { id: "original", label: "Thème Original", desc: "Le fond spatial néon par défaut de MATRIX avec ses accents violets profonds", icon: Sparkles, preview: "linear-gradient(135deg, #0a050f, #1a0a2e)" },
  { id: "light", label: "Thème Clair", desc: "Fond lumineux propre et contrasté, textes sombres", icon: Sun, preview: "#F4F4F5" },
  { id: "dark", label: "Thème Sombre", desc: "Dark mode classique optimisé, fond uni noir", icon: Moon, preview: "#000000" },
  { id: "custom", label: "Personnalisé VIP", desc: "Couleurs et visuels personnalisés - réservé aux abonnés VIP", icon: Crown, preview: "linear-gradient(135deg, #1a0a2e, #6200ea)", vip: true, price: "2,99 €/mois" },
];

const COLOR_PRESETS = ["#1a0a2e", "#0d1b2a", "#1b3a1b", "#3a0d0d", "#3a2d0d", "#0d2d3a", "#2d0d3a", "#000000"];

export default function ThemeModal({ open, onClose }) {
  const { prefs, updatePrefs, hasCustomBg, customBgChecked, refreshCustomBg } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!hasCustomBg) return;
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

  const handleSubSuccess = async () => {
    await refreshCustomBg();
    setShowCheckout(false);
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MODES.map((mode) => {
                  const isVipLocked = mode.vip && !hasCustomBg;
                  const isActive = prefs.mode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        if (isVipLocked && mode.id === "custom") {
                          setShowCheckout(true);
                          return;
                        }
                        updatePrefs({ mode: mode.id });
                      }}
                      className="relative rounded-2xl p-4 text-left transition-all"
                      style={{
                        background: isActive ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.02)",
                        border: isActive ? "1.5px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.06)",
                        boxShadow: isActive ? "0 0 20px rgba(168,85,247,0.2)" : "none",
                      }}
                    >
                      {isActive && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#a855f7" }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {isVipLocked && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#ffd700" }}>
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="w-full h-16 rounded-lg mb-3 relative overflow-hidden" style={{ background: mode.preview }}>
                        {mode.vip && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Crown className="w-5 h-5" style={{ color: "#ffd700", filter: "drop-shadow(0 0 4px rgba(255,215,0,0.6))" }} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <mode.icon className="w-4 h-4" style={{ color: mode.vip ? "#ffd700" : "#a855f7" }} />
                        <h3 className="text-sm font-bold text-white">{mode.label}</h3>
                        {mode.vip && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wide" style={{ background: "rgba(255,215,0,0.15)", color: "#ffd700", border: "1px solid rgba(255,215,0,0.3)" }}>VIP</span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/40 leading-relaxed">{mode.desc}</p>
                      {mode.price && (
                        <p className="text-[11px] font-bold mt-1" style={{ color: "#ffd700" }}>{mode.price}</p>
                      )}
                    </button>
                  );
                })}
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
                      {/* VIP Lock Panel */}
                      {!hasCustomBg ? (
                        <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(255,215,0,0.05))", border: "1px solid rgba(255,215,0,0.2)" }}>
                          <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(255,215,0,0.1)", border: "2px solid rgba(255,215,0,0.3)" }}>
                            <Crown className="w-7 h-7" style={{ color: "#ffd700", filter: "drop-shadow(0 0 6px rgba(255,215,0,0.5))" }} />
                          </div>
                          <h3 className="text-base font-black text-white mb-1">Thème Personnalisé VIP</h3>
                          <p className="text-xs text-white/50 mb-4 leading-relaxed">
                            Personnalise les couleurs et les visuels de toute l'application. Upload d'images de fond, couleurs sur mesure et bien plus encore.
                          </p>
                          <div className="flex items-center justify-center gap-4 mb-4 text-[11px] text-white/40">
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" style={{ color: "#a855f7" }} /> Couleurs illimitées</span>
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" style={{ color: "#a855f7" }} /> Image de fond</span>
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" style={{ color: "#a855f7" }} /> Sans engagement</span>
                          </div>
                          <button
                            onClick={() => setShowCheckout(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white transition hover:scale-105 tap-sm"
                            style={{
                              background: "linear-gradient(135deg, #6200ea, #aa00ff)",
                              boxShadow: "0 0 25px rgba(168,85,247,0.4)",
                            }}
                          >
                            <Crown className="w-4 h-4" />
                            S'abonner VIP - 2,99 €/mois
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Color picker */}
                          <div>
                            <label className="text-sm font-bold text-white mb-2 block">Couleur de fond globale</label>
                            <p className="text-[11px] text-white/40 mb-3">Cette couleur deviendra le fond de toute l'application.</p>
                            <div className="flex items-center gap-3 flex-wrap">
                              {COLOR_PRESETS.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => updatePrefs({ customColor: color })}
                                  className="w-9 h-9 rounded-full transition-all hover:scale-110"
                                  style={{
                                    background: color,
                                    border: prefs.customColor === color ? "2px solid #fff" : "2px solid transparent",
                                    boxShadow: prefs.customColor === color ? `0 0 15px ${color}` : "none",
                                  }}
                                />
                              ))}
                              <label className="relative w-9 h-9 rounded-full cursor-pointer flex items-center justify-center"
                                style={{ background: "conic-gradient(red, orange, yellow, green, cyan, blue, purple, red)", border: "2px solid rgba(255,255,255,0.2)" }}>
                                <input
                                  type="color"
                                  value={prefs.customColor}
                                  onChange={(e) => updatePrefs({ customColor: e.target.value })}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Palette className="w-4 h-4 text-white" style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }} />
                              </label>
                            </div>
                          </div>

                          {/* Background image (VIP) */}
                          <div className="rounded-2xl p-4" style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)" }}>
                            <div className="flex items-center gap-2 mb-3">
                              <Crown className="w-4 h-4" style={{ color: "#ffd700" }} />
                              <h3 className="text-sm font-bold text-white">Image de fond personnalisée</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(255,215,0,0.15)", color: "#ffd700", border: "1px solid rgba(255,215,0,0.3)" }}>VIP ACTIF</span>
                            </div>
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
                                    <Loader2 className="w-4 h-4 text-white animate-spin" />
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
                          </div>
                        </>
                      )}
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

      {showCheckout && (
        <CheckoutModal
          functionName="stripePayment"
          params={{ action: "createCustomBgSubscription", plan: "vip_custom_theme" }}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleSubSuccess}
        />
      )}
    </AnimatePresence>
  );
}