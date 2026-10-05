import { Radio } from "lucide-react";

export default function TwitchConnectPrompt({ onConnect, text }) {
  return (
    <div className="rounded-2xl bg-[#0f0b1a] border border-[#2a1f3e] p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#a855f7] to-[#6d28d9] flex items-center justify-center">
        <Radio className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">Chaîne Twitch</h3>
      <p className="text-sm text-[#a0a0b0] mb-4">
        {text || "Connectez votre compte Twitch pour afficher votre chaîne, votre chat et vos statistiques en direct."}
      </p>
      <button
        onClick={onConnect}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#6d28d9] text-white text-sm font-bold hover:opacity-90 transition-opacity"
      >
        Se connecter avec Twitch
      </button>
    </div>
  );
}