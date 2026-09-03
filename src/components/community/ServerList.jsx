import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Globe, Lock, Users, Copy, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ServerCreator from "./ServerCreator";

export default function ServerList() {
  const [showCreator, setShowCreator] = useState(false);
  const [user, setUser] = React.useState(null);
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: servers = [] } = useQuery({
    queryKey: ["servers"],
    queryFn: () => base44.entities.Server.list("-created_date", 30),
  });

  const myServers = servers.filter((s) => s.owner_email === user?.email);
  const publicServers = servers.filter((s) => s.is_public && s.owner_email !== user?.email);

  const copyInvite = (code) => {
    const url = `${window.location.origin}/nexus/invite/${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien d'invitation copié !");
  };

  return (
    <div className="space-y-4">
      {/* Create button */}
      <Button onClick={() => setShowCreator(true)} className="w-full gap-2 font-bold rounded-2xl bg-premium/10 text-premium border border-premium/30 hover:bg-premium/20">
        <Plus className="w-4 h-4" /> Créer un serveur
      </Button>

      {/* My servers */}
      {myServers.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Mes serveurs</p>
          <div className="space-y-2">
            {myServers.map((s) => (
              <ServerCard key={s.id} server={s} isOwner onCopyInvite={copyInvite} />
            ))}
          </div>
        </div>
      )}

      {/* Public servers */}
      {publicServers.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Serveurs publics</p>
          <div className="space-y-2">
            {publicServers.map((s) => (
              <ServerCard key={s.id} server={s} onCopyInvite={copyInvite} />
            ))}
          </div>
        </div>
      )}

      {servers.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p className="text-3xl mb-2">🏠</p>
          <p>Aucun serveur pour l'instant</p>
          <p className="text-xs mt-1">Sois le premier à en créer un !</p>
        </div>
      )}

      {showCreator && (
        <ServerCreator
          onClose={() => setShowCreator(false)}
          onCreated={() => qc.invalidateQueries({ queryKey: ["servers"] })}
        />
      )}
    </div>
  );
}

function ServerCard({ server, isOwner, onCopyInvite }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card/60 hover:bg-card transition">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-border/60"
        style={{ background: (server.banner_color || "#7c3aed") + "30" }}>
        {server.icon_emoji || "🏠"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{server.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {server.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          <span>{server.is_public ? "Public" : "Privé"}</span>
          <Users className="w-3 h-3 ml-1" />
          <span>{server.members_count || 1}</span>
        </div>
      </div>
      {isOwner && server.invite_code && (
        <button onClick={() => onCopyInvite(server.invite_code)}
          className="p-2 rounded-xl hover:bg-secondary transition text-muted-foreground hover:text-foreground">
          <Copy className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}