import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Users, Lock, Globe, Clock, MessageCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useProgression } from "@/context/ProgressionContext";
import AnimatedMedia from "@/components/community/AnimatedMedia";

export default function NexusInvite() {
  const { code } = useParams();
  const nav = useNavigate();
  const { trackActivity } = useProgression();
  const [user, setUser] = useState(null);
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!code) { setError("Code d'invitation manquant"); setLoading(false); return; }
    base44.functions.invoke("serverSearch", { action: "getServerByInviteCode", inviteCode: code })
      .then(res => {
        const found = res?.data;
        if (!found || !found.id) { setError("Ce lien d'invitation est invalide ou a expiré"); setLoading(false); return; }
        if (found.invite_expires_at) {
          const exp = new Date(found.invite_expires_at);
          if (exp < new Date()) { setError("Ce lien d'invitation a expiré"); setLoading(false); return; }
        }
        setServer(found);
        setLoading(false);
      })
      .catch(() => { setError("Erreur lors de la recherche du serveur"); setLoading(false); });
  }, [code]);

  const handleJoin = async () => {
    if (!user) { nav(`/login?returnTo=/nexus/invite/${code}`); return; }
    if (!server) return;
    setJoining(true);
    try {
      await base44.functions.invoke("serverMembership", { action: "join", serverId: server.id });
      setJoined(true);
      trackActivity("servers_joined");
      toast.success(`Rejoint "${server.name}" !`);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Erreur lors de la rejointe du serveur");
    }
    setJoining(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a050f" }}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0a050f" }}>
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-black text-white">{error}</h1>
          <p className="text-sm text-white/50">Demande une nouvelle invitation au propriétaire du serveur.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0a050f" }}>
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-xl font-black text-white">Bienvenue !</h1>
          <p className="text-sm text-white/50">Tu as rejoint "{server.name}" avec succès.</p>
          <button onClick={() => nav("/community")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
            <MessageCircle className="w-4 h-4" /> Ouvrir la communauté
          </button>
        </div>
      </div>
    );
  }

  const isExpired = server?.invite_expires_at && new Date(server.invite_expires_at) < new Date();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0a050f" }}>
      <div className="max-w-sm w-full rounded-3xl overflow-hidden" style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)" }}>
        {/* Banner */}
        {server?.banner_url ? (
          <div className="h-24 w-full overflow-hidden">
            <AnimatedMedia src={server.banner_url} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-24" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(109,40,217,0.2))" }} />
        )}

        {/* Server info */}
        <div className="px-6 pb-6 -mt-10 text-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 mx-auto mb-3" style={{ borderColor: "#13101a", background: "rgba(168,85,247,0.15)" }}>
            {server?.icon_url
              ? <AnimatedMedia src={server.icon_url} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-3xl">{server?.icon_emoji || "🏠"}</div>}
          </div>

          <h1 className="text-xl font-black text-white">{server?.name}</h1>
          {server?.description && <p className="text-xs text-white/50 mt-1">{server.description}</p>}

          {/* Meta badges */}
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
              {server?.server_type === "discord" ? "🟣 Discord" : "🟢 Nexus"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: server?.is_public ? "#22c55e" : "#fbbf24" }}>
              {server?.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {server?.is_public ? "Public" : "Privé"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af" }}>
              <Users className="w-3 h-3" /> {server?.members_count || 1}
            </span>
            {server?.invite_expires_at && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>
                <Clock className="w-3 h-3" /> Expire le {new Date(server.invite_expires_at).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>

          {/* Join button */}
          <button
            onClick={handleJoin}
            disabled={joining || isExpired}
            className="w-full mt-5 py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
          >
            {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {user ? "Rejoindre le serveur" : "Se connecter pour rejoindre"}
          </button>

          <Link to="/" className="block mt-3 text-xs text-white/40 hover:text-white/70 transition">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}