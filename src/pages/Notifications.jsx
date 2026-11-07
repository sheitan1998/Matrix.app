import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bell, BellOff, AtSign, Shield, Radio, ArrowLeft, CheckCheck, UserPlus, Check, X, Loader2 } from "lucide-react";
import { formatTimeAgo } from "@/lib/format";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [responding, setResponding] = useState(null);

  const load = async (me) => {
    try {
      const [notifs, pending] = await Promise.all([
        base44.entities.Notification.filter({ user_email: me.email }, "-created_date", 100).catch(() => []),
        base44.entities.Friend.filter({ user_email: me.email, status: "pending_received" }, "-created_date", 50).catch(() => []),
      ]);
      const notifList = notifs || [];
      const pendingList = pending || [];

      const covered = new Set(
        notifList
          .filter((n) => n.type === "friend_request" && !n.is_read && n.related_user_id)
          .map((n) => n.related_user_id)
      );

      const ids = [...new Set([
        ...pendingList.map((f) => f.friend_user_id),
        ...notifList.filter((n) => n.type === "friend_request" && !n.is_read).map((n) => n.related_user_id),
      ].filter(Boolean))];

      let profiles = {};
      if (ids.length > 0) {
        const res = await base44.functions.invoke("serverSearch", { action: "getUsersByIds", ids }).catch(() => null);
        (res?.data?.users || []).forEach((u) => { profiles[u.id] = u; });
      }

      const built = notifList
        .filter((n) => n.type === "friend_request" && !n.is_read && n.related_user_id)
        .map((n) => ({
          key: `n-${n.id}`,
          userId: n.related_user_id,
          name: profiles[n.related_user_id]?.pseudo || n.related_user_name || "Un utilisateur",
          avatar: profiles[n.related_user_id]?.avatar_url || "",
          notificationId: n.id,
          created_date: n.created_date,
        }));

      pendingList.forEach((f) => {
        if (!f.friend_user_id || covered.has(f.friend_user_id)) return;
        built.push({
          key: `f-${f.id}`,
          userId: f.friend_user_id,
          name: profiles[f.friend_user_id]?.pseudo || "Un utilisateur",
          avatar: profiles[f.friend_user_id]?.avatar_url || "",
          notificationId: null,
          created_date: f.created_date,
        });
      });

      setNotifications(notifList);
      setRequests(built);
    } catch {
      /* keep the page usable */
    }
  };

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!me) { setLoading(false); return; }
      setUser(me);
      await load(me);
      setLoading(false);
    })();
  }, []);

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read && n.type !== "friend_request");
    for (const n of unread) {
      await base44.entities.Notification.update(n.id, { is_read: true });
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const respondRequest = async (req, accept) => {
    setResponding(req.userId);
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: accept ? "acceptFriendRequest" : "removeFriend",
        friend_user_id: req.userId,
      });
      if (res?.data?.success === false) throw new Error(res?.data?.error || "Action impossible");
      if (req.notificationId) {
        await base44.entities.Notification.update(req.notificationId, { is_read: true }).catch(() => {});
        setNotifications((prev) => prev.map((n) => (n.id === req.notificationId ? { ...n, is_read: true } : n)));
      }
      setRequests((prev) => prev.filter((r) => r.userId !== req.userId));
      toast.success(accept ? "Demande d'ami acceptée !" : "Demande d'ami refusée.");
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || "Erreur lors du traitement de la demande");
    } finally {
      setResponding(null);
    }
  };

  const general = notifications.filter((n) => n.type !== "friend_request");
  const unreadGeneral = general.filter((n) => !n.is_read).length;
  const unreadCount = unreadGeneral + requests.length;
  const filteredGeneral = filter === "unread" ? general.filter((n) => !n.is_read) : general;
  const filteredRequests = requests;
  const isEmpty = filteredRequests.length === 0 && filteredGeneral.length === 0;

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
          {unreadGeneral > 0 && (
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
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <BellOff className="w-12 h-12 opacity-20" />
            <p className="text-sm">{filter === "unread" ? "Aucune notification non lue" : "Aucune notification"}</p>
          </div>
        ) : (
          <>
            {/* Friend requests — accept / decline directly from the notification center */}
            {filteredRequests.map((req, i) => (
              <motion.div key={req.key}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-start gap-3 p-4 rounded-2xl border bg-primary/5 border-primary/25">
                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden" style={{ background: "rgba(168,85,247,0.18)" }}>
                  {req.avatar
                    ? <img src={req.avatar} alt="" className="w-full h-full object-cover" />
                    : <UserPlus className="w-5 h-5" style={{ color: "#a855f7" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">Nouvelle demande d'ami</p>
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{req.name} souhaite t'ajouter en ami.</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      onClick={() => respondRequest(req, true)}
                      disabled={responding === req.userId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                      style={{ background: "rgba(34,197,94,0.25)", border: "1px solid rgba(34,197,94,0.45)" }}>
                      {responding === req.userId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Accepter
                    </button>
                    <button
                      onClick={() => respondRequest(req, false)}
                      disabled={responding === req.userId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/80 transition hover:opacity-90 disabled:opacity-50"
                      style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)" }}>
                      <X className="w-3.5 h-3.5" /> Refuser
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">{formatTimeAgo(req.created_date)}</p>
                </div>
              </motion.div>
            ))}

            {filteredGeneral.map((n, i) => {
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
            })}
          </>
        )}
      </div>
    </div>
  );
}