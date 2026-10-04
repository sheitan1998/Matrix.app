import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Users, Loader2, Zap } from "lucide-react";
import AnimatedMedia from "@/components/community/AnimatedMedia";

export default function ServerInviteEmbed({ inviteCode, accent = "#a855f7" }) {
  const navigate = useNavigate();
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchServer = async () => {
      try {
        const res = await base44.functions.invoke("serverSearch", {
          action: "getServerByInviteCode",
          inviteCode,
        });
        if (cancelled) return;
        if (res?.data?.error) setError(true);
        else setServer(res.data);
      } catch {
        if (!cancelled) setError(true);
      }
      if (!cancelled) setLoading(false);
    };
    fetchServer();
    return () => { cancelled = true; };
  }, [inviteCode]);

  if (loading) {
    return (
      <div className="mt-1.5 rounded-xl border p-3 flex items-center gap-2" style={{ borderColor: accent + "30", background: accent + "08", maxWidth: "300px" }}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Chargement du serveur...</span>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="mt-1.5 rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", maxWidth: "300px" }}>
        <p className="text-xs text-muted-foreground">Serveur introuvable ou lien expiré</p>
      </div>
    );
  }

  return (
    <div className="mt-1.5 rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: accent + "08", maxWidth: "300px" }}>
      {server.banner_url && (
        <div className="h-14 w-full overflow-hidden">
          <AnimatedMedia src={server.banner_url} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-xl shrink-0"
          style={{ background: accent + "20" }}>
          {server.icon_url
            ? <AnimatedMedia src={server.icon_url} className="w-full h-full object-cover" />
            : <span>{server.icon_emoji || "🏠"}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white truncate">{server.name}</p>
          {server.description && <p className="text-xs text-muted-foreground truncate">{server.description}</p>}
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Users className="w-2.5 h-2.5" /> {server.members_count || 1} membres
          </p>
        </div>
      </div>
      <div className="px-3 pb-3">
        <button
          onClick={() => navigate(`/nexus/invite/${inviteCode}`)}
          className="w-full py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90 flex items-center justify-center gap-1.5"
          style={{ background: accent }}
        >
          <Zap className="w-3 h-3" fill="currentColor" /> Rejoindre
        </button>
      </div>
    </div>
  );
}