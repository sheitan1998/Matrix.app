import React, { useState, useEffect, useRef } from "react";
import { Bell, BellOff, AtSign, Shield, Radio, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/format";

const TYPE_META = {
  mention: { icon: AtSign, color: "#a855f7", label: "Mention" },
  role_assigned: { icon: Shield, color: "#f59e0b", label: "Rôle" },
  sport_event: { icon: Radio, color: "#ef4444", label: "Sport" },
  new_message: { icon: Bell, color: "#06b6d4", label: "Message" },
  invite: { icon: Bell, color: "#22c55e", label: "Invitation" },
};

export default function NotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications(user);
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-secondary transition text-muted-foreground hover:text-foreground">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center"
            style={{ lineHeight: 1 }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="font-black text-sm">Notifications</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[10px] text-primary hover:underline font-semibold">
                  Tout lu
                </button>
              )}
              <div className="flex items-center gap-2">
                <a href="/notifications" className="text-[10px] text-primary hover:underline font-semibold">Voir tout</a>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <BellOff className="w-8 h-8 opacity-30" />
                <p className="text-sm">Aucune notification</p>
              </div>
            )}
            {notifications.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.new_message;
              const Icon = meta.icon;
              return (
                <button key={n.id} onClick={() => markRead(n.id)}
                  className={cn("w-full flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 transition text-left border-b border-border/50 last:border-0",
                    !n.is_read && "bg-primary/5")}>
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
                    style={{ background: meta.color + "20" }}>
                    <Icon className="w-4 h-4" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                    {n.body && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">{formatTimeAgo(n.created_date)}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}