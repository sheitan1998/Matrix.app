import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { playMessageSound } from "@/lib/messageSound";
import { messageAlertsEnabled } from "@/lib/notificationPreferences";

export function useUnreadMessages(user, enabled = true) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [preselectedEmail, setPreselectedEmail] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      if (event.detail?.friendEmail) {
        setPreselectedEmail(event.detail.friendEmail);
        setOpen(true);
      }
    };
    window.addEventListener("matrix-open-chat", handler);
    return () => window.removeEventListener("matrix-open-chat", handler);
  }, []);

  useEffect(() => {
    if (!enabled || !user?.email) return;
    base44.entities.DirectMessage.filter({ recipient_email: user.email })
      .then((messages) => setUnreadCount((messages || []).filter((m) => !m.is_read).length))
      .catch(() => {});
  }, [enabled, user?.email]);

  useEffect(() => {
    if (!enabled || !user?.email) return;
    const unsubscribe = base44.entities.DirectMessage.subscribe((event) => {
      if (event.type !== "create") return;
      const message = event.data;
      if (!message || message.recipient_email !== user.email) return;
      if (messageAlertsEnabled(user)) playMessageSound();
      if (!message.is_read) setUnreadCount((count) => count + 1);
    });
    return unsubscribe;
  }, [enabled, user?.email]);

  return {
    unreadCount,
    open,
    preselectedEmail,
    openInbox: () => setOpen(true),
    closeInbox: () => {
      setOpen(false);
      setPreselectedEmail(null);
    },
    markMessagesRead: (count) => setUnreadCount((current) => Math.max(0, current - count)),
  };
}