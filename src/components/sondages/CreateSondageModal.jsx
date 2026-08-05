import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const CATEGORIES = [
  { id: "general", label: "Général" },
  { id: "youtube", label: "Youtube" },
  { id: "twitch", label: "Twitch" },
  { id: "nexus", label: "Nexus" },
  { id: "casino", label: "Nexus Game" },
  { id: "ai", label: "AI Studio" },
  { id: "outils", label: "Outils" },
  { id: "tuto-gaming", label: "Tuto Gaming" },
];

export default function CreateSondageModal({ onClose, onSubmit, editing, isProposal }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [choices, setChoices] = useState(["", ""]);
  const [category, setCategory] = useState("general");

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || "");
      setDescription(editing.description || "");
      setChoices(editing.choices?.length ? editing.choices.map(c => c.text) : ["", ""]);
      setCategory(editing.category || "general");
    }
  }, [editing]);

  const updateChoice = (i, val) => {
    const updated = [...choices];
    updated[i] = val;
    setChoices(updated);
  };

  const addChoice = () => setChoices([...choices, ""]);
  const removeChoice = (i) => choices.length > 2 && setChoices(choices.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    if (!title.trim()) return;
    const validChoices = choices.filter(c => c.trim()).map((text, i) => ({ id: (i + 1).toString(), text: text.trim() }));
    if (validChoices.length < 2) return;
    onSubmit({ title: title.trim(), description: description.trim(), choices: validChoices, category, is_proposal: isProposal || false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl p-6 max-h-[85vh] overflow-y-auto scrollbar-thin" style={{ background: "#13101a", border: "1px solid rgba(255,255,255,0.1)" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white">
            {editing ? "Modifier" : isProposal ? "Proposer une idée" : "Créer un sondage"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-white/60 mb-1 block">Catégorie d'univers</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition tap-sm"
                  style={{
                    background: category === c.id ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.03)",
                    border: category === c.id ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    color: category === c.id ? "#fff" : "rgba(255,255,255,0.4)",
                  }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-white/60 mb-1 block">Titre</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre du sondage" className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>
          <div>
            <label className="text-xs font-bold text-white/60 mb-1 block">Description / Question</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description du sondage..." rows={2} className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none resize-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>
          <div>
            <label className="text-xs font-bold text-white/60 mb-1 block">Choix de réponses (minimum 2)</label>
            <div className="space-y-2">
              {choices.map((choice, i) => (
                <div key={i} className="flex gap-2">
                  <input value={choice} onChange={e => updateChoice(i, e.target.value)} placeholder={`Choix ${i + 1}`} className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  {choices.length > 2 && (
                    <button onClick={() => removeChoice(i)} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 tap-sm" style={{ background: "rgba(239,68,68,0.1)" }}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addChoice} className="mt-2 flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white transition">
              <Plus className="w-3.5 h-3.5" /> Ajouter un choix
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/60" style={{ background: "rgba(255,255,255,0.05)" }}>Annuler</button>
          <button onClick={handleSubmit} disabled={!title.trim() || choices.filter(c => c.trim()).length < 2} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
            {editing ? "Modifier" : isProposal ? "Proposer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}