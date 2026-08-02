import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Trash2, Edit3, FolderOpen, ArrowLeft, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ICONS = ["📝", "📓", "📔", "📒", "📕", "📗", "📘", "📙", "📋", "✏️", "📌", "🔖", "💡", "🎯", "⭐", "🔥"];
const COLORS = ["#4D79FF", "#8a4fff", "#FFD700", "#22C55E", "#FF4D4D", "#FF69B4", "#FFA500", "#06B6D4"];
const STORAGE_KEY = "matrix_notepad_files";

export default function NotepadManager({ onClose }) {
  const [notepads, setNotepads] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("custom");
  const [editingId, setEditingId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [customizingId, setCustomizingId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setNotepads(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notepads));
  }, [notepads]);

  const nowISO = () => new Date().toISOString();

  const createNotepad = () => {
    const np = {
      id: Date.now().toString(),
      name: "Nouveau bloc-notes",
      icon: "📝",
      color: "#4D79FF",
      content: "",
      created_at: nowISO(),
      updated_at: nowISO(),
      sort_order: notepads.length,
    };
    setNotepads([np, ...notepads]);
    setEditingId(np.id);
  };

  const deleteNotepad = (id) => setNotepads(notepads.filter(n => n.id !== id));

  const renameNotepad = (id, name) => {
    updateNotepad(id, { name });
    setRenamingId(null);
  };

  const updateNotepad = (id, updates) => {
    setNotepads(notepads.map(n => n.id === id ? { ...n, ...updates, updated_at: nowISO() } : n));
  };

  const updateContent = (id, content) => {
    setNotepads(notepads.map(n => n.id === id ? { ...n, content, updated_at: nowISO() } : n));
  };

  const onDragEnd = (result) => {
    if (!result.destination || sortBy !== "custom") return;
    const reordered = [...sortedNotepads];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const withOrder = reordered.map((n, i) => ({ ...n, sort_order: i }));
    setNotepads(withOrder);
  };

  const filtered = useMemo(() => {
    return notepads.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));
  }, [notepads, search]);

  const sortedNotepads = useMemo(() => {
    const result = [...filtered];
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "created") result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortBy === "updated") result.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    else result.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return result;
  }, [filtered, sortBy]);

  const editing = notepads.find(n => n.id === editingId);
  const customizing = notepads.find(n => n.id === customizingId);

  // ---- Editor view ----
  if (editing) {
    return (
      <div className="flex flex-col" style={{ height: "75vh" }}>
        <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => setEditingId(null)} className="text-white/60 hover:text-white transition tap-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xl">{editing.icon}</span>
          <input
            value={editing.name}
            onChange={(e) => updateNotepad(editing.id, { name: e.target.value })}
            className="flex-1 bg-transparent text-white font-bold text-base outline-none"
            style={{ borderBottom: "1px solid transparent", borderBottomColor: "rgba(255,255,255,0.1)" }}
          />
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition tap-sm">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
        <textarea
          value={editing.content}
          onChange={(e) => updateContent(editing.id, e.target.value)}
          placeholder="Commence à écrire..."
          className="flex-1 w-full bg-transparent text-white/90 placeholder-white/20 outline-none resize-none p-5 text-sm leading-relaxed font-mono scrollbar-thin"
          style={{ caretColor: editing.color }}
        />
        <div className="px-4 py-2 flex items-center justify-between text-[10px] text-white/50 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <span>Créé le {new Date(editing.created_at).toLocaleDateString("fr-FR")}</span>
          <span>Modifié le {new Date(editing.updated_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
    );
  }

  // ---- List view (file manager) ----
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-white">Mes blocs-notes</h3>
        <div className="flex items-center gap-2">
          <button onClick={createNotepad} className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-bold text-white transition tap-sm" style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <Plus className="w-3.5 h-3.5" /> Nouveau
          </button>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
          <Search className="w-3.5 h-3.5 text-white/50" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none" />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg text-xs text-white outline-none cursor-pointer" style={{ background: "rgba(255,255,255,0.04)", colorScheme: "dark" }}>
          <option value="custom">Personnalisé</option>
          <option value="updated">Modifié récemment</option>
          <option value="created">Créé récemment</option>
          <option value="name">Nom (A-Z)</option>
        </select>
      </div>

      {sortedNotepads.length === 0 ? (
        <div className="text-center py-12 text-white/50 text-sm">
          {search ? "Aucun résultat" : "Aucun bloc-notes. Cliquez sur 'Nouveau' pour en créer un."}
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="notepads" direction="horizontal">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-wrap gap-3 max-h-[50vh] overflow-y-auto scrollbar-thin pr-1">
                {sortedNotepads.map((np, index) => (
                  <Draggable key={np.id} draggableId={np.id} index={index} isDragDisabled={sortBy !== "custom"}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className="rounded-xl p-3 transition group"
                        style={{
                          background: `${np.color}0d`,
                          border: `1.5px solid ${np.color}30`,
                          width: "calc(50% - 0.375rem)",
                          ...dragProvided.draggableProps.style,
                          cursor: sortBy === "custom" ? "grab" : "default",
                          opacity: snapshot.isDragging ? 0.7 : 1,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <button onClick={(e) => { e.stopPropagation(); setCustomizingId(np.id); }} className="text-2xl" style={{ cursor: "pointer" }}>
                            {np.icon}
                          </button>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={(e) => { e.stopPropagation(); setEditingId(np.id); }} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${np.color}20` }} title="Ouvrir">
                              <FolderOpen className="w-3 h-3" style={{ color: np.color }} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Supprimer ce bloc-notes ?")) deleteNotepad(np.id); }} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }} title="Supprimer">
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>

                        {renamingId === np.id ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onBlur={() => renameNotepad(np.id, renameValue)}
                            onKeyDown={e => { if (e.key === "Enter") renameNotepad(np.id, renameValue); if (e.key === "Escape") setRenamingId(null); }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-xs font-bold text-white outline-none"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
                          />
                        ) : (
                          <p className="text-xs font-bold text-white truncate" style={{ cursor: "pointer" }} onClick={() => setEditingId(np.id)}>{np.name}</p>
                        )}

                        <p className="text-[10px] text-white/50 mt-1">
                          {new Date(np.updated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </p>

                        <button
                          onClick={(e) => { e.stopPropagation(); setRenamingId(np.id); setRenameValue(np.name); }}
                          className="text-[9px] text-white/40 hover:text-white flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Edit3 className="w-2.5 h-2.5" /> Renommer
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Customize (icon + color) */}
      {customizing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setCustomizingId(null)}>
          <div className="rounded-2xl p-5 w-full max-w-xs" style={{ background: "#13101a", border: "1px solid rgba(255,255,255,0.1)" }} onClick={e => e.stopPropagation()}>
            <h4 className="text-sm font-bold text-white mb-3">Personnaliser</h4>
            <p className="text-[10px] text-white/60 mb-1">Icône</p>
            <div className="grid grid-cols-8 gap-1 mb-3">
              {ICONS.map(ic => (
                <button key={ic} onClick={() => updateNotepad(customizing.id, { icon: ic })} className="w-7 h-7 rounded-lg flex items-center justify-center text-base transition" style={{ background: customizing.icon === ic ? `${customizing.color}30` : "rgba(255,255,255,0.05)", outline: customizing.icon === ic ? `2px solid ${customizing.color}` : "none" }}>
                  {ic}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/60 mb-1">Couleur</p>
            <div className="flex gap-2 mb-4">
              {COLORS.map(c => (
                <button key={c} onClick={() => updateNotepad(customizing.id, { color: c })} className="w-6 h-6 rounded-full transition" style={{ background: c, outline: customizing.color === c ? "2px solid white" : "none", outlineOffset: 1 }} />
              ))}
            </div>
            <button onClick={() => setCustomizingId(null)} className="w-full py-2 rounded-lg text-xs font-bold text-white" style={{ background: "rgba(34,197,94,0.2)" }}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}