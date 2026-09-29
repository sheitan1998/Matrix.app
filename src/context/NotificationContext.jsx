import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { UserCheck, MessageCircle, Bell } from "lucide-react";
import { messageAlertsEnabled } from '@/lib/notificationPreferences';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const prevFriendStatuses = useRef({});
  const [freeRemindersEnabled, setFreeRemindersEnabled] = useState(user?.notif_free_rewards !== false);

  useEffect(() => {
    setFreeRemindersEnabled(user?.notif_free_rewards !== false);
    if (user?.email) localStorage.setItem('matrix_notif_messages', String(user.notif_messages !== false));
    const refresh = () => base44.auth.me().then(current => {
      setFreeRemindersEnabled(current.notif_free_rewards !== false);
    }).catch(() => {});
    window.addEventListener('matrix-settings-updated', refresh);
    return () => window.removeEventListener('matrix-settings-updated', refresh);
  }, [user?.email, user?.notif_free_rewards, user?.notif_messages]);

  useEffect(() => {
    if (!isAuthenticated || !user?.email || !freeRemindersEnabled) return;
    let cancelled = false;
    const check = async () => {
      try {
        const [wheel, scratch] = await Promise.all([
          base44.functions.invoke('wheelOfFortune', { action: 'getStatus' }),
          base44.functions.invoke('scratchTicket', { action: 'getTicketStatus' }),
        ]);
        if (cancelled) return;
        const today = new Date().toISOString().slice(0, 10);
        const reminders = [
          { available: wheel?.data?.freeSpinAvailable, key: 'wheel', text: 'Votre lancer gratuit de la roue est disponible !' },
          { available: scratch?.data?.freeTicketAvailable, key: 'scratch', text: 'Votre ticket à gratter gratuit est disponible !' },
        ];
        reminders.forEach(({ available, key, text }) => {
          const storageKey = `matrix_reward_reminder_${user.id}_${key}`;
          if (available && localStorage.getItem(storageKey) !== today) {
            localStorage.setItem(storageKey, today);
            toast(text, { icon: <Bell className="w-4 h-4 text-purple-400" /> });
          }
        });
      } catch { /* Try again on the next check. */ }
    };
    check();
    const interval = setInterval(check, 15 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isAuthenticated, user?.email, user?.id, freeRemindersEnabled]);

  // Subscribe to Friend entity changes — notify when a request is accepted or received
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    // Initial load of current friend statuses
    base44.entities.Friend.filter({ user_email: user.email })
      .then(friends => {
        const map = {};
        friends.forEach(f => { map[f.friend_user_id] = f.status; });
        prevFriendStatuses.current = map;
      })
      .catch(() => {});

    const unsubscribe = base44.entities.Friend.subscribe(async (event) => {
      if (!event?.data) return;
      const { user_email, friend_user_id, status } = event.data;

      // Only react to records owned by current user
      if (user_email !== user.email) return;

      const prevStatus = prevFriendStatuses.current[friend_user_id];

      if (event.type === "create") {
        if (status === "pending_received") {
          // New friend request received
          setUnreadCount(c => c + 1);
          setNotifications(n => [{ id: Date.now(), type: "friend_request", friend_user_id, message: "Nouvelle demande d'ami" }, ...n].slice(0, 20));
          toast("Nouvelle demande d'ami", { icon: <Bell className="w-4 h-4 text-purple-400" /> });
        }
      } else if (event.type === "update") {
        if (prevStatus === "pending_received" && status === "accepted") {
          // Friend request was accepted (by me or the other party)
          setUnreadCount(c => c + 1);
          setNotifications(n => [{ id: Date.now(), type: "friend_accepted", friend_user_id, message: "Demande d'ami acceptée" }, ...n].slice(0, 20));
          toast("Demande d'ami acceptée !", { icon: <UserCheck className="w-4 h-4 text-green-400" /> });
        }
      }

      // Update the ref
      prevFriendStatuses.current[friend_user_id] = status;
    });

    return unsubscribe;
  }, [isAuthenticated, user?.email]);

  // Subscribe to DirectMessage changes — notify when a new message is received
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    const unsubscribe = base44.entities.DirectMessage.subscribe((event) => {
      if (event.type !== "create") return;
      const msg = event.data;
      if (!msg || msg.recipient_email !== user.email) return;

      setUnreadCount(c => c + 1);
      setNotifications(n => [{ id: Date.now(), type: "message", sender: msg.sender_name, message: `Nouveau message de ${msg.sender_name}` }, ...n].slice(0, 20));
      if (messageAlertsEnabled(user)) toast(`Nouveau message de ${msg.sender_name}`, { icon: <MessageCircle className="w-4 h-4 text-blue-400" /> });
    });

    return unsubscribe;
  }, [isAuthenticated, user?.email]);

  // Subscribe to Notification entity — real-time @everyone mentions and server notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type !== "create") return;
      const notif = event.data;
      if (!notif || notif.user_email !== user.email) return;

      setUnreadCount(c => c + 1);
      setNotifications(n => [{ id: Date.now(), type: notif.type || "mention", message: notif.title || "Nouvelle notification", server_id: notif.server_id, channel_id: notif.channel_id }, ...n].slice(0, 20));
      if (messageAlertsEnabled(user)) toast(notif.title || "Nouvelle notification", { icon: <Bell className="w-4 h-4 text-purple-400" /> });
    });

    return unsubscribe;
  }, [isAuthenticated, user?.email]);

  const clearNotifications = () => {
    setUnreadCount(0);
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) return { unreadCount: 0, notifications: [], clearNotifications: () => {} };
  return ctx;
}