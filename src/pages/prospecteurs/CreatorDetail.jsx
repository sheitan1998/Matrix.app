import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Eye, ThumbsUp, Download, Package, Map as MapIcon, Loader2, Users } from "lucide-react";
import SubscribeButton from "@/components/profile/SubscribeButton";
import { toast } from "sonner";

export default function CreatorDetail() {
  const { email } = useParams();
  const [creator, setCreator] = useState(null);
  const [mods, setMods] = useState([]);
  const [maps, setMaps] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    const decoded = decodeURIComponent(email);
    setLoading(true);
    (async () => {
      try {
        const res = await base44.functions.invoke("serverSearch", { action: "searchCreators", query: "" });
        const users = res?.data?.users || [];
        const found = users.find((u) => u.email === decoded);
        if (!found) { toast.error("Créateur introuvable ou profil privé"); setLoading(false); return; }
        setCreator(found);

        const [modRes, mapRes, subRes] = await Promise.all([
          base44.entities.FarmingMod.filter({ creator_email: decoded }, { sort: "-created_date", limit: 100 }),
          base44.entities.FortniteMap.filter({ user_email: decoded }, { sort: "-created_date", limit: 100 }),
          base44.entities.UserSubscription.count({ target_email: decoded }),
        ]);
        setMods(modRes?.items || modRes || []);
        setMaps(mapRes?.items || mapRes || []);
        setSubscriberCount(subRes || 0);
      } catch { toast.error("Erreur lors du chargement du profil"); }
      setLoading(false);
    })();
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <h1 className="text-xl font-black text-white mb-2">Profil introuvable</h1>
        <p className="text-sm text-muted-foreground mb-6">Ce profil est privé ou n'existe pas.</p>
        <Link to="/recherche-createur" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Retour à la recherche
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="relative h-40 sm:h-52 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(109,40,217,0.1))" }}>
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
        <Link to="/recherche-createur" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition mb-4 tap-sm">
          <ArrowLeft className="w-4 h-4" /><span className="text-xs font-bold">Retour à la recherche</span>
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background bg-secondary shrink-0">
            {creator.avatar_url ? <img src={creator.avatar_url} alt={creator.pseudo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-muted-foreground">{creator.pseudo?.[0]?.toUpperCase()}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-white">{creator.pseudo}</h1>
            {creator.bio && <p className="text-sm text-muted-foreground mt-1">{creator.bio}</p>}
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground"><Users className="w-3 h-3" /> {subscriberCount} abonné{subscriberCount > 1 ? "s" : ""}</div>
          </div>
          <SubscribeButton targetEmail={creator.email} targetName={creator.pseudo} size="md" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard icon={Eye} label="Vues" value={creator.total_views} color="#3b82f6" />
          <StatCard icon={ThumbsUp} label="Likes" value={creator.total_likes} color="#22c55e" />
          <StatCard icon={Download} label="Téléchargements" value={creator.total_downloads} color="#f59e0b" />
        </div>

        {mods.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4" style={{ color: "#7DA627" }} />
              <h2 className="text-sm font-black text-white">Mods Farming Simulator ({mods.length})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mods.map((mod) => (
                <div key={mod.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(125,166,39,0.15)" }}>
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: "rgba(125,166,39,0.1)" }}>
                    {mod.images?.[0] ? <img src={mod.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 m-auto mt-3.5" style={{ color: "#7DA627" }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{mod.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-white/40 flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{mod.views || 0}</span>
                      <span className="text-[9px] text-green-400 flex items-center gap-0.5"><ThumbsUp className="w-2.5 h-2.5" />{mod.likes || 0}</span>
                      <span className="text-[9px] text-white/30">{mod.download_count || 0} DL</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {maps.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <MapIcon className="w-4 h-4" style={{ color: "#BF5AF2" }} />
              <h2 className="text-sm font-black text-white">Maps Fortnite ({maps.length})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {maps.map((map) => (
                <div key={map.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(191,90,242,0.15)" }}>
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: "rgba(191,90,242,0.1)" }}>
                    {map.image_url ? <img src={map.image_url} alt="" className="w-full h-full object-cover" /> : <MapIcon className="w-5 h-5 m-auto mt-3.5" style={{ color: "#BF5AF2" }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{map.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-white/40 font-mono">{map.map_code}</span>
                      <span className="text-[9px] text-white/40 flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{map.views || 0}</span>
                      <span className="text-[9px] text-green-400 flex items-center gap-0.5"><ThumbsUp className="w-2.5 h-2.5" />{map.likes || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mods.length === 0 && maps.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">Ce créateur n'a pas encore publié de contenu.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <Icon className="w-5 h-5 mb-2" style={{ color }} />
      <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
      <p className="text-lg font-black text-white mt-0.5">{value}</p>
    </div>
  );
}