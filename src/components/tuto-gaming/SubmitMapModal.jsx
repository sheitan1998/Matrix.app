import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_OPTIONS, validateMapCode, formatMapCode } from "@/components/tuto-gaming/fortniteMapsData";

export default function SubmitMapModal({ open, onClose, onSuccess, userEmail }) {
  const [form, setForm] = useState({
    title: "",
    creator_name: "",
    map_code: "",
    category: "tycoon",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleMapCodeChange = (e) => {
    setForm((f) => ({ ...f, map_code: formatMapCode(e.target.value) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop lourde (max 5 Mo)");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
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
      let imageUrl = "";
      if (imageFile) {
        const res = await base44.integrations.Core.UploadPublicFile({ file: imageFile });
        imageUrl = res?.file_url || "";
      }

      await base44.entities.FortniteMap.create({
        title: form.title.trim(),
        creator_name: form.creator_name.trim(),
        map_code: form.map_code.trim(),
        category: form.category,
        description: form.description.trim(),
        image_url: imageUrl,
        user_email: userEmail || "",
        is_approved: true,
      });

      toast.success("Map publiée avec succès !");
      setForm({ title: "", creator_name: "", map_code: "", category: "tycoon", description: "" });
      setImageFile(null);
      setImagePreview("");
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Erreur lors de la publication");
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
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "#0D0518", border: "1.5px solid rgba(191,90,242,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(191,90,242,0.15)" }}>
          <h2 className="text-lg font-black text-white">Ajouter ma map</h2>
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
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-white/30 outline-none resize-none"
              style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.2)" }}
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">Image / Miniature</label>
            <label
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"
              style={{ background: "rgba(191,90,242,0.05)", border: "1px dashed rgba(191,90,242,0.3)" }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(191,90,242,0.1)" }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <ImageIcon className="w-5 h-5" style={{ color: "#BF5AF2" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white/70">{imageFile ? imageFile.name : "Cliquez pour téléverser une image"}</span>
                <span className="text-[10px] text-white/30 block">JPG, PNG, WebP — max 5 Mo</span>
              </div>
              <Upload className="w-4 h-4 text-white/30 shrink-0" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-lg text-sm font-black text-white transition hover:opacity-90 disabled:opacity-50 tap-sm flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #BF5AF2, #7C3AED)" }}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Publication...</>
            ) : (
              "Publier ma map"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}