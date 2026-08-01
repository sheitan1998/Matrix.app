import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ChevronDown, User } from "lucide-react";
import AuthModal from "@/components/landing/AuthModal";
import ProfileMenu from "@/components/landing/ProfileMenu";
import CosmicBackground from "./CosmicBackground";

export default function TutoGamingLayout() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleProfileClick = () => {
    if (user) setShowMenu(!showMenu);
    else setShowAuth(true);
  };

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  const displayName =
    user?.pseudo || user?.full_name || user?.email?.split("@")[0] || "Se connecter";

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

        {/* Right: Profile */}
        <div className="relative">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full tap-sm"
            style={{
              border: "1.5px solid rgba(191,90,242,0.4)",
              background: "rgba(191,90,242,0.05)",
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: "rgba(191,90,242,0.2)" }}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-3.5 h-3.5" style={{ color: "#BF5AF2" }} />
              )}
            </div>
            <span className="text-xs font-bold text-white hidden sm:inline">{displayName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </button>

          <AnimatePresence>
            {showMenu && user && (
              <ProfileMenu
                user={user}
                onClose={() => setShowMenu(false)}
                onLogout={handleLogout}
              />
            )}
          </AnimatePresence>
        </div>

        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      </header>

      {/* Page content */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}