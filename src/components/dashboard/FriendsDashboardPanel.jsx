import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, MessageCircle, ExternalLink } from "lucide-react";

export default function FriendsDashboardPanel({ user }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [freshUsers, setFreshUsers] = useState({});

  const { data: friends = [] } = useQuery({
    queryKey: ["dash-friends", user?.email],
    queryFn: () => base44.entities.Friend.filter({ user_email: user.email, status: "accepted" }, "-created_date", 50),
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (!friends || friends.length === 0) return;
    const userIds = [...new Set(friends.map(f => f.friend_user_id).filter(Boolean))];
    if (userIds.length === 0) return;
    base44.functions.invoke("serverSearch", { action: "getUsersByIds", ids: userIds })
      .then(res => {
        const map = {};
        (res?.data?.users || []).forEach(u => { map[u.id] = u; });
        setFreshUsers(map);
      })
      .catch(() => {});
  }, [friends]);

  const openChat = (email) => {
    if (email) window.dispatchEvent(new CustomEvent("matrix-open-chat", { detail: { friendEmail: email } }));
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-bold flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Mes amis ({friends.length})
        </h2>
      </div>
      {friends.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucun ami pour le moment.</p>
          <p className="text-xs text-muted-foreground mt-1">Ajoute des amis depuis ton profil.</p>
        </div>
      ) : (
        <div className="divide-y divide-border max-h-80 overflow-y-auto scrollbar-thin">
          {friends.map(f => {
            const fresh = freshUsers[f.friend_user_id];
            const name = fresh?.full_name || "Utilisateur";
            const pseudo = fresh?.pseudo || "";
            const avatar = fresh?.avatar_url || "";
            const email = fresh?.email || "";
            return (
              <div key={f.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-secondary/30 transition">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white bg-secondary">
                    {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : name?.[0]?.toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{name}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{pseudo}</p>
                </div>
                <button onClick={() => openChat(email)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition" title="Message">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}