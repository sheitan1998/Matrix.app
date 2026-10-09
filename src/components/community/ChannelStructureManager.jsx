import React, { useState } from "react";
import {
  Hash, Volume2, MessageSquare, Folder, Plus, Trash2, Edit3,
  ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Check, X, ArrowUp, ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CHANNEL_TYPES = [
  { key: "text", icon: Hash, label: "Textuel", color: "#3b82f6" },
  { key: "voice", icon: Volume2, label: "Vocal", color: "#10b981" },
  { key: "forum", icon: MessageSquare, label: "Forum", color: "#f59e0b" },
];

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function ChannelStructureManager({ server, theme, channels = [], onUpdate, accent }) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newChannel, setNewChannel] = useState({}); // { categoryId: { name, type } }
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [collapsedCats, setCollapsedCats] = useState({});

  const rawChannels = channels?.length ? channels : [];
  const categories = rawChannels.filter((c) => c.type === "category");
  const uncategorized = rawChannels.filter((c) => c.type !== "category" && !c.category_id);

  const getChannelsForCategory = (catId) => rawChannels.filter((c) => c.category_id === catId);

  const toggleCat = (catId) => setCollapsedCats((p) => ({ ...p, [catId]: !p[catId] }));

  // --- Category CRUD ---
  const createCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const cat = { id: makeId(), name: name.toLowerCase().replace(/\s+/g, "-"), type: "category" };
    onUpdate({ channels: [...rawChannels, cat] });
    setNewCategoryName("");
    toast.success("Catégorie créée");
  };

  const renameChannel = (id, newName) => {
    const updated = rawChannels.map((c) =>
      c.id === id ? { ...c, name: newName.toLowerCase().replace(/\s+/g, "-") } : c
    );
    onUpdate({ channels: updated });
    setEditingId(null);
    toast.success("Renommé");
  };

  const deleteChannel = (id) => {
    const ch = rawChannels.find((c) => c.id === id);
    if (!ch) return;
    const isCat = ch.type === "category";
    if (isCat) {
      // Move children to uncategorized
      const updated = rawChannels
        .filter((c) => c.id !== id)
        .map((c) => (c.category_id === id ? { ...c, category_id: null } : c));
      onUpdate({ channels: updated });
    } else {
      onUpdate({ channels: rawChannels.filter((c) => c.id !== id) });
    }
    toast.success(isCat ? "Catégorie supprimée" : "Salon supprimé");
  };

  const toggleVisibility = (id) => {
    const updated = rawChannels.map((c) => {
      if (c.id !== id) return c;
      const isVisible = c.settings?.visible !== false;
      return { ...c, settings: { ...(c.settings || {}), visible: !isVisible } };
    });
    onUpdate({ channels: updated });
  };

  const createChannelInCategory = (catId) => {
    const draft = newChannel[catId] || { name: "", type: "text" };
    if (!draft.name?.trim()) return;
    const type = CHANNEL_TYPES.find((t) => t.key === draft.type) || CHANNEL_TYPES[0];
    const ch = {
      id: makeId(),
      name: draft.name.trim().toLowerCase().replace(/\s+/g, "-"),
      type: type.key,
      category_id: catId,
      topic: "",
      permissions: { read: "everyone", write: "everyone" },
      settings: { visible: true, send_messages: true },
    };
    onUpdate({ channels: [...rawChannels, ch] });
    setNewChannel((p) => ({ ...p, [catId]: { name: "", type: "text" } }));
    toast.success("Salon créé");
  };

  const createUncategorizedChannel = () => {
    const draft = newChannel["_uncat"] || { name: "", type: "text" };
    if (!draft.name?.trim()) return;
    const type = CHANNEL_TYPES.find((t) => t.key === draft.type) || CHANNEL_TYPES[0];
    const ch = {
      id: makeId(),
      name: draft.name.trim().toLowerCase().replace(/\s+/g, "-"),
      type: type.key,
      category_id: null,
      topic: "",
      permissions: { read: "everyone", write: "everyone" },
      settings: { visible: true, send_messages: true },
    };
    onUpdate({ channels: [...rawChannels, ch] });
    setNewChannel((p) => ({ ...p, _uncat: { name: "", type: "text" } }));
    toast.success("Salon créé");
  };

  // --- Reorder ---
  const moveChannel = (id, direction) => {
    const idx = rawChannels.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= rawChannels.length) return;
    const updated = [...rawChannels];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    onUpdate({ channels: updated });
  };

  const moveCategory = (id, direction) => {
    const catIds = categories.map((c) => c.id);
    const idx = catIds.indexOf(id);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= catIds.length) return;
    // Swap the two category positions in the rawChannels array
    const catA = categories[idx];
    const catB = categories[targetIdx];
    const aIdx = rawChannels.findIndex((c) => c.id === catA.id);
    const bIdx = rawChannels.findIndex((c) => c.id === catB.id);
    const updated = [...rawChannels];
    const [moved] = updated.splice(aIdx, 1);
    updated.splice(bIdx, 0, moved);
    onUpdate({ channels: updated });
  };

  const renderChannelRow = (ch, isLast) => (
    <div key={ch.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 group">
      {ch.type === "text" ? <Hash className="w-3.5 h-3.5 shrink-0" style={{ color: "#3b82f6" }} /> :
       ch.type === "voice" ? <Volume2 className="w-3.5 h-3.5 shrink-0" style={{ color: "#10b981" }} /> :
       <MessageSquare className="w-3.5 h-3.5 shrink-0" style={{ color: "#f59e0b" }} />}
      {editingId === ch.id ? (
        <input
          autoFocus
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") renameChannel(ch.id, editName);
            if (e.key === "Escape") setEditingId(null);
          }}
          className="flex-1 h-6 px-2 text-xs rounded outline-none text-white"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
      ) : (
        <span className="flex-1 text-xs text-white/80 truncate">{ch.name}</span>
      )}
      {/* Visibility */}
      <button
        onClick={() => toggleVisibility(ch.id)}
        className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-white shrink-0"
        title={ch.settings?.visible !== false ? "Cacher le salon" : "Afficher le salon"}
      >
        {ch.settings?.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      </button>
      {/* Reorder */}
      <div className="flex opacity-0 group-hover:opacity-100 transition shrink-0">
        <button onClick={() => moveChannel(ch.id, -1)} className="text-muted-foreground hover:text-white"><ArrowUp className="w-3 h-3" /></button>
        <button onClick={() => moveChannel(ch.id, 1)} className="text-muted-foreground hover:text-white"><ArrowDown className="w-3 h-3" /></button>
      </div>
      {/* Rename */}
      {editingId === ch.id ? (
        <button onClick={() => renameChannel(ch.id, editName)} className="text-green-400 shrink-0"><Check className="w-3 h-3" /></button>
      ) : (
        <button
          onClick={() => { setEditingId(ch.id); setEditName(ch.name); }}
          className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-white shrink-0"
        >
          <Edit3 className="w-3 h-3" />
        </button>
      )}
      {/* Delete */}
      <button
        onClick={() => deleteChannel(ch.id)}
        className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-red-400 shrink-0"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );

  const renderNewChannelForm = (catId, placeholder) => {
    const draft = newChannel[catId] || { name: "", type: "text" };
    return (
      <div className="flex items-center gap-1.5 px-2 py-1">
        <select
          value={draft.type}
          onChange={(e) => setNewChannel((p) => ({ ...p, [catId]: { ...draft, type: e.target.value } }))}
          className="h-6 px-1 rounded text-[10px] bg-white/5 text-white outline-none border border-white/10"
        >
          {CHANNEL_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <input
          value={draft.name || ""}
          onChange={(e) => setNewChannel((p) => ({ ...p, [catId]: { ...draft, name: e.target.value } }))}
          onKeyDown={(e) => e.key === "Enter" && (catId === "_uncat" ? createUncategorizedChannel() : createChannelInCategory(catId))}
          placeholder={placeholder}
          className="flex-1 h-6 px-2 text-[11px] rounded outline-none text-white placeholder:text-white/20"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        />
        <button
          onClick={() => catId === "_uncat" ? createUncategorizedChannel() : createChannelInCategory(catId)}
          className="w-6 h-6 rounded flex items-center justify-center text-black shrink-0"
          style={{ background: accent }}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Structure du serveur</p>
        <p className="text-xs text-muted-foreground">Créez, renommez, réordonnez et supprimez les catégories et salons. Gérez leur visibilité.</p>
      </div>

      {/* Create category */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl border" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.03)" }}>
        <Folder className="w-4 h-4 shrink-0" style={{ color: "#8b5cf6" }} />
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createCategory()}
          placeholder="nouvelle-categorie"
          className="flex-1 h-7 px-2 text-xs rounded outline-none text-white placeholder:text-white/20"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        />
        <button
          onClick={createCategory}
          disabled={!newCategoryName.trim()}
          className="h-7 px-3 rounded-lg text-xs font-bold text-black flex items-center gap-1 disabled:opacity-40"
          style={{ background: accent }}
        >
          <Plus className="w-3 h-3" /> Catégorie
        </button>
      </div>

      {/* Categories list */}
      {categories.map((cat, catIdx) => {
        const catChannels = getChannelsForCategory(cat.id);
        const isCollapsed = collapsedCats[cat.id];
        return (
          <div key={cat.id} className="rounded-xl border overflow-hidden" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center gap-2 px-3 py-2 group" style={{ background: "rgba(139,92,246,0.05)" }}>
              <button onClick={() => toggleCat(cat.id)} className="text-muted-foreground hover:text-white">
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <Folder className="w-3.5 h-3.5" style={{ color: "#8b5cf6" }} />
              {editingId === cat.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") renameChannel(cat.id, editName); if (e.key === "Escape") setEditingId(null); }}
                  className="flex-1 h-6 px-2 text-xs rounded outline-none text-white"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              ) : (
                <span className="flex-1 text-xs font-bold uppercase tracking-wide text-white/70 truncate">{cat.name}</span>
              )}
              <span className="text-[9px] text-muted-foreground">{catChannels.length} salon{catChannels.length > 1 ? "s" : ""}</span>
              <div className="flex opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => moveCategory(cat.id, -1)} className="text-muted-foreground hover:text-white"><ArrowUp className="w-3 h-3" /></button>
                <button onClick={() => moveCategory(cat.id, 1)} className="text-muted-foreground hover:text-white"><ArrowDown className="w-3 h-3" /></button>
              </div>
              {editingId === cat.id ? (
                <button onClick={() => renameChannel(cat.id, editName)} className="text-green-400"><Check className="w-3 h-3" /></button>
              ) : (
                <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-white"><Edit3 className="w-3 h-3" /></button>
              )}
              <button onClick={() => deleteChannel(cat.id)} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
            </div>
            {!isCollapsed && (
              <div className="px-2 pb-2 space-y-0.5">
                {catChannels.map((ch) => renderChannelRow(ch))}
                {catChannels.length === 0 && <p className="text-[10px] text-muted-foreground/50 px-2 py-1">Aucun salon dans cette catégorie</p>}
                {renderNewChannelForm(cat.id, "Ajouter un salon...")}
              </div>
            )}
          </div>
        );
      })}

      {/* Uncategorized channels */}
      {uncategorized.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.02)" }}>
          <div className="px-3 py-2 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Salons sans catégorie</span>
          </div>
          <div className="px-2 pb-2 space-y-0.5">
            {uncategorized.map((ch) => renderChannelRow(ch))}
          </div>
        </div>
      )}

      {/* Add uncategorized channel */}
      {categories.length === 0 && uncategorized.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">Aucun salon. Créez une catégorie ou un salon ci-dessus.</p>
      )}
      <div className="rounded-xl border p-2" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.02)" }}>
        {renderNewChannelForm("_uncat", "Nouveau salon sans catégorie...")}
      </div>
    </div>
  );
}