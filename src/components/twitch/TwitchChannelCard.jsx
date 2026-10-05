import { Link } from "react-router-dom";
import { Circle } from "lucide-react";

/**
 * TwitchChannelCard — card for a Twitch channel (search result).
 * Shows avatar, display name, title, and live status.
 */
export default function TwitchChannelCard({ channel }) {
  if (!channel) return null;

  return (
    <Link
      to={`/twitch/channel/${channel.user_login}`}
      className="group flex items-center gap-3 p-3 rounded-xl bg-[#161321] hover:ring-2 hover:ring-[#db2777] transition-all"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1f1f2e] shrink-0 relative">
        {channel.thumbnail_url ? (
          <img src={channel.thumbnail_url} alt={channel.user_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#a0a0b0] font-bold text-lg">
            {channel.user_name?.[0]?.toUpperCase()}
          </div>
        )}
        {channel.is_live && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#ef4444] border-2 border-[#161321]" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-white font-semibold text-sm truncate">{channel.user_name}</p>
        <p className="text-[#a0a0b0] text-xs truncate mt-0.5">{channel.title || "Aucun titre"}</p>
        {channel.game_name && (
          <p className="text-[#3ba6ff] text-xs truncate mt-0.5">{channel.game_name}</p>
        )}
      </div>

      {/* Live status */}
      <div className="shrink-0">
        {channel.is_live ? (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#ef4444]/20 text-[#ef4444] text-[10px] font-bold uppercase">
            <Circle className="w-2 h-2 fill-current" />
            Live
          </span>
        ) : (
          <span className="text-[#a0a0b0] text-[10px] font-medium uppercase">Hors ligne</span>
        )}
      </div>
    </Link>
  );
}