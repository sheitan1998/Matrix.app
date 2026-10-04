import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Crown, Shield, MessageCircle } from "lucide-react";
import UserProfilePopup from "@/components/profile/UserProfilePopup";
import { stripPseudoTag } from "@/lib/format";
import { isUserOnline, getActivityIcon } from "@/hooks/usePresence";
import { useServerVoice } from "@/hooks/useServerVoice";
import SpeakingRing from "@/components/community/SpeakingRing";

const ROLE_ICONS = {
  admin: { icon: Crown, color: "#f59e0b" },
  moderator: { icon: Shield, color: "#3b82f6" },
  member: { icon: null, color: "#888" },
};

export default function MembersList({ server, theme, currentUserEmail, onOpenDm }) {
  const [profileEmail, setProfileEmail] = useState(null);
  const qc = useQueryClient();
  const { speakingEmails } = useServerVoice(server.id);
  const { data: members = [] } = useQuery({
    queryKey: ["server-members", server.id],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: server.id }, "-created_date", 100),
    refetchInterval: 15000,
  });

  // Real-time subscription for instant member updates
  useEffect(() => {
    const unsubscribe = base44.entities.ServerMember.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["server-members", server.id] });
      qc.invalidateQueries({ queryKey: ["member-activities"] });
    });
    return unsubscribe;
  }, [server.id, qc]);

  const accent = theme?.accent || "hsl(var(--primary))";

  // Fetch fresh user data (pseudo, activity, last_seen, avatar) for all members
  const memberEmails = members.map((m) => m.user_email).filter(Boolean);
  const { data: userData = [], isLoading: usersLoading } = useQuery({
    queryKey: ["member-activities", memberEmails.join(",")],
    queryFn: () =>
      base44.functions.invoke("serverSearch", {
        action: "getUsersByEmails",
        emails: memberEmails,
      }),
    enabled: memberEmails.length > 0,
    refetchInterval: 15000,
    select: (res) => res?.data?.users || [],
  });

  // Build email → user data map
  const userMap = {};
  (userData || []).forEach((u) => {
    if (u.email) userMap[u.email.toLowerCase()] = u;
  });

  // Separate owner, admins, mods, members
  const owner = members.find((m) => m.user_email === server.owner_email);
  const others = members.filter((m) => m.user_email !== server.owner_email && !m.is_banned);

  const groups = [
    { label: "Propriétaire", items: owner ? [owner] : [] },
    { label: "Admins", items: others.filter((m) => m.role === "admin") },
    { label: "Modérateurs", items: others.filter((m) => m.role === "moderator") },
    { label: "Membres", items: others.filter((m) => m.role === "member" || !m.role) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="w-40 shrink-0 border-l flex flex-col overflow-hidden hidden lg:flex"
      style={{ borderColor: theme?.border, background: theme?.card ? theme.card + "88" : "rgba(0,0,0,0.3)" }}>
      <div className="px-3 py-2.5 border-b shrink-0 flex items-center gap-1.5"
        style={{ borderColor: theme?.border }}>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Membres — {members.filter(m => !m.is_banned).length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3 no-scrollbar">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-1 mb-1">
              {group.label} — {group.items.length}
            </p>
            <div className="space-y-0.5">
              {group.items.map((m) => {
                const roleInfo = ROLE_ICONS[m.role] || ROLE_ICONS.member;
                const RoleIcon = roleInfo.icon;
                const isOwner = m.user_email === server.owner_email;
                const isMe = m.user_email === currentUserEmail;
                const customRole = m.custom_role;
                const freshUser = userMap[(m.user_email || "").toLowerCase()];
                const online = isUserOnline(freshUser?.last_seen);
                const showActivity = freshUser?.show_game_activity !== false;
                const activity = showActivity ? freshUser?.current_activity : "";
                const activityType = showActivity ? (freshUser?.current_activity_type || "idle") : "idle";
                const pseudoResolved = stripPseudoTag(freshUser?.pseudo);

                return (
                  <div key={m.id}
                    className="flex items-center gap-2 px-1.5 py-1 rounded-lg group hover:bg-white/5 transition cursor-default"
                    title={!isMe ? "Voir le profil" : ""}>
                    {/* Avatar — clickable */}
                    <button onClick={() => !isMe && setProfileEmail(m.user_email)}
                      className="relative shrink-0 tap-sm" disabled={isMe}>
                      <SpeakingRing speaking={speakingEmails.has((m.user_email || "").toLowerCase())} width={1.5} />
                      <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: isOwner ? "#f59e0b30" : accent + "30", border: `1.5px solid ${isOwner ? "#f59e0b" : accent}80` }}>
                        {(freshUser?.avatar_url || m.user_avatar) ?
                          <img src={freshUser?.avatar_url || m.user_avatar} className="w-full h-full object-cover" alt="" /> :
                          <span>{(pseudoResolved || "?")[0].toUpperCase()}</span>
                        }
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black"
                        style={{ background: online ? "#44ff88" : "#444" }} />
                    </button>

                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 min-w-0">
                        {isOwner && <Crown className="w-2.5 h-2.5 shrink-0" style={{ color: "#f59e0b" }} />}
                        {!isOwner && RoleIcon && <RoleIcon className="w-2.5 h-2.5 shrink-0" style={{ color: roleInfo.color }} />}
                        {pseudoResolved ? (
                          <button onClick={() => !isMe && setProfileEmail(m.user_email)} disabled={isMe}
                            className="text-[10px] font-semibold text-white/80 truncate leading-tight hover:underline disabled:cursor-default min-w-0">
                            <span className="truncate">{pseudoResolved}</span>
                            {isMe && " (toi)"}
                          </button>
                        ) : usersLoading ? (
                          <div className="h-2.5 w-16 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
                        ) : (
                          <span className="text-[10px] font-semibold text-white/20 truncate">—</span>
                        )}
                      </div>
                      {/* Single status line — priority: custom_status > activity > customRole > offline */}
                      <p className="text-[9px] truncate leading-tight flex items-center gap-0.5 min-w-0">
                        {online && freshUser?.custom_status ? (
                          <>
                            <span className="shrink-0">{getActivityIcon("custom")}</span>
                            <span className="truncate" style={{ color: "#c084fc" }}>{freshUser.custom_status}</span>
                          </>
                        ) : online && activity ? (
                          <>
                            <span className="shrink-0">{getActivityIcon(activityType)}</span>
                            <span className="truncate" style={{ color: accent + "aa" }}>{activity}</span>
                          </>
                        ) : online && customRole ? (
                          <span className="truncate" style={{ color: accent + "cc" }}>{customRole}</span>
                        ) : !online ? (
                          <span className="text-white/20 truncate">Hors ligne</span>
                        ) : null}
                      </p>
                    </div>
                    {!isMe && onOpenDm && (
                      <button
                        onClick={() => onOpenDm(m)}
                        className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-white shrink-0 tap-sm"
                        title="Message privé">
                        <MessageCircle className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <p className="text-[10px] text-muted-foreground text-center py-4">Aucun membre</p>
        )}
      </div>

      {profileEmail && (
        <UserProfilePopup
          userEmail={profileEmail}
          open={!!profileEmail}
          onClose={() => setProfileEmail(null)}
          onOpenDm={(contact) => { if (onOpenDm) onOpenDm({ user_email: contact.friend_email, user_name: contact.friend_name }); setProfileEmail(null); }}
        />
      )}
    </div>
  );
}