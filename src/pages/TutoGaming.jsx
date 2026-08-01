import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Search, Home, Loader2, MessageSquare, ChevronRight, GraduationCap, TrendingUp } from "lucide-react";

const BG_URL = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/891f5968b_Gemini_Generated_Image_vsevw4vsevw4vsev.png";

const GAMES = [
  { name: "ASTRACHRONICLE: GALACTIC SAGA", comments: 150, gradient: "linear-gradient(135deg, #1a0a2e, #16213e)", icon: "🚀" },
  { name: "LEGION OF KINGS", comments: 197, gradient: "linear-gradient(135deg, #2d1b0e, #4a2c1a)", icon: "🐉" },
  { name: "SHADOW PROTOCOL: CYBERPUNK", comments: 66, gradient: "linear-gradient(135deg, #0d1b2a, #1b0a2e)", icon: "🦾" },
  { name: "ANCIENT REALMS ODYSSEY", comments: 150, gradient: "linear-gradient(135deg, #1e2a1e, #2d3e2d)", icon: "🏛️" },
  { name: "STARFORGE AEON", comments: 57, gradient: "linear-gradient(135deg, #0a0e2e, #1a1a4e)", icon: "⭐" },
  { name: "ELDRITCH DEPTHS", comments: 62, gradient: "linear-gradient(135deg, #0a1a1a, #1a2e2e)", icon: "🐙" },
];

export default function TutoGaming() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const searchTutorials = async (gameName) => {
    setLoading(true);
    setSelectedGame(gameName);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Search for the best gaming tutorials and guides for "${gameName}" on YouTube and Twitch. Return 8 results with: title, platform (YouTube or Twitch), creator/channel name, thumbnail URL, and content URL.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            tutorials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  platform: { type: "string" },
                  creator: { type: "string" },
                  thumbnail: { type: "string" },
                  url: { type: "string" }
                }
              }
            }
          }
        }
      });
      setResults(res?.tutorials || []);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (query.trim()) searchTutorials(query.trim());
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
            <span className="text-[10px] font-mono text-white/40 tracking-widest mt-1">TUTO GAMING ENTRAIDE</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => nav("/")} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Home className="w-4 h-4 text-white/60" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
                <span className="text-[10px] font-bold text-white">{user?.full_name?.[0]?.toUpperCase() || "U"}</span>
              </div>
              <span className="text-xs font-bold text-white/80">{user?.pseudo || user?.full_name || "Utilisateur"}</span>
            </div>
          </div>
        </header>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex justify-center mb-8">
          <div className="relative w-full max-w-2xl">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="RECHERCHER UN JEU..."
              className="w-full h-12 pl-5 pr-14 rounded-full text-sm text-white bg-transparent outline-none placeholder-white/30 uppercase tracking-wide"
              style={{ background: "rgba(15,10,25,0.7)", border: "1.5px solid rgba(168,85,247,0.4)", boxShadow: "0 0 20px rgba(168,85,247,0.15)" }} />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <Search className="w-4 h-4 text-purple-400" />}
            </button>
          </div>
        </form>

        {/* Game cards grid */}
        {!selectedGame && (
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-5xl">
              {GAMES.map((g, i) => (
                <motion.button key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                  whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => searchTutorials(g.name)}
                  className="relative rounded-2xl overflow-hidden text-left group" style={{ background: g.gradient, border: "1px solid rgba(168,85,247,0.15)", minHeight: "180px" }}>
                  <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.2), transparent 70%)" }} />
                  <div className="relative p-5 flex flex-col h-full justify-between" style={{ minHeight: "180px" }}>
                    <div className="flex items-start justify-between">
                      <span className="text-4xl">{g.icon}</span>
                      <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white leading-tight mb-2">{g.name}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                        <MessageSquare className="w-3 h-3" />
                        <span className="uppercase tracking-wide">Commentaires ({g.comments})</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Tutorial results */}
        {selectedGame && (
          <div className="pb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <button onClick={() => { setSelectedGame(null); setResults(null); }} className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition mb-1">
                  <ChevronRight className="w-3 h-3 rotate-180" /> Retour
                </button>
                <h2 className="text-lg font-black text-white">Tutoriels: {selectedGame}</h2>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : results && results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {results.map((t, i) => (
                  <motion.a key={i} href={t.url || "#"} target="_blank" rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="group rounded-2xl overflow-hidden" style={{ background: "rgba(15,10,25,0.7)", border: "1px solid rgba(168,85,247,0.12)" }}>
                    <div className="relative aspect-video overflow-hidden" style={{ background: "rgba(168,85,247,0.05)" }}>
                      {t.thumbnail ? <img src={t.thumbnail} alt={t.title} className="w-full h-full object-cover transition group-hover:scale-105" onError={(e) => { e.target.style.display = "none"; }} /> : <div className="w-full h-full flex items-center justify-center"><GraduationCap className="w-8 h-8 text-purple-400/30" /></div>}
                      <div className="absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold text-white" style={{ background: t.platform?.toLowerCase().includes("twitch") ? "#a855f7" : "#FF0000" }}>{t.platform || "YouTube"}</div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-bold text-white line-clamp-2 mb-1">{t.title}</h3>
                      <p className="text-[10px] text-white/40">{t.creator || "Créateur inconnu"}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <GraduationCap className="w-12 h-12 text-purple-400/30 mx-auto mb-3" />
                <p className="text-white/40 text-sm">Aucun tutoriel trouvé pour "{selectedGame}".</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}