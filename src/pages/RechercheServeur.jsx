import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Home, Plus, ChevronRight, Loader2, Server, Users, Zap, Star, ExternalLink } from "lucide-react";

const BG_URL = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/891f5968b_Gemini_Generated_Image_vsevw4vsevw4vsev.png";

const GAMES = ["Valorant", "League of Legends", "Fortnite", "CS2", "Minecraft", "GTA V", "Apex Legends", "World of Warcraft"];
const PLATFORMS = ["Discord", "PC", "PlayStation", "Xbox", "Mobile"];

const SAMPLE_SERVERS = [
  { name: "ALPHA PRIME SERVER", game: "Valorant", members: 1240, votes: 342, boosts: 89, platform: "discord" },
  { name: "ASTRA REGIMENT", game: "CS2", members: 890, votes: 298, boosts: 67, platform: "discord" },
  { name: "ZODIAC CHRONICLES", game: "League of Legends", members: 2100, votes: 287, boosts: 102, platform: "discord" },
  { name: "ASTRA NEBULA FLEET", game: "EvE Online", members: 650, votes: 234, boosts: 45, platform: "pc" },
  { name: "EXPLOREUR CHRONICLES", game: "Minecraft", members: 1800, votes: 198, boosts: 78, platform: "discord" },
  { name: "STAR FORGE GUILD", game: "World of Warcraft", members: 950, votes: 176, boosts: 54, platform: "pc" },
];

export default function RechercheServeur() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterGame, setFilterGame] = useState("");
  const [form, setForm] = useState({ name: "", game: "", description: "", platform: "discord", invite_link: "" });

  const loadServers = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.GameServer.list("-votes", 50);
      if (list.length > 0) {
        setServers(list);
      } else {
        setServers(SAMPLE_SERVERS.map((s, i) => ({ ...s, id: `sample-${i}`, isSample: true })));
      }
    } catch (e) {
      setServers(SAMPLE_SERVERS.map((s, i) => ({ ...s, id: `sample-${i}`, isSample: true })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadServers();
  }, []);

  const submitServer = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      await base44.entities.GameServer.create({
        name: form.name,
        description: form.description,
        game: form.game,
        platform: form.platform,
        invite_link: form.invite_link,
        owner_email: user?.email,
        owner_name: user?.full_name,
        members_count: 1,
        votes: 0,
        boosts: 0,
      });
      setForm({ name: "", game: "", description: "", platform: "discord", invite_link: "" });
      setShowForm(false);
      loadServers();
    } catch (e) {
      console.error(e);
    }
  };

  const top10 = [...servers].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 10);
  const filtered = filterGame ? servers.filter(s => s.game === filterGame) : servers;

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden" style={{ backgroundColor: "#0a050f" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `url(${BG_URL})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(10,5,15,0.6)" }} />

      <div className="relative z-10 min-h-screen flex flex-col px-4 sm:px-6 lg:px-10 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <button onClick={() => nav("/")} className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-black text-white">MATRIX</span>
            <span className="text-[10px] font-mono text-white/40 tracking-widest mt-1">RECHERCHE SERVEUR</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 pb-8">
          {/* Left: TOP 10 */}
          <div className="rounded-2xl p-5" style={{ background: "rgba(15,10,25,0.7)", border: "1.5px solid rgba(168,85,247,0.25)", boxShadow: "0 0 20px rgba(168,85,247,0.08)" }}>
            <h2 className="text-sm font-black text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-400" /> TOP 10 SERVEURS
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {top10.map((s, i) => (
                <div key={s.id || i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="text-xs font-black w-5 text-center" style={{ color: i < 3 ? "#FFD700" : "rgba(255,255,255,0.3)" }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{s.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{s.votes || 0} votes · {s.members || 0} joueurs</p>
                  </div>
                </div>
              ))}
              {top10.length === 0 && <p className="col-span-2 text-xs text-white/30 text-center py-4">Aucun serveur</p>}
            </div>
            <button onClick={() => setShowForm(true)}
              className="w-full h-11 mt-4 rounded-xl text-sm font-black text-white transition hover:scale-[1.02]"
              style={{ background: "rgba(168,85,247,0.15)", border: "1.5px solid rgba(168,85,247,0.5)", boxShadow: "0 0 16px rgba(168,85,247,0.15)" }}>
              <Plus className="w-4 h-4 inline mr-1.5" /> PUBLIER VOTRE SERVEUR
            </button>
          </div>

          {/* Right: Server grid */}
          <div>
            {/* Filter */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
              <button onClick={() => setFilterGame("")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition shrink-0"
                style={!filterGame ? { background: "rgba(168,85,247,0.15)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.4)" } : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>
                Tous
              </button>
              {GAMES.map(g => (
                <button key={g} onClick={() => setFilterGame(g)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition shrink-0"
                  style={filterGame === g ? { background: "rgba(168,85,247,0.15)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.4)" } : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>
                  {g}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filtered.map((s, i) => (
                  <motion.div key={s.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: "rgba(15,10,25,0.7)", border: "1px solid rgba(168,85,247,0.15)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)" }}>
                      <Server className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-sm font-black text-white leading-tight line-clamp-2">{s.name}</h3>
                    {s.game && <span className="inline-block text-[10px] px-2 py-0.5 rounded-md" style={{ background: "rgba(168,85,247,0.1)", color: "#c084fc" }}>{s.game}</span>}
                    <div className="space-y-0.5 text-[10px] text-white/40">
                      <div className="flex items-center gap-1"><Star className="w-3 h-3" /> {s.votes || 0} Votes</div>
                      <div className="flex items-center gap-1"><Zap className="w-3 h-3" /> {s.boosts || 0} Boosts</div>
                      <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.members || s.members_count || 0} Joueurs</div>
                    </div>
                    {s.invite_link && (
                      <a href={s.invite_link} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition">
                        <ExternalLink className="w-3 h-3" /> Rejoindre
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Publish form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={() => setShowForm(false)}>
            <motion.form initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} onSubmit={submitServer}
              className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.3)" }}>
              <h3 className="text-base font-black text-white">Publier votre serveur</h3>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom du serveur" required
                className="w-full h-10 px-3 rounded-xl text-sm text-white bg-transparent outline-none" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }} />
              <select value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}
                className="w-full h-10 px-3 rounded-xl text-sm text-white bg-transparent outline-none cursor-pointer" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <option value="" className="bg-[#13101a]">Sélectionner un jeu</option>
                {GAMES.map(g => <option key={g} value={g} className="bg-[#13101a]">{g}</option>)}
              </select>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full h-10 px-3 rounded-xl text-sm text-white bg-transparent outline-none cursor-pointer" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {PLATFORMS.map(p => <option key={p} value={p.toLowerCase()} className="bg-[#13101a]">{p}</option>)}
              </select>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description du serveur" rows={3}
                className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent outline-none resize-none" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }} />
              <input value={form.invite_link} onChange={(e) => setForm({ ...form, invite_link: e.target.value })} placeholder="Lien d'invitation (Discord, etc.)"
                className="w-full h-10 px-3 rounded-xl text-sm text-white bg-transparent outline-none" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }} />
              <button type="submit" className="w-full h-11 rounded-xl text-sm font-black text-white" style={{ background: "rgba(168,85,247,0.2)", border: "1.5px solid rgba(168,85,247,0.5)" }}>Publier le serveur</button>
            </motion.form>
          </div>
        )}
      </div>
    </div>
  );
}