import { useTwitchAuth } from "@/context/TwitchAuthContext";
import { useTwitch } from "@/hooks/useTwitch";
import { Loader2, Heart, Users, Bell } from "lucide-react";

function formatRelative(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
}

export default function TwitchActivityFeed() {
  const { userToken, twitchUser, isAuthenticated } = useTwitchAuth();

  // Pass the userToken so the backend can resolve the broadcaster_id dynamically
  // from the Twitch /users endpoint — never rely on a stale or static ID.
  const activity = useTwitch(
    "getChannelActivity",
    { userToken, userId: twitchUser?.id },
    { enabled: !!userToken, refetchInterval: 60_000 }
  );

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] p-6 text-center">
        <Bell className="w-8 h-8 text-[#a0a0b0] mx-auto mb-2" />
        <p className="text-sm text-[#a0a0b0]">Connectez-vous pour voir l'activité de votre chaîne</p>
      </div>
    );
  }

  if (activity.isLoading) {
    return (
      <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] p-6 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-[#a855f7]" />
      </div>
    );
  }

  const followers = activity.data?.followers || [];
  const totalFollowers = activity.data?.total_followers || 0;

  return (
    <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a1f3e]">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#a855f7]" />
          Activité récente
        </h3>
        <span className="text-xs text-[#a0a0b0] flex items-center gap-1">
          <Users className="w-3 h-3" />
          {totalFollowers.toLocaleString("fr-FR")} abonnés
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
        {followers.length === 0 ? (
          <div className="p-6 text-center">
            <Heart className="w-8 h-8 text-[#a0a0b0] mx-auto mb-2 opacity-50" />
            <p className="text-sm text-[#a0a0b0]">Aucune activité récente</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1f1f2e]">
            {followers.map((f, i) => (
              <div key={`${f.from_id}-${i}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {f.from_name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    <span className="font-semibold">{f.from_name}</span>
                    <span className="text-[#a0a0b0]"> vous a suivi</span>
                  </p>
                </div>
                <span className="text-[10px] text-[#a0a0b0] shrink-0">{formatRelative(f.followed_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}