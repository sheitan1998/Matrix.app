import { useTwitchAuth } from "@/context/TwitchAuthContext";
import { useTwitch } from "@/hooks/useTwitch";
import { Loader2, Users, Eye, Radio, Video } from "lucide-react";

export default function TwitchChannelPanel() {
  const { userToken, twitchUser, isAuthenticated, login } = useTwitchAuth();

  const channelData = useTwitch("getMyChannel", { userToken }, {
    enabled: !!userToken,
  });

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] flex items-center justify-center">
          <Radio className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Chaîne Twitch</h3>
        <p className="text-sm text-[#a0a0b0] mb-4">
          Connectez votre compte Twitch pour afficher votre chaîne, votre chat et vos statistiques en direct.
        </p>
        <button
          onClick={login}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#6d28d9] text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Se connecter avec Twitch
        </button>
      </div>
    );
  }

  if (channelData.isLoading) {
    return (
      <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] p-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#a855f7]" />
      </div>
    );
  }

  const user = channelData.data?.user || twitchUser;
  const stream = channelData.data?.stream;
  const channel = channelData.data?.channel;
  const isLive = !!stream;

  if (!user) {
    return (
      <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] p-8 text-center">
        <p className="text-sm text-[#a0a0b0]">Impossible de charger les informations de la chaîne.</p>
      </div>
    );
  }

  const formatCount = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n || 0);
  };

  return (
    <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] overflow-hidden">
      {/* Bannière */}
      <div className="relative h-32 sm:h-40 bg-gradient-to-br from-[#1a0f2e] to-[#0a0714]">
        {user.offline_image_url ? (
          <img
            src={user.offline_image_url}
            alt="Bannière"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl opacity-20">🎮</div>
          </div>
        )}
        {/* Badge live */}
        {isLive && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ef4444] text-white text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            EN DIRECT
          </div>
        )}
      </div>

      {/* Profile info */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="flex items-end gap-4 -mt-10 mb-3">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full border-4 border-[#0f0b1a] bg-[#1f1f2e] overflow-hidden shrink-0">
            {user.profile_image_url ? (
              <img src={user.profile_image_url} alt={user.display_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                {user.display_name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <h2 className="text-xl font-bold text-white truncate">{user.display_name}</h2>
            <p className="text-xs text-[#a0a0b0] capitalize">
              {user.broadcaster_type === "partner" ? "Partenaire" : user.broadcaster_type === "affiliate" ? "Affilié" : "Créateur"}
              {channel?.game_name && isLive && <span className="text-[#a855f7]"> • {channel.game_name}</span>}
            </p>
          </div>
        </div>

        {/* Description */}
        {user.description && (
          <p className="text-sm text-[#a0a0b0] mb-3 line-clamp-2">{user.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-[#a0a0b0]">
            <Eye className="w-3.5 h-3.5 text-[#a855f7]" />
            {formatCount(user.view_count)} vues
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5 text-[#ef4444]">
              <Users className="w-3.5 h-3.5" />
              {formatCount(stream.viewer_count)} spectateurs
            </span>
          )}
          {isLive && (
            <span className="flex items-center gap-1.5 text-[#a855f7]">
              <Video className="w-3.5 h-3.5" />
              {stream.game_name}
            </span>
          )}
        </div>

        {/* Stream title */}
        {isLive && stream.title && (
          <div className="mt-3 p-3 rounded-xl bg-[#1a0f2e] border border-[#2a1f3e]">
            <p className="text-xs text-[#a0a0b0] mb-1">Titre du stream</p>
            <p className="text-sm text-white line-clamp-2">{stream.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}