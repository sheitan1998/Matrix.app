import { useTwitchAuth } from "@/context/TwitchAuthContext";
import { Twitch as TwitchIcon, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function TwitchProfileMenu() {
  const { twitchUser, isAuthenticated, loading, login, logout } = useTwitchAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-[#1f1f2e] animate-pulse shrink-0" />
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={login}
        className="h-9 px-3 rounded-full bg-[#9146FF] hover:bg-[#9146FF]/80 text-white text-sm font-semibold flex items-center gap-1.5 tap-sm transition-colors shrink-0"
      >
        <TwitchIcon className="w-4 h-4" />
        <span className="hidden sm:block">Connexion Twitch</span>
      </button>
    );
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#9146FF] hover:border-[#db2777] transition-colors tap-sm"
        aria-label="Profil Twitch"
      >
        {twitchUser?.profile_image_url ? (
          <img src={twitchUser.profile_image_url} alt={twitchUser.display_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#9146FF] flex items-center justify-center text-white font-bold text-sm">
            {(twitchUser?.display_name || "T")[0]?.toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-64 bg-[#161321] border border-[#2a2a3e] rounded-xl shadow-2xl overflow-hidden">
          {/* User info */}
          <div className="flex items-center gap-3 p-4 border-b border-[#2a2a3e]">
            {twitchUser?.profile_image_url && (
              <img src={twitchUser.profile_image_url} alt="" className="w-12 h-12 rounded-full object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold text-sm truncate">{twitchUser?.display_name}</p>
              <p className="text-[#a0a0b0] text-xs truncate">@{twitchUser?.login}</p>
            </div>
          </div>

          {/* Stats */}
          {twitchUser?.broadcaster_type && (
            <div className="px-4 py-2 border-b border-[#2a2a3e]">
              <span className="text-xs text-[#a0a0b0]">
                {twitchUser.broadcaster_type === "partner" ? "Partenaire Twitch" :
                 twitchUser.broadcaster_type === "affiliate" ? "Affilié Twitch" : "Utilisateur"}
              </span>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="w-full px-4 py-3 flex items-center gap-2 text-sm text-[#a0a0b0] hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}