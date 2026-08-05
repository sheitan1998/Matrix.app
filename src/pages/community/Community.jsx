import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Plus, Hash, Volume2, Megaphone, Settings, Trash2, Search, UserPlus, Link2, MessageCircle, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ServerCreator from "@/components/community/ServerCreator";
import ServerChat from "@/components/community/ServerChat";
import VoiceChannel from "@/components/community/VoiceChannel";
import ServerSettings from "@/components/community/ServerSettings";
import MembersList from "@/components/community/MembersList";
import ServerSearch from "@/components/community/ServerSearch";
import NitroModal from "@/components/community/NitroModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { VISUAL_THEMES, getTheme } from "@/lib/visualThemes";
import NotificationBell from "@/components/NotificationBell";
import PrivateChat from "@/components/community/PrivateChat";
import DmList from "@/components/community/DmList";
import { useProgression } from "@/context/ProgressionContext";
import { getRank } from "@/lib/progressionData";
import { Gamepad2, Cpu, Music, Palette, Film, Newspaper } from "lucide-react";
import TrixWalletBar from "@/components/TrixWalletBar";

const CATEGORIES = [
  { id: "gaming", label: "Jeux Vidéo", icon: Gamepad2 },
  { id: "tech", label: "Technologie", icon: Cpu },
  { id: "music", label: "Musique", icon: Music },
  { id: "art", label: "Art", icon: Palette },
  { id: "cinema", label: "Cinéma", icon: Film },
  { id: "news", label: "Actualités", icon: Newspaper },
];

const CHANNEL_TYPES = [
  { key: "text", label: "Textuel", icon: Hash },
  { key: "voice", label: "Vocal", icon: Volume2 },
  { key: "announce", label: "Annonces", icon: Megaphone },
];

const defaultChannels = [
  { id: "general", name: "général", type: "text" },
  { id: "bienvenue", name: "bienvenue", type: "announce" },
  { id: "vocal", name: "vocal", type: "voice" },
];

export default function Community() {
  const [user, setUser] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [showCreator, setShowCreator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showInviteJoin, setShowInviteJoin] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [activeDm, setActiveDm] = useState(null);
  const [showDmList, setShowDmList] = useState(false);
  const [showNitro, setShowNitro] = useState(false);
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const { progress } = useProgression();
  const rank = progress ? getRank(progress.level) : null;

  // Handle Nitro Stripe redirect
  useEffect(() => {
    const nitroStatus = searchParams.get("nitro");
    const sessionId = searchParams.get("session_id");
    if (nitroStatus === "success" && sessionId) {
      base44.functions.invoke("stripePayment", { action: "verifySession", sessionId })
        .then(res => {
          if (res?.data?.success) toast.success("Nitro activé ! Profite de tes avantages 🎉");
        })
        .catch(() => {});
    }
    if (nitroStatus === "canceled") toast.error("Paiement annulé");
  }, [searchParams]);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: servers = [] } = useQuery({
    queryKey: ["servers"],
    queryFn: () => base44.entities.Server.list("-created_date", 50),
  });

  const isOwner = selectedServer?.owner_email === user?.email;
  const theme = getTheme(selectedServer?.visual_theme || "default");
  const channels = selectedServer && selectedServer.id !== "__feed__"
    ? (selectedServer.channels?.length ? selectedServer.channels : defaultChannels)
    : [];

  const updateServer = async (data) => {
    if (!selectedServer?.id || selectedServer.id.startsWith("__")) return;
    await base44.entities.Server.update(selectedServer.id, data);
    qc.invalidateQueries({ queryKey: ["servers"] });
    setSelectedServer((s) => ({ ...s, ...data }));
  };

  const deleteServer = async () => {
    if (!window.confirm("Supprimer définitivement ce serveur ?")) return;
    await base44.entities.Server.delete(selectedServer.id);
    qc.invalidateQueries({ queryKey: ["servers"] });
    setSelectedServer(null);
    toast.success("Serveur supprimé");
  };

  const removeChannel = async (id) => {
    const updated = (selectedServer.channels?.length ? selectedServer.channels : defaultChannels).filter((c) => c.id !== id);
    await updateServer({ channels: updated });
    if (activeChannel?.id === id) setActiveChannel(null);
  };

  const uploadIcon = async (file) => {
    setUploadingIcon(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await updateServer({ icon_url: file_url });
    setUploadingIcon(false);
    toast.success("Icône mise à jour !");
  };

  const uploadBanner = async (file) => {
    setUploadingBanner(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await updateServer({ banner_url: file_url });
    setUploadingBanner(false);
    toast.success("Bannière mise à jour !");
  };

  const copyInvite = (code) => { navigator.clipboard.writeText(code); toast.success("Code copié !"); };

  const joinByInviteCode = async () => {
    const input = inviteCodeInput.trim();
    if (!input) return;
    // Support Discord invite links (discord.gg/xxx, discord.com/invite/xxx)
    const discordMatch = input.match(/(?:discord\.gg\/|discord\.com\/invite\/)([a-zA-Z0-9]+)/i);
    if (discordMatch) {
      toast.info("Lien Discord détecté — tu seras redirigé vers Discord", { description: "Ouvre le lien dans un nouvel onglet." });
      window.open(`https://discord.gg/${discordMatch[1]}`, "_blank");
      setShowInviteJoin(false);
      setInviteCodeInput("");
      return;
    }
    // Matrix invite code
    const allServers = await base44.entities.Server.list("-created_date", 200);
    const found = allServers.find((s) => s.invite_code === input);
    if (!found) { toast.error("Code invalide ou expiré"); return; }
    // Check if already a member
    const existing = await base44.entities.ServerMember.filter({ server_id: found.id, user_email: user.email });
    if (existing.length === 0) {
      await base44.entities.ServerMember.create({
        server_id: found.id,
        user_email: user.email,
        user_name: user.full_name || user.email.split("@")[0],
        role: "member",
      });
      await base44.entities.Server.update(found.id, { members_count: (found.members_count || 1) + 1 });
    }
    qc.invalidateQueries({ queryKey: ["servers"] });
    setShowInviteJoin(false);
    setInviteCodeInput("");
    selectServer(found);
    toast.success(`Rejoint "${found.name}" !`);
  };

  const inviteToServer = (server) => {
    if (!server.invite_code) { toast.error("Ce serveur n'a pas de code d'invitation"); return; }
    const link = `Rejoins mon serveur "${server.name}" sur MATRIX ! Code: ${server.invite_code}`;
    navigator.clipboard.writeText(link);
    toast.success("Lien d'invitation copié !");
  };

  const selectServer = (s) => {
    setSelectedServer(s);
    setActiveChannel(null);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: selectedServer ? theme.bg : "hsl(var(--background))" }}>
      {/* Top header */}
      <div className="shrink-0 border-b px-4 py-3 flex items-center gap-3 z-40 backdrop-blur-xl"
        style={{ borderColor: selectedServer ? theme.border : "hsl(var(--border))", background: selectedServer ? theme.card : "hsl(var(--background)/0.9)" }}>
        {selectedServer ? (
          <>
            <button onClick={() => setSelectedServer(null)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-xl overflow-hidden border shrink-0" style={{ borderColor: theme.border }}>
              {selectedServer.icon_url
                ? <img src={selectedServer.icon_url} className="w-full h-full object-cover" alt="" />
                : <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: (selectedServer.banner_color || theme.accent) + "30" }}>{selectedServer.icon_emoji || "🏠"}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm truncate text-white">{selectedServer.name}</p>
              <p className="text-[10px] text-muted-foreground">{selectedServer.server_type === "discord" ? "🟣 Serveur Discord" : "🟢 Serveur Nexus"} · {selectedServer.is_public ? "🌍 Public" : "🔒 Privé"} · {channels.length} salons</p>
            </div>
            <button onClick={() => inviteToServer(selectedServer)}
              className="p-2 rounded-xl transition text-muted-foreground hover:text-white"
              title="Copier le lien d'invitation">
              <UserPlus className="w-4 h-4" />
            </button>
            {isOwner && (
              <button onClick={() => setShowSettings(!showSettings)}
                className={cn("p-2 rounded-xl transition", showSettings ? "text-white bg-white/10" : "text-muted-foreground hover:text-white")}>
                <Settings className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <>
            <button onClick={() => setShowDmList(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border hover:bg-secondary transition"
              title="Messages privés">
              <MessageCircle className="w-3.5 h-3.5" /> MP
            </button>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition"><ArrowLeft className="w-5 h-5" /></Link>
            <span className="font-black text-lg"><span className="text-premium">M</span>ATRIX Community</span>
            <div className="ml-auto flex items-center gap-2">
              <TrixWalletBar />
              {user && <NotificationBell user={user} />}
              <button onClick={() => setShowInviteJoin(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border hover:bg-secondary transition">
                <UserPlus className="w-3.5 h-3.5" /> Rejoindre
              </button>
              <button onClick={() => setShowSearch(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border hover:bg-secondary transition">
                <Search className="w-3.5 h-3.5" /> Explorer
              </button>
              <button onClick={() => setShowNitro(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-premium/40 bg-premium/10 text-premium transition hover:scale-105 tap-sm">
                <Sparkles className="w-3.5 h-3.5" /> Nitro
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Server icon sidebar (always visible when server selected) */}
        {selectedServer && (
          <div className="w-14 shrink-0 border-r flex flex-col items-center py-3 gap-2 overflow-y-auto no-scrollbar"
            style={{ borderColor: theme.border, background: theme.card + "cc" }}>
            {servers.map((s) => {
              const t = getTheme(s.visual_theme || "default");
              const active = selectedServer?.id === s.id;
              return (
                <button key={s.id} onClick={() => selectServer(s)}
                  className="w-10 h-10 rounded-xl overflow-hidden border-2 transition shrink-0"
                  style={{ borderColor: active ? t.accent : "transparent" }}>
                  {s.icon_url
                    ? <img src={s.icon_url} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: (s.banner_color || t.accent) + "25" }}>{s.icon_emoji || "🏠"}</div>}
                </button>
              );
            })}
            <button onClick={() => setShowCreator(true)}
              className="w-10 h-10 rounded-xl border-2 border-dashed flex items-center justify-center transition"
              style={{ borderColor: theme.accent + "40", color: theme.accent }}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Server list (when no server selected) */}
        {!selectedServer && (
          <div className="w-full sm:w-72 md:w-80 shrink-0 border-r flex flex-col overflow-y-auto no-scrollbar"
            style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card)/0.6)" }}>
            <div className="p-3">
              <button onClick={() => setShowCreator(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary hover:border-primary/60 transition font-bold text-sm">
                <Plus className="w-4 h-4" /> Créer un serveur
              </button>
            </div>
            {servers.map((s) => {
              const t = getTheme(s.visual_theme || "default");
              return (
                <button key={s.id} onClick={() => selectServer(s)}
                  className="flex items-center gap-3 px-3 py-2 mx-2 mb-1 rounded-2xl hover:bg-secondary/50 transition">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border shrink-0" style={{ borderColor: t.border }}>
                    {s.icon_url
                      ? <img src={s.icon_url} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-xl" style={{ background: (s.banner_color || t.accent) + "25" }}>{s.icon_emoji || "🏠"}</div>}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-bold text-sm truncate">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {s.server_type === "discord" ? "🟣 Discord" : "🟢 Nexus"} · {s.is_public ? "🌍" : "🔒"} {s.members_count || 1}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Categories */}
            <div className="px-3 mt-2 border-t border-border pt-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Catégories</p>
              {CATEGORIES.map((c) => (
                <button key={c.id} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary/50 transition text-sm font-medium text-muted-foreground hover:text-white">
                  <c.icon className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
                  {c.label}
                </button>
              ))}
            </div>

            {/* User widget with XP */}
            {user && progress && rank && (
              <div className="mx-2 mt-3 p-3 rounded-2xl" style={{ background: "rgba(18,18,21,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: `1.5px solid ${rank.color}40` }}>
                    {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-secondary">{user.full_name?.[0] || "U"}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user.full_name || user.email?.split("@")[0]}</p>
                    <p className="text-[10px]" style={{ color: rank.color }}>{rank.icon} Niv. {progress.level}</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (progress.xp / (100 * Math.pow(progress.level, 1.4))) * 100)}%`, background: "linear-gradient(90deg, #a855f7, #6d28d9)" }} />
                </div>
                <p className="text-[9px] text-white/30 mt-1 font-mono">{progress.xp.toLocaleString()} XP</p>
              </div>
            )}
          </div>
        )}

        {/* Channel list sidebar */}
        {selectedServer && selectedServer.id !== "__feed__" && (
          <div className="w-44 sm:w-52 shrink-0 border-r flex flex-col overflow-hidden"
            style={{ borderColor: theme.border, background: theme.card + "88" }}>
            {selectedServer.banner_url && (
              <div className="w-full h-20 overflow-hidden shrink-0">
                <img src={selectedServer.banner_url} className="w-full h-full object-cover" alt="" />
              </div>
            )}
            <div className="p-3 border-b shrink-0 flex items-center justify-between" style={{ borderColor: theme.border }}>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Salons</p>
              {isOwner && (
                <button
                  onClick={() => {
                    const name = prompt("Nom du salon :");
                    if (!name) return;
                    const type = prompt("Type : text / voice / announce") || "text";
                    const ch = { id: Date.now().toString(), name: name.trim().toLowerCase().replace(/\s+/g, "-"), type: ["text","voice","announce"].includes(type) ? type : "text" };
                    const updated = [...(selectedServer.channels?.length ? selectedServer.channels : defaultChannels), ch];
                    updateServer({ channels: updated }).then(() => toast.success("Salon créé !"));
                  }}
                  className="w-5 h-5 rounded-md flex items-center justify-center transition hover:opacity-80"
                  style={{ background: theme.accent, color: "#000" }}
                  title="Créer un salon">
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {channels.map((ch) => {
                const TypeIcon = CHANNEL_TYPES.find((t) => t.key === ch.type)?.icon || Hash;
                return (
                  <div key={ch.id}
                    className={cn("flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-pointer group transition",
                      activeChannel?.id === ch.id ? "text-white" : "text-muted-foreground hover:text-white")}
                    style={activeChannel?.id === ch.id ? { background: theme.accent + "30" } : {}}
                    onClick={() => setActiveChannel(ch)}>
                    <TypeIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-semibold truncate flex-1">{ch.name}</span>
                    {isOwner && (
                      <button onClick={(e) => { e.stopPropagation(); removeChannel(ch.id); }}
                        className="opacity-0 group-hover:opacity-100 transition hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>


          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {/* Settings overlay */}
          {showSettings && selectedServer && isOwner && (
            <ServerSettings
              server={selectedServer}
              theme={theme}
              onClose={() => setShowSettings(false)}
              onUpdate={updateServer}
              onDelete={deleteServer}
              uploadIcon={uploadIcon}
              uploadBanner={uploadBanner}
              uploadingIcon={uploadingIcon}
              uploadingBanner={uploadingBanner}
              copyInvite={copyInvite}
              channels={channels}
            />
          )}

          {/* Welcome screen when no server selected */}
          {!selectedServer && (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 text-center p-6">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
                <MessageCircle className="w-10 h-10" style={{ color: "#a855f7" }} />
              </div>
              <div>
                <p className="font-black text-2xl text-white">Bienvenue sur MATRIX Community</p>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">Sélectionne un serveur à gauche ou crée le tien pour commencer à discuter avec la communauté.</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setShowSearch(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-border text-sm font-bold text-white hover:bg-secondary transition">
                  <Search className="w-4 h-4" /> Explorer les serveurs
                </button>
                <button onClick={() => setShowCreator(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-white transition"
                  style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                  <Plus className="w-4 h-4" /> Créer un serveur
                </button>
              </div>
            </div>
          )}

          {/* Server welcome screen */}
          {selectedServer && selectedServer.id !== "__feed__" && !activeChannel && !showSettings && (
            <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center p-6">
              <span className="text-6xl">{selectedServer.icon_emoji || "🏠"}</span>
              <p className="font-black text-2xl text-white">{selectedServer.name}</p>
              <p className="text-sm text-muted-foreground max-w-xs">{selectedServer.description || "Bienvenue ! Sélectionne un salon pour commencer."}</p>
              {channels.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {channels.slice(0, 3).map((ch) => {
                    const Icon = CHANNEL_TYPES.find((t) => t.key === ch.type)?.icon || Hash;
                    return (
                      <button key={ch.id} onClick={() => setActiveChannel(ch)}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-semibold text-white transition"
                        style={{ borderColor: theme.accent + "40", background: theme.accent + "15" }}>
                        <Icon className="w-4 h-4" /> #{ch.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Text channel */}
          {selectedServer && selectedServer.id !== "__feed__" && activeChannel?.type === "text" && !showSettings && user && (
            <ServerChat server={selectedServer} channel={activeChannel} theme={theme} user={user} />
          )}

          {/* Announce channel (read-only) */}
          {selectedServer && selectedServer.id !== "__feed__" && activeChannel?.type === "announce" && !showSettings && user && (
            <ServerChat server={selectedServer} channel={activeChannel} theme={theme} user={user} />
          )}

          {/* Voice channel */}
          {selectedServer && selectedServer.id !== "__feed__" && activeChannel?.type === "voice" && !showSettings && (
            <VoiceChannel channel={activeChannel} server={selectedServer} theme={theme} user={user} />
          )}
        </div>

        {/* Members list — right panel */}
        {selectedServer && selectedServer.id !== "__feed__" && activeChannel && (
          <MembersList server={selectedServer} theme={theme} currentUserEmail={user?.email} onOpenDm={(m) => setActiveDm({ friend_email: m.user_email, friend_name: m.user_name })} />
        )}
      </div>

      {/* Private Chat */}
      {activeDm && user && (
        <PrivateChat user={user} friend={activeDm} onClose={() => setActiveDm(null)} />
      )}

      {/* DM List */}
      {showDmList && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowDmList(false)}>
          <div className="w-full max-w-sm max-h-[80vh] rounded-3xl p-6 space-y-4 overflow-y-auto" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-black text-lg text-white flex items-center gap-2"><MessageCircle className="w-5 h-5 text-primary" /> Messages Privés</h2>
              <button onClick={() => setShowDmList(false)} className="text-muted-foreground hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <DmList user={user} onOpenDm={(friend) => { setActiveDm(friend); setShowDmList(false); }} />
          </div>
        </div>
      )}

      {showCreator && (
        <ServerCreator onClose={() => setShowCreator(false)} onCreated={() => qc.invalidateQueries({ queryKey: ["servers"] })} />
      )}

      {showNitro && <NitroModal open={showNitro} onClose={() => setShowNitro(false)} />}

      {showSearch && (
        <div className="fixed inset-0 z-50">
          <ServerSearch
            onSelectServer={selectServer}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      {/* Join by invite code modal */}
      {showInviteJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <div className="text-center">
              <span className="text-4xl">🔗</span>
              <h2 className="font-black text-lg text-white mt-2">Rejoindre un serveur</h2>
              <p className="text-xs text-muted-foreground">Code d'invitation Matrix ou lien Discord (discord.gg/...)</p>
            </div>
            <input
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinByInviteCode()}
              placeholder="Code Matrix ou lien discord.gg/..."
              className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-white placeholder:text-muted-foreground outline-none text-sm"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowInviteJoin(false); setInviteCodeInput(""); }}
                className="flex-1 py-2.5 rounded-2xl border border-border text-sm font-bold text-muted-foreground hover:text-white transition">
                Annuler
              </button>
              <button onClick={joinByInviteCode}
                className="flex-1 py-2.5 rounded-2xl font-bold text-sm text-black transition"
                style={{ background: "hsl(var(--primary))" }}>
                Rejoindre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}