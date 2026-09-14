import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Bell, MessageSquare, ChevronDown, Plus, User } from "lucide-react";

export default function MatrixTopbar({ title, searchPlaceholder = "Rechercher dans MATRIX..." }) {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3"
      style={{ background: "rgba(10,10,12,0.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <h2 className="text-lg font-black text-white hidden sm:block">{title}</h2>

      <div className="flex-1 max-w-md mx-auto sm:mx-0 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          placeholder={searchPlaceholder}
          className="w-full h-10 pl-10 pr-4 rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="relative w-10 h-10 rounded-xl flex items-center justify-center transition text-white/50 hover:text-white hover:bg-white/5">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#a855f7" }} />
        </button>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center transition text-white/50 hover:text-white hover:bg-white/5">
          <MessageSquare className="w-5 h-5" />
        </button>

        <button className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
          <Plus className="w-4 h-4" /> Créer
        </button>

        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 h-10 px-2 sm:px-3 rounded-xl transition"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
              style={{ background: "rgba(139,92,246,0.3)" }}>
              {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" alt="" /> : <User className="w-4 h-4" />}
            </div>
            <span className="text-xs font-bold text-white hidden sm:block">{user?.pseudo || user?.full_name || user?.email?.split("@")[0] || "Invité"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-52 rounded-2xl overflow-hidden z-50"
              style={{ background: "rgba(18,18,20,0.95)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseLeave={() => setMenuOpen(false)}>
              <button onClick={() => { nav("/mon-profil"); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition">
                <User className="w-4 h-4" /> Mon profil
              </button>
              <button onClick={() => base44.auth.logout()}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition">
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}