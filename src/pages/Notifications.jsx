import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bell, BellOff, AtSign, Shield, Radio, ArrowLeft, CheckCheck } from "lucide-react";
import { formatTimeAgo } from "@/lib/format";
import { motion } from "framer-motion";

const TYPE_META = {
  mention: { icon: AtSign, color: "#a855f7", label: "Mention" },
  role_assigned: { icon: Shield, color: "#f59e0b", label: "Rôle" },
  sport_event: { icon: Radio, color: "#ef4444", label: "Sport" },
  new_message: { icon: Bell, color: "#06b6d4", label: "Message" },
  invite: { icon: Bell, color: "#22c55e", label: "Invitation" },
};

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!me) { setLoading(false); return; }
      setUser(me);
      try {
        const notifs = await base44.entities.Notification.filter({ user_email: me.email }, "-created_date", 100);
        setNotifications(notifs);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await base44.entities.Notification.update(n.id, { is_read: true });
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filtered = filter === "unread" ? notifications.filter(n => !n.is_read) : notifications;

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-3 flex items-center gap-3"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--background)/0.9)" }}>
        <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-black text-lg text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" /> Notifications
        </h1>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">{unreadCount} non lues</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex gap-1 p-1 rounded-xl bg-secondary/60">
            <button onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"}`}>
              Toutes
            </button>
            <button onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filter === "unread" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"}`}>
              Non lues
            </button>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border hover:bg-secondary transition">
              <CheckCheck className="w-3.5 h-3.5" /> Tout lu
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <BellOff className="w-12 h-12 opacity-20" />
            <p className="text-sm">{filter === "unread" ? "Aucune notification non lue" : "Aucune notification"}</p>
          </div>
        ) : (
          filtered.map((n, i) => {
            const meta = TYPE_META[n.type] || TYPE_META.new_message;
            const Icon = meta.icon;
            return (
              <motion.div key={n.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => markRead(n.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition hover:bg-secondary/40 ${!n.is_read ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`}>
                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ background: meta.color + "20" }}>
                  <Icon className="w-5 h-5" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{n.title}</p>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: meta.color + "20", color: meta.color }}>{meta.label}</span>
                    <p className="text-[10px] text-muted-foreground">{formatTimeAgo(n.created_date)}</p>
                  </div>
                </div>
                {n.link && <Link to={n.link} onClick={(e) => e.stopPropagation()} className="shrink-0 text-primary hover:underline text-xs font-bold">Voir</Link>}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}