import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

/**
 * TwitchStreamCard — rectangular card for a live Twitch stream.
 * Matches the reference image: LIVE badge (top-left), thumbnail,
 * viewer count pill, streamer name, title, category + language tags.
 */
export default function TwitchStreamCard({ stream }) {
  if (!stream) return null;

  const formatViewers = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <Link
      to={`/twitch/watch/${stream.user_login}`}
      className="group block rounded-xl overflow-hidden bg-[#161321] hover:ring-2 hover:ring-[#db2777] transition-all"
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
          <div className="w-full h-full flex items-center justify-center text-[#a0a0b0] text-xs">
            Pas de miniature
          </div>
        )}

        {/* LIVE badge */}
        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#ef4444] text-white text-[10px] font-bold uppercase tracking-wide">
          Live
        </span>

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