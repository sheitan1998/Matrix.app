import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Trash2, Pencil, Loader2, Save, Eye, Upload, GripVertical, FileText, Image as ImageIcon, ChevronDown, Square, Globe } from "lucide-react";
import { toast } from "sonner";
import BlockEditModal from "@/components/admin/BlockEditModal";

const BLOCK_TYPES = [
  { value: "text", label: "Texte riche", icon: FileText },
  { value: "accordion", label: "Accordéon", icon: ChevronDown },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "banner", label: "Bannière", icon: ImageIcon },
  { value: "section", label: "Titre de section", icon: Square },
];

export default function DynamicPageEditor({ page, onBack }) {
  const [meta, setMeta] = useState({
    title: page.title || "",
    slug: page.slug || "",
    description: page.description || "",
    status: page.status || "draft",
    seo_title: page.seo_title || "",
    seo_description: page.seo_description || "",
    background_type: page.background_type || "default",
  });
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [showAddBlock, setShowAddBlock] = useState(false);

  const fetchBlocks = useCallback(async () => {
    try {
      const data = await base44.entities.PageBlock.filter(
        { game_slug: "dynamic", page_key: page.slug },
        "position",
        200
      );
      setBlocks(data);
    } catch {
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, [page.slug]);

  useEffect(() => {
    fetchBlocks();
    const unsub = base44.entities.PageBlock.subscribe(() => fetchBlocks());
    return unsub;
  }, [fetchBlocks]);

  const handleSaveMeta = async (newStatus) => {
    if (!meta.title.trim()) { toast.error("Le titre est requis."); return; }
    if (!meta.slug.trim()) { toast.error("L'URL (slug) est requise."); return; }
    setSaving(true);
    try {
      if (meta.slug !== page.slug) {
        const existing = await base44.entities.DynamicPage.filter({ slug: meta.slug });
        if (existing.length > 0 && existing[0].id !== page.id) {
          toast.error("Une autre page utilise déjà cette URL.");
          return;
        }
        const oldBlocks = await base44.entities.PageBlock.filter({ game_slug: "dynamic", page_key: page.slug });
        for (const b of oldBlocks) {
          await base44.entities.PageBlock.update(b.id, { page_key: meta.slug });
        }
      }
      await base44.entities.DynamicPage.update(page.id, {
        title: meta.title.trim(),
        slug: meta.slug,
        description: meta.description.trim(),
        status: newStatus,
        seo_title: meta.seo_title.trim(),
        seo_description: meta.seo_description.trim(),
        background_type: meta.background_type,
      });
      toast.success(newStatus === "published" ? "Page publiée !" : "Brouillon enregistré.");
      setMeta(prev => ({ ...prev, status: newStatus }));
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlock = async (blockId) => {
    if (!confirm("Supprimer ce bloc ?")) return;
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

  const blockIcon = (type) => {
    const t = BLOCK_TYPES.find(b => b.value === type);
    return t ? t.icon : FileText;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:opacity-80 tap-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </button>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tight">Éditeur de page</h2>
            <p className="text-[10px] text-white/40">/page/{meta.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.open(`/page/${meta.slug}?preview=true`, "_blank")}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold text-white border border-white/10 hover:bg-white/5 transition tap-sm">
            <Eye className="w-3.5 h-3.5" /> Prévisualiser
          </button>
          <button onClick={() => handleSaveMeta("draft")} disabled={saving}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold text-white border border-white/10 hover:bg-white/5 transition tap-sm">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Brouillon
          </button>
          <button onClick={() => handleSaveMeta("published")} disabled={saving}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />} Publier
          </button>
        </div>
      </div>

      {/* Metadata form */}
      <div className="rounded-2xl border border-white/10 p-5 space-y-4" style={{ background: "rgba(15,10,25,0.6)" }}>
        <h3 className="text-[10px] font-black uppercase tracking-wider text-white/50">Informations de la page</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold uppercase text-white/50 mb-1">Titre</label>
            <input type="text" value={meta.title} onChange={e => setMeta(prev => ({ ...prev, title: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold uppercase text-white/50 mb-1">URL (slug)</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30 font-mono">/page/</span>
              <input type="text" value={meta.slug} onChange={e => setMeta(prev => ({ ...prev, slug: e.target.value }))}
                className="flex-1 h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none font-mono" style={{ background: "#1a1a1a" }} />
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-bold uppercase text-white/50 mb-1">Description</label>
            <textarea value={meta.description} onChange={e => setMeta(prev => ({ ...prev, description: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 outline-none resize-none" style={{ background: "#1a1a1a" }} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-white/50 mb-1">Titre SEO</label>
            <input type="text" value={meta.seo_title} onChange={e => setMeta(prev => ({ ...prev, seo_title: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-white/50 mb-1">Description SEO</label>
            <input type="text" value={meta.seo_description} onChange={e => setMeta(prev => ({ ...prev, seo_description: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
          </div>
        </div>
      </div>

      {/* Blocks section */}
      <div className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(15,10,25,0.6)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-white/50">Blocs de contenu ({blocks.length})</h3>
          <button onClick={() => { setEditingBlock(null); setShowAddBlock(true); }}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm"
            style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>
            <Plus className="w-3.5 h-3.5" /> Ajouter un bloc
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
        ) : blocks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-white/30">Aucun bloc. Cliquez sur "Ajouter un bloc" pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blocks.map((block, index) => {
              const Icon = blockIcon(block.block_type);
              return (
                <div key={block.id} className="flex items-center gap-3 rounded-lg border border-white/5 px-3 py-2.5" style={{ background: "#1a1a1a" }}>
                  <div className="flex flex-col">
                    <button onClick={() => handleReorder(index, -1)} disabled={index === 0} className="text-white/30 hover:text-white text-[10px] disabled:opacity-20">▲</button>
                    <button onClick={() => handleReorder(index, 1)} disabled={index === blocks.length - 1} className="text-white/30 hover:text-white text-[10px] disabled:opacity-20">▼</button>
                  </div>
                  <Icon className="w-4 h-4 text-white/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{block.title || "(sans titre)"}</p>
                    <p className="text-[9px] text-white/30 uppercase">{block.block_type} · {block.col_span || 12}/12 colonnes</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setEditingBlock(block); setShowAddBlock(false); }} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-[#a855f7] hover:bg-white/10">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteBlock(block.id)} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-white/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Block editor modal */}
      {showAddBlock && !editingBlock && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setShowAddBlock(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 p-5" style={{ background: "#0d0518" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-black text-white uppercase mb-4">Type de bloc</h3>
            <div className="space-y-2">
              {BLOCK_TYPES.map(bt => {
                const Icon = bt.icon;
                return (
                  <button key={bt.value} onClick={() => { setEditingBlock({ new: true, block_type: bt.value }); setShowAddBlock(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-bold text-white transition hover:bg-white/5 tap-sm" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Icon className="w-4 h-4 text-[#a855f7]" />
                    {bt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {editingBlock && (
        <BlockEditModal
          block={editingBlock.new ? null : editingBlock}
          blockType={editingBlock.new ? editingBlock.block_type : editingBlock.block_type}
          pageSlug={meta.slug}
          onClose={() => { setEditingBlock(null); setShowAddBlock(false); }}
          onSaved={() => { setEditingBlock(null); setShowAddBlock(false); fetchBlocks(); }}
        />
      )}
    </div>
  );
}