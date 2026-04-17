import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Mic, Lock, Globe, Plus, Pencil, X, LogIn, LogOut, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function VoiceRooms() {
  const [user, setUser] = useState(null);
  const [myRoom, setMyRoom] = useState(null);
  const [editName, setEditName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPublic, setNewPublic] = useState(true);
  const [joinedRoom, setJoinedRoom] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
  }, []);

  const { data: rooms = [] } = useQuery({
    queryKey: ["voice-rooms"],
    queryFn: () => base44.entities.VoiceRoom.list("-created_date", 30),
    refetchInterval: 5000,
  });

  const visibleRooms = rooms.filter((r) => r.is_public || r.owner_email === user?.email);

  const createRoom = async () => {
    if (!newName.trim() || !user) return;
    const r = await base44.entities.VoiceRoom.create({
      name: newName.trim(),
      owner_email: user.email,
      owner_name: user.full_name,
      is_public: newPublic,
      participants_count: 1,
    });
    setMyRoom(r);
    setJoinedRoom(r.id);
    setCreating(false);
    setNewName("");
    qc.invalidateQueries({ queryKey: ["voice-rooms"] });
    toast.success("Salon vocal créé !");
  };

  const saveEdit = async () => {
    if (!myRoom || !editName.trim()) return;
    await base44.entities.VoiceRoom.update(myRoom.id, { name: editName.trim() });
    setMyRoom((r) => ({ ...r, name: editName.trim() }));
    setEditOpen(false);
    qc.invalidateQueries({ queryKey: ["voice-rooms"] });
    toast.success("Nom mis à jour !");
  };

  const deleteRoom = async () => {
    if (!myRoom) return;
    await base44.entities.VoiceRoom.delete(myRoom.id);
    setMyRoom(null);
    setJoinedRoom(null);
    qc.invalidateQueries({ queryKey: ["voice-rooms"] });
  };

  const joinRoom = async (room) => {
    if (joinedRoom === room.id) {
      // leave
      await base44.entities.VoiceRoom.update(room.id, { participants_count: Math.max(1, (room.participants_count || 1) - 1) });
      setJoinedRoom(null);
      qc.invalidateQueries({ queryKey: ["voice-rooms"] });
      return;
    }
    await base44.entities.VoiceRoom.update(room.id, { participants_count: (room.participants_count || 1) + 1 });
    setJoinedRoom(room.id);
    qc.invalidateQueries({ queryKey: ["voice-rooms"] });
    toast.success(`Vous avez rejoint "${room.name}"`);
  };

  return (
    <div className="space-y-5">
      {/* Create room */}
      {user && !myRoom && (
        creating ? (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-bold">Nouveau salon vocal</h3>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du salon..."
              className="w-full h-9 rounded-lg bg-secondary/60 border border-border px-3 text-sm"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNewPublic(true)}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition", newPublic ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}
              >
                <Globe className="w-4 h-4" /> Public
              </button>
              <button
                onClick={() => setNewPublic(false)}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition", !newPublic ? "border-premium bg-premium/10 text-premium" : "border-border text-muted-foreground")}
              >
                <Lock className="w-4 h-4" /> Privé
              </button>
            </div>
            <div className="flex gap-2">
              <Button onClick={createRoom} disabled={!newName.trim()} className="flex-1 rounded-full bg-primary text-primary-foreground">Créer</Button>
              <Button onClick={() => setCreating(false)} variant="outline" className="rounded-full">Annuler</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setCreating(true)} className="w-full rounded-2xl h-12 gap-2 border border-dashed border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition" variant="ghost">
            <Plus className="w-4 h-4" /> Créer un salon vocal
          </Button>
        )
      )}

      {/* My room controls */}
      {myRoom && (
        <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Mic className="w-5 h-5 text-primary animate-live-pulse" />
            <div className="flex-1">
              {editOpen ? (
                <div className="flex gap-2">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 h-8 rounded-lg bg-secondary/60 border border-border px-2 text-sm" />
                  <button onClick={saveEdit} className="px-3 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">OK</button>
                  <button onClick={() => setEditOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
              ) : (
                <span className="font-bold">{myRoom.name}</span>
              )}
            </div>
            <button onClick={() => { setEditName(myRoom.name); setEditOpen(true); }} className="p-1.5 rounded-lg hover:bg-secondary transition">
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button onClick={deleteRoom} className="p-1.5 rounded-lg hover:bg-destructive/10 transition">
              <X className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Tu es le propriétaire — tu peux modifier ou supprimer ce salon.</p>
        </div>
      )}

      {/* Room list */}
      <div className="space-y-3">
        {visibleRooms.length === 0 && (
          <p className="text-center text-muted-foreground py-10 text-sm">Aucun salon vocal. Crée le premier !</p>
        )}
        {visibleRooms.map((room) => {
          const isJoined = joinedRoom === room.id;
          const isOwner = room.owner_email === user?.email;
          return (
            <div key={room.id} className={cn("rounded-2xl border bg-card p-4 flex items-center gap-4 transition", isJoined ? "border-primary/40" : "border-border")}>
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", isJoined ? "bg-primary/15" : "bg-secondary")}>
                <Mic className={cn("w-5 h-5", isJoined ? "text-primary animate-live-pulse" : "text-muted-foreground")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{room.name}</p>
                  {room.is_public ? <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <Lock className="w-3.5 h-3.5 text-premium shrink-0" />}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Users className="w-3 h-3" />
                  {room.participants_count || 0} participant{room.participants_count > 1 ? "s" : ""}
                  <span>• par {room.owner_name}</span>
                  {isOwner && <span className="text-primary font-semibold">(toi)</span>}
                </div>
              </div>
              {!isOwner && user && (
                <button
                  onClick={() => joinRoom(room)}
                  className={cn("flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-semibold transition", isJoined ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-primary text-primary-foreground hover:bg-primary/90")}
                >
                  {isJoined ? <><LogOut className="w-4 h-4" /> Quitter</> : <><LogIn className="w-4 h-4" /> Rejoindre</>}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}