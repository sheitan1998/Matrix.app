import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, Loader2, X, Upload, Copy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const GAME_OPTIONS = [
  { slug: "farming-simulator-25", label: "Farming Simulator 25" },
  { slug: "dofus", label: "Dofus" },
  { slug: "camions", label: "Camions" },
  { slug: "global", label: "Global / Tous" },
];

const PAGE_OPTIONS = [
  { key: "hub", label: "Hub (page d'accueil)" },
  { key: "category", label: "Catégorie" },
  { key: "detail", label: "Fiche détaillée" },
  { key: "custom", label: "Personnalisé" },
];

const BLOCK_TYPES = [
  { value: "accordion", label: "Accordéon / Tiroir" },
  { value: "banner", label: "Bannière" },
  { value: "image", label: "Image" },
  { value: "text", label: "Bloc texte" },
  { value: "section", label: "Section / Titre" },
];

export default function BlockManager() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameSlug, setGameSlug] = useState("farming-simulator-25");
  const [pageKey, setPageKey] = useState("hub");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.PageBlock.filter(
        { game_slug: gameSlug, page_key: pageKey },
        "position",
        100
      );
      setBlocks(data);
    } catch {
      toast.error("Erreur lors du chargement des blocs.");
    } finally {
      setLoading(false);
    }
  }, [gameSlug, pageKey]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const handleDuplicate = async (block) => {
    try {
      await base44.entities.PageBlock.create({
        ...block,
        title: `${block.title} (copie)`,
      });
      delete block.id;
      toast.success("Bloc dupliqué.");
      fetchBlocks();
    } catch {
      toast.error("Erreur lors de la duplication.");
    }
  };

  const handleDelete = async (blockId) => {
    try {
      await base44.entities.PageBlock.delete(blockId);
      toast.success("Bloc supprimé.");
      fetchBlocks();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const handleReorder = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setBlocks(updated);
    try {
      await base44.entities.PageBlock.update(moved.id, { position: newIndex });
      await base44.entities.PageBlock.update(updated[index].id, { position: index });
    } catch {
      fetchBlocks();
    }
  };

  return (
    <div className="space-y-4">
      {/* Game + Page selectors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Jeu / Univers</label>
          <select value={gameSlug} onChange={(e) => setGameSlug(e.target.value)}
            className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none"
            style={{ background: "#1a1a1a" }}>
            {GAME_OPTIONS.map(g => <option key={g.slug} value={g.slug}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Page</label>
          <select value={pageKey} onChange={(e) => setPageKey(e.target.value)}
            className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none"
            style={{ background: "#1a1a1a" }}>
            {PAGE_OPTIONS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => { setEditing(null); setShowForm(true); }}
        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white border border-white/10 hover:bg-white/5 transition tap-sm"
      >
        <Plus className="w-4 h-4" /> Ajouter un bloc
      </button>

      {/* Blocks list */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
      ) : blocks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 py-8 text-center">
          <p className="text-xs text-white/30">Aucun bloc sur cette page pour ce jeu.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <div key={block.id} className="flex items-center gap-3 rounded-lg border border-white/5 px-4 py-3" style={{ background: "#1a1a1a" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase text-white/50" style={{ background: "rgba(255,255,255,0.05)" }}>
                    {block.block_type}
                  </span>
                  <p className="text-sm font-bold text-white truncate">{block.title}</p>
                </div>
                <p className="text-[10px] text-white/40 mt-0.5">
                  Col: {block.grid_col} · Span: {block.col_span || 12} · {block.is_collapsible ? "Repliable" : "Fixe"}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleReorder(index, -1)} disabled={index === 0} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20">↑</button>
                <button onClick={() => handleReorder(index, 1)} disabled={index === blocks.length - 1} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20">↓</button>
                <button onClick={() => handleDuplicate(block)} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-[#7DA627] hover:bg-white/10" title="Dupliquer">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setEditing(block); setShowForm(true); }} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-[#7DA627] hover:bg-white/10">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(block.id)} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-white/10">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BlockForm
          gameSlug={gameSlug}
          pageKey={pageKey}
          editing={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchBlocks(); }}
        />
      )}
    </div>
  );
}

function BlockForm({ gameSlug, pageKey, editing, onClose, onSaved }) {
  const [blockType, setBlockType] = useState(editing?.block_type || "accordion");
  const [title, setTitle] = useState(editing?.title || "");
  const [content, setContent] = useState(editing?.content || "");
  const [imageUrl, setImageUrl] = useState(editing?.image_url || "");
  const [linkUrl, setLinkUrl] = useState(editing?.link_url || "");
  const [colSpan, setColSpan] = useState(editing?.col_span || 12);
  const [gridCol, setGridCol] = useState(editing?.grid_col || 0);
  const [isCollapsible, setIsCollapsible] = useState(editing?.is_collapsible ?? true);
  const [defaultOpen, setDefaultOpen] = useState(editing?.default_open ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
      toast.success("Image uploadée.");
    } catch {
      toast.error("Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Le titre est requis."); return; }
    setSaving(true);
    try {
      const payload = {
        game_slug: gameSlug,
        page_key: pageKey,
        block_type: blockType,
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl,
        link_url: linkUrl.trim(),
        col_span: Number(colSpan),
        grid_col: Number(gridCol),
        is_collapsible: isCollapsible,
        default_open: defaultOpen,
        is_active: true,
      };
      if (editing) {
        await base44.entities.PageBlock.update(editing.id, payload);
        toast.success("Bloc modifié.");
      } else {
        payload.position = 999;
        await base44.entities.PageBlock.create(payload);
        toast.success("Bloc créé.");
      }
      onSaved();
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const needsImage = blockType === "banner" || blockType === "image" || blockType === "accordion";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10" style={{ background: "#0d0518" }} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between px-5 py-3 border-b border-white/10" style={{ background: "rgba(13,5,24,0.95)" }}>
          <h2 className="text-sm font-black text-white uppercase">{editing ? "Modifier le bloc" : "Nouveau bloc"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Type</label>
              <select value={blockType} onChange={e => setBlockType(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }}>
                {BLOCK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Largeur (colonnes)</label>
              <select value={colSpan} onChange={e => setColSpan(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }}>
                {[12, 6, 4, 3, 8].map(v => <option key={v} value={v}>{v}/12</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Titre</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Contenu / Texte</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 outline-none resize-none" style={{ background: "#1a1a1a" }} />
          </div>
          {needsImage && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Image</label>
              <div className="relative rounded-lg border border-dashed border-white/10 overflow-hidden" style={{ background: "#1a1a1a" }}>
                {imageUrl ? (
                  <div className="relative">
                    <img src={imageUrl} alt="" className="w-full h-32 object-contain" />
                    <button type="button" onClick={() => setImageUrl("")} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">✕</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin text-white/40" /> : <><Upload className="w-5 h-5 text-white/30 mb-1" /><span className="text-[10px] text-white/30">Uploader une image</span></>}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
                  </label>
                )}
              </div>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Lien (optionnel)</label>
            <input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none placeholder:text-white/20" style={{ background: "#1a1a1a" }} />
          </div>
          {blockType === "accordion" && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isCollapsible} onChange={e => setIsCollapsible(e.target.checked)} className="accent-[#7DA627]" />
                <span className="text-xs text-white/70">Repliable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={defaultOpen} onChange={e => setDefaultOpen(e.target.checked)} className="accent-[#7DA627]" />
                <span className="text-xs text-white/70">Ouvert par défaut</span>
              </label>
            </div>
          )}
          <button type="submit" disabled={saving} className="w-full h-11 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #7DA627, #5e8a1c)" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}