import { Link } from "react-router-dom";
import { Eye, Bell, BellOff } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * TwitchStreamCard — rectangular card for a live Twitch stream.
 * Includes a favorite (bell) button to get live notifications.
 */
export default function TwitchStreamCard({ stream }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    base44.functions.invoke("twitchLiveNotifier", {
      action: "checkFavoriteStatus",
      channelLogin: stream.user_login,
    }).then(res => {
      if (!cancelled) setIsFavorite(res.data?.isFavorite || false);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [stream.user_login]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try {
      const res = await base44.functions.invoke("twitchLiveNotifier", {
        action: "toggleFavorite",
        channelLogin: stream.user_login,
        channelDisplayName: stream.user_name,
        channelAvatar: stream.thumbnail_url || "",
      });
      setIsFavorite(res.data?.isFavorite ?? !isFavorite);
    } catch {
      /* ignore */
    } finally {
      setToggling(false);
    }
  };

  if (!stream) return null;

  const formatViewers = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <Link
      to={`/twitch/watch/${stream.user_login}`}
      className="group block rounded-xl overflow-hidden bg-[#161321] hover:ring-2 hover:ring-[#db2777] transition-all relative"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#0e0e10] overflow-hidden">
        {stream.thumbnail_url ? (
          <img
            src={stream.thumbnail_url}
            alt={stream.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[#161321]" />
        )}

        {/* LIVE badge */}
        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#ef4444] text-white text-[10px] font-bold uppercase tracking-wide">
          Live
        </span>

        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          disabled={toggling}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all tap-sm ${
            isFavorite
              ? "bg-[#a855f7] text-white"
              : "bg-black/70 text-white opacity-0 group-hover:opacity-100 hover:bg-[#a855f7]"
          }`}
          aria-label={isFavorite ? "Ne plus suivre" : "Recevoir une notification en direct"}
        >
          {isFavorite ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
        </button>

        {/* Viewer count */}
        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[#3ba6ff] text-xs font-medium flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {formatViewers(stream.viewer_count)}
        </span>
      </div>

      {/* Footer info */}
      <div className="p-2.5">
        <p className="text-white font-semibold text-sm truncate">{stream.user_name}</p>
        <p className="text-[#a0a0b0] text-xs truncate mt-0.5">{stream.title}</p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {stream.game_name && (
            <span className="px-1.5 py-0.5 rounded bg-[#1f1f2e] text-[#a0a0b0] text-[10px] font-medium">
              {stream.game_name}
            </span>
          )}
          {stream.language && (
            <span className="px-1.5 py-0.5 rounded bg-[#1f1f2e] text-[#a0a0b0] text-[10px] font-medium uppercase">
              {stream.language}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}