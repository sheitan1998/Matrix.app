import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Plus, Hash, Volume2, Megaphone, Settings, Trash2, Copy, Globe, Lock, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PostFeed from "@/components/community/PostFeed";
import ServerCreator from "@/components/community/ServerCreator";
import ServerChat from "@/components/community/ServerChat";
import VoiceChannel from "@/components/community/VoiceChannel";
import ServerSettings from "@/components/community/ServerSettings";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { VISUAL_THEMES, getTheme } from "@/lib/visualThemes";
import { Input } from "@/components/ui/input";

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
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState("text");
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const qc = useQueryClient();

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

  const addChannel = async () => {
    if (!newChannelName.trim()) return;
    const ch = {
      id: Date.now().toString(),
      name: newChannelName.trim().toLowerCase().replace(/\s+/g, "-"),
      type: newChannelType,
    };
    const updated = [...(selectedServer.channels?.length ? selectedServer.channels : defaultChannels), ch];
    await updateServer({ channels: updated });
    setNewChannelName("");
    toast.success("Salon créé !");
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
              <p className="text-[10px] text-muted-foreground">{selectedServer.is_public ? "🌍 Public" : "🔒 Privé"} · {channels.length} salons</p>
            </div>
            {isOwner && (
              <button onClick={() => setShowSettings(!showSettings)}
                className={cn("p-2 rounded-xl transition", showSettings ? "text-white bg-white/10" : "text-muted-foreground hover:text-white")}>
                <Settings className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition"><ArrowLeft className="w-5 h-5" /></Link>
            <span className="font-black text-lg"><span className="text-premium">M</span>ATRIX Community</span>
            <Link to="/community/subscription"
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-premium/40 bg-premium/10 text-premium">
              <Sparkles className="w-3.5 h-3.5" /> Nitro
            </Link>
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
                    <p className="text-[10px] text-muted-foreground">{s.is_public ? "🌍" : "🔒"} {s.members_count || 1} membres</p>
                  </div>
                </button>
              );
            })}

            <div className="px-3 mt-2 border-t border-border pt-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Général</p>
              <button onClick={() => selectServer({ id: "__feed__", name: "Fil communautaire", icon_emoji: "📰", is_public: true })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-secondary transition text-sm font-semibold">
                📰 Fil d'actualité
              </button>
            </div>
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
            <div className="p-3 border-b shrink-0" style={{ borderColor: theme.border }}>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Salons</p>
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

            {isOwner && (
              <div className="p-2 border-t space-y-2 shrink-0" style={{ borderColor: theme.border }}>
                <div className="flex gap-1">
                  {CHANNEL_TYPES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button key={t.key} onClick={() => setNewChannelType(t.key)}
                        className={cn("flex-1 flex items-center justify-center p-1.5 rounded-lg transition",
                          newChannelType === t.key ? "text-white" : "text-muted-foreground hover:text-white")}
                        style={newChannelType === t.key ? { background: theme.accent + "40" } : {}}>
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-1">
                  <input value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="nouveau-salon" onKeyDown={(e) => e.key === "Enter" && addChannel()}
                    className="flex-1 h-7 px-2 text-xs rounded-lg outline-none text-white placeholder:text-white/30"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button onClick={addChannel} className="px-2 rounded-lg text-white font-bold text-sm hover:opacity-80"
                    style={{ background: theme.accent }}>+</button>
                </div>
              </div>
            )}
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
            />
          )}

          {/* Community feed */}
          {(!selectedServer || selectedServer.id === "__feed__") && (
            <div className="flex-1 overflow-y-auto p-4">
              <PostFeed theme="all" />
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
      </div>

      {showCreator && (
        <ServerCreator onClose={() => setShowCreator(false)} onCreated={() => qc.invalidateQueries({ queryKey: ["servers"] })} />
      )}
    </div>
  );
}