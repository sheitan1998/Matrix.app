import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import VideoPlayer from "@/components/video/VideoPlayer";
import LiveChat from "@/components/live/LiveChat";
import SubscribeButton from "@/components/channel/SubscribeButton";
import { Radio, Eye, CheckCircle2 } from "lucide-react";
import { formatViews } from "@/lib/format";

export default function Live() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  const loadUser = () => base44.auth.me().then(setUser).catch(() => setUser(null));
  useEffect(() => { loadUser(); }, []);

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

  if (!video) return <div className="p-8 text-muted-foreground">Chargement...</div>;

  return (
    <div className="px-4 lg:px-6 py-4 max-w-[1800px] mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
        <div className="space-y-4 min-w-0">
          <VideoPlayer video={video} />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-live text-white rounded-md text-xs font-bold">
              <Radio className="w-3 h-3 animate-live-pulse" /> LIVE
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              {formatViews(video.viewers_count || 0)} spectateurs
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold">{video.title}</h1>

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
                <p className="text-xs text-muted-foreground">
                  {formatViews(channel?.subscribers_count || 0)} abonnés
                </p>
              </div>
            </Link>
            {channel && <SubscribeButton channel={channel} user={user} />}
          </div>

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
    </div>
  );
}