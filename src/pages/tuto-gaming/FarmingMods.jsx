import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Package, Download, ShieldCheck, ShieldAlert, Wrench } from "lucide-react";
import { base44 } from "@/api/base44Client";
import FarmingModCard from "@/components/tuto-gaming/FarmingModCard";
import FarmingModCreatorPanel from "@/components/tuto-gaming/FarmingModCreatorPanel";

const CATEGORIES = [
  { id: "all", label: "Tous", icon: Package },
  { id: "vehicles", label: "Véhicules" },
  { id: "maps", label: "Maps" },
  { id: "tools", label: "Outils" },
  { id: "factories", label: "Usines" },
  { id: "animals", label: "Animaux" },
  { id: "scripts", label: "Scripts" },
  { id: "others", label: "Autres" },
];

export default function FarmingMods() {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [user, setUser] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [showCreatorPanel, setShowCreatorPanel] = useState(false);

  // Load user + check creator badge
  useEffect(() => {
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
  }, []);

  // Fetch mods
  const fetchMods = useCallback(async () => {
    setLoading(true);
    try {
      const query = activeCategory === "all" ? {} : { category: activeCategory };
      const data = await base44.entities.FarmingMod.filter(query, {
        sort: "-created_date",
        limit: 100,
      });
      setMods(data?.items || data || []);
    } catch {
      setMods([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchMods(); }, [fetchMods]);

  // Realtime sync
  useEffect(() => {
    const unsub = base44.entities.FarmingMod.subscribe(() => fetchMods());
    return () => { if (unsub) unsub(); };
  }, [fetchMods]);

  const handleDownload = (mod) => {
    if (mod.file_url) {
      window.open(mod.file_url, "_blank");
      base44.entities.FarmingMod.update(mod.id, {
        download_count: (mod.download_count || 0) + 1,
      }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#1a1a1a" }}>
      {/* Top bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/tuto-gaming/farming-simulator-25"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">Retour au Farming</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {isCreator && (
              <button
                onClick={() => setShowCreatorPanel(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition tap-sm"
                style={{ background: "rgba(125,166,39,0.15)", border: "1px solid rgba(125,166,39,0.4)", color: "#a3c649" }}
              >
                <Wrench className="w-3.5 h-3.5" />
                Creator
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mt-4 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="block w-1 h-6 rounded-full" style={{ background: "#7DA627" }} />
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
              Bibliothèque de Mods
            </h1>
          </div>
          <p className="text-xs text-white/40 ml-3">
            Téléchargez des mods pour Farming Simulator 25, partagés par la communauté.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition tap-sm"
              style={{
                background: activeCategory === cat.id ? "rgba(125,166,39,0.2)" : "rgba(38,38,38,0.6)",
                border: activeCategory === cat.id ? "1px solid rgba(125,166,39,0.4)" : "1px solid rgba(255,255,255,0.06)",
                color: activeCategory === cat.id ? "#a3c649" : "rgba(255,255,255,0.5)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mods grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-white/30" />
          </div>
        ) : mods.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 py-16 text-center">
            <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/40">Aucun mod disponible dans cette catégorie</p>
            <p className="text-xs text-white/30 mt-1">
              {isCreator
                ? "Publiez votre premier mod via le bouton Creator"
                : "Les créateurs n'ont pas encore publié de mods ici"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {mods.map((mod) => (
              <FarmingModCard key={mod.id} mod={mod} onDownload={handleDownload} />
            ))}
          </div>
        )}
      </div>

      {/* Creator panel */}
      {showCreatorPanel && (
        <FarmingModCreatorPanel
          user={user}
          onClose={() => setShowCreatorPanel(false)}
        />
      )}
    </div>
  );
}