import { useParams, useNavigate } from "react-router-dom";
import { useTwitch } from "@/hooks/useTwitch";
import TwitchPlayer from "@/components/twitch/TwitchPlayer";
import TwitchChat from "@/components/twitch/TwitchChat";
import { useTwitchMiniPlayer } from "@/context/TwitchMiniPlayerContext";
import { useMiniPlayer } from "@/context/MiniPlayerContext";
import { Minimize2, Maximize, Eye, Loader2, MessageSquare, X, ArrowLeft } from "lucide-react";
import { useState, useRef, useLayoutEffect, useEffect } from "react";

export default function TwitchWatch() {
  const { channelLogin } = useParams();
  const navigate = useNavigate();
  const twitchMini = useTwitchMiniPlayer();
  const ytMini = useMiniPlayer();
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false);

  const { data, isLoading } = useTwitch("getChannelDetails", { login: channelLogin });

  // Close YouTube mini-player on mount (prevent cross-universe double audio)
  useLayoutEffect(() => {
    if (ytMini.mode === "mini") ytMini.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close Twitch mini-player when switching to a different stream (single audio source)
  useLayoutEffect(() => {
    if (twitchMini.mode === "mini" && twitchMini.currentStream?.user_login !== channelLogin) {
      twitchMini.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelLogin]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen?.();
    }
  };

  const handleMinimize = () => {
    const streamData = data?.stream || {
      user_login: channelLogin,
      user_name: data?.user?.display_name || channelLogin,
      title: data?.channel?.title || "",
      game_name: data?.channel?.game_name || "",
      _source: "twitch",
    };
    twitchMini.minimize(streamData);
  };

  const isMinimized = twitchMini.mode === "mini" && twitchMini.currentStream?.user_login === channelLogin;

  const stream = data?.stream;
  const user = data?.user;
  const channel = data?.channel;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] bg-[#0a0714]">
        <Loader2 className="w-8 h-8 animate-spin text-[#db2777]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] gap-3 bg-[#0a0714]">
        <p className="text-white text-lg font-semibold">Chaîne introuvable</p>
        <button onClick={() => navigate("/twitch")} className="px-4 py-2 rounded-full bg-[#db2777] text-white text-sm font-semibold tap-sm">
          Retour à Twitch
        </button>
      </div>
    );
  }

  const formatViewers = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] bg-[#0a0714]">
      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Player area */}
        <div ref={containerRef} className="relative bg-black aspect-video lg:flex-1 lg:aspect-auto group">
          {isMinimized ? (
            <div
              className="w-full h-full flex flex-col items-center justify-center bg-black cursor-pointer gap-2"
              onClick={twitchMini.expand}
            >
              <div className="w-14 h-14 rounded-full bg-[#db2777] flex items-center justify-center">
                <Maximize className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-sm font-semibold">Lecture en mini-lecteur</p>
              <p className="text-[#a0a0b0] text-xs">Cliquez pour agrandir</p>
            </div>
          ) : (
            <TwitchPlayer channel={channelLogin} autoplay muted={false} />
          )}

          {/* Player controls */}
          {!isMinimized && (
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleMinimize}
                className="w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center tap-sm transition"
                aria-label="Mini-lecteur"
                title="Mini-lecteur"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center tap-sm transition"
                aria-label="Plein écran"
                title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
              >
                <Maximize className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Live badge */}
          {stream?.is_live && !isMinimized && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-[#ef4444] text-white rounded text-xs font-bold z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-live-pulse" />
              LIVE
            </div>
          )}
        </div>

        {/* Stream info */}
        <div className="p-4 bg-[#0e0e10] border-t border-[#1f1f2e] shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1f1f2e] shrink-0">
              {user.profile_image_url && <img src={user.profile_image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-white font-bold text-lg truncate">{user.display_name}</h1>
              <p className="text-[#a0a0b0] text-sm mt-0.5 line-clamp-2">
                {channel?.title || stream?.title || "Hors ligne"}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {stream?.is_live && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold uppercase">
                    Live
                  </span>
                )}
                {stream && (
                  <span className="flex items-center gap-1 text-[#3ba6ff] text-xs font-medium">
                    <Eye className="w-3 h-3" />
                    {formatViewers(stream.viewer_count)} spectateurs
                  </span>
                )}
                {(channel?.game_name || stream?.game_name) && (
                  <span className="px-2 py-0.5 rounded bg-[#1f1f2e] text-[#a0a0b0] text-xs font-medium">
                    {channel?.game_name || stream?.game_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile chat toggle */}
        <button
          onClick={() => setShowChatMobile(!showChatMobile)}
          className="lg:hidden flex items-center justify-center gap-2 py-3 bg-[#161321] border-t border-[#1f1f2e] text-white text-sm font-medium shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          {showChatMobile ? "Masquer le chat" : "Afficher le chat"}
        </button>
      </div>

      {/* Chat sidebar (desktop) */}
      <aside className="hidden lg:flex w-80 xl:w-96 shrink-0 flex-col bg-[#0e0e10] border-l border-[#1f1f2e]">
        <div className="px-4 py-3 border-b border-[#1f1f2e] shrink-0">
          <h3 className="text-white font-semibold text-sm">Chat du stream</h3>
        </div>
        <div className="flex-1 min-h-0">
          <TwitchChat channel={channelLogin} />
        </div>
      </aside>

      {/* Mobile chat overlay */}
      {showChatMobile && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0e0e10] border-b border-[#1f1f2e] shrink-0">
            <h3 className="text-white font-semibold text-sm">Chat du stream</h3>
            <button onClick={() => setShowChatMobile(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center tap-sm">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <TwitchChat channel={channelLogin} />
          </div>
        </div>
      )}
    </div>
  );
}