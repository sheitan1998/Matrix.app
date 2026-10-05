import { Link } from "react-router-dom";
import { useTwitchAuth } from "@/context/TwitchAuthContext";
import { useTwitch } from "@/hooks/useTwitch";
import { Loader2, ExternalLink, Play } from "lucide-react";
import TwitchChannelStats from "./TwitchChannelStats";
import TwitchConnectPrompt from "./TwitchConnectPrompt";

const BROADCASTER_LABELS = { partner: "Partenaire", affiliate: "Affilié" };

/** Channel profile from Twitch Helix. Without `login` → the connected user's own channel. */
export default function TwitchChannelPanel({ login }) {
  const { userToken, twitchUser, isAuthenticated, login: connect } = useTwitchAuth();
  const isOwn = !login || login.toLowerCase() === twitchUser?.login;
  const profile = useTwitch(
    "getChannelProfile",
    isOwn ? { userToken } : { login: login.toLowerCase() },
    { enabled: isOwn ? !!userToken : !!login, refetchInterval: 60_000 }
  );

  if (isOwn && !isAuthenticated) return <TwitchConnectPrompt onConnect={connect} />;

  if (profile.isLoading) {
    return (
      <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] p-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#a855f7]" />
      </div>
    );
  }

  const user = profile.data?.user;
  if (!user) {
    return (
      <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] p-8 text-center">
        <p className="text-sm text-[#a0a0b0]">Chaîne introuvable ou impossible à charger.</p>
      </div>
    );
  }

  const { stream, channel, followers_total, subscribers_total } = profile.data;
  const isLive = !!stream;

  return (
    <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] overflow-hidden">
      <div className="relative h-32 sm:h-44 bg-gradient-to-br from-[#1a0f2e] to-[#0a0714]">
        {user.offline_image_url && (
          <img src={user.offline_image_url} alt="Bannière" className="w-full h-full object-cover" />
        )}
        {isLive && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ef4444] text-white text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            EN DIRECT
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 pb-5">
        <div className="flex items-end gap-4 -mt-10 mb-3">
          <div className="w-20 h-20 rounded-full border-4 border-[#0f0b1a] bg-[#1f1f2e] overflow-hidden shrink-0">
            {user.profile_image_url && <img src={user.profile_image_url} alt={user.display_name} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h2 className="text-xl font-bold text-white truncate">{user.display_name}</h2>
            <p className="text-xs text-[#a0a0b0]">
              @{user.login} • {BROADCASTER_LABELS[user.broadcaster_type] || "Créateur"}
              {channel?.game_name && <span className="text-[#a855f7]"> • {channel.game_name}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 pb-1 shrink-0">
            {isLive && (
              <Link to={`/twitch/watch/${user.login}`} className="h-9 px-3 rounded-full bg-[#ef4444] text-white text-xs font-bold flex items-center gap-1.5 tap-sm">
                <Play className="w-3.5 h-3.5" /> Regarder
              </Link>
            )}
            <a href={`https://www.twitch.tv/${user.login}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#1f1f2e] hover:bg-[#2a2a3e] flex items-center justify-center tap-sm" aria-label="Ouvrir sur Twitch">
              <ExternalLink className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>

        {user.description && <p className="text-sm text-[#a0a0b0] mb-4 line-clamp-3">{user.description}</p>}

        <TwitchChannelStats
          followers={followers_total}
          subscribers={subscribers_total}
          viewers={isLive ? stream.viewer_count : null}
          createdAt={user.created_at}
        />

        {(stream?.title || channel?.title) && (
          <div className="mt-3 p-3 rounded-xl bg-[#1a0f2e] border border-[#2a1f3e]">
            <p className="text-xs text-[#a0a0b0] mb-1">{isLive ? "Titre du stream" : "Dernier titre"}</p>
            <p className="text-sm text-white line-clamp-2">{stream?.title || channel?.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}