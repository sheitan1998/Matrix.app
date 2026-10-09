import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit3, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Général", "Membres", "Messages", "Vocal", "Modération", "Salons", "Rôles", "Invitations"];

export default function PermissionBuilder({ accent }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ key: "", label: "", description: "", category: "Général", default_value: false, highlight: false });

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["nexus-permissions"],
    queryFn: async () => {
      const res = await base44.entities.NexusPermission.filter({}, "sort_order", 200);
      return Array.isArray(res) ? res : res?.items || [];
    },
  });

  const resetForm = () => {
    setForm({ key: "", label: "", description: "", category: "Général", default_value: false, highlight: false });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.key.trim() || !form.label.trim()) {
      toast.error("Clé et nom sont requis");
      return;
    }
    const cleanKey = form.key.trim().toLowerCase().replace(/\s+/g, "_");
    try {
      if (editingId) {
        await base44.entities.NexusPermission.update(editingId, { ...form, key: cleanKey });
        toast.success("Permission mise à jour");
      } else {
        if (permissions.some((p) => p.key === cleanKey)) {
          toast.error("Cette clé existe déjà");
          return;
        }
        await base44.entities.NexusPermission.create({ ...form, key: cleanKey, sort_order: permissions.length });
        toast.success("Permission créée — ajoutée automatiquement à la matrice des rôles");
      }
      qc.invalidateQueries({ queryKey: ["nexus-permissions"] });
      resetForm();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({ key: p.key, label: p.label, description: p.description || "", category: p.category || "Général", default_value: p.default_value, highlight: p.highlight });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.NexusPermission.delete(id);
      qc.invalidateQueries({ queryKey: ["nexus-permissions"] });
      toast.success("Permission supprimée — retirée de tous les rôles");
    } catch {
      toast.error("Suppression impossible");
    }
  };

  const toggleActive = async (p) => {
    await base44.entities.NexusPermission.update(p.id, { is_active: !p.is_active });
    qc.invalidateQueries({ queryKey: ["nexus-permissions"] });
  };

  // Group by category
  const categoryMap = {};
  for (const p of permissions) {
    const cat = p.category || "Général";
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(p);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white">Permissions Dynamiques</h3>
          <p className="text-xs text-white/40">Créez des permissions de toutes pièces. Elles s'ajoutent automatiquement à la matrice des rôles et des salons.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition tap-sm" style={{ background: accent }}>
            <Plus className="w-3.5 h-3.5" /> Nouvelle permission
          </button>
        )}
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(168,85,247,0.05)", border: `1px solid ${accent}40` }}>
          <p className="text-xs font-bold text-white">{editingId ? "Modifier la permission" : "Créer une permission"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Clé technique</label>
              <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="ex: can_fly" disabled={!!editingId}
                className="w-full h-9 px-3 rounded-lg text-xs text-white font-mono outline-none disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Nom affiché</label>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="ex: Autoriser le vol"
                className="w-full h-9 px-3 rounded-lg text-xs text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description de la permission"
              className="w-full h-9 px-3 rounded-lg text-xs text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <div className="flex items-center gap-4">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-9 px-3 rounded-lg text-xs text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {CATEGORIES.map((c) => <option key={c} value={c} className="bg-neutral-900">{c}</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-xs text-white/60">
              <button onClick={() => setForm({ ...form, default_value: !form.default_value })}
                className={`w-9 h-4 rounded-full transition ${form.default_value ? "bg-green-500" : "bg-white/20"}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${form.default_value ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              Activée par défaut
            </label>
            <label className="flex items-center gap-1.5 text-xs text-white/60">
              <button onClick={() => setForm({ ...form, highlight: !form.highlight })}
                className={`w-9 h-4 rounded-full transition ${form.highlight ? "bg-red-500" : "bg-white/20"}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${form.highlight ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              Mettre en évidence
            </label>
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

      {/* Permission list grouped by category */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-3 border-white/10 rounded-full animate-spin" style={{ borderTopColor: accent }} />
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(categoryMap).map(([cat, perms]) => (
            <div key={cat}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{cat} ({perms.length})</p>
              <div className="space-y-1">
                {perms.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <code className="text-[10px] font-mono text-white/40 shrink-0">{p.key}</code>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${p.highlight ? "text-red-400" : "text-white"}`}>{p.label}</p>
                      {p.description && <p className="text-[10px] text-white/30 truncate">{p.description}</p>}
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: p.default_value ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)", color: p.default_value ? "#22c55e" : "#888" }}>
                      {p.default_value ? "VRAI" : "FAUX"}
                    </span>
                    <button onClick={() => toggleActive(p)} className="shrink-0 tap-sm" title={p.is_active ? "Désactiver" : "Activer"}>
                      {p.is_active ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4 text-white/20" />}
                    </button>
                    <button onClick={() => handleEdit(p)} className="shrink-0 text-white/30 hover:text-white transition tap-sm">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="shrink-0 text-red-400/60 hover:text-red-400 transition tap-sm">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {permissions.length === 0 && (
            <p className="text-center text-xs text-white/30 py-6">Aucune permission. Cliquez sur "Nouvelle permission" pour en créer une.</p>
          )}
        </div>
      )}
    </div>
  );
}