import { useTwitchAuth } from "@/context/TwitchAuthContext";
import { MessageSquare, ExternalLink } from "lucide-react";

export default function TwitchChatEmbed() {
  const { twitchUser, isAuthenticated } = useTwitchAuth();

  // Use the dynamically-resolved login from the Twitch /users endpoint — never a static default
  const channelLogin = twitchUser?.login;
  const channelName = twitchUser?.display_name || channelLogin;

  if (!isAuthenticated || !channelLogin) {
    return (
      <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] p-6 text-center">
        <MessageSquare className="w-8 h-8 text-[#a0a0b0] mx-auto mb-2" />
        <p className="text-sm text-[#a0a0b0]">Connectez-vous pour accéder au chat de votre chaîne</p>
      </div>
    );
  }

  const chatUrl = `https://www.twitch.tv/embed/${channelLogin}/chat?parent=${window.location.hostname}&darkpopout`;

  return (
    <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a1f3e]">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#a855f7]" />
          Chat de {channelName}
        </h3>
        <a
          href={`https://www.twitch.tv/popout/${channelLogin}/chat`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#a0a0b0] hover:text-white transition-colors"
          aria-label="Ouvrir dans un nouvel onglet"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      <iframe
        src={chatUrl}
        className="w-full h-[400px] bg-[#0a0714]"
        title={`Chat Twitch - ${channelName}`}
      />
    </div>
  );
}