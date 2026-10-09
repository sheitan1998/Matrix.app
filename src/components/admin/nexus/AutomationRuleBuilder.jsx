import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit3, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const TRIGGERS = [
  { key: "member_join", label: "Membre rejoint" },
  { key: "member_leave", label: "Membre quitte" },
  { key: "message_sent", label: "Message envoyé" },
  { key: "role_assigned", label: "Rôle attribué" },
  { key: "boost_received", label: "Boost reçu" },
  { key: "channel_created", label: "Salon créé" },
  { key: "custom", label: "Personnalisé" },
];

const ACTIONS = [
  { key: "send_message", label: "Envoyer un message" },
  { key: "assign_role", label: "Attribuer un rôle" },
  { key: "toggle_permission", label: "Activer/désactiver une permission" },
  { key: "create_channel", label: "Créer un salon" },
  { key: "custom", label: "Personnalisé" },
];

export default function AutomationRuleBuilder({ accent }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ key: "", name: "", description: "", trigger_type: "member_join", action_type: "send_message", config: {} });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["nexus-automation-rules"],
    queryFn: async () => {
      const res = await base44.entities.NexusAutomationRule.filter({}, "sort_order", 200);
      return Array.isArray(res) ? res : res?.items || [];
    },
  });

  const resetForm = () => {
    setForm({ key: "", name: "", description: "", trigger_type: "member_join", action_type: "send_message", config: {} });
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
        await base44.entities.NexusAutomationRule.update(editingId, { ...form, key: cleanKey });
        toast.success("Règle mise à jour");
      } else {
        if (rules.some((r) => r.key === cleanKey)) {
          toast.error("Cette clé existe déjà");
          return;
        }
        await base44.entities.NexusAutomationRule.create({ ...form, key: cleanKey, sort_order: rules.length });
        toast.success("Règle d'automatisation créée");
      }
      qc.invalidateQueries({ queryKey: ["nexus-automation-rules"] });
      resetForm();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setForm({ key: r.key, name: r.name, description: r.description || "", trigger_type: r.trigger_type, action_type: r.action_type, config: r.config || {} });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.NexusAutomationRule.delete(id);
      qc.invalidateQueries({ queryKey: ["nexus-automation-rules"] });
      toast.success("Règle supprimée");
    } catch {
      toast.error("Suppression impossible");
    }
  };

  const toggleActive = async (r) => {
    await base44.entities.NexusAutomationRule.update(r.id, { is_active: !r.is_active });
    qc.invalidateQueries({ queryKey: ["nexus-automation-rules"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white">Règles d'Automatisation</h3>
          <p className="text-xs text-white/40">Créez et configurez des automatisations (messages de bienvenue, boutons interactifs, etc.)</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition tap-sm" style={{ background: accent }}>
            <Plus className="w-3.5 h-3.5" /> Nouvelle règle
          </button>
        )}
      </div>

      {showForm && (
        <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(168,85,247,0.05)", border: `1px solid ${accent}40` }}>
          <p className="text-xs font-bold text-white">{editingId ? "Modifier la règle" : "Créer une règle"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Clé technique</label>
              <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="ex: welcome_msg" disabled={!!editingId}
                className="w-full h-9 px-3 rounded-lg text-xs text-white font-mono outline-none disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Nom</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Message de bienvenue"
                className="w-full h-9 px-3 rounded-lg text-xs text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description de la règle"
              className="w-full h-9 px-3 rounded-lg text-xs text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Déclencheur</label>
              <select value={form.trigger_type} onChange={(e) => setForm({ ...form, trigger_type: e.target.value })}
                className="w-full h-9 px-3 rounded-lg text-xs text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {TRIGGERS.map((t) => <option key={t.key} value={t.key} className="bg-neutral-900">{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Action</label>
              <select value={form.action_type} onChange={(e) => setForm({ ...form, action_type: e.target.value })}
                className="w-full h-9 px-3 rounded-lg text-xs text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {ACTIONS.map((a) => <option key={a.key} value={a.key} className="bg-neutral-900">{a.label}</option>)}
              </select>
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
          {rules.map((r) => {
            const trig = TRIGGERS.find((t) => t.key === r.trigger_type);
            const act = ACTIONS.find((a) => a.key === r.action_type);
            return (
              <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <code className="text-[10px] font-mono text-white/40 shrink-0">{r.key}</code>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{r.name}</p>
                  {r.description && <p className="text-[10px] text-white/30 truncate">{r.description}</p>}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>{trig?.label || r.trigger_type}</span>
                    <span className="text-white/20">→</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc" }}>{act?.label || r.action_type}</span>
                  </div>
                </div>
                <button onClick={() => toggleActive(r)} className="shrink-0 tap-sm">
                  {r.is_active ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4 text-white/20" />}
                </button>
                <button onClick={() => handleEdit(r)} className="shrink-0 text-white/30 hover:text-white transition tap-sm"><Edit3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(r.id)} className="shrink-0 text-red-400/60 hover:text-red-400 transition tap-sm"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            );
          })}
          {rules.length === 0 && <p className="text-center text-xs text-white/30 py-6">Aucune règle. Créez-en une pour automatiser des actions.</p>}
        </div>
      )}
    </div>
  );
}