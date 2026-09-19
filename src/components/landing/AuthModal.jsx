import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { X, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { startOAuthLogin } from "@/lib/startOAuthLogin";

export default function AuthModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      setLoading(false);
      setError(err.message || "Email ou mot de passe incorrect");
    }
  };

  const handleOAuthProvider = async (provider) => {
    setError("");
    setOauthLoadingProvider(provider);

    try {
      await startOAuthLogin(provider, "/oauth/callback");
    } catch (oauthError) {
      setError(
        oauthError?.response?.data?.provider_message ||
          oauthError?.response?.data?.error_description ||
          oauthError?.response?.data?.error ||
          oauthError?.message ||
          "Impossible de démarrer la connexion OAuth."
      );
    } finally {
      setOauthLoadingProvider("");
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: "#12091c", border: "1.5px solid rgba(168,85,247,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(168,85,247,0.15)" }}
            >
              <h2 className="text-sm font-black tracking-wider uppercase text-white">
                Connexion
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {error && (
                <div
                  className="flex items-center gap-2 p-2.5 rounded-lg"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#ef4444" }} />
                  <span className="text-xs text-red-400">{error}</span>
                </div>
              )}

              {/* Social login buttons */}
              <button
                onClick={() => handleOAuthProvider("google")}
                disabled={loading || Boolean(oauthLoadingProvider)}
                className="w-full h-10 rounded-lg flex items-center justify-center gap-2 text-sm font-bold text-white transition disabled:opacity-50 tap-sm"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                {oauthLoadingProvider === "google" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <GoogleIcon className="w-4 h-4" />
                )}
                Continuer avec Google
              </button>



              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: "rgba(168,85,247,0.15)" }} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                  ou
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(168,85,247,0.15)" }} />
              </div>

              {/* Email */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@email.com"
                    className="w-full h-10 pl-9 pr-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                    style={{
                      background: "rgba(168,85,247,0.05)",
                      border: "1px solid rgba(168,85,247,0.2)",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-9 pr-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                    style={{
                      background: "rgba(168,85,247,0.05)",
                      border: "1px solid rgba(168,85,247,0.2)",
                    }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-10 rounded-lg text-sm font-black tracking-wider uppercase transition disabled:opacity-50 tap-sm"
                style={{
                  background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                  color: "#fff",
                  boxShadow: "0 0 15px rgba(168,85,247,0.3)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>

              {/* Register link */}
              <div className="text-center">
                <span className="text-[11px] text-white/40">Pas encore de compte ? </span>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="text-[11px] font-bold"
                  style={{ color: "#a855f7" }}
                >
                  S'inscrire
                </Link>
              </div>

              {/* Forgot password */}
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  onClick={onClose}
                  className="text-[10px] text-white/30 hover:text-white/50 transition"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}