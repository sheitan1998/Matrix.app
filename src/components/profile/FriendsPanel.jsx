import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserCheck, Clock, Users, X, Search, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function FriendsPanel({ user, onClose }) {
  const [addPseudo, setAddPseudo] = useState("");
  const [searching, setSearching] = useState(false);
  const [freshUsers, setFreshUsers] = useState({});
  const qc = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ["mp-friends", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Friend.filter({ user_email: user.email }, "-created_date", 100);
    },
    enabled: !!user?.email,
  });

  // Real-time: refresh friend list when any Friend record changes
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.Friend.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["mp-friends"] });
    });
    return unsubscribe;
  }, [user?.email, qc]);

  // Fetch fresh profile data (pseudo, avatar) for all friends by user_id
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

  const pendingSent = friends.filter(f => f.status === "pending_sent");
  const pendingReceived = friends.filter(f => f.status === "pending_received");
  const accepted = friends.filter(f => f.status === "accepted");

  const parsePseudoTag = (input) => {
    const trimmed = input.trim();
    const hashIdx = trimmed.indexOf("#");
    if (hashIdx === -1) return { pseudo: trimmed, tag: null };
    return { pseudo: trimmed.slice(0, hashIdx).trim(), tag: trimmed.slice(hashIdx + 1).trim() };
  };

  const sendFriendRequest = async () => {
    if (!addPseudo?.trim()) return;
    const input = addPseudo.trim();
    const isEmail = input.includes("@");
    const { pseudo, tag } = parsePseudoTag(input);
    if (!pseudo && !isEmail) { toast.error("Pseudo invalide"); return; }
    if (!user?.email) { toast.error("Session expirée, reconnecte-toi."); return; }
    setSearching(true);
    try {
      const payload = isEmail
        ? { action: "addFriend", email: input }
        : { action: "addFriend", pseudo, tag };
      const res = await base44.functions.invoke("serverSearch", payload);
      if (!res?.data?.success) {
        toast.error(res?.data?.error || "Erreur lors de l'envoi");
        return;
      }
      qc.invalidateQueries({ queryKey: ["mp-friends"] });
      setAddPseudo("");
      toast.success(`Demande envoyée à ${res.data.target_name || ""} !`);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Erreur lors de l'envoi";
      toast.error(msg);
    }
    setSearching(false);
  };

  const acceptRequest = async (friend) => {
    if (!friend?.friend_user_id) return;
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "acceptFriendRequest",
        friend_user_id: friend.friend_user_id,
      });
      if (!res?.data?.success) {
        toast.error(res?.data?.error || "Erreur lors de l'acceptation");
        return;
      }
      qc.invalidateQueries({ queryKey: ["mp-friends"] });
      toast.success("Ami accepté !");
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Erreur");
    }
  };

  const removeFriend = async (friend) => {
    if (!friend?.friend_user_id) return;
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "removeFriend",
        friend_user_id: friend.friend_user_id,
      });
      if (!res?.data?.success) {
        toast.error(res?.data?.error || "Erreur lors de la suppression");
        return;
      }
      qc.invalidateQueries({ queryKey: ["mp-friends"] });
      toast.success("Ami retiré.");
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Erreur");
    }
  };

  const openConversation = (friend) => {
    const email = freshUsers[friend.friend_user_id]?.email;
    if (email) window.dispatchEvent(new CustomEvent("matrix-open-chat", { detail: { friendEmail: email } }));
    if (onClose) onClose();
  };

  const resolveFriend = (f) => {
    const fresh = f.friend_user_id ? freshUsers[f.friend_user_id] : null;
    return {
      name: fresh?.full_name || "Utilisateur",
      pseudo: fresh?.pseudo || "",
      avatar: fresh?.avatar_url || "",
    };
  };

  const Avatar = ({ f }) => {
    const data = resolveFriend(f);
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden shrink-0" style={{ background: "rgba(168,85,247,0.2)" }}>
        {data.avatar ? <img src={data.avatar} alt="" className="w-full h-full object-cover" /> : data.name?.[0]?.toUpperCase() || "?"}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search / Add */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Search className="w-4 h-4" style={{ color: "#a855f7" }} /> Rechercher un utilisateur
        </h3>
        <div className="flex gap-2">
          <input value={addPseudo} onChange={e => setAddPseudo(e.target.value)} onKeyDown={e => e.key === "Enter" && sendFriendRequest()}
            placeholder="Pseudo#1234 ou email" className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
          <button onClick={sendFriendRequest} disabled={searching} className="px-4 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
            <Send className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
        <p className="text-[10px] text-white/30 mt-2">Format : Pseudo#1234 (le tag identifie l'utilisateur) ou son email</p>
      </div>

      {/* Pending received */}
      {pendingReceived.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(234,179,8,0.2)" }}>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-yellow-500" /> Demandes reçues ({pendingReceived.length})
          </h3>
          <div className="space-y-2">
            {pendingReceived.map(f => {
              const d = resolveFriend(f);
              return (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <Avatar f={f} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{d.name}</p>
                  <p className="text-[10px] text-white/40 font-mono">{d.pseudo}</p>
                </div>
                <button onClick={() => acceptRequest(f)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1" style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}>
                  <UserCheck className="w-3 h-3" /> Accepter
                </button>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending sent */}
      {pendingSent.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-sm font-bold text-white/60 flex items-center gap-2 mb-3">
            <Send className="w-4 h-4" /> Demandes envoyées ({pendingSent.length})
          </h3>
          <div className="space-y-2">
            {pendingSent.map(f => {
              const d = resolveFriend(f);
              return (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <Avatar f={f} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/70 truncate">{d.name}</p>
                  <p className="text-[10px] text-white/30 font-mono">{d.pseudo}</p>
                </div>
                <span className="text-[10px] text-white/40 px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.05)" }}>En attente</span>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Users className="w-4 h-4" style={{ color: "#a855f7" }} /> Mes amis ({accepted.length})
        </h3>
        {accepted.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-4">Aucun ami pour le moment.</p>
        ) : (
          <div className="space-y-1">
            {accepted.map(f => {
              const d = resolveFriend(f);
              return (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition group">
                <Avatar f={f} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{d.name}</p>
                  <p className="text-[10px] text-white/40 font-mono">{d.pseudo}</p>
                </div>
                <button onClick={() => openConversation(f)} className="p-1.5 rounded-lg text-white/40 hover:text-purple-400 transition" title="Envoyer un message">
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button onClick={() => removeFriend(f)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 transition" title="Retirer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}