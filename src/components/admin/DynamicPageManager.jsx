import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Pencil, Loader2, X, FileCode, Globe, Eye } from "lucide-react";
import { toast } from "sonner";
import DynamicPageEditor from "@/components/admin/DynamicPageEditor";

function slugify(text) {
  return text.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function DynamicPageManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.DynamicPage.list("-created_date", 200);
      setPages(data);
    } catch {
      toast.error("Erreur lors du chargement des pages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
    const unsub = base44.entities.DynamicPage.subscribe(() => fetchPages());
    return unsub;
  }, [fetchPages]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) { toast.error("Le titre est requis."); return; }
    const slug = slugify(newSlug || newTitle);
    setCreating(true);
    try {
      const existing = await base44.entities.DynamicPage.filter({ slug });
      if (existing.length > 0) { toast.error("Une page avec cette URL existe déjà."); return; }
      const page = await base44.entities.DynamicPage.create({
        title: newTitle.trim(),
        slug,
        status: "draft",
      });
      toast.success("Page créée en mode brouillon.");
      setShowCreate(false);
      setNewTitle("");
      setNewSlug("");
      fetchPages();
      setEditingPage(page);
    } catch {
      toast.error("Erreur lors de la création.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (page) => {
    if (!confirm(`Supprimer la page "${page.title}" et tous ses blocs ?`)) return;
    try {
      const blocks = await base44.entities.PageBlock.filter({ game_slug: "dynamic", page_key: page.slug });
      for (const b of blocks) {
        await base44.entities.PageBlock.delete(b.id);
      }
      await base44.entities.DynamicPage.delete(page.id);
      toast.success("Page supprimée.");
      fetchPages();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  if (editingPage) {
    return <DynamicPageEditor page={editingPage} onBack={() => { setEditingPage(null); fetchPages(); }} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-tight">Pages dynamiques</h2>
          <p className="text-[10px] text-white/40 mt-0.5">Créez et éditez des pages sans toucher au code</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm"
          style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
        >
          <Plus className="w-4 h-4" /> Nouvelle page
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
      ) : pages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 py-12 text-center">
          <FileCode className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">Aucune page pour le moment.</p>
          <p className="text-[10px] text-white/20 mt-1">Cliquez sur "Nouvelle page" pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center gap-3 rounded-lg border border-white/5 px-4 py-3" style={{ background: "#1a1a1a" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${page.status === "published" ? "text-green-400" : "text-yellow-400"}`}
                    style={{ background: page.status === "published" ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)" }}>
                    {page.status === "published" ? "En ligne" : "Brouillon"}
                  </span>
                  <p className="text-sm font-bold text-white truncate">{page.title}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Globe className="w-3 h-3 text-white/30" />
                  <span className="text-[10px] text-white/40 font-mono">/page/{page.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {page.status === "published" && (
                  <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer"
                    className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-blue-400 hover:bg-white/10" title="Voir">
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                )}
                <button onClick={() => setEditingPage(page)} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-[#a855f7] hover:bg-white/10" title="Éditer">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(page)} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-white/10" title="Supprimer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10" style={{ background: "#0d0518" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <h2 className="text-sm font-black text-white uppercase">Nouvelle page</h2>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Titre de la page</label>
                <input type="text" value={newTitle} onChange={e => { setNewTitle(e.target.value); setNewSlug(slugify(e.target.value)); }}
                  placeholder="Ex: Conditions d'utilisation" autoFocus
                  className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">URL (slug)</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30 font-mono">/page/</span>
                  <input type="text" value={newSlug} onChange={e => setNewSlug(slugify(e.target.value))}
                    placeholder="conditions-utilisation"
                    className="flex-1 h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none font-mono" style={{ background: "#1a1a1a" }} />
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.15)" }}>
                <span className="text-[10px] text-yellow-400/80">La page sera créée en mode brouillon. Vous pourrez la publier après édition.</span>
              </div>
              <button type="submit" disabled={creating} className="w-full h-11 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Créer la page
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}