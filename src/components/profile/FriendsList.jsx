import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserPlus, UserCheck, Clock, Users, X, Copy, ShieldCheck, MessageCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function FriendsList({ user }) {
  const [addPseudo, setAddPseudo] = useState("");
  const [myPseudo, setMyPseudo] = useState(user?.pseudo || "");
  const [editingPseudo, setEditingPseudo] = useState(false);
  const qc = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ["friends", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const sent = await base44.entities.Friend.filter({ user_email: user.email }, "-created_date", 100);
      return sent;
    },
    enabled: !!user?.email,
  });

  const pendingSent = friends.filter((f) => f.status === "pending_sent");
  const pendingReceived = friends.filter((f) => f.status === "pending_received");
  const accepted = friends.filter((f) => f.status === "accepted");

  const generatePseudo = (base) => {
    const digits = String(Math.floor(1000 + Math.random() * 9000));
    return `${base}#${digits}`;
  };

  const savePseudo = async () => {
    const pseudo = myPseudo.includes("#") ? myPseudo : generatePseudo(myPseudo);
    await base44.auth.updateMe({ pseudo });
    setMyPseudo(pseudo);
    setEditingPseudo(false);
    toast.success("Pseudo enregistré !");
  };

  const sendFriendRequest = async () => {
    if (!addPseudo.trim()) return;
    if (!myPseudo) { toast.error("Définis d'abord ton pseudo !"); return; }
    if (addPseudo.trim() === myPseudo) { toast.error("Tu ne peux pas t'ajouter toi-même !"); return; }

    const allUsers = await base44.entities.User.list();
    const target = allUsers.find((u) => u.pseudo === addPseudo.trim());
    if (!target) { toast.error("Pseudo introuvable !"); return; }

    const existing = friends.find((f) => f.friend_email === target.email);
    if (existing) { toast.error("Déjà ami ou demande en cours."); return; }

    await base44.entities.Friend.create({
      user_email: user.email,
      friend_email: target.email,
      friend_name: target.full_name,
      friend_pseudo: target.pseudo || addPseudo.trim(),
      friend_avatar: target.avatar_url || "",
      status: "pending_sent",
    });
    await base44.entities.Friend.create({
      user_email: target.email,
      friend_email: user.email,
      friend_name: user.full_name,
      friend_pseudo: myPseudo,
      friend_avatar: user.avatar_url || "",
      status: "pending_received",
    });
    qc.invalidateQueries({ queryKey: ["friends"] });
    setAddPseudo("");
    toast.success("Demande envoyée !");
  };

  const acceptRequest = async (friend) => {
    await base44.entities.Friend.update(friend.id, { status: "accepted" });
    const theirRecord = await base44.entities.Friend.filter({ user_email: friend.friend_email, friend_email: user.email });
    if (theirRecord.length > 0) {
      await base44.entities.Friend.update(theirRecord[0].id, { status: "accepted" });
    }
    qc.invalidateQueries({ queryKey: ["friends"] });
    toast.success("Ami accepté !");
  };

  const removeFriend = async (friend) => {
    await base44.entities.Friend.delete(friend.id);
    const theirRecord = await base44.entities.Friend.filter({ user_email: friend.friend_email, friend_email: user.email });
    if (theirRecord.length > 0) {
      await base44.entities.Friend.delete(theirRecord[0].id);
    }
    qc.invalidateQueries({ queryKey: ["friends"] });
    toast.success("Ami retiré.");
  };

  return (
    <div className="space-y-4">
      {/* My pseudo */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Mon Pseudo
          </h3>
          <Button size="sm" variant="ghost" onClick={() => setEditingPseudo(!editingPseudo)} className="text-xs h-7">
            {editingPseudo ? "Annuler" : "Modifier"}
          </Button>
        </div>
        {editingPseudo ? (
          <div className="flex gap-2">
            <Input
              value={myPseudo}
              onChange={(e) => setMyPseudo(e.target.value)}
              placeholder="TonPseudo"
              className="text-sm h-9"
            />
            <Button size="sm" onClick={savePseudo} className="h-9 shrink-0">Enregistrer</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg text-primary">{myPseudo || "Pas de pseudo"}</span>
            <button onClick={() => { navigator.clipboard.writeText(myPseudo); toast.success("Copié !"); }}
              className="text-muted-foreground hover:text-foreground"><Copy className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>

      {/* Add friend */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <h3 className="font-bold text-sm flex items-center gap-2 mb-2">
          <UserPlus className="w-4 h-4 text-primary" /> Ajouter un ami
        </h3>
        <div className="flex gap-2">
          <Input value={addPseudo} onChange={(e) => setAddPseudo(e.target.value)}
            placeholder="Pseudo#1234" className="text-sm h-9"
            onKeyDown={(e) => { if (e.key === "Enter") sendFriendRequest(); }} />
          <Button size="sm" onClick={sendFriendRequest} className="h-9 shrink-0">Ajouter</Button>
        </div>
      </div>

      {/* Pending received */}
      {pendingReceived.length > 0 && (
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-500" /> Demandes reçues ({pendingReceived.length})
          </h3>
          <div className="space-y-2">
            {pendingReceived.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                  {f.friend_name?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{f.friend_name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{f.friend_pseudo}</p>
                </div>
                <Button size="sm" onClick={() => acceptRequest(f)} className="h-7 text-xs gap-1">
                  <UserCheck className="w-3 h-3" /> Accepter
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" /> Amis ({accepted.length})
        </h3>
        {accepted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun ami pour le moment. Ajoutes-en avec leur pseudo !
          </p>
        ) : (
          <div className="space-y-1">
            {accepted.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition group">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                    {f.friend_name?.[0] || "?"}
                  </div>
                  <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                    f.is_online ? "bg-green-500" : "bg-gray-500")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{f.friend_name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{f.friend_pseudo}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => removeFriend(f)}
                    className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}