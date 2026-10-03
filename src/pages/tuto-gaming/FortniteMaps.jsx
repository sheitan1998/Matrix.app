import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, ArrowLeft, Plus, Map as MapIcon, User, Lock } from "lucide-react";
import { toast } from "sonner";
import FortniteMapCard from "@/components/tuto-gaming/FortniteMapCard";
import SubmitMapModal from "@/components/tuto-gaming/SubmitMapModal";
import MapDetailModal from "@/components/tuto-gaming/MapDetailModal";
import { FORTNITE_BANNER, MAP_CATEGORIES } from "@/components/tuto-gaming/fortniteMapsData";
import { useTutoGamingAssets, getAssetUrl } from "@/hooks/useTutoGamingAssets";

export default function FortniteMaps() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showSubmit, setShowSubmit] = useState(false);
  const [showMyMaps, setShowMyMaps] = useState(false);
  const [selectedMap, setSelectedMap] = useState(null);
  const [user, setUser] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const { assets } = useTutoGamingAssets();
  const fortniteBanner = getAssetUrl(assets, "fortnite_banner", FORTNITE_BANNER);

  const fetchMaps = useCallback(async () => {
    try {
      const all = await base44.entities.FortniteMap.list("-created_date", 200);
      setMaps(all.filter((m) => m.is_approved !== false));
    } catch {

      /* silent */} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaps();
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me?.email) {
          const progressRes = await base44.entities.UserProgress.filter(
            { user_email: me.email },
            { limit: 1 }
          );
          const progress = progressRes?.items?.[0] || progressRes?.[0];
          const badges = Array.isArray(progress?.badges) ? progress.badges : [];
          setIsCreator(badges.includes("creator") || me.role === "admin");
        }
      } catch {
        setIsCreator(false);
      }
    })();
  }, [fetchMaps]);

  // Realtime subscription
  useEffect(() => {
    const unsubscribe = base44.entities.FortniteMap.subscribe((event) => {
      if (event.type === "create") {
        setMaps((prev) => [event.data, ...prev]);
      } else if (event.type === "update") {
        setMaps((prev) => prev.map((m) => m.id === event.data.id ? event.data : m));
      } else if (event.type === "delete") {
        setMaps((prev) => prev.filter((m) => m.id !== event.data.id));
      }
    });
    return () => {unsubscribe();};
  }, []);

  // Filter maps
  const filteredMaps = maps.filter((m) => {
    if (activeCategory !== "all" && m.category !== activeCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!m.title?.toLowerCase().includes(s) && !m.creator_name?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const myMaps = user ? maps.filter((m) => m.user_email === user.email) : [];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto pb-12">
      {/* Back */}
      <Link
        to="/tuto-gaming"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition mb-5 tap-sm">
        
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold">Retour au Hub</span>
      </Link>

      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6" style={{ border: "1px solid rgba(191,90,242,0.2)" }}>
        














        
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button
          onClick={() => isCreator ? setShowSubmit(true) : toast.error("Réservé aux créateurs. Demandez le statut créateur via le support.")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black text-white transition hover:opacity-90 tap-sm"
          style={{ background: "linear-gradient(135deg, #BF5AF2, #7C3AED)" }}>
          
          {isCreator ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />} Ajouter ma map
        </button>
        {user &&
        <button
          onClick={() => setShowMyMaps(!showMyMaps)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition tap-sm"
          style={
          showMyMaps ?
          { background: "rgba(191,90,242,0.15)", border: "1px solid rgba(191,90,242,0.3)", color: "#BF5AF2" } :
          { background: "rgba(13,5,24,0.7)", border: "1px solid rgba(191,90,242,0.2)", color: "rgba(255,255,255,0.7)" }
          }>
          
            <User className="w-3.5 h-3.5" /> Mes publications {myMaps.length > 0 && `(${myMaps.length})`}
          </button>
        }
      </div>

      {/* My Maps section */}
      {showMyMaps && user &&
      <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(13,5,24,0.5)", border: "1px solid rgba(191,90,242,0.15)" }}>
          <h2 className="text-xs font-black uppercase tracking-wider text-white/60 mb-3">Mes publications</h2>
          {myMaps.length === 0 ?
        <p className="text-xs text-white/30 text-center py-4">Vous n'avez pas encore publié de map.</p> :

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {myMaps.map((m, i) =>
          <FortniteMapCard key={m.id} map={m} index={i} onClick={setSelectedMap} user={user} />
          )}
            </div>
        }
        </div>
      }

      {/* Search */}
      <div className="max-w-xl mb-4">
        <div
          className="relative flex items-center"
          style={{
            borderRadius: "9999px",
            background: "rgba(13,5,24,0.7)",
            border: "1.5px solid rgba(191,90,242,0.25)"
          }}>
          
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre ou créateur..."
            className="w-full h-11 px-5 pr-11 bg-transparent text-sm text-white placeholder:text-white/30 outline-none" />
          
          <div className="absolute right-4">
            <Search className="w-4 h-4" style={{ color: "#BF5AF2" }} />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-1">
        {MAP_CATEGORIES.map((cat) =>
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition tap-sm"
          style={
          activeCategory === cat.id ?
          { background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}50` } :
          { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }
          }>
          
            {cat.label}
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">
          {filteredMaps.length} map{filteredMaps.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Maps grid */}
      {loading ?
      <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div> :
      filteredMaps.length === 0 ?
      <div className="text-center py-16">
          <MapIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-sm text-white/40 mb-2">
            {search ? `Aucune map trouvée pour "${search}"` : "Aucune map disponible pour le moment."}
          </p>
          {!search &&
        <p className="text-xs text-white/30">Soyez le premier à en ajouter une !</p>
        }
        </div> :

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredMaps.map((m, i) =>
        <FortniteMapCard key={m.id} map={m} index={i} onClick={setSelectedMap} user={user} />
        )}
        </div>
        }

      {/* Detail modal */}
      <MapDetailModal map={selectedMap} onClose={() => setSelectedMap(null)} />

      {/* Submit modal */}
      <SubmitMapModal open={showSubmit} onClose={() => setShowSubmit(false)} onSuccess={fetchMaps} userEmail={user?.email} />
    </div>);

}