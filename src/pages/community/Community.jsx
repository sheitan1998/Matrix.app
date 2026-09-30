import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Plus, Hash, Volume2, Megaphone, Settings, Trash2, Search, UserPlus, Link2, MessageCircle, X, Zap, ArrowRight, Folder, MessageSquare, SlidersHorizontal } from "lucide-react";
import ChannelCreateModal from "@/components/community/ChannelCreateModal";
import ChannelList from "@/components/community/ChannelList";
import ForumChannel from "@/components/community/ForumChannel";
import HeaderActions from "@/components/layout/HeaderActions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ServerCreator from "@/components/community/ServerCreator";
import ServerChat from "@/components/community/ServerChat";
import VoiceChannel from "@/components/community/VoiceChannel";
import ServerSettings from "@/components/community/ServerSettings";
import MembersList from "@/components/community/MembersList";
import ServerSearch from "@/components/community/ServerSearch";
import NexusVIPShop from "@/components/nexus/NexusVIPShop";
import ServerBoostButton from "@/components/community/ServerBoostButton";
import UserProfilePopup from "@/components/profile/UserProfilePopup";
import ProfileContent from "@/components/profile/ProfileContent";
import UserSettingsModal from "@/components/profile/UserSettingsModal";
import UserBar from "@/components/community/UserBar";
import { uploadImageWithToast } from "@/lib/imageModeration";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { VISUAL_THEMES, getTheme } from "@/lib/visualThemes";
import { useProgression } from "@/context/ProgressionContext";
import { getRank } from "@/lib/progressionData";
import { canonicalAppUrl } from "@/lib/canonicalOrigin";
import { Gamepad2, Cpu, Music, Palette, Film, Newspaper } from "lucide-react";

const CATEGORIES = [
{ id: "gaming", label: "Jeux Vidéo", icon: Gamepad2 },
{ id: "tech", label: "Technologie", icon: Cpu },
{ id: "music", label: "Musique", icon: Music },
{ id: "art", label: "Art", icon: Palette },
{ id: "cinema", label: "Cinéma", icon: Film },
{ id: "news", label: "Actualités", icon: Newspaper }];


const CHANNEL_TYPES = [
{ key: "text", label: "Textuel", icon: Hash },
{ key: "voice", label: "Vocal", icon: Volume2 },
{ key: "announce", label: "Annonces", icon: Megaphone },
{ key: "forum", label: "Forum", icon: MessageSquare },
{ key: "category", label: "Catégorie", icon: Folder }];


const defaultChannels = [
{ id: "general", name: "général", type: "text" },
{ id: "bienvenue", name: "bienvenue", type: "announce" },
{ id: "vocal", name: "vocal", type: "voice" }];


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
  const [showVIPShop, setShowVIPShop] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [flashBoosts, setFlashBoosts] = useState(0);
  const [joinConfirmServer, setJoinConfirmServer] = useState(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [channelModalMode, setChannelModalMode] = useState("text");
  const [contextMenu, setContextMenu] = useState(null);
  const [userMemberships, setUserMemberships] = useState([]);
  const [joinedServerIds, setJoinedServerIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const { progress } = useProgression();
  const rank = progress ? getRank(progress.level) : null;

  // Handle Nitro Stripe redirect
  useEffect(() => {
    const nitroStatus = searchParams.get("nitro");
    const sessionId = searchParams.get("session_id");
    if (nitroStatus === "success" && sessionId) {
      base44.functions.invoke("stripePayment", { action: "verifySession", sessionId }).
      then((res) => {
        if (res?.data?.success) toast.success("Nitro activé ! Profite de tes avantages 🎉");
      }).
      catch(() => {});
    }
    if (nitroStatus === "canceled") toast.error("Paiement annulé");
  }, [searchParams]);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setFlashBoosts(u?.flash_boosts || 0);
    }).catch(() => {});
  }, []);

  const { data: servers = [] } = useQuery({
    queryKey: ["servers"],
    queryFn: () => base44.entities.Server.list("-created_date", 50)
  });

  // Fetch joined server IDs
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.ServerMember.filter({ user_email: user.email }, "-created_date", 200).
    then((members) => {
      setJoinedServerIds(new Set(members.map((m) => m.server_id)));
      setUserMemberships(members);
    }).
    catch(() => {});
  }, [user]);

  const myServers = servers.filter((s) => s.owner_email === user?.email || joinedServerIds.has(s.id));
  const publicServers = servers.filter((s) => s.is_public && s.owner_email !== user?.email && !joinedServerIds.has(s.id));

  const isOwner = selectedServer?.owner_email === user?.email;
  const myMembership = userMemberships.find((m) => m.server_id === selectedServer?.id);
  const canManageChannels = isOwner || myMembership?.role === "admin" || myMembership?.role === "moderator";
  const theme = getTheme(selectedServer?.visual_theme || "default");
  const channels = selectedServer && selectedServer.id !== "__feed__" ?
  selectedServer.channels?.length ? selectedServer.channels : defaultChannels :
  [];

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

  const createChannel = async (channel) => {
    const updated = [...(selectedServer.channels?.length ? selectedServer.channels : defaultChannels), channel];
    await updateServer({ channels: updated });
    toast.success(`${channel.type === "category" ? "Catégorie" : "Salon"} créé !`);
  };

  const openChannelModal = (mode) => {
    setChannelModalMode(mode);
    setShowChannelModal(true);
    setContextMenu(null);
  };

  const reorderChannels = async (newChannels) => {
    await updateServer({ channels: newChannels });
  };

  const uploadIcon = async (file) => {
    setUploadingIcon(true);
    try {
      const { file_url } = await uploadImageWithToast(file);
      await updateServer({ icon_url: file_url });
      toast.success("Icône mise à jour !");
    } catch { /* error already toasted */ }
    setUploadingIcon(false);
  };

  const uploadBanner = async (file) => {
    setUploadingBanner(true);
    try {
      const { file_url } = await uploadImageWithToast(file);
      await updateServer({ banner_url: file_url });
      toast.success("Bannière mise à jour !");
    } catch { /* error already toasted */ }
    setUploadingBanner(false);
  };

  const copyInvite = (code) => {
    const url = canonicalAppUrl(`/nexus/invite/${code}`);
    navigator.clipboard.writeText(url);
    toast.success("Lien copié !");
  };

  const joinByInviteCode = async () => {
    const input = inviteCodeInput.trim();
    if (!input) return;
    // Extract code from URL or accept raw code
    let code = input;
    const urlMatch = input.match(/\/nexus\/invite\/([a-zA-Z0-9]+)/i);
    if (urlMatch) code = urlMatch[1];
    // Search server by invite code
    const allServers = await base44.entities.Server.list("-created_date", 200);
    const found = allServers.find((s) => s.invite_code === code);
    if (!found) {toast.error("Lien invalide ou expiré");return;}
    // Check expiration
    if (found.invite_expires_at) {
      const exp = new Date(found.invite_expires_at);
      if (exp < new Date()) {toast.error("Ce lien d'invitation a expiré");return;}
    }
    // Check if already a member
    const existing = await base44.entities.ServerMember.filter({ server_id: found.id, user_email: user.email });
    if (existing.length === 0) {
      await base44.entities.ServerMember.create({
        server_id: found.id,
        user_email: user.email,
        user_name: user.full_name || user.email.split("@")[0],
        role: "member"
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
    if (!server.invite_code) {toast.error("Ce serveur n'a pas de lien d'invitation");return;}
    const url = canonicalAppUrl(`/nexus/invite/${server.invite_code}`);
    navigator.clipboard.writeText(url);
    toast.success("Lien d'invitation copié !");
  };

  const selectServer = (s) => {
    // If it's not the user's server and they haven't joined, show join confirmation
    if (s.owner_email !== user?.email && !joinedServerIds.has(s.id)) {
      setJoinConfirmServer(s);
      return;
    }
    setSelectedServer(s);
    setActiveChannel(null);
    setShowSettings(false);
  };

  const confirmJoinServer = async () => {
    if (!joinConfirmServer || !user) return;
    try {
      await base44.entities.ServerMember.create({
        server_id: joinConfirmServer.id,
        user_email: user.email,
        user_name: user.full_name || user.email.split("@")[0],
        role: "member"
      });
      await base44.entities.Server.update(joinConfirmServer.id, { members_count: (joinConfirmServer.members_count || 1) + 1 });
      setJoinedServerIds((prev) => new Set([...prev, joinConfirmServer.id]));
      setSelectedServer(joinConfirmServer);
      setActiveChannel(null);
      setShowSettings(false);
      toast.success(`Rejoint "${joinConfirmServer.name}" !`);
    } catch {
      toast.error("Erreur lors de la rejointe du serveur");
    }
    setJoinConfirmServer(null);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-y-auto sm:fixed sm:inset-0 sm:overflow-hidden" style={{ background: selectedServer ? theme.bg : "hsl(var(--background))" }}>
      {/* Top header */}
      <div className="sticky top-0 z-50 shrink-0 border-b px-4 py-3 flex items-center gap-3 backdrop-blur-xl"
      style={{ borderColor: selectedServer ? theme.border : "hsl(var(--border))", background: selectedServer ? theme.card : "hsl(var(--background)/0.9)" }}>
        {selectedServer ?
        <>
            <button onClick={() => setSelectedServer(null)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-xl overflow-hidden border shrink-0" style={{ borderColor: theme.border }}>
              {selectedServer.icon_url ?
            <img src={selectedServer.icon_url} className="w-full h-full object-cover" alt="" /> :
            <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: (selectedServer.banner_color || theme.accent) + "30" }}>{selectedServer.icon_emoji || "🏠"}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm truncate text-white">{selectedServer.name}</p>
              <p className="text-[10px] text-muted-foreground">{selectedServer.server_type === "discord" ? "🟣 Serveur Discord" : "🟢 Serveur Nexus"} · {selectedServer.is_public ? "🌍 Public" : "🔒 Privé"} · {channels.length} salons</p>
            </div>
            <ServerBoostButton
            server={selectedServer}
            user={user}
            flashBoosts={flashBoosts}
            onBoosted={(newBoosts, newFlashBoosts) => {
              setFlashBoosts(newFlashBoosts);
              qc.invalidateQueries({ queryKey: ["servers"] });
              setSelectedServer((s) => ({ ...s, boosts: newBoosts }));
            }} />
          
            



          
            {isOwner &&
          <button onClick={() => setShowSettings(!showSettings)}
          className={cn("p-2 rounded-xl transition", showSettings ? "text-white bg-white/10" : "text-muted-foreground hover:text-white")}>
                <Settings className="w-4 h-4" />
              </button>
          }
          <button onClick={() => setShowUserSettings(true)}
            className="p-2 rounded-xl transition text-muted-foreground hover:text-white"
            title="Paramètres utilisateur">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          </> :

        <>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition"><ArrowLeft className="w-5 h-5" /></Link>
            <span className="font-black text-lg"><span className="text-premium">M</span>ATRIX Community</span>
            <div className="ml-auto flex items-center gap-2 overflow-hidden">
              <HeaderActions />
              <button onClick={() => setShowInviteJoin(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border hover:bg-secondary transition">
                <UserPlus className="w-3.5 h-3.5" /> Rejoindre
              </button>
              <button onClick={() => setShowSearch(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border hover:bg-secondary transition">
                <Search className="w-3.5 h-3.5" /> Explorer
              </button>
              <Link to="/boutique-nexus"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition hover:scale-105 tap-sm"
            style={{ background: "rgba(168,85,247,0.15)", border: "2px solid #fff", color: "#a855f7" }}>
                <Zap className="w-3.5 h-3.5" fill="currentColor" /> Boutique VIP
              </Link>
            </div>
          </>
        }
      </div>

      {/* Main layout */}
      <div className="flex flex-1 flex-col overflow-visible sm:flex-row sm:overflow-hidden relative">
        {/* Server icon sidebar (always visible when server selected) */}
        {selectedServer &&
        <div className="w-14 shrink-0 border-r flex flex-col items-center py-3 gap-2 overflow-y-auto no-scrollbar"
        style={{ borderColor: theme.border, background: theme.card + "cc" }}>
            {servers.map((s) => {
            const t = getTheme(s.visual_theme || "default");
            const active = selectedServer?.id === s.id;
            return (
              <button key={s.id} onClick={() => selectServer(s)}
              className="w-10 h-10 rounded-xl overflow-hidden border-2 transition shrink-0"
              style={{ borderColor: active ? t.accent : "transparent" }}>
                  {s.icon_url ?
                <img src={s.icon_url} className="w-full h-full object-cover" alt="" /> :
                <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: (s.banner_color || t.accent) + "25" }}>{s.icon_emoji || "🏠"}</div>}
                </button>);

          })}
            <button onClick={() => setShowCreator(true)}
          className="w-10 h-10 rounded-xl border-2 border-dashed flex items-center justify-center transition"
          style={{ borderColor: theme.accent + "40", color: theme.accent }}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        }

        {/* Server list (when no server selected) */}
        {!selectedServer &&
        <div className="w-full sm:w-72 md:w-80 shrink-0 border-r flex flex-col overflow-y-auto no-scrollbar"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card)/0.6)" }}>
            <div className="p-3 pt-16 sm:pt-3">
              <button onClick={() => setShowCreator(true)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary hover:border-primary/60 transition font-bold text-sm">
                <Plus className="w-4 h-4" /> Créer un serveur
              </button>
            </div>
            {myServers.map((s) => {
            const t = getTheme(s.visual_theme || "default");
            return (
              <button key={s.id} onClick={() => selectServer(s)}
              className="flex items-center gap-3 px-3 py-2 mx-2 mb-1 rounded-2xl hover:bg-secondary/50 transition">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border shrink-0" style={{ borderColor: t.border }}>
                    {s.icon_url ?
                  <img src={s.icon_url} className="w-full h-full object-cover" alt="" /> :
                  <div className="w-full h-full flex items-center justify-center text-xl" style={{ background: (s.banner_color || t.accent) + "25" }}>{s.icon_emoji || "🏠"}</div>}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-bold text-sm truncate">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {s.server_type === "discord" ? "🟣 Discord" : "🟢 Nexus"} · {s.is_public ? "🌍" : "🔒"} {s.members_count || 1}
                      {(s.boosts || 0) > 0 &&
                    <span className="ml-1 text-purple-400 font-bold">⚡{s.boosts}</span>
                    }
                    </p>
                  </div>
                </button>);

          })}

            {/* Categories */}
            <div className="px-3 mt-2 border-t border-border pt-3">
              
              {CATEGORIES.map((c) => {
              const active = selectedCategory === c.id;
              return (
                <button key={c.id} onClick={() => setSelectedCategory(active ? null : c.id)}
                className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-sm font-medium hidden",
                active ?
                "text-white sm:text-purple-900" :
                "text-muted-foreground hover:text-white")}
                style={active ? { background: "rgba(168,85,247,0.15)" } : {}}>
                    <c.icon className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
                    {c.label}
                  </button>);

            })}
            </div>

            {/* Discord-like user bar at the bottom */}
            {user &&
          <div className="mt-auto">
                <UserBar user={user} progress={progress} rank={rank} onOpenProfile={() => setShowProfile(true)} />
              </div>
          }
          </div>
        }

        {/* Channel list sidebar */}
        {selectedServer && selectedServer.id !== "__feed__" &&
        <div className="w-44 sm:w-52 shrink-0 border-r flex flex-col overflow-hidden"
        style={{ borderColor: theme.border, background: theme.card + "88" }}>
            {selectedServer.banner_url &&
          <div className="w-full h-20 overflow-hidden shrink-0">
                <img src={selectedServer.banner_url} className="w-full h-full object-cover" alt="" />
              </div>
          }
            <div className="p-3 border-b shrink-0 flex items-center justify-between" style={{ borderColor: theme.border }}>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Salons</p>
              <div className="flex items-center gap-1">
                {(canManageChannels || selectedServer.allow_member_invites) && selectedServer.invite_code &&
                  <button
                    onClick={() => inviteToServer(selectedServer)}
                    className="w-5 h-5 rounded-md flex items-center justify-center transition hover:opacity-80 text-muted-foreground hover:text-white"
                    title="Inviter des membres">
                    <UserPlus className="w-3 h-3" />
                  </button>
                }
                {canManageChannels &&
              <button
                onClick={() => openChannelModal("text")}
                className="w-5 h-5 rounded-md flex items-center justify-center transition hover:opacity-80"
                style={{ background: theme.accent, color: "#000" }}
                title="Créer un salon">
                    <Plus className="w-3 h-3" />
                  </button>
                }
              </div>
            </div>

            <ChannelList
              channels={channels}
              activeChannel={activeChannel}
              setActiveChannel={setActiveChannel}
              canManage={canManageChannels}
              theme={theme}
              onReorder={reorderChannels}
              onRemove={removeChannel}
              onContextMenu={(e) => {
                if (!canManageChannels) return;
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY });
              }}
            />

            <UserBar user={user} progress={progress} rank={rank} onOpenProfile={() => setShowProfile(true)} />
          </div>
        }

        {/* Main content area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {/* Settings overlay */}
          {showSettings && selectedServer && isOwner &&
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
            channels={channels} />

          }

          {/* Welcome screen when no server selected */}
          {!selectedServer &&
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
          }

          {/* Server welcome screen */}
          {selectedServer && selectedServer.id !== "__feed__" && !activeChannel && !showSettings &&
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center p-6">
              <span className="text-6xl">{selectedServer.icon_emoji || "🏠"}</span>
              <p className="font-black text-2xl text-white">{selectedServer.name}</p>
              <p className="text-sm text-muted-foreground max-w-xs">{selectedServer.description || "Bienvenue ! Sélectionne un salon pour commencer."}</p>
              {channels.length > 0 &&
            <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {channels.slice(0, 3).map((ch) => {
                const Icon = CHANNEL_TYPES.find((t) => t.key === ch.type)?.icon || Hash;
                return (
                  <button key={ch.id} onClick={() => setActiveChannel(ch)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-semibold text-white transition"
                  style={{ borderColor: theme.accent + "40", background: theme.accent + "15" }}>
                        <Icon className="w-4 h-4" /> #{ch.name}
                      </button>);

              })}
                </div>
            }
            </div>
          }

          {/* Text channel */}
          {selectedServer && selectedServer.id !== "__feed__" && activeChannel?.type === "text" && !showSettings && user &&
          <ServerChat server={selectedServer} channel={activeChannel} theme={theme} user={user} />
          }

          {/* Announce channel (read-only) */}
          {selectedServer && selectedServer.id !== "__feed__" && activeChannel?.type === "announce" && !showSettings && user &&
          <ServerChat server={selectedServer} channel={activeChannel} theme={theme} user={user} />
          }

          {/* Voice channel */}
          {selectedServer && selectedServer.id !== "__feed__" && activeChannel?.type === "voice" && !showSettings &&
          <VoiceChannel channel={activeChannel} server={selectedServer} theme={theme} user={user} />
          }

          {/* Forum channel */}
          {selectedServer && selectedServer.id !== "__feed__" && activeChannel?.type === "forum" && !showSettings && user &&
          <ForumChannel channel={activeChannel} server={selectedServer} theme={theme} user={user} />
          }
        </div>

        {/* Members list — right panel (always visible when server selected) */}
        {selectedServer && selectedServer.id !== "__feed__" &&
        <MembersList
          server={selectedServer}
          theme={theme}
          currentUserEmail={user?.email}
          onOpenDm={(contact) => {
            window.dispatchEvent(new CustomEvent("matrix-open-chat", { detail: { friendEmail: contact.user_email } }));
          }}
        />
        }
      </div>

      {showCreator &&
      <ServerCreator onClose={() => setShowCreator(false)} onCreated={() => qc.invalidateQueries({ queryKey: ["servers"] })} />
      }

      {/* VIP Shop modal */}
      {showVIPShop &&
      <div className="fixed inset-0 z-[90] overflow-y-auto" style={{ background: "#0a050f" }}>
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3" style={{ background: "#0a050f", borderBottom: "1px solid rgba(168,85,247,0.15)" }}>
            <span className="font-black text-white">Boutique VIP Nexus</span>
            <button onClick={() => setShowVIPShop(false)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white/60 hover:text-white transition tap-sm"
          style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
              Fermer
            </button>
          </div>
          <div className="p-4">
            <NexusVIPShop user={user} />
          </div>
        </div>
      }

      {/* Profile overlay */}
      {showProfile &&
      <div className="fixed inset-0 z-[90] overflow-y-auto" style={{ background: "#0a050f" }}>
          <ProfileContent onClose={() => setShowProfile(false)} />
        </div>
      }

      {/* Join server confirmation */}
      {joinConfirmServer &&
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={() => setJoinConfirmServer(null)}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                {joinConfirmServer.icon_url ?
              <img src={joinConfirmServer.icon_url} className="w-full h-full object-cover" alt="" /> :
              <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: "rgba(168,85,247,0.15)" }}>{joinConfirmServer.icon_emoji || "🏠"}</div>}
              </div>
              <h3 className="text-lg font-black text-white">{joinConfirmServer.name}</h3>
              {joinConfirmServer.description && <p className="text-xs text-white/50 mt-1">{joinConfirmServer.description}</p>}
              <p className="text-sm text-white/70 mt-4">Veux-tu rejoindre ce serveur ?</p>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setJoinConfirmServer(null)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-muted-foreground hover:text-white transition">
                  Annuler
                </button>
                <button onClick={confirmJoinServer}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                  Rejoindre
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      {showSearch &&
      <div className="fixed inset-0 z-50">
          <ServerSearch
          onSelectServer={selectServer}
          onClose={() => setShowSearch(false)} />
        
        </div>
      }

      {/* Channel creation modal */}
      {showChannelModal && selectedServer &&
      <ChannelCreateModal
        show={showChannelModal}
        mode={channelModalMode}
        theme={theme}
        onClose={() => setShowChannelModal(false)}
        onCreate={createChannel} />
      }

      {/* Channel context menu */}
      {contextMenu && canManageChannels &&
      <>
        <div className="fixed inset-0 z-[95]" onClick={() => setContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }} />
        <div className="fixed z-[96] rounded-xl overflow-hidden py-1 min-w-[180px]"
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 220), left: Math.min(contextMenu.x, window.innerWidth - 200), background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          <button onClick={() => openChannelModal("category")} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/5 transition text-left">
            <Folder className="w-3.5 h-3.5" style={{ color: "#8b5cf6" }} /> Créer une catégorie
          </button>
          <div className="h-px bg-white/5 my-1" />
          <button onClick={() => openChannelModal("text")} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/5 transition text-left">
            <Hash className="w-3.5 h-3.5" style={{ color: "#3b82f6" }} /> Salon textuel
          </button>
          <button onClick={() => openChannelModal("voice")} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/5 transition text-left">
            <Volume2 className="w-3.5 h-3.5" style={{ color: "#10b981" }} /> Salon vocal
          </button>
          <button onClick={() => openChannelModal("forum")} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/5 transition text-left">
            <MessageSquare className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} /> Salon forum
          </button>
        </div>
      </>
      }

      {/* Join by invite code modal */}
      {showInviteJoin &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <div className="text-center">
              <span className="text-4xl">🔗</span>
              <h2 className="font-black text-lg text-white mt-2">Rejoindre un serveur</h2>
              <p className="text-xs text-muted-foreground">Colle le lien d'invitation Nexus reçu</p>
            </div>
            <input
            value={inviteCodeInput}
            onChange={(e) => setInviteCodeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinByInviteCode()}
            placeholder="Colle le lien d'invitation Nexus..."
            className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-white placeholder:text-muted-foreground outline-none text-sm" />
          
            <div className="flex gap-3">
              <button onClick={() => {setShowInviteJoin(false);setInviteCodeInput("");}}
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
      }

      {/* User Settings Modal */}
      <UserSettingsModal
        open={showUserSettings}
        onClose={() => setShowUserSettings(false)}
        user={user}
      />
    </div>);

}