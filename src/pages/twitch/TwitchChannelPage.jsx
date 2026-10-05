import { useParams } from "react-router-dom";
import { useTwitchAuth } from "@/context/TwitchAuthContext";
import TwitchChannelPanel from "@/components/twitch/TwitchChannelPanel";
import TwitchChatEmbed from "@/components/twitch/TwitchChatEmbed";
import TwitchActivityFeed from "@/components/twitch/TwitchActivityFeed";

export default function TwitchChannelPage() {
  const { login } = useParams();
  const { twitchUser } = useTwitchAuth();
  const isOwn = login?.toLowerCase() === twitchUser?.login;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <TwitchChannelPanel login={login} />
        <TwitchChatEmbed channel={login} />
      </div>
      {isOwn && (
        <div>
          <TwitchActivityFeed />
        </div>
      )}
    </div>
  );
}