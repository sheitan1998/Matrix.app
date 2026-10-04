import React, { useState, useEffect, useCallback } from "react";
import { X, Upload, Loader2, FileArchive, Trash2, ImagePlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import CreatorAgreementCheckbox from "@/components/tuto-gaming/CreatorAgreementCheckbox";

const CATEGORIES = [
  { id: "vehicles", label: "Véhicules" },
  { id: "maps", label: "Maps" },
  { id: "tools", label: "Outils" },
  { id: "factories", label: "Usines" },
  { id: "animals", label: "Animaux" },
  { id: "scripts", label: "Scripts" },
  { id: "others", label: "Autres" },
];

export default function FarmingModForm({ mod, userEmail, userName, userAvatar, onClose, onSaved }) {
  const isEdit = !!mod;
  const [title, setTitle] = useState(mod?.title || "");
  const [description, setDescription] = useState(mod?.description || "");
  const [category, setCategory] = useState(mod?.category || "vehicles");
  const [isFree, setIsFree] = useState(mod?.is_free ?? true);
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]); // new File objects selected
  const [existingImages, setExistingImages] = useState(mod?.images || []); // already-uploaded URLs (edit mode)
  const [saving, setSaving] = useState(false);
  const [uploadingZip, setUploadingZip] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".zip")) {
      toast.error("Le fichier doit être un .zip");
      return;
    }
    setFile(f);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Le titre est requis");
    if (!isEdit && !file) return toast.error("Le fichier .zip est requis");
    if (!userEmail) return toast.error("Vous devez être connecté");

    setSaving(true);
    try {
      let fileUrl = mod?.file_url || "";
      let fileName = mod?.file_name || "";

      // Upload .zip (no size limit — large maps / packs supported)
      if (file) {
        setUploadingZip(true);
        const res = await base44.integrations.Core.UploadPublicFile({ file });
        fileUrl = res.file_url;
        fileName = file.name;
        setUploadingZip(false);
      }

      // Upload new images (public, no size limit)
      let uploadedImageUrls = [];
      if (images.length > 0) {
        setUploadingImages(true);
        const results = await Promise.all(
          images.map((img) => base44.integrations.Core.UploadPublicFile({ file: img }))
        );
        uploadedImageUrls = results.map((r) => r.file_url);
        setUploadingImages(false);
      }

      const finalImages = [...existingImages, ...uploadedImageUrls];

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        is_free: isFree,
        file_url: fileUrl,
        file_name: fileName,
        images: finalImages,
        creator_email: userEmail,
        creator_name: userName || "Créateur",
        creator_avatar: userAvatar || "",
      };

      if (isEdit) {
        await base44.entities.FarmingMod.update(mod.id, payload);
        toast.success("Mod mis à jour");
      } else {
        await base44.entities.FarmingMod.create(payload);
        toast.success("Mod publié");
      }
      onSaved();
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
      setUploadingZip(false);
      setUploadingImages(false);
    }
  };

  const isUploading = uploadingZip || uploadingImages;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl scrollbar-thin"
        style={{ background: "#1a1a1a", border: "1px solid rgba(125,166,39,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 sticky top-0 z-10"
          style={{ background: "#1a1a1a", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-sm font-black uppercase tracking-wider text-white">
            {isEdit ? "Modifier le mod" : "Nouveau mod"}
          </h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition tap-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Titre du mod *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Tracteur John Deere 8R"
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "#262626", border: "1px solid rgba(255,255,255,0.1)" }}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Catégorie *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "#262626", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Décrivez votre mod, ses fonctionnalités, etc."
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-none scrollbar-thin"
              style={{ background: "#262626", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>

          {/* File upload — no size limit */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Fichier .zip {isEdit ? "(laisser vide pour garder l'actuel)" : "*"}
            </label>
            <label
              className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-lg cursor-pointer transition border border-dashed"
              style={{ background: "#262626", borderColor: "rgba(125,166,39,0.3)" }}
            >
              {file ? (
                <>
                  <FileArchive className="w-8 h-8" style={{ color: "#7DA627" }} />
                  <span className="text-xs font-bold text-white">{file.name}</span>
                  <span className="text-[10px] text-white/40">{(file.size / 1024 / 1024).toFixed(1)} Mo</span>
                </>
              ) : isEdit && mod?.file_name ? (
                <>
                  <FileArchive className="w-8 h-8 text-white/30" />
                  <span className="text-xs text-white/50">{mod.file_name}</span>
                  <span className="text-[10px] text-white/30">Cliquer pour remplacer</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-white/30" />
                  <span className="text-xs text-white/50">Cliquer pour sélectionner un .zip</span>
                  <span className="text-[10px] text-white/30">Taille illimitée</span>
                </>
              )}
              <input type="file" accept=".zip" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Image upload — multiple screenshots, no size limit */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Captures d'écran
            </label>
            <label
              className="flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-lg cursor-pointer transition border border-dashed"
              style={{ background: "#262626", borderColor: "rgba(125,166,39,0.3)" }}
            >
              <ImagePlus className="w-7 h-7 text-white/30" />
              <span className="text-xs text-white/50">Ajouter des captures d'écran</span>
              <span className="text-[10px] text-white/30">Taille illimitée — plusieurs images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="hidden"
              />
            </label>

            {/* Existing images (edit mode) */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden" style={{ background: "#262626" }}>
                    <img src={url} alt="" className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition tap-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New images (preview before upload) */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((f, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden" style={{ background: "#262626" }}>
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition tap-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* License */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg" style={{ background: "#262626" }}>
            <button
              type="button"
              onClick={() => setIsFree(!isFree)}
              className="relative w-10 h-5 rounded-full transition shrink-0"
              style={{ background: isFree ? "#7DA627" : "rgba(255,255,255,0.15)" }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: isFree ? "22px" : "2px" }}
              />
            </button>
            <div className="flex-1">
              <p className="text-xs font-bold text-white">
                {isFree ? "Libre de droit" : "Droits réservés / Non libre"}
              </p>
              <p className="text-[10px] text-white/40">
                {isFree
                  ? "Le mod peut être librement utilisé et redistribué."
                  : "Le créateur conserve tous les droits d'utilisation."}
              </p>
            </div>
          </div>

          {/* Creator agreement */}
          <CreatorAgreementCheckbox checked={agreed} onChange={setAgreed} accent="#7DA627" />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-2 px-5 py-3"
          style={{ background: "#1a1a1a", borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white/60 hover:text-white transition tap-sm">
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving || isUploading || !agreed}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition tap-sm disabled:opacity-50"
            style={{ background: "#7DA627", color: "#0a0a0a" }}
          >
            {isUploading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Upload…</>
            ) : saving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement…</>
            ) : (
              isEdit ? "Enregistrer" : "Publier"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}