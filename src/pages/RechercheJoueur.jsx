import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Search, Home, Gamepad2, Trophy, Plus, ChevronRight, Loader2, Users, Star } from "lucide-react";

const BG_URL = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/891f5968b_Gemini_Generated_Image_vsevw4vsevw4vsev.png";

const GAMES = ["Valorant", "League of Legends", "Fortnite", "CS2", "Apex Legends", "Minecraft", "GTA V", "Valorant", "Rocket League", "Call of Duty", "FIFA", "World of Warcraft"];
const PLATFORMS = ["PC", "PlayStation", "Xbox", "Mobile", "Switch"];

export default function RechercheJoueur() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ game: "", platform: "", availability: "" });
  const [form, setForm] = useState({ pseudo: "", game: "", rank: "", platform: "pc", description: "" });

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.PlayerProfile.list("-created_date", 50);
      setProfiles(list);
    } catch (e) {
      // entity might be empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadProfiles();
  }, []);

  const submitProfile = async (e) => {
    e.preventDefault();
    if (!form.pseudo || !form.game) return;
    try {
      await base44.entities.PlayerProfile.create({
        pseudo: form.pseudo,
        user_email: user?.email,
        game: form.game,
        rank: form.rank,
        platform: form.platform,
        description: form.description,
        availability: "available",
      });
      setForm({ pseudo: "", game: "", rank: "", platform: "pc", description: "" });
      setShowForm(false);
      loadProfiles();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = profiles.filter(p => {
    if (filters.game && p.game !== filters.game) return false;
    if (filters.platform && p.platform !== filters.platform.toLowerCase()) return false;
    if (filters.availability && p.availability !== filters.availability) return false;
    return true;
  });

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden" style={{ backgroundColor: "#0a050f" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `url(${BG_URL})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(10,5,15,0.6)" }} />

      <div className="relative z-10 min-h-screen flex flex-col px-4 sm:px-6 lg:px-10 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <button onClick={() => nav("/")} className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-black text-white">MATRIX</span>
            <span className="text-[10px] font-mono text-white/40 tracking-widest mt-1">RECHERCHE JOUEUR</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 pb-8">
          {/* Left: Filters */}
          <div className="rounded-2xl p-5" style={{ background: "rgba(15,10,25,0.7)", border: "1.5px solid rgba(168,85,247,0.25)", boxShadow: "0 0 20px rgba(168,85,247,0.08)" }}>
            <h2 className="text-sm font-black text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-400" /> Recherche Joueur
            </h2>

            <div className="space-y-4">
              {/* Game selector */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wide mb-1.5 block">Sélectionner le jeu</label>
                <select value={filters.game} onChange={(e) => setFilters({ ...filters, game: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl text-sm text-white bg-transparent outline-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(168,85,247,0.2)" }}>
                  <option value="" className="bg-[#13101a]">Tous les jeux</option>
                  {GAMES.map(g => <option key={g} value={g} className="bg-[#13101a]">{g}</option>)}
                </select>
              </div>

              {/* Platform selector */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wide mb-1.5 block">Sélectionner la plateforme</label>
                <select value={filters.platform} onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl text-sm text-white bg-transparent outline-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(168,85,247,0.2)" }}>
                  <option value="" className="bg-[#13101a]">Toutes les plateformes</option>
                  {PLATFORMS.map(p => <option key={p} value={p} className="bg-[#13101a]">{p}</option>)}
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wide mb-1.5 block">Sélectionner la disponibilité</label>
                <div className="flex gap-2">
                  {[
                    { v: "available", label: "Disponible", color: "#22C55E" },
                    { v: "busy", label: "Occupé", color: "#F59E0B" },
                    { v: "offline", label: "Hors ligne", color: "#6B7280" },
                  ].map(a => (
                    <button key={a.v} onClick={() => setFilters({ ...filters, availability: filters.availability === a.v ? "" : a.v })}
                      className="flex-1 h-10 rounded-xl text-xs font-bold transition"
                      style={filters.availability === a.v
                        ? { background: `${a.color}20`, border: `1px solid ${a.color}`, color: a.color }
                        : { background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post button */}
              <button onClick={() => setShowForm(true)}
                className="w-full h-11 rounded-xl text-sm font-black text-white transition hover:scale-[1.02]"
                style={{ background: "rgba(168,85,247,0.15)", border: "1.5px solid rgba(168,85,247,0.5)", boxShadow: "0 0 16px rgba(168,85,247,0.15)" }}>
                <Plus className="w-4 h-4 inline mr-1.5" /> POSTER VOTRE ANNONCE
              </button>
            </div>
          </div>

          {/* Right: Player profiles */}
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> Joueurs ({filtered.length})
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(15,10,25,0.5)", border: "1px dashed rgba(168,85,247,0.2)" }}>
                <Users className="w-10 h-10 text-purple-400/30 mx-auto mb-3" />
                <p className="text-white/40 text-sm">Aucun joueur trouvé. Soyez le premier à poster votre annonce !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-4" style={{ background: "rgba(15,10,25,0.7)", border: "1px solid rgba(168,85,247,0.15)" }}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                        {p.avatar ? <img src={p.avatar} alt={p.pseudo} className="w-full h-full rounded-xl object-cover" /> : <span className="text-lg font-black text-purple-300">{p.pseudo?.[0]?.toUpperCase()}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-white truncate">{p.pseudo}</h3>
                        <p className="text-xs text-purple-400/80">{p.game || "Jeu non spécifié"}</p>
                      </div>
                      <div className="px-2 py-1 rounded-full text-[10px] font-bold" style={{
                        background: p.availability === "available" ? "rgba(34,197,94,0.15)" : p.availability === "busy" ? "rgba(245,158,11,0.15)" : "rgba(107,114,128,0.15)",
                        color: p.availability === "available" ? "#22C55E" : p.availability === "busy" ? "#F59E0B" : "#9CA3AF",
                      }}>
                        {p.availability === "available" ? "Disponible" : p.availability === "busy" ? "Occupé" : "Hors ligne"}
                      </div>
                    </div>
                    {p.rank && <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold" style={{ background: "rgba(255,215,0,0.1)", color: "#FFD700" }}><Trophy className="w-3 h-3" /> {p.rank}</div>}
                    {p.description && <p className="mt-2 text-xs text-white/50 line-clamp-2">{p.description}</p>}
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-white/30">
                      <span className="uppercase">{p.platform}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Post form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={() => setShowForm(false)}>
            <motion.form initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} onSubmit={submitProfile}
              className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.3)" }}>
              <h3 className="text-base font-black text-white">Poster votre annonce joueur</h3>
              <input value={form.pseudo} onChange={(e) => setForm({ ...form, pseudo: e.target.value })} placeholder="Votre pseudo" required
                className="w-full h-10 px-3 rounded-xl text-sm text-white bg-transparent outline-none" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }} />
              <select value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} required
                className="w-full h-10 px-3 rounded-xl text-sm text-white bg-transparent outline-none cursor-pointer" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <option value="" className="bg-[#13101a]">Sélectionner un jeu</option>
                {GAMES.map(g => <option key={g} value={g} className="bg-[#13101a]">{g}</option>)}
              </select>
              <input value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} placeholder="Votre rank (ex: Diamant, Or...)"
                className="w-full h-10 px-3 rounded-xl text-sm text-white bg-transparent outline-none" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }} />
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full h-10 px-3 rounded-xl text-sm text-white bg-transparent outline-none cursor-pointer" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {PLATFORMS.map(p => <option key={p} value={p.toLowerCase()} className="bg-[#13101a]">{p}</option>)}
              </select>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (recherche team, duo, coaching...)" rows={3}
                className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent outline-none resize-none" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }} />
              <button type="submit" className="w-full h-11 rounded-xl text-sm font-black text-white" style={{ background: "rgba(168,85,247,0.2)", border: "1.5px solid rgba(168,85,247,0.5)" }}>Publier mon annonce</button>
            </motion.form>
          </div>
        )}
      </div>
    </div>
  );
}