import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const EVENTSUB_URL = "wss://eventsub.wss.twitch.tv/ws";
const MAX_STORED = 50;
const RETRY_MS = 15000;
const storageKey = (id) => `twitch_whispers_${id}`;

function readStored(id) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(id)) || "[]");
  } catch {
    return [];
  }
}

/**
 * Receives the user's Twitch whispers in real time via EventSub WebSocket
 * (user.whisper.message). Helix exposes no whisper history, so received
 * whispers are kept locally per Twitch account.
 * status: idle | connecting | connected | missing_scope | error
 */
export function useTwitchWhispers(userToken, twitchUserId) {
  const [whispers, setWhispers] = useState([]);
  const [status, setStatus] = useState("idle");

  const persist = useCallback((updater) => {
    setWhispers((prev) => {
      const next = updater(prev);
      if (twitchUserId) localStorage.setItem(storageKey(twitchUserId), JSON.stringify(next));
      return next;
    });
  }, [twitchUserId]);

  useEffect(() => {
    setWhispers(twitchUserId ? readStored(twitchUserId) : []);
  }, [twitchUserId]);

  useEffect(() => {
    if (!userToken || !twitchUserId) {
      setStatus("idle");
      return;
    }
    let socket = null;
    let stopped = false;
    let retryTimer = null;

    const open = (url, isReconnect) => {
      setStatus("connecting");
      const ws = new WebSocket(url);
      socket = ws;

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        const type = msg.metadata?.message_type;

        if (type === "session_welcome") {
          // Subscriptions carry over on a Twitch-initiated reconnect
          if (isReconnect) return setStatus("connected");
          try {
            await base44.functions.invoke("twitchApi", {
              action: "subscribeWhispers",
              userToken,
              sessionId: msg.payload.session.id,
            });
            setStatus("connected");
          } catch (err) {
            stopped = true;
            const code = err?.response?.status;
            setStatus(code === 401 || code === 403 ? "missing_scope" : "error");
            ws.close();
          }
        } else if (type === "session_reconnect") {
          ws.onclose = null;
          open(msg.payload.session.reconnect_url, true);
        } else if (type === "notification" && msg.metadata.subscription_type === "user.whisper.message") {
          const ev = msg.payload.event;
          const item = {
            id: ev.whisper_id,
            from_login: ev.from_user_login,
            from_name: ev.from_user_name,
            text: ev.whisper?.text || "",
            received_at: msg.metadata.message_timestamp,
            read: false,
          };
          persist((prev) => [item, ...prev.filter((w) => w.id !== item.id)].slice(0, MAX_STORED));
        }
      };

      ws.onclose = () => {
        if (stopped) return;
        setStatus("connecting");
        retryTimer = setTimeout(() => open(EVENTSUB_URL, false), RETRY_MS);
      };
    };

    open(EVENTSUB_URL, false);
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [userToken, twitchUserId, persist]);

  const markAllRead = useCallback(() => {
    persist((prev) => (prev.some((w) => !w.read) ? prev.map((w) => ({ ...w, read: true })) : prev));
  }, [persist]);

  return { whispers, status, unreadCount: whispers.filter((w) => !w.read).length, markAllRead };
}