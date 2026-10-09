import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown, UserPlus, Zap, Bell, LogOut, Settings as SettingsIcon,
  Hash, Volume2, Megaphone, MessageSquare, Folder, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const notifKey = (serverId) => `matrix-server-notif-${serverId}`;

export function getServerNotifPref(serverId) {
  try { return JSON.parse(localStorage.getItem(notifKey(serverId))) || { muted: false, mentions_only: false }; }
  catch { return { muted: false, mentions_only: false }; }
}

export function setServerNotifPref(serverId, pref) {
  localStorage.setItem(notifKey(serverId), JSON.stringify(pref));
}

export default function ServerDropdownHeader({
  server, theme, isOwner, channels, onInvite, onOpenSettings, onLeaveServer, onExpandAll,
}) {
  const [open, setOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifPref, setNotifPref] = useState({ muted: false, mentions_only: false });
  const ref = useRef(null);

  useEffect(() => {
    setNotifPref(getServerNotifPref(server.id));
  }, [server.id]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const accent = theme?.accent || "hsl(var(--primary))";
  const iconUrl = server.icon_url;

  const saveNotif = (pref) => {
    setNotifPref(pref);
    setServerNotifPref(server.id, pref);
  };

  const handleLeave = () => {
    setOpen(false);
    if (!window.confirm(`Quitter le serveur "${server.name}" ?`)) return;
    onLeaveServer?.();
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => { setOpen(!open); setShowNotif(false); }}
        className="w-full flex items-center gap-2 px-3 py-2.5 transition hover:bg-white/5"
        style={{ borderBottom: `1px solid ${theme?.border || "hsl(var(--border))"}` }}
      >
        <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
          style={{ background: (server.banner_color || accent) + "30" }}>
          {iconUrl
            ? <img src={iconUrl} alt="" className="w-full h-full object-cover" />
            : <span className="text-sm">{server.icon_emoji || "🏠"}</span>}
        </div>
        <span className="flex-1 text-left text-sm font-black text-white truncate">{server.name}</span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition shrink-0", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 rounded-b-xl overflow-hidden shadow-2xl"
          style={{ background: "hsl(var(--card))", border: `1px solid ${theme?.border || "hsl(var(--border))"}`, borderTop: "none" }}>
          {/* Inviter des membres */}
          <MenuItem icon={UserPlus} label="Inviter des membres" accent={accent}
            onClick={() => { setOpen(false); onInvite?.(); }} />

          {/* Voir les boosts */}
          <MenuItem icon={Zap} label="Voir les boosts" accent={accent}
            onClick={() => { setOpen(false); onOpenSettings?.("boosts"); }} />

          {/* Paramètres de notification */}
          <MenuItem icon={Bell} label="Paramètres de notification" accent={accent}
            onClick={() => setShowNotif(!showNotif)} />

          {showNotif && (
            <div className="px-4 py-2 space-y-2" style={{ background: "rgba(255,255,255,0.02)" }}>
              <NotifToggle label="Couper toutes les notifications" checked={notifPref.muted}
                onChange={(v) => saveNotif({ ...notifPref, muted: v })} />
              <NotifToggle label="Mentions uniquement" checked={notifPref.mentions_only}
                onChange={(v) => saveNotif({ ...notifPref, mentions_only: v })} />
            </div>
          )}

          <div className="h-px bg-white/5" />

          {/* Afficher tous les salons */}
          <MenuItem icon={Hash} label="Afficher tous les salons" accent={accent}
            onClick={() => { setOpen(false); onExpandAll?.(); }} />

          {/* Gérer le serveur (owner) ou Quitter */}
          {isOwner ? (
            <MenuItem icon={SettingsIcon} label="Gérer le serveur" accent={accent}
              onClick={() => { setOpen(false); onOpenSettings?.("general"); }} />
          ) : (
            <MenuItem icon={LogOut} label="Quitter le serveur" accent="#ef4444"
              onClick={handleLeave} />
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, accent, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/5 transition text-left">
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
      {label}
    </button>
  );
}

function NotifToggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <button onClick={() => onChange(!checked)}
        className={cn("w-8 h-4 rounded-full transition shrink-0", checked ? "bg-green-500" : "bg-white/20")}>
        <div className={cn("w-3 h-3 rounded-full bg-white transition-transform", checked ? "translate-x-4" : "translate-x-0.5")} />
      </button>
    </label>
  );
}