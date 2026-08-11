import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, ChevronDown, Check, RefreshCw } from "lucide-react";
import { useYouTubeAuth } from "@/hooks/useYouTubeAuth";
import { formatViews } from "@/lib/format";

// Official YouTube icon PNG (red rectangle + white triangle — brand guidelines, proportions must not be altered)
const YT_ICON_RED = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/c4e71cf23_yt_icon_red_digital.png";

/**
 * Top-right profile for the YouTube universe only.
 * Shows the connected YouTube channel (avatar, name, stats),
 * with Google OAuth login/logout and multi-channel switching.
 */
export default function YouTubeChannelProfile() {
  const {
    token,
    channels,
    selectedChannel,
    loading,
    error,
    login,
    logout,
    switchChannel,
    clientIdConfigured,
    clientIdLoading,
  } = useYouTubeAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Still loading the OAuth config from the backend — brief skeleton
  if (clientIdLoading) {
    return (
      <div className="h-9 flex items-center justify-center px-2">
        <img src={YT_ICON_RED} alt="YouTube" style={{ height: 24, width: "auto" }} className="animate-pulse opacity-60" />
      </div>
    );
  }

  // Not connected — show the connect button with official YouTube logo
  if (!token || !selectedChannel) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={login}
          disabled={loading}
          className="flex items-center gap-2 px-3 h-9 rounded-full bg-[#FF0000] hover:bg-[#CC0000] text-white text-sm font-semibold transition tap-sm disabled:opacity-50"
          style={{ minHeight: 36 }}
        >
          <img src={YT_ICON_RED} alt="YouTube" style={{ height: 20, width: "auto" }} />
          <span className="hidden sm:inline">{loading ? "…" : "Connecter YouTube"}</span>
        </button>
        {(error || !clientIdConfigured) && (
          <span className="text-[10px] text-destructive/80 max-w-[180px] text-right leading-tight">
            {error || "OAuth en attente de configuration"}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full pl-1 pr-2 h-9 hover:bg-secondary transition tap-sm"
      >
        <img
          src={selectedChannel.avatar_url}
          alt=""
          className="w-7 h-7 rounded-full object-cover"
        />
        <span className="hidden md:block text-sm font-semibold truncate max-w-[120px]">
          {selectedChannel.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-72 rounded-xl bg-card border border-border shadow-xl overflow-hidden z-50">
          {/* Channel header */}
          <div className="p-4 flex items-center gap-3 border-b border-border">
            <img
              src={selectedChannel.avatar_url}
              alt=""
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{selectedChannel.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {selectedChannel.handle || selectedChannel.id}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 p-3 text-center border-b border-border">
            <div>
              <p className="text-sm font-bold">
                {formatViews(selectedChannel.subscribers_count)}
              </p>
              <p className="text-[10px] text-muted-foreground">Abonnés</p>
            </div>
            <div>
              <p className="text-sm font-bold">
                {formatViews(selectedChannel.total_views)}
              </p>
              <p className="text-[10px] text-muted-foreground">Vues</p>
            </div>
            <div>
              <p className="text-sm font-bold">
                {formatViews(selectedChannel.video_count)}
              </p>
              <p className="text-[10px] text-muted-foreground">Vidéos</p>
            </div>
          </div>

          {/* Access to channel content */}
          <Link
            to={`/channel/${selectedChannel.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition"
          >
            <img src={YT_ICON_RED} alt="YouTube" style={{ height: 20, width: "auto" }} />
            Ma chaîne
          </Link>

          {/* Channel switching (multiple channels under the same Google account) */}
          {channels.length > 1 && (
            <div className="border-t border-border">
              <p className="px-4 pt-2.5 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                Changer de chaîne
              </p>
              <div className="max-h-40 overflow-y-auto scrollbar-thin">
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      switchChannel(ch.id);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition"
                  >
                    <img
                      src={ch.avatar_url}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <span className="flex-1 text-left truncate">{ch.name}</span>
                    {ch.id === selectedChannel.id && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Switch Google account (re-consent with account picker) */}
          <button
            onClick={() => {
              login();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition border-t border-border"
          >
            <RefreshCw className="w-4 h-4" />
            Changer de compte Google
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition border-t border-border"
          >
            <LogOut className="w-4 h-4" />
            Déconnecter YouTube
          </button>

          {error && (
            <p className="px-4 py-2 text-xs text-destructive border-t border-border">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}