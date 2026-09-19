import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { fetchYouTube, mergeYouTubeLocal } from "@/hooks/useYouTube";
import VideoGrid from "@/components/video/VideoGrid";
import SubscribeButton from "@/components/channel/SubscribeButton";
import { CheckCircle2, Users, Eye, Coins, Pencil, Save, X, Radio } from "lucide-react";
import { formatViews, formatTrix } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TABS = ["Vidéos", "Lives", "Description"];

export default function Channel() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Vidéos");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: channel } = useQuery({
    queryKey: ["channel", id],
    queryFn: async () => {
      const yt = await fetchYouTube("channelDetails", { id });
      if (yt && yt.length > 0) return yt[0];
      const c = await base44.entities.Channel.filter({ id });
      return c[0];
    },
    enabled: !!id,
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ["channel-videos", id],
    queryFn: async () => {
      const [local, yt] = await Promise.all([
        base44.entities.Video.filter({ channel_id: id }, "-created_date", 60),
        fetchYouTube("channelVideos", { channelId: id, maxResults: 50 }),
      ]);
      return mergeYouTubeLocal(yt, local);
    },
    initialData: [],
    enabled: !!id,
  });

  const regularVideos = (videos || []).filter((v) => !v.is_live);
  const liveVideos = (videos || []).filter((v) => v.is_live);

  const isOwner = user && channel && user.email === channel.owner_email;

  const openEdit = () => {
    setEditForm({
      name: channel.name,
      description: channel.description || "",
      avatar_url: channel.avatar_url || "",
      banner_url: channel.banner_url || "",
    });
    setEditing(true);
  };

  const uploadImg = async (file, key) => {
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    setEditForm((f) => ({ ...f, [key]: file_url }));
    toast.success("Image téléversée");
  };

  const saveEdit = async () => {
    setSaving(true);
    await base44.entities.Channel.update(channel.id, editForm);
    qc.invalidateQueries(["channel", id]);
    setSaving(false);
    setEditing(false);
    toast.success("Chaîne mise à jour");
  };

  if (!channel) return <div className="p-8 text-muted-foreground">Chargement...</div>;

  return (
    <div>
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-secondary overflow-hidden">
        {channel.banner_url ? (
          <img src={channel.banner_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid-bg opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        {isOwner && !editing && (
          <button
            onClick={openEdit}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/70 backdrop-blur text-xs font-semibold hover:bg-background/90 transition"
          >
            <Pencil className="w-3.5 h-3.5" /> Modifier la chaîne
          </button>
        )}
      </div>

      {/* Header */}
      <div className="px-4 lg:px-6 -mt-14 relative">
        <div className="flex flex-col md:flex-row md:items-end gap-5">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-background overflow-hidden bg-secondary shrink-0">
            {channel.avatar_url ? (
              <img src={channel.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-matrix flex items-center justify-center text-4xl font-black text-background">
                {channel.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black">{channel.name}</h1>
              {channel.verified && <CheckCircle2 className="w-5 h-5 text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground font-mono mt-1">@{channel.handle}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {formatViews(channel.subscribers_count)} abonnés</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {formatViews(channel.total_views)} vues</span>
              <span className="flex items-center gap-1.5"><Coins className="w-4 h-4 text-trix" /> {formatTrix(channel.trix_received)} TRIX</span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {isOwner && !editing && (
              <Button onClick={openEdit} variant="outline" size="sm" className="rounded-full gap-1.5">
                <Pencil className="w-3.5 h-3.5" /> Modifier
              </Button>
            )}
            <SubscribeButton channel={channel} user={user} />
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="mt-6 p-5 rounded-2xl bg-card border border-border space-y-4">
            <h3 className="font-bold">Modifier la chaîne</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-secondary/60 border-border mt-1" />
              </div>
              <div>
                <Label>Photo de profil (fichier)</Label>
                <Input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadImg(e.target.files[0], "avatar_url")} className="bg-secondary/60 border-border mt-1" />
                {editForm.avatar_url && <img src={editForm.avatar_url} alt="" className="mt-2 w-14 h-14 rounded-full object-cover" />}
              </div>
              <div className="sm:col-span-2">
                <Label>Bannière (fichier)</Label>
                <Input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadImg(e.target.files[0], "banner_url")} className="bg-secondary/60 border-border mt-1" />
                {editForm.banner_url && <img src={editForm.banner_url} alt="" className="mt-2 w-full h-24 object-cover rounded-lg" />}
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="bg-secondary/60 border-border mt-1 resize-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveEdit} disabled={saving} className="bg-foreground text-background hover:bg-foreground/90 gap-1.5">
                <Save className="w-4 h-4" /> {saving ? "Sauvegarde..." : "Enregistrer"}
              </Button>
              <Button onClick={() => setEditing(false)} variant="outline" className="gap-1.5">
                <X className="w-4 h-4" /> Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-6 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2.5 text-sm font-semibold border-b-2 transition",
                activeTab === tab
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 lg:px-6 py-8">
        {activeTab === "Vidéos" && (
          <VideoGrid videos={regularVideos} isLoading={isLoading} emptyMessage="Pas encore de vidéo sur cette chaîne" />
        )}
        {activeTab === "Lives" && (
          <div>
            {liveVideos.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground">Aucun live sur cette chaîne</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {liveVideos.map((v) => (
                  <div key={v.id} className="relative">
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-live text-white rounded-md text-xs font-bold">
                      <Radio className="w-3 h-3 animate-live-pulse" /> LIVE
                    </div>
                    <a href={`/live/${v.id}`}>
                      <img src={v.thumbnail_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop"} alt={v.title} className="w-full aspect-video object-cover rounded-xl" />
                      <p className="mt-2 font-semibold text-sm line-clamp-2">{v.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatViews(v.viewers_count || 0)} spectateurs</p>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "Description" && (
          <div className="max-w-2xl">
            <p className="text-muted-foreground whitespace-pre-wrap">{channel.description || "Aucune description."}</p>
          </div>
        )}
      </div>
    </div>
  );
}