import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

// Shared load: several components can mount this hook without each firing its
// own entity_list request (which used to blow the per-caller rate limit).
const CACHE_TTL = 60000;
const shared = { email: null, at: 0, promise: null, data: [] };

function loadNotifications(email) {
  if (shared.email === email) {
    if (shared.promise) return shared.promise;
    if (Date.now() - shared.at < CACHE_TTL) return Promise.resolve(shared.data);
  }
  shared.email = email;
  shared.promise = base44.entities.Notification.filter(
    { user_email: email },
    "-created_date",
    50
  ).then((notifs) => {
    shared.data = notifs;
    shared.at = Date.now();
    return notifs;
  }).finally(() => {
    shared.promise = null;
  });
  return shared.promise;
}

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.email) return;
    let active = true;

    const fetchNotifs = async () => {
      try {
        const notifs = await loadNotifications(user.email);
        if (!active) return;
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      } catch {
        // Rate limit or network hiccup: the cache keeps the last known list and
        // the next scheduled refresh retries later.
      }
    };

    fetchNotifs();

    // Real-time updates come from the subscription below; polling is only a
    // safety net, so keep it light and pause it while the tab is hidden.
    const interval = setInterval(() => {
      if (!document.hidden) fetchNotifs();
    }, 300000);
    const onVisible = () => {
      if (!document.hidden && Date.now() - shared.at > CACHE_TTL) fetchNotifs();
    };
    document.addEventListener("visibilitychange", onVisible);

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

    return () => {
      active = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      unsub();
    };
  }, [user?.email]);

  const markAllRead = useCallback(async () => {
    if (!notifications.some((n) => !n.is_read)) return;
    const email = notifications.find((n) => !n.is_read)?.user_email;
    if (!email) return;
    // One bulk update instead of one request per notification.
    await base44.entities.Notification.updateMany(
      { user_email: email, is_read: false },
      { $set: { is_read: true } }
    );
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