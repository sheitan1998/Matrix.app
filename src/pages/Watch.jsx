import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoCard from "@/components/video/VideoCard";
import CommentSection from "@/components/video/CommentSection";
import SubscribeButton from "@/components/channel/SubscribeButton";
import TrixDonationDialog from "@/components/live/TrixDonationDialog";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share2, Coins, CheckCircle2 } from "lucide-react";
import { formatViews, formatTimeAgo } from "@/lib/format";

export default function Watch() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [donateOpen, setDonateOpen] = useState(false);
  const [adDone, setAdDone] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: video } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const v = await base44.entities.Video.filter({ id });
      return v[0];
    },
    enabled: !!id,
  });

  const { data: channel } = useQuery({
    queryKey: ["channel", video?.channel_id],
    queryFn: async () => {
      if (!video?.channel_id) return null;
      const c = await base44.entities.Channel.filter({ id: video.channel_id });
      return c[0];
    },
    enabled: !!video?.channel_id,
  });

  const { data: related } = useQuery({
    queryKey: ["related", video?.category],
    queryFn: () => base44.entities.Video.filter({ category: video?.category || "other" }, "-views", 15),
    initialData: [],
    enabled: !!video,
  });

  useEffect(() => {
    if (video?.id) {
      base44.entities.Video.update(video.id, { views: (video.views || 0) + 1 });
    }
  }, [video?.id]);

  if (!video) {
    return <div className="p-8 text-muted-foreground">Chargement...</div>;
  }

  const showAd = !user?.is_premium && !adDone;
  const relatedFiltered = (related || []).filter((v) => v.id !== id).slice(0, 10);

  return (
    <div className="px-4 lg:px-6 py-4 max-w-[1800px] mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
        <div className="min-w-0 space-y-4">
          <VideoPlayer video={video} showPreAd={showAd} onAdEnd={() => setAdDone(true)} />

          <h1 className="text-xl md:text-2xl font-bold leading-tight">{video.title}</h1>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to={channel ? `/channel/${channel.id}` : "#"} className="flex items-center gap-3 min-w-0 group">
              {video.channel_avatar && (
                <img src={video.channel_avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold group-hover:text-primary transition">{video.channel_name}</span>
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatViews(channel?.subscribers_count || 0)} abonnés
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 flex-wrap">
              {channel && <SubscribeButton channel={channel} user={user} />}

              <div className="flex rounded-full bg-secondary overflow-hidden">
                <button className="flex items-center gap-1.5 px-4 h-10 hover:bg-secondary/70 transition border-r border-border">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">{formatViews(video.likes || 0)}</span>
                </button>
                <button className="px-4 h-10 hover:bg-secondary/70 transition">
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>

              <Button
                variant="outline"
                onClick={() => setDonateOpen(true)}
                className="rounded-full h-10 border-trix/40 text-trix hover:bg-trix/10 hover:text-trix"
              >
                <Coins className="w-4 h-4 mr-1.5" />
                TRIX
              </Button>

              <Button variant="secondary" className="rounded-full h-10">
                <Share2 className="w-4 h-4 mr-1.5" /> Partager
              </Button>
            </div>
          </div>

          <div className="rounded-xl bg-secondary/40 border border-border p-4 text-sm">
            <p className="font-semibold mb-1">
              {formatViews(video.views)} vues • {formatTimeAgo(video.created_date)}
            </p>
            <p className="text-muted-foreground whitespace-pre-wrap">{video.description || "Aucune description."}</p>
          </div>

          <CommentSection videoId={id} user={user} />
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-sm">Vidéos suggérées</h3>
          <div className="space-y-3">
            {relatedFiltered.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </div>
      </div>

      <TrixDonationDialog
        open={donateOpen}
        onOpenChange={setDonateOpen}
        video={video}
        channel={channel}
        user={user}
        onSent={() => base44.auth.me().then(setUser)}
      />
    </div>
  );
}