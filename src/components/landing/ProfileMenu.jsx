import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Settings, LogOut, Loader2 } from "lucide-react";

export default function ProfileMenu({ user, onClose, onLogout }) {
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    await onLogout();
  };

  const displayName = user?.full_name || user?.pseudo || user?.email?.split("@")[0] || "Utilisateur";
  const initial = displayName?.[0]?.toUpperCase() || "U";

  return (
    <>
      {/* Click-away overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50"
        style={{
          background: "#12091c",
          border: "1.5px solid rgba(168,85,247,0.3)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* User info */}
        <div
          className="p-4"
          style={{ borderBottom: "1px solid rgba(168,85,247,0.15)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white overflow-hidden shrink-0"
              style={{ background: "rgba(168,85,247,0.2)" }}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="p-2">
          <Link
            to="/mon-profil"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition tap-sm"
          >
            <User className="w-3.5 h-3.5" />
            Mon profil
          </Link>
          <Link
            to="/progression"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition tap-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            Préférences
          </Link>

          <div className="h-px my-1.5" style={{ background: "rgba(168,85,247,0.12)" }} />

          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition tap-sm disabled:opacity-50"
          >
            {logoutLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            Déconnexion
          </button>
        </div>
      </motion.div>
    </>
  );
}