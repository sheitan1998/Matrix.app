import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import VideoGrid from "@/components/video/VideoGrid";
import { Heart } from "lucide-react";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";

export default function Subscriptions() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const me = await base44.auth.me().catch(() => null);
    if (!me) { setLoading(false); return; }
    const subs = await base44.entities.Subscription.filter({ user_email: me.email });
    if (subs.length === 0) { setLoading(false); return; }
    const ids = subs.map((s) => s.channel_id);
    const all = await base44.entities.Video.list("-created_date", 200);
    setVideos(all.filter((v) => ids.includes(v.channel_id)));
    setLoading(false);
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const { pulling, pullY } = usePullToRefresh({ onRefresh: fetchVideos });

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PullToRefreshIndicator pulling={pulling} pullY={pullY} />
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Abonnements</h1>
          <p className="text-sm text-muted-foreground">Les dernières vidéos de tes chaînes</p>
        </div>
      </div>
      <VideoGrid videos={videos} isLoading={loading} emptyMessage="Abonne-toi à des chaînes pour voir leurs vidéos ici" />
    </div>
  );
}