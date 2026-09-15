import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Upload, Trash2, Plus, Bold, Italic, List, Link2, Heading } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);
  const newValue = before + text + after;
  textarea.value = newValue;
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
  textarea.focus();
  return newValue;
}

export default function BlockEditModal({ block, blockType, pageSlug, onClose, onSaved }) {
  const [type] = useState(block?.block_type || blockType || "text");
  const [title, setTitle] = useState(block?.title || "");
  const [content, setContent] = useState(block?.content || "");
  const [imageUrl, setImageUrl] = useState(block?.image_url || "");
  const [linkUrl, setLinkUrl] = useState(block?.link_url || "");
  const [colSpan, setColSpan] = useState(block?.col_span || 12);
  const [isCollapsible, setIsCollapsible] = useState(block?.is_collapsible ?? true);
  const [defaultOpen, setDefaultOpen] = useState(block?.default_open ?? true);
  const [buttons, setButtons] = useState(block?.config?.buttons || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setImageUrl(file_url);
      toast.success("Image uploadée.");
    } catch {
      toast.error("Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const insertMarkdown = (syntax) => {
    if (!textareaRef.current) return;
    const newValue = insertAtCursor(textareaRef.current, syntax);
    setContent(newValue);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() && type !== "image" && type !== "banner") { toast.error("Le titre est requis."); return; }
    setSaving(true);
    try {
      const payload = {
        game_slug: "dynamic",
        page_key: pageSlug,
        block_type: type,
        title: title.trim(),
        content: content,
        image_url: imageUrl,
        link_url: linkUrl.trim(),
        col_span: Number(colSpan),
        grid_col: 0,
        is_collapsible: isCollapsible,
        default_open: defaultOpen,
        is_active: true,
        config: { buttons: buttons.filter(b => b.label && b.url) },
      };
      if (block) {
        await base44.entities.PageBlock.update(block.id, payload);
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

  const needsImage = type === "banner" || type === "image" || type === "accordion";
  const needsContent = type === "text" || type === "accordion" || type === "section";
  const showMarkdownToolbar = type === "text" || type === "accordion";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10" style={{ background: "#0d0518" }} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between px-5 py-3 border-b border-white/10 z-10" style={{ background: "rgba(13,5,24,0.95)" }}>
          <h2 className="text-sm font-black text-white uppercase">{block ? "Modifier le bloc" : "Nouveau bloc"} — {type}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Titre</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre du bloc"
              className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
          </div>

          {/* Content with markdown toolbar */}
          {needsContent && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">
                {type === "section" ? "Texte descriptif" : "Contenu (Markdown)"}
              </label>
              {showMarkdownToolbar && (
                <div className="flex items-center gap-1 mb-1.5 p-1 rounded-lg" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <button type="button" onClick={() => insertMarkdown("**gras**")} className="w-7 h-7 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 tap-sm" title="Gras"><Bold className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown("*italique*")} className="w-7 h-7 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 tap-sm" title="Italique"><Italic className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown("## Titre")} className="w-7 h-7 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 tap-sm" title="Titre"><Heading className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown("- ")} className="w-7 h-7 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 tap-sm" title="Liste"><List className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => insertMarkdown("[texte](https://...)")} className="w-7 h-7 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 tap-sm" title="Lien"><Link2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
              <textarea ref={textareaRef} value={content} onChange={e => setContent(e.target.value)}
                rows={type === "section" ? 2 : 6}
                placeholder={type === "section" ? "Description courte..." : "Écrivez votre contenu en Markdown..."}
                className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 outline-none resize-none font-mono" style={{ background: "#1a1a1a" }} />
              {showMarkdownToolbar && content && (
                <div className="mt-2 p-3 rounded-lg rich-text-content text-sm text-white/70 max-h-40 overflow-y-auto" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <ReactMarkdown breaks>{content}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Image */}
          {needsImage && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Image</label>
              <div className="relative rounded-lg border border-dashed border-white/10 overflow-hidden" style={{ background: "#1a1a1a" }}>
                {imageUrl ? (
                  <div className="relative">
                    <img src={imageUrl} alt="" className="w-full h-40 object-contain" />
                    <button type="button" onClick={() => setImageUrl("")} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">✕</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin text-white/40" /> : <><Upload className="w-5 h-5 text-white/30 mb-1" /><span className="text-[10px] text-white/30">Uploader une image</span></>}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Link */}
          {(type === "image" || type === "banner") && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Lien (optionnel)</label>
              <input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..."
                className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
            </div>
          )}

          {/* Accordion settings */}
          {type === "accordion" && (
            <>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isCollapsible} onChange={e => setIsCollapsible(e.target.checked)} className="accent-[#a855f7]" />
                  <span className="text-xs text-white/70">Repliable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={defaultOpen} onChange={e => setDefaultOpen(e.target.checked)} className="accent-[#a855f7]" />
                  <span className="text-xs text-white/70">Ouvert par défaut</span>
                </label>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Boutons d'action</label>
                {buttons.map((btn, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input type="text" value={btn.label || ""} onChange={e => { const b = [...buttons]; b[i] = { ...b[i], label: e.target.value }; setButtons(b); }} placeholder="Label"
                      className="flex-1 h-9 px-2 rounded-lg text-xs text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
                    <input type="text" value={btn.url || ""} onChange={e => { const b = [...buttons]; b[i] = { ...b[i], url: e.target.value }; setButtons(b); }} placeholder="https://..."
                      className="flex-1 h-9 px-2 rounded-lg text-xs text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }} />
                    <button type="button" onClick={() => setButtons(buttons.filter((_, idx) => idx !== i))} className="w-7 h-7 rounded flex items-center justify-center text-white/40 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setButtons([...buttons, { label: "", url: "" }])} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold text-white border border-white/10 hover:bg-white/5 transition tap-sm">
                  <Plus className="w-3.5 h-3.5" /> Ajouter un bouton
                </button>
              </div>
            </>
          )}

          {/* Layout */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-white/50 mb-1.5">Largeur (colonnes sur 12)</label>
            <select value={colSpan} onChange={e => setColSpan(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 outline-none" style={{ background: "#1a1a1a" }}>
              {[12, 6, 4, 3, 8].map(v => <option key={v} value={v}>{v}/12 {v === 12 ? "(pleine largeur)" : v === 6 ? "(demi)" : v === 4 ? "(tiers)" : v === 3 ? "(quart)" : "(deux-tiers)"}</option>)}
            </select>
          </div>

          <button type="submit" disabled={saving} className="w-full h-11 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}