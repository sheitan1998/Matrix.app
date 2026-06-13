import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Crown, Shield, MessageCircle } from "lucide-react";

const ROLE_ICONS = {
  admin: { icon: Crown, color: "#f59e0b" },
  moderator: { icon: Shield, color: "#3b82f6" },
  member: { icon: null, color: "#888" },
};

export default function MembersList({ server, theme, currentUserEmail, onOpenDm }) {
  const { data: members = [] } = useQuery({
    queryKey: ["server-members", server.id],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: server.id }, "-created_date", 100),
    refetchInterval: 15000,
  });

  const accent = theme?.accent || "hsl(var(--primary))";

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
          Membres — {members.length}
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

                return (
                  <div key={m.id}
                    className="flex items-center gap-2 px-1.5 py-1 rounded-lg group hover:bg-white/5 transition cursor-default"
                    title={!isMe ? `Écrire à ${m.user_name || m.user_email}` : ""}>
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: isOwner ? "#f59e0b30" : accent + "30", border: `1px solid ${isOwner ? "#f59e0b" : accent}50` }}>
                        {(m.user_name || "?")[0].toUpperCase()}
                      </div>
                      {/* Online dot (simulated) */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black"
                        style={{ background: "#44ff88" }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        {isOwner && <Crown className="w-2.5 h-2.5 shrink-0" style={{ color: "#f59e0b" }} />}
                        {!isOwner && RoleIcon && <RoleIcon className="w-2.5 h-2.5 shrink-0" style={{ color: roleInfo.color }} />}
                        <span className="text-[10px] font-semibold text-white/80 truncate leading-none">
                          {m.user_name || m.user_email?.split("@")[0]}
                          {isMe && " (toi)"}
                        </span>
                      </div>
                      {customRole && (
                        <p className="text-[9px] truncate leading-none mt-0.5"
                          style={{ color: accent + "cc" }}>
                          {customRole}
                        </p>
                      )}
                    </div>
                    {!isMe && onOpenDm && (
                      <button
                        onClick={() => onOpenDm(m)}
                        className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-white shrink-0"
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
    </div>
  );
}