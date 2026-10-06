import React, { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Loader2, Upload, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { normalizeAppAssetUrl } from "@/lib/urlUtils";

/**
 * Galerie d'images supplémentaires pour un élément FarmingSimPopup.
 * Permet d'uploader, réordonner et supprimer des images additionnelles
 * (recettes, étapes de fabrication, détails visuels).
 * L'image principale (img) est gérée séparément et reste l'affiche de l'élément.
 */
export default function PopupGalleryEditor({ item, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const gallery = item.gallery || [];

  const persist = async (newGallery) => {
    setSaving(true);
    try {
      await base44.entities.FarmingSimPopup.update(item.id, { gallery: newGallery });
      toast.success("Galerie mise à jour.");
      if (onUpdate) onUpdate();
    } catch {
      toast.error("Erreur lors de la sauvegarde de la galerie.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      const url = normalizeAppAssetUrl(file_url);
      await persist([...gallery, url]);
    } catch {
      toast.error("Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleReorder = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= gallery.length) return;
    const reordered = [...gallery];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    await persist(reordered);
  };

  const handleDelete = async (index) => {
    const filtered = gallery.filter((_, i) => i !== index);
    await persist(filtered);
  };

  return (
    <div className="mt-1.5 pl-4 pr-1 pb-1.5 space-y-1.5">
      <div className="flex items-center gap-1.5 text-[9px] text-white/40 uppercase tracking-wider">
        <span>Galerie ({gallery.length})</span>
        {saving && <Loader2 className="w-3 h-3 animate-spin" />}
      </div>

      {gallery.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {gallery.map((url, index) => (
            <div key={index} className="relative group w-12 h-12 rounded overflow-hidden shrink-0" style={{ background: "#262626" }}>
              <img src={normalizeAppAssetUrl(url)} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleReorder(index, -1)}
                  disabled={index === 0}
                  className="w-4 h-4 rounded flex items-center justify-center text-white/80 hover:text-white disabled:opacity-20"
                  title="Monter"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleReorder(index, 1)}
                  disabled={index === gallery.length - 1}
                  className="w-4 h-4 rounded flex items-center justify-center text-white/80 hover:text-white disabled:opacity-20"
                  title="Descendre"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="w-4 h-4 rounded flex items-center justify-center text-white/80 hover:text-red-400"
                  title="Supprimer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex items-center gap-1 cursor-pointer text-[9px] text-white/40 hover:text-white transition">
        {uploading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Plus className="w-3 h-3" />
        )}
        <span>Ajouter une image</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files[0])}
        />
      </label>
    </div>
  );
}