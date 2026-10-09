import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const AVAILABLE_FEATURES = [
  "voice_channels",
  "forum_channels",
  "announce_channels",
  "custom_emojis",
  "custom_themes",
  "welcome_messages",
  "interactive_buttons",
  "screen_sharing",
  "voice_recording",
  "image_sharing",
  "message_effects",
  "polls",
  "events",
];

export default function CategoryExtensions({ config, onUpdate, accent }) {
  const extensions = config?.category_extensions || [];
  const [newCategory, setNewCategory] = useState("");

  const addCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    if (extensions.some((e) => e.category_name === name)) {
      toast.error("Cette catégorie existe déjà");
      return;
    }
    const updated = [...extensions, { id: makeId(), category_name: name, features: [], enabled: true }];
    onUpdate({ category_extensions: updated });
    setNewCategory("");
  };

  const removeCategory = (id) => {
    onUpdate({ category_extensions: extensions.filter((e) => e.id !== id) });
  };

  const toggleEnabled = (id) => {
    const updated = extensions.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e));
    onUpdate({ category_extensions: updated });
  };

  const toggleFeature = (catId, feature) => {
    const updated = extensions.map((e) => {
      if (e.id !== catId) return e;
      const has = (e.features || []).includes(feature);
      return { ...e, features: has ? e.features.filter((f) => f !== feature) : [...e.features, feature] };
    });
    onUpdate({ category_extensions: updated });
  };

  const renameCategory = (id, name) => {
    const updated = extensions.map((e) => (e.id === id ? { ...e, category_name: name } : e));
    onUpdate({ category_extensions: updated });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-black text-white mb-1">Extensions de Fonctionnalités par Catégorie</h3>
        <p className="text-xs text-white/40 mb-3">Ajoutez et configurez des fonctionnalités sur mesure par catégorie de serveur. Les modifications sont appliquées instantanément en base de données.</p>
      </div>

      {/* Add new category */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: "rgba(15,10,25,0.4)", border: "1px dashed rgba(255,255,255,0.1)" }}>
        <Plus className="w-3.5 h-3.5 text-white/30 shrink-0" />
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addCategory(); }}
          placeholder="Nom de la catégorie (ex: Gaming, Musique, Tech...)"
          className="flex-1 bg-transparent text-xs text-white placeholder:text-white/30 outline-none"
        />
        <button
          onClick={addCategory}
          disabled={!newCategory.trim()}
          className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white transition disabled:opacity-30 tap-sm"
          style={{ background: accent }}
        >
          Ajouter
        </button>
      </div>

      {/* Category list */}
      {extensions.length === 0 && (
        <p className="text-center text-xs text-white/30 py-6">Aucune catégorie configurée. Ajoutez-en une ci-dessus.</p>
      )}

      {extensions.map((ext) => (
        <div key={ext.id} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Category header */}
          <div className="flex items-center gap-2 p-3">
            <input
              value={ext.category_name}
              onChange={(e) => renameCategory(ext.id, e.target.value)}
              className="flex-1 bg-transparent text-sm font-bold text-white outline-none"
            />
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${ext.enabled ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}>
              {ext.enabled ? "ACTIF" : "INACTIF"}
            </span>
            <button
              onClick={() => toggleEnabled(ext.id)}
              className={`w-10 h-5 rounded-full transition shrink-0 ${ext.enabled ? "bg-green-500" : "bg-white/20"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${ext.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <button
              onClick={() => removeCategory(ext.id)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400/60 hover:text-red-400 transition tap-sm"
              style={{ background: "rgba(239,68,68,0.08)" }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* Features */}
          <div className="px-3 pb-3 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Fonctionnalités activées</p>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_FEATURES.map((f) => {
                const active = (ext.features || []).includes(f);
                return (
                  <button
                    key={f}
                    onClick={() => toggleFeature(ext.id, f)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                      active ? "text-white" : "text-white/30 hover:text-white/50"
                    }`}
                    style={active ? { background: accent + "15", borderColor: accent + "50" } : { borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    {f.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}