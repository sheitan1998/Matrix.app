import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserCheck, Clock, Users, X, Search, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function FriendsPanel({ user, onClose }) {
  const [addPseudo, setAddPseudo] = useState("");
  const [searching, setSearching] = useState(false);
  const qc = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ["mp-friends", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Friend.filter({ user_email: user.email }, "-created_date", 100);
    },
    enabled: !!user?.email,
  });

  // Real-time: refresh friend list when any Friend record changes (new request, accept, delete)
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.Friend.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["mp-friends"] });
    });
    return unsubscribe;
  }, [user?.email, qc]);

  const pendingSent = friends.filter(f => f.status === "pending_sent");
  const pendingReceived = friends.filter(f => f.status === "pending_received");
  const accepted = friends.filter(f => f.status === "accepted");

  // Parse "Pseudo#1234" into { pseudo, tag }
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
    if (!pseudo) { toast.error("Pseudo invalide"); return; }
    if (!isEmail && pseudo === user?.pseudo && (!tag || tag === user?.pseudo_tag)) {
      toast.error("Tu ne peux pas t'ajouter toi-même !");
      return;
    }
    if (isEmail && input.toLowerCase() === user?.email?.toLowerCase()) {
      toast.error("Tu ne peux pas t'ajouter toi-même !");
      return;
    }
    if (!user?.email) { toast.error("Session expirée, reconnecte-toi."); return; }
    setSearching(true);
    try {
      // Step 1: search for the target user
      const searchPayload = isEmail
        ? { action: "searchUser", email: input }
        : { action: "searchUser", pseudo, tag };
      const searchRes = await base44.functions.invoke("serverSearch", searchPayload);
      const target = searchRes?.user;
      if (!target?.email) {
        toast.error(searchRes?.error || "Aucun utilisateur trouvé. Vérifiez le pseudo#tag ou l'email saisi.");
        return;
      }

      // Step 2: send friend request via backend (creates both records atomically, anti-duplicate)
      const sendRes = await base44.functions.invoke("serverSearch", {
        action: "sendFriendRequest",
        target_email: target.email,
      });
      if (!sendRes?.success) {
        toast.error(sendRes?.error || "Erreur lors de l'envoi");
        return;
      }
      qc.invalidateQueries({ queryKey: ["mp-friends"] });
      setAddPseudo("");
      toast.success("Demande envoyée !");
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.detail || err?.message || "Erreur lors de l'envoi";
      toast.error(msg);
    }
    setSearching(false);
  };

  const acceptRequest = async (friend) => {
    if (!friend?.id || !user?.email) return;
    try {
      await base44.entities.Friend.update(friend.id, { status: "accepted" });
      const theirRecord = await base44.entities.Friend.filter({ user_email: friend.friend_email, friend_email: user.email });
      if (theirRecord?.length > 0) await base44.entities.Friend.update(theirRecord[0].id, { status: "accepted" });
      qc.invalidateQueries({ queryKey: ["mp-friends"] });
      toast.success("Ami accepté !");
    } catch (err) {
      toast.error(err?.message || "Erreur lors de l'acceptation");
    }
  };

  const removeFriend = async (friend) => {
    if (!friend?.id || !user?.email) return;
    try {
      await base44.entities.Friend.delete(friend.id);
      const theirRecord = await base44.entities.Friend.filter({ user_email: friend.friend_email, friend_email: user.email });
      if (theirRecord?.length > 0) await base44.entities.Friend.delete(theirRecord[0].id);
      qc.invalidateQueries({ queryKey: ["mp-friends"] });
      toast.success("Ami retiré.");
    } catch (err) {
      toast.error(err?.message || "Erreur lors de la suppression");
    }
  };

  const openConversation = (friend) => {
    window.dispatchEvent(new CustomEvent("matrix-open-chat", { detail: { friendEmail: friend.friend_email } }));
    if (onClose) onClose();
  };

  const Avatar = ({ f }) => (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden shrink-0" style={{ background: "rgba(168,85,247,0.2)" }}>
      {f.friend_avatar ? <img src={f.friend_avatar} alt="" className="w-full h-full object-cover" /> : f.friend_name?.[0]?.toUpperCase() || "?"}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search / Add */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Search className="w-4 h-4" style={{ color: "#a855f7" }} /> Rechercher un utilisateur
        </h3>
        <div className="flex gap-2">
          <input value={addPseudo} onChange={e => setAddPseudo(e.target.value)} onKeyDown={e => e.key === "Enter" && sendFriendRequest()}
            placeholder="Pseudo#1234" className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
          <button onClick={sendFriendRequest} disabled={searching} className="px-4 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
            <Send className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
        <p className="text-[10px] text-white/30 mt-2">Format requis : Pseudo#1234 (le tag identifie de manière unique l'utilisateur)</p>
      </div>

      {/* Pending received */}
      {pendingReceived.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(234,179,8,0.2)" }}>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-yellow-500" /> Demandes reçues ({pendingReceived.length})
          </h3>
          <div className="space-y-2">
            {pendingReceived.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <Avatar f={f} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{f.friend_name}</p>
                  <p className="text-[10px] text-white/40 font-mono">{f.friend_pseudo}</p>
                </div>
                <button onClick={() => acceptRequest(f)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1" style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}>
                  <UserCheck className="w-3 h-3" /> Accepter
                </button>
              </div>
            ))}
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
            {pendingSent.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <Avatar f={f} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/70 truncate">{f.friend_name}</p>
                  <p className="text-[10px] text-white/30 font-mono">{f.friend_pseudo}</p>
                </div>
                <span className="text-[10px] text-white/40 px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.05)" }}>En attente</span>
              </div>
            ))}
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
            {accepted.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition group">
                <Avatar f={f} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{f.friend_name}</p>
                  <p className="text-[10px] text-white/40 font-mono">{f.friend_pseudo}</p>
                </div>
                <button onClick={() => openConversation(f)} className="p-1.5 rounded-lg text-white/40 hover:text-purple-400 transition" title="Envoyer un message">
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button onClick={() => removeFriend(f)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 transition" title="Retirer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}