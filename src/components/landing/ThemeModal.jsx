import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, Sun, Palette, Crown, Lock, X, Upload,
  Check, Sparkles, Loader2, RotateCcw
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { base44 } from "@/api/base44Client";
import CheckoutModal from "@/components/CheckoutModal";

const PRICE_LABEL = "3,00 € — Paiement unique (accès à vie)";
const MAX_SLOTS = 3;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MODES = [
  { id: "original", label: "Thème Original", desc: "Le fond spatial néon par défaut de MATRIX avec ses accents violets profonds", icon: Sparkles, preview: "linear-gradient(135deg, #0a050f, #1a0a2e)" },
  { id: "light", label: "Thème Clair", desc: "Fond lumineux propre et contrasté, textes sombres", icon: Sun, preview: "#F4F4F5" },
  { id: "dark", label: "Thème Sombre", desc: "Dark mode classique optimisé, fond uni noir", icon: Moon, preview: "#000000" },
  { id: "custom", label: "Personnalisé", desc: "Couleurs et image de fond sur mesure - achat unique, accès à vie", icon: Crown, preview: "linear-gradient(135deg, #1a0a2e, #6200ea)", vip: true, price: PRICE_LABEL },
];

const COLOR_PRESETS = ["#1a0a2e", "#0d1b2a", "#1b3a1b", "#3a0d0d", "#3a2d0d", "#0d2d3a", "#2d0d3a", "#000000"];

const NEON_PRESETS = [
  { color: "#a855f7", label: "Violet" },
  { color: "#22d3ee", label: "Cyan" },
  { color: "#ec4899", label: "Rose" },
  { color: "#22c55e", label: "Vert" },
  { color: "#f59e0b", label: "Or" },
  { color: "#3b82f6", label: "Bleu" },
  { color: "#ef4444", label: "Rouge" },
];

export default function ThemeModal({ open, onClose }) {
  const { prefs, updatePrefs, hasCustomBg, refreshCustomBg } = useTheme();
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const slots = Array.from({ length: MAX_SLOTS }, (_, i) => (Array.isArray(prefs.bgSlots) ? prefs.bgSlots[i] : "") || "");

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const handleFileUpload = async (file, index) => {
    if (!file || !hasCustomBg) return;
    setUploadError("");
    if (!IMAGE_TYPES.includes(file.type)) {
      setUploadError("Format non supporté : utilise une image JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image trop lourde (5 Mo maximum).");
      return;
    }
    setUploadingSlot(index);
    try {
      const { file_url } = await base44.integrations.Core.UploadPrivateFile({ file });
      const next = [...slots];
      next[index] = file_url;
      updatePrefs({ bgSlots: next, bgSlotIndex: index, bgImageUrl: file_url });
    } catch (err) {
      console.error("Theme upload error:", err);
      setUploadError("L'import a échoué, réessaie.");
    } finally {
      setUploadingSlot(null);
    }
  };

  const selectSlot = (index) => {
    if (slots[index]) updatePrefs({ bgImageUrl: slots[index], bgSlotIndex: index });
  };

  const clearSlot = (index) => {
    const next = [...slots];
    next[index] = "";
    const wasActive = prefs.bgSlotIndex === index;
    updatePrefs({ bgSlots: next, ...(wasActive ? { bgImageUrl: "", bgSlotIndex: -1 } : {}) });
  };

  const handleSubSuccess = async () => {
    await refreshCustomBg();
    setShowCheckout(false);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", pointerEvents: "auto" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-card text-card-foreground border border-primary/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                  <Palette className="w-5 h-5" style={{ color: "#a855f7" }} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">Personnalisation du Thème</h2>
                  <p className="text-xs text-muted-foreground">Choisis l'apparence de MATRIX</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center tap-sm hover:bg-foreground/10 transition">
                <X className="w-4 h-4 text-muted-foreground" />
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
                        background: isActive ? "rgba(168,85,247,0.12)" : "hsl(var(--foreground) / 0.03)",
                        border: isActive ? "1.5px solid rgba(168,85,247,0.5)" : "1px solid hsl(var(--border))",
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
                        <h3 className="text-sm font-bold text-foreground">{mode.label}</h3>
                        {mode.vip && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wide" style={{ background: "rgba(255,215,0,0.15)", color: "#ffd700", border: "1px solid rgba(255,215,0,0.3)" }}>VIP</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{mode.desc}</p>
                      {mode.price && (
                        <p className="text-[11px] font-bold mt-1" style={{ color: "#ffd700" }}>{mode.price}</p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sidebar neon color */}
              <div className="rounded-2xl p-4 border border-border" style={{ background: "hsl(var(--foreground) / 0.03)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4" style={{ color: prefs.neonColor || "#a855f7" }} />
                  <h3 className="text-sm font-bold text-foreground">Couleur des néons du panneau latéral</h3>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Choisis la teinte des lueurs et du menu de gauche.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {NEON_PRESETS.map((preset) => {
                    const isSelected = (prefs.neonColor || "#a855f7").toLowerCase() === preset.color;
                    return (
                      <button
                        key={preset.color}
                        type="button"
                        title={preset.label}
                        onClick={() => updatePrefs({ neonColor: preset.color })}
                        className="w-9 h-9 rounded-full transition-all hover:scale-110"
                        style={{
                          background: preset.color,
                          border: isSelected ? "2px solid #fff" : "2px solid transparent",
                          boxShadow: isSelected ? `0 0 16px ${preset.color}` : `0 0 8px ${preset.color}55`,
                        }}
                      />
                    );
                  })}
                  <label
                    className="relative w-9 h-9 rounded-full cursor-pointer flex items-center justify-center"
                    title="Couleur personnalisée"
                    style={{ background: "conic-gradient(red, orange, yellow, green, cyan, blue, purple, red)", border: "2px solid rgba(255,255,255,0.2)" }}>
                    <input
                      type="color"
                      value={prefs.neonColor || "#a855f7"}
                      onChange={(e) => updatePrefs({ neonColor: e.target.value })}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Palette className="w-4 h-4 text-white" style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }} />
                  </label>
                  <button
                    type="button"
                    onClick={() => updatePrefs({ neonColor: "#a855f7" })}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition hover:bg-foreground/10 tap-sm text-muted-foreground border border-border"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Réinitialiser par défaut
                  </button>
                </div>
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
                          <h3 className="text-base font-black text-foreground mb-1">Thème Personnalisé</h3>
                          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                            Personnalise les couleurs et l'arrière-plan de toute l'application. Importe tes images de fond et enregistre jusqu'à 3 favoris.
                          </p>
                          <div className="flex items-center justify-center gap-4 mb-4 text-[11px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" style={{ color: "#a855f7" }} /> Couleurs illimitées</span>
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" style={{ color: "#a855f7" }} /> 3 images sauvegardées</span>
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" style={{ color: "#a855f7" }} /> Accès à vie, sans abonnement</span>
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
                            {PRICE_LABEL}
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Color picker */}
                          <div>
                            <label className="text-sm font-bold text-foreground mb-2 block">Couleur de fond globale</label>
                            <p className="text-[11px] text-muted-foreground mb-3">Cette couleur deviendra le fond de toute l'application.</p>
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

                          {/* Background image gallery: 3 saved slots */}
                          <div className="rounded-2xl p-4 border border-border" style={{ background: "rgba(168,85,247,0.05)" }}>
                            <div className="flex items-center gap-2 mb-1">
                              <Crown className="w-4 h-4" style={{ color: "#d4a000" }} />
                              <h3 className="text-sm font-bold text-foreground">Image de fond globale</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(255,215,0,0.15)", color: "#b8860b", border: "1px solid rgba(255,215,0,0.3)" }}>DÉBLOQUÉ À VIE</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mb-3">
                              JPG, PNG ou WebP (5 Mo max). Enregistre jusqu'à {MAX_SLOTS} images, clique sur une image pour l'activer sur tout le site.
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                              {slots.map((url, index) => {
                                const isActiveSlot = !!url && prefs.bgImageUrl === url && prefs.bgSlotIndex === index;
                                return (
                                  <div key={index} className="space-y-1.5">
                                    <button
                                      type="button"
                                      disabled={!url}
                                      onClick={() => selectSlot(index)}
                                      className="relative w-full aspect-video rounded-xl overflow-hidden tap-sm border-2 transition"
                                      style={{ borderColor: isActiveSlot ? "#a855f7" : "hsl(var(--border))", background: "hsl(var(--muted))" }}
                                      aria-label={`Activer l'image ${index + 1}`}
                                    >
                                      {url ? (
                                        <img src={url} alt={`Image personnalisée ${index + 1}`} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground">Emplacement {index + 1}</span>
                                      )}
                                      {isActiveSlot && (
                                        <span className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#a855f7" }}>
                                          <Check className="w-3 h-3 text-white" />
                                        </span>
                                      )}
                                    </button>
                                    <div className="flex gap-1.5">
                                      <label
                                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg cursor-pointer text-[11px] font-bold text-white"
                                        style={{ background: "linear-gradient(135deg, #6200ea, #aa00ff)", opacity: uploadingSlot !== null ? 0.6 : 1 }}
                                      >
                                        {uploadingSlot === index ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                        {url ? "Remplacer" : "Importer"}
                                        <input
                                          type="file"
                                          accept="image/jpeg,image/png,image/webp"
                                          className="hidden"
                                          disabled={uploadingSlot !== null}
                                          onChange={(e) => { handleFileUpload(e.target.files?.[0], index); e.target.value = ""; }}
                                        />
                                      </label>
                                      {url && (
                                        <button
                                          type="button"
                                          onClick={() => clearSlot(index)}
                                          className="px-2 rounded-lg tap-sm border border-border text-muted-foreground hover:bg-foreground/10"
                                          aria-label={`Supprimer l'image ${index + 1}`}
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {uploadError && <p className="text-[11px] mt-2" style={{ color: "#dc2626" }}>{uploadError}</p>}
                            <div className="space-y-3 mt-4">
                              {prefs.bgImageUrl && (
                                <button
                                  type="button"
                                  onClick={() => updatePrefs({ bgImageUrl: "", bgSlotIndex: -1 })}
                                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg tap-sm border border-border text-muted-foreground hover:bg-foreground/10"
                                >
                                  Désactiver l'image de fond
                                </button>
                              )}
                              {prefs.bgImageUrl && (
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Voile sur l'image: {Math.round((1 - (prefs.bgOpacity ?? 0.5)) * 100)}%</label>
                                    <input
                                      type="range"
                                      min="0.1"
                                      max="0.9"
                                      step="0.1"
                                      value={prefs.bgOpacity ?? 0.5}
                                      onChange={(e) => updatePrefs({ bgOpacity: parseFloat(e.target.value) })}
                                      className="w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Opacité des cartes et panneaux: {Math.round((prefs.panelOpacity ?? 0.8) * 100)}%</label>
                                    <input
                                      type="range"
                                      min="0.4"
                                      max="1"
                                      step="0.05"
                                      value={prefs.panelOpacity ?? 0.8}
                                      onChange={(e) => updatePrefs({ panelOpacity: parseFloat(e.target.value) })}
                                      className="w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Flou derrière les panneaux: {prefs.bgBlur ?? 0}px</label>
                                    <input
                                      type="range"
                                      min="0"
                                      max="20"
                                      step="1"
                                      value={prefs.bgBlur ?? 0}
                                      onChange={(e) => updatePrefs({ bgBlur: parseInt(e.target.value, 10) })}
                                      className="w-full"
                                    />
                                  </div>
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
                <p className="text-xs text-muted-foreground">
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
          params={{ action: "createCustomThemePurchase" }}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleSubSuccess}
        />
      )}
    </AnimatePresence>,
    document.body
  );
}