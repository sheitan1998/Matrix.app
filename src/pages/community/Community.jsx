import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Plus, Hash, Volume2, Megaphone, Settings, Trash2, Copy, Globe, Lock, Users, Upload, Palette } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PostFeed from "@/components/community/PostFeed";
import VoiceRooms from "@/components/community/VoiceRooms";
import ServerCreator from "@/components/community/ServerCreator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { VISUAL_THEMES, getTheme } from "@/lib/visualThemes";

const CHANNEL_TYPES = [
  { key: "text", label: "Textuel", icon: Hash },
  { key: "voice", label: "Vocal", icon: Volume2 },
  { key: "announce", label: "Annonces", icon: Megaphone },
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

  const updateServer = async (data) => {
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
    const channels = [...(selectedServer.channels || []), {
      id: Date.now().toString(),
      name: newChannelName.trim().toLowerCase().replace(/\s+/g, "-"),
      type: newChannelType,
    }];
    await updateServer({ channels });
    setNewChannelName("");
    toast.success("Salon créé !");
  };

  const removeChannel = async (id) => {
    const channels = (selectedServer.channels || []).filter((c) => c.id !== id);
    await updateServer({ channels });
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

  const copyInvite = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copié !");
  };

  const defaultChannels = [
    { id: "general", name: "général", type: "text" },
    { id: "vocal", name: "vocal", type: "voice" },
  ];

  const channels = selectedServer ? (selectedServer.channels?.length ? selectedServer.channels : defaultChannels) : [];

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
            <div className="w-8 h-8 rounded-xl overflow-hidden border shrink-0"
              style={{ borderColor: theme.border }}>
              {selectedServer.icon_url
                ? <img src={selectedServer.icon_url} className="w-full h-full object-cover" alt="" />
                : <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: (selectedServer.banner_color || theme.accent) + "30" }}>{selectedServer.icon_emoji || "🏠"}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm truncate">{selectedServer.name}</p>
              <p className="text-[10px] text-muted-foreground">{selectedServer.is_public ? "🌍 Public" : "🔒 Privé"} · {(channels.length)} salons</p>
            </div>
            {isOwner && (
              <button onClick={() => setShowSettings(!showSettings)}
                className={cn("p-2 rounded-xl transition", showSettings ? "text-foreground bg-white/10" : "text-muted-foreground hover:text-foreground")}>
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
      <div className="flex flex-1 overflow-hidden">
        {/* Server list sidebar */}
        <div className={cn(
          "shrink-0 border-r flex flex-col overflow-y-auto no-scrollbar",
          selectedServer ? "w-14 sm:w-56" : "w-full sm:w-72 md:w-80"
        )}
          style={{ borderColor: selectedServer ? theme.border : "hsl(var(--border))", background: selectedServer ? theme.card : "hsl(var(--card)/0.6)" }}>
          {/* Create button */}
          <div className="p-3">
            <button onClick={() => setShowCreator(true)}
              className={cn("w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed transition font-bold text-sm",
                selectedServer ? "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60" : "border-primary/30 text-primary hover:border-primary/60")}>
              <Plus className="w-4 h-4" />
              {!selectedServer && "Créer un serveur"}
            </button>
          </div>

          {/* Server list */}
          {servers.map((s) => {
            const t = getTheme(s.visual_theme || "default");
            const active = selectedServer?.id === s.id;
            return (
              <button key={s.id} onClick={() => { setSelectedServer(s); setActiveChannel(null); setShowSettings(false); }}
                className={cn("flex items-center gap-3 px-3 py-2 mx-2 mb-1 rounded-2xl transition",
                  active ? "bg-white/10" : "hover:bg-white/5")}
                style={active ? { background: t.accent + "20", border: `1px solid ${t.accent}40` } : {}}>
                <div className="w-9 h-9 rounded-xl overflow-hidden border shrink-0"
                  style={{ borderColor: t.border }}>
                  {s.icon_url
                    ? <img src={s.icon_url} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: (s.banner_color || t.accent) + "25" }}>{s.icon_emoji || "🏠"}</div>}
                </div>
                {!selectedServer && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-bold text-sm truncate">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.is_public ? "🌍" : "🔒"} {s.members_count || 1} membres</p>
                  </div>
                )}
              </button>
            );
          })}

          {/* Community feed link when no server selected */}
          {!selectedServer && (
            <div className="px-3 mt-2 border-t border-border pt-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Général</p>
              <div className="space-y-1">
                <button onClick={() => setSelectedServer({ id: "__feed__", name: "Fil communautaire", icon_emoji: "📰", is_public: true, channels: [] })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-secondary transition text-sm font-semibold">
                  📰 Fil d'actualité
                </button>
                <button onClick={() => setSelectedServer({ id: "__voice__", name: "Salons Vocaux", icon_emoji: "🎙️", is_public: true, channels: [] })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-secondary transition text-sm font-semibold">
                  🎙️ Salons Vocaux
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Channel sidebar (when server selected and not special) */}
        {selectedServer && selectedServer.id !== "__feed__" && selectedServer.id !== "__voice__" && (
          <div className="w-44 sm:w-52 shrink-0 border-r flex flex-col overflow-y-auto no-scrollbar"
            style={{ borderColor: theme.border, background: theme.card + "99" }}>

            {/* Server banner */}
            {selectedServer.banner_url && (
              <div className="w-full h-20 overflow-hidden shrink-0">
                <img src={selectedServer.banner_url} className="w-full h-full object-cover" alt="" />
              </div>
            )}

            <div className="p-3 border-b" style={{ borderColor: theme.border }}>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Salons</p>
            </div>

            {/* Channels */}
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

            {/* Add channel (owner only) */}
            {isOwner && !showSettings && (
              <div className="p-2 border-t space-y-2" style={{ borderColor: theme.border }}>
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
                  <Input value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="nouveau-salon" onKeyDown={(e) => e.key === "Enter" && addChannel()}
                    className="h-7 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                  <button onClick={addChannel} className="px-2 rounded-lg text-white font-bold text-sm hover:opacity-80"
                    style={{ background: theme.accent }}>+</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Settings panel */}
          {showSettings && selectedServer && isOwner && (
            <div className="absolute inset-0 z-30 overflow-y-auto overscroll-contain p-4 space-y-5"
              style={{ background: theme.bg }}>
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
                <h2 className="font-black text-lg">Paramètres du serveur</h2>
              </div>

              {/* Icon upload */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Icône</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor: theme.accent + "60" }}>
                    {selectedServer.icon_url
                      ? <img src={selectedServer.icon_url} className="w-full h-full object-cover" alt="" />
                      : <span className="text-2xl">{selectedServer.icon_emoji || "🏠"}</span>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{uploadingIcon ? "Envoi..." : "Changer l'icône"}</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG recommandé</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadIcon(e.target.files[0])} disabled={uploadingIcon} />
                </label>
              </div>

              {/* Banner upload */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Bannière</p>
                <label className="cursor-pointer block">
                  <div className="w-full h-24 rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor: theme.accent + "60" }}>
                    {selectedServer.banner_url
                      ? <img src={selectedServer.banner_url} className="w-full h-full object-cover" alt="" />
                      : <div className="flex flex-col items-center gap-1 text-muted-foreground">
                          <Upload className="w-5 h-5" />
                          <span className="text-xs">{uploadingBanner ? "Envoi..." : "Ajouter une bannière"}</span>
                        </div>}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadBanner(e.target.files[0])} disabled={uploadingBanner} />
                </label>
              </div>

              {/* Visual theme */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Thème visuel</p>
                <div className="grid grid-cols-4 gap-2">
                  {VISUAL_THEMES.map((t) => (
                    <button key={t.key} onClick={() => updateServer({ visual_theme: t.key })}
                      className={cn("flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition text-xs font-semibold",
                        (selectedServer.visual_theme || "default") === t.key ? "border-white scale-105" : "border-transparent hover:border-white/20")}
                      style={{ background: t.bg, borderColor: (selectedServer.visual_theme || "default") === t.key ? t.accent : undefined }}>
                      <span className="text-xl">{t.emoji}</span>
                      <span className="text-white/80 text-[10px]">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Invite code */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Code d'invitation</p>
                <div className="flex items-center gap-2 p-3 rounded-xl border font-mono text-sm" style={{ borderColor: theme.border }}>
                  <span className="flex-1">{selectedServer.invite_code || "—"}</span>
                  {selectedServer.invite_code && (
                    <button onClick={() => copyInvite(selectedServer.invite_code)} className="text-muted-foreground hover:text-white">
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Delete */}
              <Button onClick={deleteServer} variant="destructive" className="w-full font-bold">
                <Trash2 className="w-4 h-4 mr-2" /> Supprimer ce serveur
              </Button>
            </div>
          )}

          {/* Community feed */}
          {(!selectedServer || selectedServer.id === "__feed__") && (
            <div className="flex-1 overflow-y-auto p-4">
              <PostFeed theme="all" />
            </div>
          )}

          {/* Voice rooms */}
          {selectedServer?.id === "__voice__" && (
            <div className="flex-1 overflow-y-auto p-4">
              <VoiceRooms />
            </div>
          )}

          {/* Channel content */}
          {selectedServer && selectedServer.id !== "__feed__" && selectedServer.id !== "__voice__" && !showSettings && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeChannel ? (
                <>
                  <div className="shrink-0 px-4 py-3 border-b flex items-center gap-2"
                    style={{ borderColor: theme.border }}>
                    {(() => { const Icon = CHANNEL_TYPES.find((t) => t.key === activeChannel.type)?.icon || Hash; return <Icon className="w-4 h-4 text-muted-foreground" />; })()}
                    <span className="font-bold text-sm">{activeChannel.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 capitalize">
                      {activeChannel.type === "text" ? "Salon textuel" : activeChannel.type === "voice" ? "Salon vocal" : "Annonces"}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {activeChannel.type === "voice" ? (
                      <VoiceRooms />
                    ) : (
                      <PostFeed theme="all" />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center p-6">
                  <span className="text-5xl">{selectedServer.icon_emoji || "🏠"}</span>
                  <p className="font-black text-xl">{selectedServer.name}</p>
                  <p className="text-sm text-muted-foreground max-w-xs">{selectedServer.description || "Bienvenue ! Sélectionne un salon pour commencer."}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreator && (
        <ServerCreator onClose={() => setShowCreator(false)} onCreated={() => qc.invalidateQueries({ queryKey: ["servers"] })} />
      )}
    </div>
  );
}