import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

export default function DmList({ user, onOpenDm }) {
  const { data: friends = [] } = useQuery({
    queryKey: ["friends-dm", user?.email],
    queryFn: async () => {
      const all = await base44.entities.Friend.filter({ user_email: user.email, status: "accepted" }, "-created_date", 100);
      return all;
    },
    enabled: !!user?.email,
  });

  // Get unique DMs with last message preview
  const [dms, setDms] = React.useState([]);

  React.useEffect(() => {
    if (friends.length === 0) { setDms([]); return; }
    Promise.all(friends.map(async (f) => {
      const dmId = "dm__" + [user.email, f.friend_email].sort().join("__");
      const msgs = await base44.entities.ServerMessage.filter({ server_id: dmId, channel_id: "dm" }, "-created_date", 1);
      return { friend: f, lastMsg: msgs[0] || null, dmId };
    })).then(results => {
      setDms(results.filter(r => r.lastMsg).sort((a, b) => new Date(b.lastMsg.created_date) - new Date(a.lastMsg.created_date)));
    });
  }, [friends]);

  if (dms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="font-bold text-sm">Aucune conversation</p>
        <p className="text-xs mt-1">Ajoutez des amis pour discuter en privé</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {dms.map(({ friend, lastMsg }) => (
        <button key={friend.id}
          onClick={() => onOpenDm({ friend_email: friend.friend_email, friend_name: friend.friend_name })}
          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary/50 transition text-left">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm shrink-0">
            {friend.friend_name?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-white">{friend.friend_name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {lastMsg?.author_email === user.email ? "Vous : " : ""}
              {lastMsg?.content?.slice(0, 40)}
            </p>
          </div>
          {lastMsg && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {new Date(lastMsg.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}