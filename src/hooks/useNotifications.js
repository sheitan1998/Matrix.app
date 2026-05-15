import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.email) return;

    const fetchNotifs = async () => {
      const notifs = await base44.entities.Notification.filter(
        { user_email: user.email },
        "-created_date",
        50
      );
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.is_read).length);
    };

    fetchNotifs();

    // Poll every 5 seconds for real-time feel
    const interval = setInterval(fetchNotifs, 5000);

    // Real-time subscription
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.data?.user_email !== user.email) return;
      if (event.type === "create") {
        setNotifications((prev) => [event.data, ...prev]);
        setUnreadCount((c) => c + 1);
      } else if (event.type === "update") {
        setNotifications((prev) => prev.map((n) => n.id === event.id ? event.data : n));
        setUnreadCount((prev) => prev); // recalc below
      }
    });

    return () => { clearInterval(interval); unsub(); };
  }, [user?.email]);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [notifications]);

  const markRead = useCallback(async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const pushNotification = useCallback(async (userEmail, type, title, body, extra = {}) => {
    await base44.entities.Notification.create({
      user_email: userEmail,
      type,
      title,
      body,
      is_read: false,
      ...extra,
    });
  }, []);

  return { notifications, unreadCount, markAllRead, markRead, pushNotification };
}