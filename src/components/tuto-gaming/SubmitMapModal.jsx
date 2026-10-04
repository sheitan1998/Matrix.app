import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Upload, ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_OPTIONS, validateMapCode, formatMapCode } from "@/components/tuto-gaming/fortniteMapsData";
import { uploadImageWithToast } from "@/lib/imageModeration";
import CreatorAgreementCheckbox from "@/components/tuto-gaming/CreatorAgreementCheckbox";

export default function SubmitMapModal({ open, onClose, onSuccess, userEmail, editMap }) {
  const isEdit = !!editMap;
  const [form, setForm] = useState({
    title: "",
    creator_name: "",
    map_code: "",
    category: "tycoon",
    description: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Pre-fill form when editing an existing map
  useEffect(() => {
    if (editMap) {
      setForm({
        title: editMap.title || "",
        creator_name: editMap.creator_name || "",
        map_code: editMap.map_code || "",
        category: editMap.category || "tycoon",
        description: editMap.description || "",
      });
      setExistingGallery(editMap.gallery || (editMap.image_url ? [editMap.image_url] : []));
      setImageFiles([]);
    } else {
      setForm({ title: "", creator_name: "", map_code: "", category: "tycoon", description: "" });
      setExistingGallery([]);
      setImageFiles([]);
      setAgreed(false);
    }
  }, [editMap, open]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleMapCodeChange = (e) => {
    setForm((f) => ({ ...f, map_code: formatMapCode(e.target.value) }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx) => {
    setExistingGallery((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.creator_name.trim() || !form.map_code.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (!validateMapCode(form.map_code)) {
      toast.error("Format du code invalide (ex: 1234-5678-9012)");
      return;
    }

    setSubmitting(true);
    try {
      const normalizedCode = form.map_code.trim().toUpperCase();

      // Check map code uniqueness (skip if unchanged in edit mode)
      if (!isEdit || normalizedCode !== (editMap.map_code || "").toUpperCase()) {
        const existing = await base44.entities.FortniteMap.filter({ map_code: normalizedCode }, "-created_date", 5);
        const conflict = (existing?.items || existing || []).filter((m) => m.id !== editMap?.id);
        if (conflict.length > 0) {
          toast.error("Une map avec ce code existe déjà !");
          setSubmitting(false);
          return;
        }
      }

      // Upload new images
      const newUrls = [];
      for (const file of imageFiles) {
        const res = await uploadImageWithToast(file);
        if (res?.file_url) newUrls.push(res.file_url);
      }

      const gallery = [...existingGallery, ...newUrls];

      const payload = {
        title: form.title.trim(),
        creator_name: form.creator_name.trim(),
        map_code: form.map_code.trim(),
        category: form.category,
        description: form.description.trim(),
        image_url: gallery[0] || "",
        gallery,
      };

      if (isEdit) {
        await base44.entities.FortniteMap.update(editMap.id, payload);
        toast.success("Map mise à jour !");
      } else {
        await base44.entities.FortniteMap.create({
          ...payload,
          user_email: userEmail || "",
          is_approved: true,
        });
        toast.success("Map publiée avec succès !");
      }

      onSuccess?.();
      onClose();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl scrollbar-thin"
        style={{ background: "#0D0518", border: "1.5px solid rgba(191,90,242,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10" style={{ background: "#0D0518", borderColor: "rgba(191,90,242,0.15)" }}>
          <h2 className="text-lg font-black text-white">{isEdit ? "Modifier ma map" : "Ajouter ma map"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Titre de la map *</label>
            <input
              type="text"
              value={form.title}
              onChange={handleChange("title")}
              placeholder="Ma map incroyable..."
              className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
              style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.2)" }}
            />
          </div>

          {/* Creator name */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Nom / Pseudo du créateur *</label>
            <input
              type="text"
              value={form.creator_name}
              onChange={handleChange("creator_name")}
              placeholder="Votre pseudo..."
              className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
              style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.2)" }}
            />
          </div>

          {/* Map code */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Code de la map * <span className="text-white/20">(XXXX-XXXX-XXXX)</span></label>
            <input
              type="text"
              value={form.map_code}
              onChange={handleMapCodeChange}
              placeholder="1234-5678-9012"
              maxLength={14}
              className="w-full h-10 px-3 rounded-lg text-sm font-mono font-bold tracking-wider text-white placeholder:text-white/30 outline-none"
              style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.2)" }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Catégorie *</label>
            <select
              value={form.category}
              onChange={handleChange("category")}
              className="w-full h-10 px-3 rounded-lg text-sm text-white outline-none appearance-none cursor-pointer"
              style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.2)" }}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id} style={{ background: "#0D0518" }}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Décrivez votre map, ses règles, ses objectifs..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-white/30 outline-none resize-none scrollbar-thin"
              style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.2)" }}
            />
          </div>

          {/* Image gallery upload */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">
              Images / Galerie <span className="text-white/20 normal-case">({imageFiles.length + existingGallery.length} image{imageFiles.length + existingGallery.length > 1 ? "s" : ""})</span>
            </label>

            {/* Existing gallery (edit mode) */}
            {existingGallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {existingGallery.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden h-16" style={{ background: "rgba(191,90,242,0.05)" }}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition tap-sm"
                      style={{ background: "rgba(0,0,0,0.7)" }}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"
              style={{ background: "rgba(191,90,242,0.05)", border: "1px dashed rgba(191,90,242,0.3)" }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(191,90,242,0.1)" }}>
                <ImageIcon className="w-5 h-5" style={{ color: "#BF5AF2" }} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white/70">{existingGallery.length > 0 ? "Ajouter d'autres images" : "Cliquez pour ajouter des images"}</span>
                <span className="text-[10px] text-white/30 block">JPG, PNG, WebP — taille illimitée</span>
              </div>
              <Upload className="w-4 h-4 text-white/30 shrink-0" />
              <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
            </label>

            {/* Preview thumbnails for new images */}
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden h-16" style={{ background: "rgba(191,90,242,0.05)" }}>
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition tap-sm"
                      style={{ background: "rgba(0,0,0,0.7)" }}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Creator agreement */}
          <CreatorAgreementCheckbox checked={agreed} onChange={setAgreed} accent="#BF5AF2" />

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !agreed}
            className="w-full h-11 rounded-lg text-sm font-black text-white transition hover:opacity-90 disabled:opacity-50 tap-sm flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #BF5AF2, #7C3AED)" }}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {isEdit ? "Mise à jour..." : "Publication..."}</>
            ) : (
              isEdit ? "Enregistrer les modifications" : "Publier ma map"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}