import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import { fetchYouTube, mergeYouTubeLocal } from "@/hooks/useYouTube";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoCard from "@/components/video/VideoCard";
import CommentSection from "@/components/video/CommentSection";
import SubscribeButton from "@/components/channel/SubscribeButton";
import TrixDonationDialog from "@/components/live/TrixDonationDialog";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share2, Coins, CheckCircle2 } from "lucide-react";
import { formatViews, formatTimeAgo } from "@/lib/format";
import ShareDialog from "@/components/ShareDialog";
import TrixIcon from "@/components/TrixIcon";

export default function Watch() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [donateOpen, setDonateOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [adDone, setAdDone] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(null);
  const [optimisticDislikes, setOptimisticDislikes] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: video } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const yt = await fetchYouTube("videoDetails", { id });
      if (yt && yt.length > 0) return yt[0];
      const v = await base44.entities.Video.filter({ id });
      return v[0];
    },
    enabled: !!id,
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

  const { data: related } = useQuery({
    queryKey: ["related", video?.id, video?.category],
    queryFn: async () => {
      if (video._source === "youtube" && video.id) {
        return fetchYouTube("relatedVideos", { videoId: video.id, maxResults: 15 });
      }
      return base44.entities.Video.filter({ category: video?.category || "other" }, "-views", 15);
    },
    initialData: [],
    enabled: !!video,
  });

  useEffect(() => {
    if (video?.id && video._source !== "youtube") {
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
                <button
                  onClick={() => {
                    if (liked) return;
                    const newLikes = (video.likes || 0) + 1;
                    setOptimisticLikes(newLikes);
                    setLiked(true);
                    if (disliked) { setDisliked(false); setOptimisticDislikes((video.dislikes || 0)); }
                    if (video._source !== "youtube") {
                      base44.entities.Video.update(video.id, { likes: newLikes }).catch(() => {
                        setOptimisticLikes(null); setLiked(false);
                      });
                    }
                  }}
                  className={cn("flex items-center gap-1.5 px-4 h-11 hover:bg-secondary/70 transition border-r border-border select-none", liked && "text-primary")}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">{formatViews(optimisticLikes ?? (video.likes || 0))}</span>
                </button>
                <button
                  onClick={() => {
                    if (disliked) return;
                    const newDislikes = (video.dislikes || 0) + 1;
                    setOptimisticDislikes(newDislikes);
                    setDisliked(true);
                    if (liked) { setLiked(false); setOptimisticLikes((video.likes || 0)); }
                    if (video._source !== "youtube") {
                      base44.entities.Video.update(video.id, { dislikes: newDislikes }).catch(() => {
                        setOptimisticDislikes(null); setDisliked(false);
                      });
                    }
                  }}
                  className={cn("px-4 h-11 hover:bg-secondary/70 transition select-none", disliked && "text-destructive")}
                >
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

              <Button variant="secondary" onClick={() => setShareOpen(true)} className="rounded-full h-10">
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

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} url={window.location.href} title={video.title} />

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