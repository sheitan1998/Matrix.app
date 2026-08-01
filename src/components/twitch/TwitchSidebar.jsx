import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { useTwitchAuth } from "@/context/TwitchAuthContext";
import { useTwitch } from "@/hooks/useTwitch";

function SidebarSection({ title, children }) {
  return (
    <div className="px-3 py-3 border-b border-[#1f1f2e]">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0b0] mb-2 px-1">{title}</h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function FollowedItem({ stream }) {
  return (
    <Link
      to={`/twitch/watch/${stream.user_login}`}
      className="flex items-center gap-2 px-1.5 py-1.5 rounded-md hover:bg-white/5 transition-colors group"
    >
      <div className="w-8 h-8 rounded-full bg-[#1f1f2e] flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
        {stream.user_name?.[0]?.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white font-medium truncate">{stream.user_name}</p>
        <p className="text-[10px] text-[#a0a0b0] truncate">{stream.game_name}</p>
      </div>
      <span className="w-2 h-2 rounded-full bg-[#ef4444] shrink-0" />
    </Link>
  );
}

function LiveChannelItem({ stream }) {
  const formatViewers = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };
  return (
    <Link
      to={`/twitch/watch/${stream.user_login}`}
      className="flex items-center gap-2 px-1.5 py-1.5 rounded-md hover:bg-white/5 transition-colors group"
    >
      <div className="w-8 h-8 rounded-full bg-[#1f1f2e] flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
        {stream.user_name?.[0]?.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white font-medium truncate">{stream.user_name}</p>
        <p className="text-[10px] text-[#a0a0b0] truncate">{stream.game_name}</p>
      </div>
      <span className="text-[#3ba6ff] text-xs font-medium flex items-center gap-0.5 shrink-0">
        <Eye className="w-3 h-3" />
        {formatViewers(stream.viewer_count)}
      </span>
    </Link>
  );
}

export default function TwitchSidebar() {
  const { isAuthenticated, userToken } = useTwitchAuth();
  const [showAllLive, setShowAllLive] = useState(false);

  const followedStreams = useTwitch("getFollowedStreams", { userToken }, {
    enabled: !!userToken,
  });
  const topStreams = useTwitch("getStreams", { first: 12 });
  const topCategories = useTwitch("getTopGames", { first: 8 });

  const followed = followedStreams.data?.streams || [];
  const liveChannels = topStreams.data?.streams || [];
  const categories = topCategories.data?.categories || [];

  const visibleLive = showAllLive ? liveChannels : liveChannels.slice(0, 8);

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-[#0e0e10] border-r border-[#1f1f2e] overflow-y-auto scrollbar-thin h-[calc(100vh-3.5rem)] sticky top-14">
      {/* Pour vous — followed channels */}
      {isAuthenticated && (
        <SidebarSection title="Pour vous">
          {followed.length > 0 ? (
            followed.slice(0, 5).map((s) => <FollowedItem key={s.id} stream={s} />)
          ) : (
            <p className="text-xs text-[#a0a0b0] px-1.5 py-2">
              {followedStreams.isLoading ? "Chargement..." : "Aucune chaîne suivie en direct"}
            </p>
          )}
        </SidebarSection>
      )}

      {/* Chaînes live */}
      <SidebarSection title="Chaînes live">
        {topStreams.isLoading ? (
          <p className="text-xs text-[#a0a0b0] px-1.5 py-2">Chargement...</p>
        ) : visibleLive.length > 0 ? (
          <>
            {visibleLive.map((s) => <LiveChannelItem key={s.id} stream={s} />)}
            {liveChannels.length > 8 && (
              <button
                onClick={() => setShowAllLive(!showAllLive)}
                className="flex items-center gap-1 px-1.5 py-1.5 text-xs text-[#3ba6ff] hover:text-[#5bb6ff] transition-colors"
              >
                {showAllLive ? <><ChevronUp className="w-3 h-3" /> Afficher moins</> : <><ChevronDown className="w-3 h-3" /> Afficher plus</>}
              </button>
            )}
          </>
        ) : (
          <p className="text-xs text-[#a0a0b0] px-1.5 py-2">Aucun live disponible</p>
        )}
      </SidebarSection>

      {/* Catégories recommandées */}
      <SidebarSection title="Catégories recommandées">
        {categories.slice(0, 6).map((c) => (
          <Link
            key={c.id}
            to={`/twitch/search?q=${encodeURIComponent(c.name)}&filter=categories`}
            className="flex items-center gap-2 px-1.5 py-1.5 rounded-md hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-9 rounded overflow-hidden bg-[#1f1f2e] shrink-0">
              {c.box_art_url && <img src={c.box_art_url} alt="" className="w-full h-full object-cover" loading="lazy" />}
            </div>
            <span className="text-sm text-white truncate">{c.name}</span>
          </Link>
        ))}
      </SidebarSection>
    </aside>
  );
}