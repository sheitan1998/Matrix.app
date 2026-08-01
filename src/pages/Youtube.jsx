import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Search, Youtube, Eye, Home, ChevronRight, Loader2, Gamepad2, TrendingUp, Users } from "lucide-react";

const BG_URL = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/891f5968b_Gemini_Generated_Image_vsevw4vsevw4vsev.png";

export default function YoutubePage() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("gaming");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    searchVideos("popular gaming videos 2025");
  }, []);

  const searchVideos = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      const prompt = q === "popular gaming videos 2025" || !q
        ? "Find the 12 most popular gaming videos on YouTube right now. For each, return: title, channel name, view count (as a readable string like '1.2M views'), thumbnail image URL (from ytimg.com or similar), and the full YouTube video URL."
        : `Search YouTube for videos about "${q}". Return 12 results with: title, channel name, view count (readable string), thumbnail image URL, and YouTube video URL. Focus on gaming content if relevant.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            videos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  channel: { type: "string" },
                  views: { type: "string" },
                  thumbnail: { type: "string" },
                  url: { type: "string" }
                }
              }
            }
          }
        }
      });
      setResults(res?.videos || []);
    } catch (e) {
      setError("Impossible de charger les vidéos. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    const q = query.trim() || "popular gaming videos 2025";
    setActiveQuery(q);
    searchVideos(q);
  };

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden" style={{ backgroundColor: "#0a050f" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `url(${BG_URL})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(10,5,15,0.6)" }} />

      <div className="relative z-10 min-h-screen flex flex-col px-4 sm:px-6 lg:px-10 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <button onClick={() => nav("/")} className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-black text-white">MATRIX</span>
            <span className="text-[10px] font-mono text-white/40 tracking-widest mt-1">YOUTUBE</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => nav("/")} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Home className="w-4 h-4 text-white/60" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)" }}>
              <Youtube className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-white/80">{user?.pseudo || user?.full_name || "Utilisateur"}</span>
            </div>
          </div>
        </header>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex justify-center mb-8">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une vidéo, une chaîne, un jeu..."
              className="w-full h-12 pl-5 pr-14 rounded-full text-sm text-white bg-transparent outline-none placeholder-white/30"
              style={{ background: "rgba(15,10,25,0.7)", border: "1.5px solid rgba(168,85,247,0.4)", boxShadow: "0 0 20px rgba(168,85,247,0.15)" }}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <Search className="w-4 h-4 text-purple-400" />}
            </button>
          </div>
        </form>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { id: "gaming", label: "Gaming", icon: Gamepad2 },
            { id: "trending", label: "Tendance", icon: TrendingUp },
            { id: "creators", label: "Créateurs", icon: Users },
          ].map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "gaming") searchVideos("popular gaming videos 2025"); else if (t.id === "trending") searchVideos("trending videos 2025"); else searchVideos("popular YouTube creators gaming"); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition"
              style={tab === t.id
                ? { background: "rgba(168,85,247,0.15)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.4)" }
                : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-white/50 text-sm">{error}</p>
            <button onClick={handleSearch} className="mt-4 px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.3)" }}>Réessayer</button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
            {results.map((v, i) => (
              <motion.a
                key={i}
                href={v.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl overflow-hidden"
                style={{ background: "rgba(15,10,25,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="relative aspect-video overflow-hidden" style={{ background: "rgba(255,0,0,0.05)" }}>
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover transition group-hover:scale-105" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center" style={{ display: v.thumbnail ? "none" : "flex", background: "linear-gradient(135deg, rgba(255,0,0,0.1), rgba(168,85,247,0.1))" }}>
                    <Youtube className="w-10 h-10 text-red-500/40" />
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-[10px] font-bold text-white" style={{ background: "rgba(0,0,0,0.7)" }}>
                    <Eye className="w-3 h-3 inline mr-1" />{v.views || "—"}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold text-white line-clamp-2 mb-1">{v.title || "Sans titre"}</h3>
                  <p className="text-xs text-white/40">{v.channel || "Chaîne inconnue"}</p>
                </div>
              </motion.a>
            ))}
            {results.length === 0 && (
              <div className="col-span-full text-center py-20">
                <Youtube className="w-12 h-12 text-red-500/30 mx-auto mb-3" />
                <p className="text-white/40 text-sm">Aucune vidéo trouvée. Lancez une recherche.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}