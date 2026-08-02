import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { User } from "lucide-react";
import AuthModal from "@/components/landing/AuthModal";
import CosmicBackground from "./CosmicBackground";
import TrixWalletBar from "@/components/TrixWalletBar";

export default function TutoGamingLayout() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen relative">
      <CosmicBackground />

      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3"
        style={{
          background: "rgba(13,5,24,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(191,90,242,0.2)",
        }}
      >
        {/* Left: MATRIX logo */}
        <Link to="/" className="flex items-center gap-2 tap-sm">
          <h1 className="text-xl font-black text-white tracking-tight">
            MATRI<span style={{ color: "#BF5AF2" }}>X</span>
          </h1>
        </Link>

        {/* Center: TUTO GAMING ENTRAIDE */}
        <div
          className="hidden sm:flex items-center px-5 py-1.5 rounded-full"
          style={{
            background: "rgba(191,90,242,0.1)",
            border: "1px solid rgba(191,90,242,0.3)",
          }}
        >
          <span className="text-[11px] font-black tracking-[0.2em] uppercase text-white">
            Tuto Gaming Entraide
          </span>
        </div>

        {/* Right: Trix balance + Boutique + Profile */}
        <div className="flex items-center gap-3 ml-auto">
          <TrixWalletBar />
        </div>
        {!user && (
          <button
            onClick={() => setShowAuth(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full tap-sm"
            style={{
              border: "1.5px solid rgba(191,90,242,0.4)",
              background: "rgba(191,90,242,0.05)",
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "rgba(191,90,242,0.2)" }}
            >
              <User className="w-3.5 h-3.5" style={{ color: "#BF5AF2" }} />
            </div>
            <span className="text-xs font-bold text-white hidden sm:inline">Se connecter</span>
          </button>
        )}

        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      </header>

      {/* Page content */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}