import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit3, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

export default function GlobalExtensionBuilder({ accent }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ key: "", name: "", description: "", category: "Général" });

  const { data: extensions = [], isLoading } = useQuery({
    queryKey: ["nexus-global-extensions"],
    queryFn: async () => {
      const res = await base44.entities.NexusGlobalExtension.filter({}, "sort_order", 200);
      return Array.isArray(res) ? res : res?.items || [];
    },
  });

  const resetForm = () => {
    setForm({ key: "", name: "", description: "", category: "Général" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.key.trim() || !form.name.trim()) {
      toast.error("Clé et nom sont requis");
      return;
    }
    const cleanKey = form.key.trim().toLowerCase().replace(/\s+/g, "_");
    try {
      if (editingId) {
        await base44.entities.NexusGlobalExtension.update(editingId, { ...form, key: cleanKey });
        toast.success("Extension mise à jour");
      } else {
        if (extensions.some((e) => e.key === cleanKey)) {
          toast.error("Cette clé existe déjà");
          return;
        }
        await base44.entities.NexusGlobalExtension.create({ ...form, key: cleanKey, sort_order: extensions.length });
        toast.success("Extension globale créée");
      }
      qc.invalidateQueries({ queryKey: ["nexus-global-extensions"] });
      resetForm();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (e) => {
    setEditingId(e.id);
    setForm({ key: e.key, name: e.name, description: e.description || "", category: e.category || "Général" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.NexusGlobalExtension.delete(id);
      qc.invalidateQueries({ queryKey: ["nexus-global-extensions"] });
      toast.success("Extension supprimée");
    } catch {
      toast.error("Suppression impossible");
    }
  };

  const toggleActive = async (e) => {
    await base44.entities.NexusGlobalExtension.update(e.id, { is_active: !e.is_active });
    qc.invalidateQueries({ queryKey: ["nexus-global-extensions"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white">Extensions Globales</h3>
          <p className="text-xs text-white/40">Ajoutez des fonctionnalités sur mesure par catégorie de serveur. Liées instantanément en base de données.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition tap-sm" style={{ background: accent }}>
            <Plus className="w-3.5 h-3.5" /> Nouvelle extension
          </button>
        )}
      </div>

      {showForm && (
        <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(168,85,247,0.05)", border: `1px solid ${accent}40` }}>
          <p className="text-xs font-bold text-white">{editingId ? "Modifier l'extension" : "Créer une extension"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Clé technique</label>
              <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="ex: voice_recording" disabled={!!editingId}
                className="w-full h-9 px-3 rounded-lg text-xs text-white font-mono outline-none disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Nom</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enregistrement vocal"
                className="w-full h-9 px-3 rounded-lg text-xs text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description de l'extension"
                className="w-full h-9 px-3 rounded-lg text-xs text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Catégorie</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Gaming, Musique..."
                className="w-full h-9 px-3 rounded-lg text-xs text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white tap-sm" style={{ background: accent }}>
              <Check className="w-3.5 h-3.5 inline mr-1" /> {editingId ? "Mettre à jour" : "Créer"}
            </button>
            <button onClick={resetForm} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/40 hover:text-white transition tap-sm">
              <X className="w-3.5 h-3.5 inline mr-1" /> Annuler
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-3 border-white/10 rounded-full animate-spin" style={{ borderTopColor: accent }} />
        </div>
      ) : (
        <div className="space-y-1">
          {extensions.map((e) => (
            <div key={e.id} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <code className="text-[10px] font-mono text-white/40 shrink-0">{e.key}</code>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">{e.name}</p>
                {e.description && <p className="text-[10px] text-white/30 truncate">{e.description}</p>}
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>{e.category}</span>
              <button onClick={() => toggleActive(e)} className="shrink-0 tap-sm">
                {e.is_active ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4 text-white/20" />}
              </button>
              <button onClick={() => handleEdit(e)} className="shrink-0 text-white/30 hover:text-white transition tap-sm"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(e.id)} className="shrink-0 text-red-400/60 hover:text-red-400 transition tap-sm"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          {extensions.length === 0 && <p className="text-center text-xs text-white/30 py-6">Aucune extension. Ajoutez des fonctionnalités sur mesure par catégorie.</p>}
        </div>
      )}
    </div>
  );
}