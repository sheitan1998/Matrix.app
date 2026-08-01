import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const COLORS = [
  { name: "yellow", bg: "rgba(255,235,59,0.15)", border: "#FFEB3B", text: "#FFEB3B" },
  { name: "pink",   bg: "rgba(255,105,180,0.15)", border: "#FF69B4", text: "#FF69B4" },
  { name: "blue",  bg: "rgba(77,121,255,0.15)", border: "#4D79FF", text: "#4D79FF" },
  { name: "green", bg: "rgba(34,197,94,0.15)", border: "#22C55E", text: "#22C55E" },
  { name: "orange",bg: "rgba(255,165,0,0.15)", border: "#FFA500", text: "#FFA500" },
];

export default function StickyNotes({ onClose }) {
  const [notes, setNotes] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("matrix_sticky_notes");
    if (saved) {
      try { setNotes(JSON.parse(saved)); } catch {}
    } else {
      setNotes([{ id: 1, text: "Bienvenue dans les bloc-notes adhésifs !", color: 0 }]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("matrix_sticky_notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = (colorIdx = 0) => {
    const newNote = { id: Date.now(), text: "", color: colorIdx };
    setNotes([newNote, ...notes]);
    setEditing(newNote.id);
  };

  const updateNote = (id, text) => setNotes(notes.map(n => n.id === id ? { ...n, text } : n));
  const deleteNote = (id) => setNotes(notes.filter(n => n.id !== id));
  const changeColor = (id, colorIdx) => setNotes(notes.map(n => n.id === id ? { ...n, color: colorIdx } : n));

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-white">Bloc-notes Adhésifs</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => addNote()} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(77,121,255,0.15)" }}>
            <Plus className="w-4 h-4" style={{ color: "#4D79FF" }} />
          </button>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
        {notes.map((note) => {
          const c = COLORS[note.color] || COLORS[0];
          return (
            <div key={note.id} className="rounded-xl p-3 relative group" style={{ background: c.bg, border: `1.5px solid ${c.border}40` }}>
              <textarea
                value={note.text}
                onChange={(e) => updateNote(note.id, e.target.value)}
                onFocus={() => setEditing(note.id)}
                placeholder="Écris ta note..."
                className="w-full bg-transparent resize-none text-xs text-white placeholder-white/30 outline-none min-h-[80px]"
                style={{ caretColor: c.text }}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1">
                  {COLORS.map((col, i) => (
                    <button key={i} onClick={() => changeColor(note.id, i)}
                      className="w-4 h-4 rounded-full transition"
                      style={{ background: col.border, opacity: note.color === i ? 1 : 0.4, border: note.color === i ? "1.5px solid white" : "none" }} />
                  ))}
                </div>
                <button onClick={() => deleteNote(note.id)} className="opacity-0 group-hover:opacity-100 transition w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,77,77,0.15)" }}>
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
          );
        })}
        {notes.length === 0 && (
          <div className="col-span-2 text-center py-8 text-white/30 text-sm">
            Aucune note. Clique sur + pour en créer une.
          </div>
        )}
      </div>
    </div>
  );
}