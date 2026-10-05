import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useTwitchAuth } from "@/context/TwitchAuthContext";
import { useTwitch } from "@/hooks/useTwitch";
import { useClickOutside } from "@/hooks/useClickOutside";
import TwitchLiveAlertItem from "./TwitchLiveAlertItem";

const seenKey = (id) => `twitch_seen_lives_${id}`;

/** Live alerts from the user's followed Twitch channels (Helix streams/followed). */
export default function TwitchNotificationsButton() {
  const { userToken, twitchUser, isAuthenticated, login } = useTwitchAuth();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState([]);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close);

  const { data } = useTwitch("getFollowedStreams", { userToken }, { enabled: !!userToken, refetchInterval: 120_000 });
  const streams = data?.streams || [];
  const unread = streams.filter((s) => !seen.includes(s.id)).length;

  useEffect(() => {
    if (twitchUser?.id) setSeen(JSON.parse(localStorage.getItem(seenKey(twitchUser.id)) || "[]"));
  }, [twitchUser?.id]);

  const toggle = () => {
    setOpen(!open);
    if (!open && twitchUser?.id) {
      const ids = streams.map((s) => s.id);
      localStorage.setItem(seenKey(twitchUser.id), JSON.stringify(ids));
      setSeen(ids);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={toggle} className="relative w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center tap-sm transition-colors" aria-label="Notifications Twitch">
        <Bell className="w-5 h-5 text-[#a0a0b0]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-[#161321] border border-[#2a2a3e] rounded-xl shadow-2xl overflow-hidden">
          <p className="px-4 py-3 border-b border-[#2a2a3e] text-sm font-bold text-white">Chaînes suivies en direct</p>
          <div className="max-h-96 overflow-y-auto scrollbar-thin divide-y divide-[#1f1f2e]">
            {!isAuthenticated ? (
              <div className="p-5 text-center">
                <p className="text-xs text-[#a0a0b0] mb-3">Connectez Twitch pour recevoir les alertes de vos chaînes suivies.</p>
                <button onClick={login} className="px-4 py-2 rounded-full bg-[#9146FF] text-white text-xs font-bold">Connexion Twitch</button>
              </div>
            ) : streams.length === 0 ? (
              <p className="p-5 text-center text-xs text-[#a0a0b0]">Aucune chaîne suivie n'est en direct pour le moment.</p>
            ) : (
              streams.map((s) => <TwitchLiveAlertItem key={s.id} stream={s} onClick={close} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}