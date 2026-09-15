import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FARMING_SIM_CATEGORIES } from "@/components/tuto-gaming/farmingSimData";
import { toast } from "sonner";

export default function WikiItemEditModal({ item, onClose, onSaved }) {
  const [category, setCategory] = useState(item.category || "");
  const [subCategory, setSubCategory] = useState(item.sub_category || "");
  const [itemName, setItemName] = useState(item.title || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(item.thumbnail_url || item.image_url || "");
  const [specSheetUrl, setSpecSheetUrl] = useState(item.spec_sheet_url || "");
  const [notes, setNotes] = useState(item.notes || item.description || "");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingSpec, setUploadingSpec] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedCategory = FARMING_SIM_CATEGORIES.find((c) => c.id === category);

  const handleUpload = async (file, setUrl, setUploading) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setUrl(file_url);
      toast.success("Image uploadée.");
    } catch {
      toast.error("Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!category || !subCategory || !itemName || !thumbnailUrl || !specSheetUrl) {
      toast.error("Tous les champs obligatoires doivent être remplis.");
      return;
    }
    setSaving(true);
    try {
      await base44.entities.WikiEntry.update(item.id, {
        title: itemName,
        category,
        sub_category: subCategory,
        thumbnail_url: thumbnailUrl,
        spec_sheet_url: specSheetUrl,
        notes,
        description: notes,
      });
      toast.success("Élément modifié avec succès !");
      onSaved();
    } catch {
      toast.error("Erreur lors de la modification.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10"
        style={{ background: "#0d0518" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-white/10" style={{ background: "rgba(13,5,24,0.95)", backdropFilter: "blur(12px)" }}>
          <h2 className="text-sm font-black text-white uppercase tracking-tight">Modifier l'élément</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Category + Sub-category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Catégorie parente</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSubCategory(""); }}
                className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 focus:border-[#7DA627] outline-none"
                style={{ background: "#1a1a1a" }}
              >
                <option value="">— Sélectionner —</option>
                {FARMING_SIM_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Sous-catégorie</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={!selectedCategory || selectedCategory.cards.length === 0}
                className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 focus:border-[#7DA627] outline-none disabled:opacity-40"
                style={{ background: "#1a1a1a" }}
              >
                <option value="">— Sélectionner —</option>
                {selectedCategory?.cards.map((card) => (
                  <option key={card.id} value={card.id}>{card.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Item name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Nom de l'élément</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 focus:border-[#7DA627] outline-none"
              style={{ background: "#1a1a1a" }}
            />
          </div>

          {/* Upload zones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Image Vignette / Menu</label>
              <div className="relative rounded-lg border border-dashed border-white/10 overflow-hidden" style={{ background: "#1a1a1a" }}>
                {thumbnailUrl ? (
                  <div className="relative">
                    <img src={thumbnailUrl} alt="Vignette" className="w-full h-36 object-contain" />
                    <button type="button" onClick={() => setThumbnailUrl("")} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-red-500/80">✕</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 cursor-pointer hover:border-[#7DA627] transition">
                    {uploadingThumb ? <Loader2 className="w-5 h-5 animate-spin text-white/40" /> : (
                      <><Upload className="w-5 h-5 text-white/30 mb-1" /><span className="text-[10px] text-white/30">Remplacer l'image</span></>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files[0], setThumbnailUrl, setUploadingThumb)} />
                  </label>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Image Fiche Technique</label>
              <div className="relative rounded-lg border border-dashed border-white/10 overflow-hidden" style={{ background: "#1a1a1a" }}>
                {specSheetUrl ? (
                  <div className="relative">
                    <img src={specSheetUrl} alt="Fiche technique" className="w-full h-36 object-contain" />
                    <button type="button" onClick={() => setSpecSheetUrl("")} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-red-500/80">✕</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 cursor-pointer hover:border-[#7DA627] transition">
                    {uploadingSpec ? <Loader2 className="w-5 h-5 animate-spin text-white/40" /> : (
                      <><Upload className="w-5 h-5 text-white/30 mb-1" /><span className="text-[10px] text-white/30">Remplacer l'image</span></>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files[0], setSpecSheetUrl, setUploadingSpec)} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Notes / Conseils (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-[#7DA627] outline-none resize-none"
              style={{ background: "#1a1a1a" }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full h-11 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7DA627, #5e8a1c)" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Enregistrer les modifications</>}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}