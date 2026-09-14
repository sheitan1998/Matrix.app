import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Mail } from "lucide-react";
import MessageOverlay from "@/components/messaging/MessageOverlay";
import { playMessageSound } from "@/lib/messageSound";

const EXCLUDED_PREFIXES = [
  "/twitch", "/community", "/mon-profil", "/login", "/register",
  "/forgot-password", "/reset-password", "/oauth",
];

export default function GlobalMessageButton() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preselectedEmail, setPreselectedEmail] = useState(null);

  // Listen for "open chat with friend" events (e.g. from FriendsPanel)
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.friendEmail) {
        setPreselectedEmail(e.detail.friendEmail);
        setOpen(true);
      }
    };
    window.addEventListener("matrix-open-chat", handler);
    return () => window.removeEventListener("matrix-open-chat", handler);
  }, []);

  const isExcluded = useMemo(() => {
    const p = location.pathname;
    if (p === "/live" || p.startsWith("/live/")) return true;
    return EXCLUDED_PREFIXES.some(prefix => p === prefix || p.startsWith(prefix + "/"));
  }, [location.pathname]);

  // Fetch initial unread count
  useEffect(() => {
    if (!isAuthenticated || !user || isExcluded) return;
    base44.entities.DirectMessage.filter({ recipient_email: user.email })
      .then(msgs => {
        const unread = (msgs || []).filter(m => !m.is_read);
        setUnreadCount(unread.length);
      })
      .catch(() => {});
  }, [isAuthenticated, user, isExcluded]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!isAuthenticated || !user || isExcluded) return;
    const unsubscribe = base44.entities.DirectMessage.subscribe((event) => {
      if (event.type === "create") {
        const msg = event.data;
        if (msg.recipient_email === user.email) {
          playMessageSound();
          if (!msg.is_read) {
            setUnreadCount(prev => prev + 1);
          }
        }
      }
    });
    return unsubscribe;
  }, [isAuthenticated, user, isExcluded]);

  if (!isAuthenticated || !user || isExcluded) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-2.5 right-[52px] z-[55] w-9 h-9 rounded-full flex items-center justify-center transition hover:scale-105 active:scale-95"
        style={{
          background: "rgba(18,9,28,0.85)",
          border: "1.5px solid rgba(168,85,247,0.4)",
          boxShadow: "0 4px 16px rgba(168,85,247,0.2)",
          backdropFilter: "blur(12px)",
        }}
        title="Messagerie"
      >
        <Mail className="w-4 h-4 text-white/70" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#ec4899", boxShadow: "0 0 6px rgba(236,72,153,0.6)" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[80]" style={{ background: "#0a050f" }}>
          <MessageOverlay
            user={user}
            preselectedEmail={preselectedEmail}
            onClose={() => { setOpen(false); setPreselectedEmail(null); }}
            onMessagesRead={(count) => setUnreadCount(prev => Math.max(0, prev - count))}
          />
        </div>
      )}
    </>
  );
}