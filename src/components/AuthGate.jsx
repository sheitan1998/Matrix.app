import React, { useState } from "react";
import AuthModal from "@/components/landing/AuthModal";

/**
 * Affiche le AuthModal (popup de connexion) au lieu de rediriger
 * vers la page /login quand un utilisateur non authentifié tente
 * d'accéder à une route protégée.
 */
export default function AuthGate() {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    // Redirige vers la landing si l'utilisateur ferme sans se connecter
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a050f" }}>
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-black text-white mb-2">Connexion requise</h1>
          <p className="text-sm text-white/50">
            Vous devez être connecté pour accéder à cette page.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 rounded-xl text-sm font-black text-white transition hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #a855f7, #7c3aed)",
            boxShadow: "0 0 20px rgba(168,85,247,0.3)",
          }}
        >
          Se connecter
        </button>
      </div>
      <AuthModal open={open} onClose={handleClose} />
    </div>
  );
}