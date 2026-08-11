import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { formatViews, formatTrix, formatTimeAgo } from "@/lib/format";
import { Radio, Eye, ThumbsUp, Users, Coins, Pencil, Trash2, Plus, Tv2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import FriendsDashboardPanel from "@/components/dashboard/FriendsDashboardPanel";
import PWAInstallStats from "@/components/dashboard/PWAInstallStats";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const me = await base44.auth.me().catch(() => null);
    setUser(me);
    if (!me?.channel_id) { setLoading(false); return; }
    const [ch] = await base44.entities.Channel.filter({ id: me.channel_id });
    setChannel(ch);
    const vids = await base44.entities.Video.filter({ channel_id: me.channel_id }, "-created_date", 50);
    setVideos(vids);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Real-time sub
  useEffect(() => {
    const unsub = base44.entities.Video.subscribe((event) => {
      if (event.type === "update") setVideos((prev) => prev.map((v) => v.id === event.id ? event.data : v));
      if (event.type === "delete") setVideos((prev) => prev.filter((v) => v.id !== event.id));
      if (event.type === "create") load();
    });
    return unsub;
  }, []);

  const deleteVideo = async (vid) => {
    if (!confirm("Supprimer cette vidéo ?")) return;
    await base44.entities.Video.delete(vid.id);
    setVideos((prev) => prev.filter((v) => v.id !== vid.id));
    toast.success("Vidéo supprimée");
  };

  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0);
  const liveCount = videos.filter((v) => v.is_live).length;

  if (loading) return <div className="p-8 text-muted-foreground">Chargement...</div>;

  if (!channel) {
    return (
      <div className="px-4 lg:px-6 py-10 max-w-xl mx-auto text-center space-y-4">
        <BarChart2 className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-black">Pas encore de chaîne</h1>
        <p className="text-muted-foreground">Lance une vidéo ou un live pour créer ta chaîne automatiquement.</p>
        <Link to="/studio"><Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full">Créer un live</Button></Link>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 py-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
            {channel.avatar_url ? <img src={channel.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="font-black text-xl">{channel.name?.[0]}</span>}
          </div>
          <div>
            <h1 className="text-2xl font-black">{channel.name}</h1>
            <p className="text-sm text-muted-foreground">Tableau de bord créateur</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/studio"><Button className="rounded-full bg-live text-white hover:bg-live/90 gap-2"><Radio className="w-4 h-4" /> Nouveau live</Button></Link>
          <Link to="/upload"><Button variant="outline" className="rounded-full gap-2"><Plus className="w-4 h-4" /> Vidéo</Button></Link>
          <Link to={`/channel/${channel.id}`}><Button variant="secondary" className="rounded-full gap-2"><Eye className="w-4 h-4" /> Ma chaîne</Button></Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Abonnés", value: formatViews(channel.subscribers_count || 0), icon: Users, color: "text-primary" },
          { label: "Vues totales", value: formatViews(totalViews), icon: Eye, color: "text-foreground" },
          { label: "Likes totaux", value: formatViews(totalLikes), icon: ThumbsUp, color: "text-green-400" },
          { label: "TRIX reçus", value: formatTrix(channel.trix_received || 0), icon: Coins, color: "text-premium" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-5 rounded-2xl bg-card border border-border">
              <Icon className={cn("w-5 h-5", s.color)} />
              <p className="text-2xl font-black font-mono mt-3">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Live now */}
      {liveCount > 0 && (
        <div className="p-4 rounded-xl bg-live/10 border border-live/30 flex items-center gap-3">
          <Radio className="w-5 h-5 text-live animate-live-pulse" />
          <p className="text-sm font-semibold text-live">{liveCount} diffusion(s) en cours</p>
          <Link to={`/live/${videos.find((v) => v.is_live)?.id}`} className="ml-auto">
            <Button size="sm" className="bg-live text-white hover:bg-live/90 rounded-full">Rejoindre</Button>
          </Link>
        </div>
      )}

      {/* Friends panel */}
      <FriendsDashboardPanel user={user} />

      {/* Admin: PWA install stats */}
      {user?.role === "admin" && <PWAInstallStats />}

      {/* Videos table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold">Mes vidéos ({videos.length})</h2>
        </div>
        {videos.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">Aucune vidéo</p>
        ) : (
          <div className="divide-y divide-border">
            {videos.map((v) => (
              <div key={v.id} className="flex items-center gap-4 px-5 py-3 hover:bg-secondary/30 transition">
                <div className="w-24 aspect-video rounded-lg overflow-hidden bg-secondary shrink-0">
                  {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{v.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {v.is_live ? (
                      <span className="text-live font-semibold flex items-center gap-1"><Radio className="w-3 h-3" /> EN DIRECT • {formatViews(v.viewers_count || 0)} spectateurs</span>
                    ) : (
                      <>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatViews(v.views || 0)}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {formatViews(v.likes || 0)}</span>
                        <span>{formatTimeAgo(v.created_date)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link to={v.is_live ? `/live/${v.id}` : `/watch/${v.id}`}>
                    <Button size="icon" variant="ghost" className="w-8 h-8"><Eye className="w-3.5 h-3.5" /></Button>
                  </Link>
                  <Button size="icon" variant="ghost" onClick={() => deleteVideo(v)} className="w-8 h-8 hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}