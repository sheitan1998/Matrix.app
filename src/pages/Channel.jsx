import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import VideoGrid from "@/components/video/VideoGrid";
import SubscribeButton from "@/components/channel/SubscribeButton";
import { CheckCircle2, Users, Eye, Coins } from "lucide-react";
import { formatViews, formatTrix } from "@/lib/format";

export default function Channel() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: channel } = useQuery({
    queryKey: ["channel", id],
    queryFn: async () => {
      const c = await base44.entities.Channel.filter({ id });
      return c[0];
    },
    enabled: !!id,
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ["channel-videos", id],
    queryFn: () => base44.entities.Video.filter({ channel_id: id }, "-created_date", 60),
    initialData: [],
    enabled: !!id,
  });

  if (!channel) return <div className="p-8 text-muted-foreground">Chargement...</div>;

  return (
    <div>
      <div className="relative h-48 md:h-64 bg-secondary overflow-hidden">
        {channel.banner_url ? (
          <img src={channel.banner_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid-bg gradient-matrix opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

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
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {formatViews(channel.subscribers_count)} abonnés
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> {formatViews(channel.total_views)} vues
              </span>
              <span className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-trix" /> {formatTrix(channel.trix_received)} TRIX reçus
              </span>
            </div>
            {channel.description && (
              <p className="text-sm mt-3 text-muted-foreground max-w-2xl">{channel.description}</p>
            )}
          </div>

          <div className="shrink-0">
            <SubscribeButton channel={channel} user={user} />
          </div>
        </div>

        <div className="h-px bg-border mt-8" />
      </div>

      <div className="px-4 lg:px-6 py-8">
        <h2 className="text-lg font-bold mb-5">Vidéos</h2>
        <VideoGrid videos={videos} isLoading={isLoading} emptyMessage="Pas encore de vidéo sur cette chaîne" />
      </div>
    </div>
  );
}