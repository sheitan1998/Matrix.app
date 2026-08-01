import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { fetchYouTube } from "@/hooks/useYouTube";
import VideoPlayer from "@/components/video/VideoPlayer";
import LiveChat from "@/components/live/LiveChat";
import SubscribeButton from "@/components/channel/SubscribeButton";
import ShareDialog from "@/components/ShareDialog";
import { Radio, Eye, CheckCircle2, Share2, Square, Pencil, Save } from "lucide-react";
import { formatViews } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Live() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const loadUser = () => base44.auth.me().then(setUser).catch(() => setUser(null));
  useEffect(() => { loadUser(); }, []);

  const { data: video } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const yt = await fetchYouTube("videoDetails", { id });
      if (yt && yt.length > 0) return yt[0];
      const v = await base44.entities.Video.filter({ id });
      return v[0];
    },
    enabled: !!id,
    refetchInterval: 10000,
  });

  const { data: channel } = useQuery({
    queryKey: ["channel", video?.channel_id, video?._source],
    queryFn: async () => {
      if (!video?.channel_id) return null;
      if (video._source === "youtube") {
        const yt = await fetchYouTube("channelDetails", { id: video.channel_id });
        if (yt && yt.length > 0) return yt[0];
      }
      const c = await base44.entities.Channel.filter({ id: video.channel_id });
      return c[0];
    },
    enabled: !!video?.channel_id,
  });

  if (!video) return <div className="p-8 text-muted-foreground">Chargement...</div>;

  const isOwner = video?._source !== "youtube" && user && channel && user.email === channel.owner_email;

  const endLive = async () => {
    await base44.entities.Video.update(id, { is_live: false, viewers_count: 0 });
    toast.success("Direct terminé");
    nav(`/watch/${id}`);
  };

  const saveTitle = async () => {
    if (!newTitle.trim()) return;
    await base44.entities.Video.update(id, { title: newTitle.trim() });
    qc.invalidateQueries(["video", id]);
    setEditingTitle(false);
    toast.success("Titre mis à jour");
  };

  return (
    <div className="px-4 lg:px-6 py-4 max-w-[1800px] mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
        <div className="space-y-4 min-w-0">
          <VideoPlayer video={video} />

          {/* Live badge + viewers */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-live text-white rounded-md text-xs font-bold">
              <Radio className="w-3 h-3 animate-live-pulse" /> EN DIRECT
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              {formatViews(video.viewers_count || 0)} spectateurs
            </div>
          </div>

          {/* Title (editable by owner) */}
          {editingTitle ? (
            <div className="flex gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-secondary/60 border-border text-xl font-bold"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
              />
              <Button onClick={saveTitle} size="icon" className="bg-foreground text-background"><Save className="w-4 h-4" /></Button>
              <Button onClick={() => setEditingTitle(false)} size="icon" variant="outline">✕</Button>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <h1 className="text-xl md:text-2xl font-bold flex-1">{video.title}</h1>
              {isOwner && (
                <button onClick={() => { setNewTitle(video.title); setEditingTitle(true); }} className="mt-1 p-1.5 rounded-lg hover:bg-secondary transition">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          )}

          {/* Channel info + actions */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Link to={channel ? `/channel/${channel.id}` : "#"} className="flex items-center gap-3 group">
              {video.channel_avatar && (
                <img src={video.channel_avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold group-hover:text-primary transition">{video.channel_name}</span>
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">{formatViews(channel?.subscribers_count || 0)} abonnés</p>
              </div>
            </Link>

            <div className="flex items-center gap-2 flex-wrap">
              {channel && <SubscribeButton channel={channel} user={user} />}
              <Button variant="secondary" onClick={() => setShareOpen(true)} className="rounded-full h-10">
                <Share2 className="w-4 h-4 mr-1.5" /> Partager
              </Button>
              {isOwner && (
                <Button onClick={endLive} variant="destructive" className="rounded-full h-10 gap-1.5">
                  <Square className="w-4 h-4" /> Terminer le live
                </Button>
              )}
            </div>
          </div>

          {/* Owner broadcast info */}
          {isOwner && (
            <div className="p-4 rounded-xl bg-live/10 border border-live/30 text-sm space-y-1">
              <p className="font-semibold text-live">🔴 Vous êtes en direct</p>
              <p className="text-muted-foreground">Partagez le lien pour inviter des spectateurs. Le chat et les dons TRIX sont actifs.</p>
            </div>
          )}

          {video.description && (
            <div className="rounded-xl bg-secondary/40 border border-border p-4 text-sm text-muted-foreground">
              {video.description}
            </div>
          )}
        </div>

        <div className="xl:h-[calc(100vh-96px)] h-[600px] xl:sticky xl:top-20">
          <LiveChat video={video} channel={channel} user={user} onUserUpdate={loadUser} />
        </div>
      </div>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} url={window.location.href} title={video.title} />
    </div>
  );
}