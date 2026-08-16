import React, { useState } from "react";
import { Upload, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FARMING_SIM_CATEGORIES } from "@/components/tuto-gaming/farmingSimData";
import { toast } from "sonner";

export default function AddWikiItemForm({ onSaved }) {
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [specSheetUrl, setSpecSheetUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingSpec, setUploadingSpec] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedCategory = FARMING_SIM_CATEGORIES.find((c) => c.id === category);

  const handleUpload = async (file, setUrl, setUploading) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUrl(file_url);
      toast.success("Image uploadée.");
    } catch {
      toast.error("Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !subCategory || !itemName || !thumbnailUrl || !specSheetUrl) {
      toast.error("Tous les champs obligatoires doivent être remplis.");
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.WikiEntry.create({
        game_id: "farming-simulator-25",
        game_slug: "farming-simulator-25",
        entry_type: "equipement",
        title: itemName,
        category,
        sub_category: subCategory,
        thumbnail_url: thumbnailUrl,
        spec_sheet_url: specSheetUrl,
        notes,
        description: notes,
      });
      toast.success("Élément ajouté au Wiki !");
      setCategory("");
      setSubCategory("");
      setItemName("");
      setThumbnailUrl("");
      setSpecSheetUrl("");
      setNotes("");
      if (onSaved) onSaved();
    } catch {
      toast.error("Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Catégorie parente</label>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setSubCategory(""); }}
            className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 focus:border-[#7DA627] outline-none"
            style={{ background: "#1a1a1a" }}>
            <option value="">— Sélectionner —</option>
            {FARMING_SIM_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Sous-catégorie</label>
          <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)}
            disabled={!selectedCategory || selectedCategory.cards.length === 0}
            className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 focus:border-[#7DA627] outline-none disabled:opacity-40"
            style={{ background: "#1a1a1a" }}>
            <option value="">— Sélectionner —</option>
            {selectedCategory?.cards.map((card) => (
              <option key={card.id} value={card.id}>{card.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Nom de l'élément</label>
        <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="ex: KUBOTA M7003…"
          className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 focus:border-[#7DA627] outline-none placeholder:text-white/20"
          style={{ background: "#1a1a1a" }} />
      </div>

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
                  <><Upload className="w-5 h-5 text-white/30 mb-1" /><span className="text-[10px] text-white/30">Cliquez pour uploader</span></>
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
                  <><Upload className="w-5 h-5 text-white/30 mb-1" /><span className="text-[10px] text-white/30">Cliquez pour uploader</span></>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files[0], setSpecSheetUrl, setUploadingSpec)} />
              </label>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Notes / Conseils (optionnel)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder="Notes personnelles, conseils de trade, astuces…"
          className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-[#7DA627] outline-none placeholder:text-white/20 resize-none"
          style={{ background: "#1a1a1a" }} />
      </div>

      <button type="submit" disabled={submitting}
        className="w-full h-11 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #7DA627, #5e8a1c)" }}>
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Ajouter au Wiki</>}
      </button>
    </form>
  );
}