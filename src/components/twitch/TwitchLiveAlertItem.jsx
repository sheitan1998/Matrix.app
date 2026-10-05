import { Link } from "react-router-dom";

export default function TwitchLiveAlertItem({ stream, onClick }) {
  return (
    <Link
      to={`/twitch/watch/${stream.user_login}`}
      onClick={onClick}
      className="flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
    >
      <div className="relative w-20 aspect-video rounded overflow-hidden bg-[#1f1f2e] shrink-0">
        {stream.thumbnail_url && <img src={stream.thumbnail_url} alt="" className="w-full h-full object-cover" />}
        <span className="absolute top-1 left-1 px-1 rounded bg-[#ef4444] text-[9px] font-bold text-white">LIVE</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white truncate">
          <span className="font-semibold">{stream.user_name}</span>
          <span className="text-[#a0a0b0]"> est en direct</span>
        </p>
        <p className="text-xs text-[#a0a0b0] truncate">{stream.title}</p>
        <p className="text-[11px] text-[#a855f7] truncate">
          {stream.game_name} • {Number(stream.viewer_count || 0).toLocaleString("fr-FR")} spectateurs
        </p>
      </div>
    </Link>
  );
}