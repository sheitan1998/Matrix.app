import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { base44 } from "@/api/base44Client";
import { X, Bell, Gift, UserPlus, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UserSettingsModal({ open, onClose, user }) {
  const [settings, setSettings] = useState({
    notif_messages: true,
    notif_free_rewards: true,
    allow_friend_requests: true,
    dm_privacy: "everyone",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      setSettings({
        notif_messages: user.notif_messages !== false,
        notif_free_rewards: user.notif_free_rewards !== false,
        allow_friend_requests: user.allow_friend_requests !== false,
        dm_privacy: user.dm_privacy || "everyone",
      });
    }
  }, [open, user]);

  if (!open) return null;

  const updateSetting = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaving(true);
    try {
      await base44.auth.updateMe({ [key]: value });
      toast.success("Paramètre mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour");
      // revert
      setSettings(prev => ({ ...prev, [key]: !value }));
    }
    setSaving(false);
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={cn("w-11 h-6 rounded-full transition shrink-0 relative", checked ? "bg-green-500" : "bg-white/20")}
    >
      <div className={cn("w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5", checked ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );

  const sections = [
    {
      icon: Bell,
      color: "#3b82f6",
      title: "Notifications de messages",
      desc: "Recevoir des alertes quand vous recevez un nouveau message privé ou dans un serveur.",
      toggleKey: "notif_messages",
    },
    {
      icon: Gift,
      color: "#fbbf24",
      title: "Rappels de récompenses gratuites",
      desc: "Être notifié lorsque la Roue de la Fortune gratuite ou le Ticket Quotidien gratuit sont disponibles.",
      toggleKey: "notif_free_rewards",
    },
    {
      icon: UserPlus,
      color: "#22c55e",
      title: "Demandes d'amis",
      desc: "Autoriser les autres utilisateurs à vous ajouter en tant qu'ami.",
      toggleKey: "allow_friend_requests",
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin rounded-2xl"
        style={{ background: "#18191c", border: "1px solid rgba(168,85,247,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)" }}>
              <Bell className="w-4 h-4" style={{ color: "#a855f7" }} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Paramètres</h2>
              <p className="text-[10px] text-white/40">Gérez vos préférences</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition" style={{ background: "rgba(255,255,255,0.05)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toggle sections */}
        <div className="p-5 space-y-3">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.toggleKey} className="p-4 rounded-xl flex items-start gap-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + "15" }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{s.title}</p>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
                <Toggle checked={settings[s.toggleKey]} onChange={(v) => updateSetting(s.toggleKey, v)} />
              </div>
            );
          })}

          {/* DM Privacy */}
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
                <MessageSquare className="w-4 h-4" style={{ color: "#a855f7" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">Réception des messages</p>
                <p className="text-xs text-white/40 mt-0.5">Choisissez qui peut vous envoyer des messages privés.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 ml-12">
              <button
                onClick={() => updateSetting("dm_privacy", "everyone")}
                className={cn("px-3 py-2.5 rounded-xl text-xs font-bold transition", settings.dm_privacy === "everyone" ? "text-white" : "text-white/40 hover:text-white/60")}
                style={settings.dm_privacy === "everyone" ? { background: "rgba(168,85,247,0.2)", border: "1px solid #a855f7" } : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                Tout le monde
              </button>
              <button
                onClick={() => updateSetting("dm_privacy", "friends")}
                className={cn("px-3 py-2.5 rounded-xl text-xs font-bold transition", settings.dm_privacy === "friends" ? "text-white" : "text-white/40 hover:text-white/60")}
                style={settings.dm_privacy === "friends" ? { background: "rgba(168,85,247,0.2)", border: "1px solid #a855f7" } : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                Amis uniquement
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
          >
            Terminé
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}