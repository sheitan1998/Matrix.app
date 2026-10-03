import React, { useState, useEffect, useCallback } from "react";
import { X, Upload, Loader2, FileArchive, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".zip")) {
      toast.error("Le fichier doit être un .zip");
      return;
    }
    if (f.size > 200 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 200 Mo");
      return;
    }
    setFile(f);
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

      if (file) {
        setUploading(true);
        const res = await base44.integrations.Core.UploadPublicFile({ file });
        fileUrl = res.file_url;
        fileName = file.name;
        setUploading(false);
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        is_free: isFree,
        file_url: fileUrl,
        file_name: fileName,
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
      setUploading(false);
    }
  };

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

          {/* File upload */}
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
                  <span className="text-[10px] text-white/30">Max 200 Mo</span>
                </>
              )}
              <input type="file" accept=".zip" onChange={handleFileChange} className="hidden" />
            </label>
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
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition tap-sm disabled:opacity-50"
            style={{ background: "#7DA627", color: "#0a0a0a" }}
          >
            {uploading ? (
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