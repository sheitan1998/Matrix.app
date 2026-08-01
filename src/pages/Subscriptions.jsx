import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Radio, Heart, Users, Video } from "lucide-react";
import VideoGrid from "@/components/video/VideoGrid";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";

const TABS = [
  { id: "all", label: "Vue d'ensemble" },
  { id: "live", label: "Live" },
  { id: "videos", label: "Vidéos" },
  { id: "categories", label: "Catégories" },
  { id: "channels", label: "Chaînes" },
];

const CATEGORIES = [
  { id: "gaming", label: "Starforge Tactics", color: "#a855f7" },
  { id: "music", label: "Voidrunners", color: "#3b82f6" },
  { id: "sports", label: "Legion of Stars", color: "#22c55e" },
];

export default function Subscriptions() {
  const [tab, setTab] = useState("all");
  const [videos, setVideos] = useState([]);
  const [liveVideos, setLiveVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const me = await base44.auth.me().catch(() => null);
    if (!me) { setLoading(false); return; }
    const subs = await base44.entities.Subscription.filter({ user_email: me.email });
    const subIds = subs.map((s) => s.channel_id);

    const [allVideos, allLive, allChannels] = await Promise.all([
      base44.entities.Video.list("-created_date", 100),
      base44.entities.Video.filter({ is_live: true }, "-viewers_count", 20),
      base44.entities.Channel.list("-subscribers_count", 30),
    ]);

    const subVideos = subIds.length > 0 ? allVideos.filter((v) => subIds.includes(v.channel_id)) : allVideos.slice(0, 20);
    const subLive = subIds.length > 0 ? allLive.filter((v) => subIds.includes(v.channel_id)) : [];
    const recommended = allChannels.filter((c) => !subIds.includes(c.id)).slice(0, 10);

    setVideos(subVideos);
    setLiveVideos(subLive);
    setChannels(recommended);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { pulling, pullY } = usePullToRefresh({ onRefresh: fetchData });

  const showAll = tab === "all";
  const showLive = showAll || tab === "live";
  const showVideos = showAll || tab === "videos";
  const showCategories = showAll || tab === "categories";
  const showChannels = showAll || tab === "channels";

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PullToRefreshIndicator pulling={pulling} pullY={pullY} />

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)" }}>
          <Heart className="w-6 h-6" style={{ color: "#a052ff" }} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Suivis</h1>
          <p className="text-sm text-white/40">Les chaînes et contenus que tu suis</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-white/5">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative px-3 py-2.5 text-xs font-bold whitespace-nowrap transition ${tab === t.id ? "text-white" : "text-white/40 hover:text-white/60"}`}>
            {t.label}
            {tab === t.id && <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: "#a052ff" }} />}
          </button>
        ))}
      </div>

      {/* Chaînes live */}
      {showLive && (
        <section>
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-500" /> Chaînes live
          </h2>
          {liveVideos.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.04)" }}>
              <Radio className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">Aucune chaîne suivie n'est en signal pour l'instant</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {liveVideos.map((v) => (
                <Link key={v.id} to={`/live/${v.id}`} className="rounded-2xl overflow-hidden group" style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="relative aspect-video">
                    {v.thumbnail_url ? <img src={v.thumbnail_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-secondary" />}
                    <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded bg-red-600 text-white">LIVE</span>
                    <span className="absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white">{(v.viewers_count || 0).toLocaleString()} spectateurs</span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-white truncate">{v.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{v.channel_name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Chaînes recommandées */}
      {showChannels && (
        <section>
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: "#a052ff" }} /> Chaînes recommandées
          </h2>
          {channels.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="text-sm text-white/40">Aucune chaîne recommandée pour le moment</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {channels.map((c) => (
                <Link key={c.id} to={`/channel/${c.id}`} className="rounded-2xl p-4 flex items-center gap-3 group" style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(168,85,247,0.1)" }}>
                    {c.avatar_url ? <img src={c.avatar_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white/40">{c.name?.[0]}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{c.name}</p>
                    <p className="text-xs text-white/40">{(c.subscribers_count || 0).toLocaleString()} abonnés</p>
                    <div className="flex gap-1 mt-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(168,85,247,0.15)", color: "#a052ff" }}>Jeu</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white/60" style={{ background: "rgba(255,255,255,0.06)" }}>Français</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Vidéos les plus récentes */}
      {showVideos && (
        <section>
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Video className="w-4 h-4" style={{ color: "#a052ff" }} /> Vidéos les plus récentes
          </h2>
          {videos.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="text-sm text-white/40">Aucune capture récente de vos chaînes suivies</p>
            </div>
          ) : (
            <VideoGrid videos={videos} isLoading={loading} />
          )}
        </section>
      )}

      {/* Catégories live */}
      {showCategories && (
        <section>
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4" style={{ color: "#a052ff" }} /> Catégories live
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.id}`} className="rounded-2xl p-5 relative overflow-hidden group" style={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: cat.color }} />
                <div className="pl-2">
                  <p className="text-sm font-black text-white">{cat.label}</p>
                  <p className="text-[10px] text-white/40 mt-1">0 chaînes en direct</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}