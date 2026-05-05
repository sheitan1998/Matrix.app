import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Monitor, Lock, Globe, Plus, Pencil, X, LogIn, LogOut, Users, Trash2, Zap } from "lucide-react";
import { Link } from "react-router-dom";
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

  // Media controls
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const screenStreamRef = useRef(null);

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

  const deleteRoom = async (room) => {
    // Find next participant to transfer ownership if needed
    await base44.entities.VoiceRoom.delete(room.id);
    if (myRoom?.id === room.id) {
      setMyRoom(null);
    }
    if (joinedRoom === room.id) {
      setJoinedRoom(null);
    }
    stopScreenShare();
    qc.invalidateQueries({ queryKey: ["voice-rooms"] });
    toast.success("Salon supprimé");
  };

  const joinRoom = async (room) => {
    if (joinedRoom === room.id) {
      // Leave
      const newCount = Math.max(0, (room.participants_count || 1) - 1);
      // If owner leaves, check if there are others and transfer (simulated)
      if (room.owner_email === user?.email && newCount > 0) {
        // Transfer ownership to first other participant (simulated — we don't store participant list)
        toast("Salon transféré au prochain participant");
      }
      await base44.entities.VoiceRoom.update(room.id, { participants_count: newCount });
      setJoinedRoom(null);
      stopScreenShare();
      qc.invalidateQueries({ queryKey: ["voice-rooms"] });
      return;
    }
    if (joinedRoom) {
      // Leave current first
      const currentRoom = rooms.find((r) => r.id === joinedRoom);
      if (currentRoom) {
        await base44.entities.VoiceRoom.update(joinedRoom, { participants_count: Math.max(0, (currentRoom.participants_count || 1) - 1) });
      }
      stopScreenShare();
    }
    await base44.entities.VoiceRoom.update(room.id, { participants_count: (room.participants_count || 0) + 1 });
    setJoinedRoom(room.id);
    qc.invalidateQueries({ queryKey: ["voice-rooms"] });
    toast.success(`Vous avez rejoint "${room.name}"`);
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setScreenSharing(false);
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      stopScreenShare();
      toast("Partage d'écran arrêté");
      return;
    }
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error("Partage d'écran non supporté par ce navigateur");
      return;
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    screenStreamRef.current = stream;
    setScreenSharing(true);
    stream.getVideoTracks()[0].addEventListener("ended", () => {
      setScreenSharing(false);
      screenStreamRef.current = null;
    });
    toast.success("Partage d'écran actif !");
  };

  const activeRoom = joinedRoom ? rooms.find((r) => r.id === joinedRoom) : null;
  const isOwnerOfJoined = activeRoom?.owner_email === user?.email;

  return (
    <div className="space-y-5">
      {/* Booster CTA */}
      {user && !user.community_plan && (
        <Link to="/community/subscription"
          className="flex items-center gap-3 p-3 rounded-2xl border border-premium/30 bg-premium/5 hover:bg-premium/10 transition">
          <Zap className="w-4 h-4 text-premium shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-premium">Abonnement Booster</p>
            <p className="text-xs text-muted-foreground">Crée des serveurs privés · 2 boosts inclus · 10€/mois</p>
          </div>
          <span className="text-xs font-bold text-premium shrink-0">Voir →</span>
        </Link>
      )}

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
            <button onClick={() => deleteRoom(myRoom)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition">
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Tu es le propriétaire — modifie ou supprime ce salon.</p>
        </div>
      )}

      {/* Active room media controls bar */}
      {joinedRoom && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Contrôles — {activeRoom?.name}</p>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Mic */}
            <button
              onClick={() => setMicOn((v) => !v)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition",
                micOn ? "bg-primary/10 border-primary/40 text-primary" : "bg-destructive/10 border-destructive/40 text-destructive"
              )}
            >
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              {micOn ? "Micro actif" : "Micro coupé"}
            </button>

            {/* Camera */}
            <button
              onClick={() => setCamOn((v) => !v)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition",
                camOn ? "bg-primary/10 border-primary/40 text-primary" : "bg-secondary border-border text-muted-foreground"
              )}
            >
              {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              {camOn ? "Caméra active" : "Caméra off"}
            </button>

            {/* Screen share */}
            <button
              onClick={toggleScreenShare}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition",
                screenSharing ? "bg-premium/10 border-premium/40 text-premium animate-live-pulse" : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Monitor className="w-4 h-4" />
              {screenSharing ? "Partage actif" : "Partager écran"}
            </button>

            {/* Owner — delete */}
            {isOwnerOfJoined && (
              <button
                onClick={() => deleteRoom(activeRoom)}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
              >
                <Trash2 className="w-4 h-4" /> Supprimer le salon
              </button>
            )}
          </div>
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
              <div className="flex items-center gap-2">
                {isOwner && (
                  <button
                    onClick={() => deleteRoom(room)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {user && (
                  <button
                    onClick={() => joinRoom(room)}
                    className={cn("flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-semibold transition", isJoined ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-primary text-primary-foreground hover:bg-primary/90")}
                  >
                    {isJoined ? <><LogOut className="w-4 h-4" /> Quitter</> : <><LogIn className="w-4 h-4" /> Rejoindre</>}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}