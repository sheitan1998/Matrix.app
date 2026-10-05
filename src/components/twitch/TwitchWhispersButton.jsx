import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useTwitchAuth } from "@/context/TwitchAuthContext";
import { useTwitchWhispers } from "@/hooks/useTwitchWhispers";
import { useClickOutside } from "@/hooks/useClickOutside";

const STATUS_TEXT = {
  connected: "Réception des whispers en direct",
  connecting: "Connexion à Twitch…",
  error: "Connexion aux whispers interrompue",
};

/** Whispers received on the connected Twitch account (EventSub user.whisper.message). */
export default function TwitchWhispersButton() {
  const { userToken, twitchUser, isAuthenticated, login } = useTwitchAuth();
  const { whispers, status, unreadCount, markAllRead } = useTwitchWhispers(userToken, twitchUser?.id);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close);

  const toggle = () => {
    if (!open) markAllRead();
    setOpen(!open);
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={toggle} className="relative w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center tap-sm transition-colors" aria-label="Whispers Twitch">
        <MessageCircle className="w-5 h-5 text-[#a0a0b0]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#9146FF] text-white text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-[#161321] border border-[#2a2a3e] rounded-xl shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a3e]">
            <p className="text-sm font-bold text-white">Whispers</p>
            {isAuthenticated && STATUS_TEXT[status] && (
              <p className="text-[11px] text-[#a0a0b0] flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${status === "connected" ? "bg-[#22c55e]" : "bg-[#a0a0b0]"}`} />
                {STATUS_TEXT[status]}
              </p>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto scrollbar-thin divide-y divide-[#1f1f2e]">
            {!isAuthenticated || status === "missing_scope" ? (
              <div className="p-5 text-center">
                <p className="text-xs text-[#a0a0b0] mb-3">
                  {isAuthenticated ? "Autorisez la lecture des whispers en reconnectant votre compte Twitch." : "Connectez Twitch pour recevoir vos whispers."}
                </p>
                <button onClick={login} className="px-4 py-2 rounded-full bg-[#9146FF] text-white text-xs font-bold">
                  {isAuthenticated ? "Reconnecter Twitch" : "Connexion Twitch"}
                </button>
              </div>
            ) : whispers.length === 0 ? (
              <p className="p-5 text-center text-xs text-[#a0a0b0]">Aucun whisper reçu. Twitch ne fournit pas l'historique : les nouveaux whispers s'afficheront ici en temps réel.</p>
            ) : (
              whispers.map((w) => (
                <div key={w.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link to={`/twitch/channel/${w.from_login}`} onClick={close} className="text-sm font-semibold text-white hover:text-[#a855f7] truncate">{w.from_name}</Link>
                    <span className="text-[10px] text-[#a0a0b0] shrink-0">{formatDistanceToNow(new Date(w.received_at), { addSuffix: true, locale: fr })}</span>
                  </div>
                  <p className="text-xs text-[#d0d0dc] mt-0.5 break-words">{w.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}