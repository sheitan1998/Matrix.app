import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { UserCheck, MessageCircle, Bell } from "lucide-react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const prevFriendStatuses = useRef({});

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
      toast(`Nouveau message de ${msg.sender_name}`, { icon: <MessageCircle className="w-4 h-4 text-blue-400" /> });
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