import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Heart, MapPin, Plus } from "lucide-react";

export default function ValheimSeedShare() {
  const [seeds, setSeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ seed_code: "", title: "", description: "", difficulty: "moyen", spawn_location: "", biome_tags: "" });

  const fetchSeeds = useCallback(async () => {
    try {
      const page = await base44.entities.ValheimSeed.filter({}, { sort: "-likes", limit: 50 });
      setSeeds(page.items || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeeds();
    const unsub = base44.entities.ValheimSeed.subscribe(() => fetchSeeds());
    return () => unsub();
  }, [fetchSeeds]);

  const submitSeed = async (e) => {
    e.preventDefault();
    try {
      const user = await base44.auth.me().catch(() => null);
      if (!user) return alert("Connexion requise pour partager une seed");
      await base44.entities.ValheimSeed.create({
        ...form,
        biome_tags: form.biome_tags ? form.biome_tags.split(",").map(s => s.trim()).filter(Boolean) : [],
        author_email: user.email,
        author_name: user.full_name || user.email,
      });
      setForm({ seed_code: "", title: "", description: "", difficulty: "moyen", spawn_location: "", biome_tags: "" });
      setShowForm(false);
      fetchSeeds();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const likeSeed = async (seed) => {
    try {
      await base44.entities.ValheimSeed.update(seed.id, { likes: (seed.likes || 0) + 1 });
      fetchSeeds();
    } catch { /* silent */ }
  };

  const diffColors = { facile: "#4ADE80", moyen: "#FBBF24", difficile: "#F87171", expert: "#9333EA" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Partagez et découvrez les meilleures seeds de cartes Valheim</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tap-sm transition"
          style={{ background: "linear-gradient(135deg, #4ADE80, #22C55E)", color: "#fff" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Partager
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitSeed} className="rounded-2xl p-4 space-y-3" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Code seed *" value={form.seed_code} onChange={(e) => setForm({ ...form, seed_code: e.target.value })} className="px-3 py-2 rounded-lg text-xs bg-transparent text-foreground" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }} />
            <input required placeholder="Titre *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg text-xs bg-transparent text-foreground" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }} />
          </div>
          <textarea placeholder="Description (points forts, ressources, boss proches...)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg text-xs bg-transparent text-foreground resize-none" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }} />
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Lieu de spawn" value={form.spawn_location} onChange={(e) => setForm({ ...form, spawn_location: e.target.value })} className="px-3 py-2 rounded-lg text-xs bg-transparent text-foreground" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }} />
            <input placeholder="Biomes (ex: Prairies, Marais)" value={form.biome_tags} onChange={(e) => setForm({ ...form, biome_tags: e.target.value })} className="px-3 py-2 rounded-lg text-xs bg-transparent text-foreground" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }} />
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="px-3 py-2 rounded-lg text-xs bg-transparent text-foreground" style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }}>
              <option value="facile">Facile</option>
              <option value="moyen">Moyen</option>
              <option value="difficile">Difficile</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 rounded-lg text-xs font-bold text-white transition" style={{ background: "linear-gradient(135deg, #4ADE80, #22C55E)" }}>
            Publier la seed
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : seeds.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground">Aucune seed partagée pour le moment. Soyez le premier !</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {seeds.map((seed) => (
            <div key={seed.id} className="rounded-xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground truncate">{seed.title}</h4>
                  <code className="text-[10px] text-muted-foreground font-mono">{seed.seed_code}</code>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase" style={{ background: `${diffColors[seed.difficulty]}22`, color: diffColors[seed.difficulty] }}>
                  {seed.difficulty}
                </span>
              </div>
              {seed.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{seed.description}</p>}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 flex-wrap">
                  {(seed.biome_tags || []).slice(0, 3).map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
                      <MapPin className="w-2.5 h-2.5" />{tag}
                    </span>
                  ))}
                </div>
                <button onClick={() => likeSeed(seed)} className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-red-400 transition tap-sm">
                  <Heart className="w-3 h-3" /> {seed.likes || 0}
                </button>
              </div>
              {seed.author_name && <p className="text-[9px] text-muted-foreground/50 mt-1">par {seed.author_name}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}