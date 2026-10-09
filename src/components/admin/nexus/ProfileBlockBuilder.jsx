import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit3, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const BLOCK_TYPES = [
  { key: "stats", label: "Statistiques" },
  { key: "badges", label: "Badges" },
  { key: "activity", label: "Activité" },
  { key: "roles", label: "Rôles" },
  { key: "custom_status", label: "Statut personnalisé" },
  { key: "dm_input", label: "Champ de message privé" },
  { key: "trophies", label: "Trophées" },
  { key: "friend_status", label: "Statut d'ami" },
  { key: "report_button", label: "Bouton de signalement" },
  { key: "custom", label: "Personnalisé" },
];

export default function ProfileBlockBuilder({ accent }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ key: "", name: "", description: "", block_type: "stats", is_visible: true });

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["nexus-profile-blocks"],
    queryFn: async () => {
      const res = await base44.entities.NexusProfileBlock.filter({}, "sort_order", 200);
      return Array.isArray(res) ? res : res?.items || [];
    },
  });

  const resetForm = () => {
    setForm({ key: "", name: "", description: "", block_type: "stats", is_visible: true });
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
        await base44.entities.NexusProfileBlock.update(editingId, { ...form, key: cleanKey });
        toast.success("Bloc mis à jour");
      } else {
        if (blocks.some((b) => b.key === cleanKey)) {
          toast.error("Cette clé existe déjà");
          return;
        }
        await base44.entities.NexusProfileBlock.create({ ...form, key: cleanKey, sort_order: blocks.length });
        toast.success("Bloc de profil créé");
      }
      qc.invalidateQueries({ queryKey: ["nexus-profile-blocks"] });
      resetForm();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setForm({ key: b.key, name: b.name, description: b.description || "", block_type: b.block_type, is_visible: b.is_visible });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.NexusProfileBlock.delete(id);
      qc.invalidateQueries({ queryKey: ["nexus-profile-blocks"] });
      toast.success("Bloc supprimé");
    } catch {
      toast.error("Suppression impossible");
    }
  };

  const toggleVisible = async (b) => {
    await base44.entities.NexusProfileBlock.update(b.id, { is_visible: !b.is_visible });
    qc.invalidateQueries({ queryKey: ["nexus-profile-blocks"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white">Blocs de Pop-up de Profil</h3>
          <p className="text-xs text-white/40">Définissez les blocs affichés dans les pop-ups de profil utilisateur à travers tous les serveurs.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition tap-sm" style={{ background: accent }}>
            <Plus className="w-3.5 h-3.5" /> Nouveau bloc
          </button>
        )}
      </div>

      {showForm && (
        <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(168,85,247,0.05)", border: `1px solid ${accent}40` }}>
          <p className="text-xs font-bold text-white">{editingId ? "Modifier le bloc" : "Créer un bloc"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Clé technique</label>
              <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="ex: show_trophies" disabled={!!editingId}
                className="w-full h-9 px-3 rounded-lg text-xs text-white font-mono outline-none disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Nom</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Trophées"
                className="w-full h-9 px-3 rounded-lg text-xs text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description du bloc"
              className="w-full h-9 px-3 rounded-lg text-xs text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase">Type de bloc</label>
            <select value={form.block_type} onChange={(e) => setForm({ ...form, block_type: e.target.value })}
              className="w-full h-9 px-3 rounded-lg text-xs text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {BLOCK_TYPES.map((b) => <option key={b.key} value={b.key} className="bg-neutral-900">{b.label}</option>)}
            </select>
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
          {blocks.map((b) => {
            const bt = BLOCK_TYPES.find((t) => t.key === b.block_type);
            return (
              <div key={b.id} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <code className="text-[10px] font-mono text-white/40 shrink-0">{b.key}</code>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{b.name}</p>
                  {b.description && <p className="text-[10px] text-white/30 truncate">{b.description}</p>}
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc" }}>{bt?.label || b.block_type}</span>
                <button onClick={() => toggleVisible(b)} className="shrink-0 tap-sm">
                  {b.is_visible ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4 text-white/20" />}
                </button>
                <button onClick={() => handleEdit(b)} className="shrink-0 text-white/30 hover:text-white transition tap-sm"><Edit3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(b.id)} className="shrink-0 text-red-400/60 hover:text-red-400 transition tap-sm"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            );
          })}
          {blocks.length === 0 && <p className="text-center text-xs text-white/30 py-6">Aucun bloc. Créez-en un pour configurer l'affichage des pop-ups de profil.</p>}
        </div>
      )}
    </div>
  );
}