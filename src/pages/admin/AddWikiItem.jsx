import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FARMING_SIM_CATEGORIES } from "@/components/tuto-gaming/farmingSimData";
import { toast } from "sonner";

export default function AddWikiItem() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [specSheetUrl, setSpecSheetUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingSpec, setUploadingSpec] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setAuthChecked(true);
    }).catch(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0518" }}>
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0d0518" }}>
        <p className="text-sm text-white/40">Accès réservé aux administrateurs.</p>
        <Link to="/" className="text-xs font-bold text-white/60 hover:text-white">Retour à l'accueil</Link>
      </div>
    );
  }

  const selectedCategory = FARMING_SIM_CATEGORIES.find((c) => c.id === category);

  const handleUpload = async (file, setUrl, setUploading) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setUrl(file_url);
      toast.success("Image uploadée avec succès.");
    } catch {
      toast.error("Erreur lors de l'upload de l'image.");
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
      toast.success("Élément ajouté au Wiki avec succès !");
      setCategory("");
      setSubCategory("");
      setItemName("");
      setThumbnailUrl("");
      setSpecSheetUrl("");
      setNotes("");
    } catch {
      toast.error("Erreur lors de la création de l'entrée.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0d0518" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition mb-6 tap-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour à l'admin</span>
        </Link>

        <h1 className="text-xl font-black text-white uppercase tracking-tight mb-1">
          Ajouter un élément Wiki
        </h1>
        <p className="text-xs text-white/40 mb-6">
          Farming Simulator 25 — Véhicules, outils, équipements, quêtes…
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category + Sub-category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                Catégorie parente
              </label>
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                Sous-catégorie
              </label>
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
              {selectedCategory && selectedCategory.cards.length === 0 && (
                <span className="block text-[10px] text-white/30 mt-1">Aucune sous-catégorie disponible</span>
              )}
            </div>
          </div>

          {/* Item name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Nom de l'élément
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="ex: KUBOTA M7003, Godet universel 2000L…"
              className="w-full h-10 px-3 rounded-lg text-sm text-white border border-white/10 focus:border-[#7DA627] outline-none placeholder:text-white/20"
              style={{ background: "#1a1a1a" }}
            />
          </div>

          {/* Upload zones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Thumbnail */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                Image Vignette / Menu
              </label>
              <div
                className="relative rounded-lg border border-dashed border-white/10 overflow-hidden"
                style={{ background: "#1a1a1a" }}
              >
                {thumbnailUrl ? (
                  <div className="relative">
                    <img src={thumbnailUrl} alt="Vignette" className="w-full h-40 object-contain" />
                    <button
                      type="button"
                      onClick={() => setThumbnailUrl("")}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-red-500/80"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 cursor-pointer hover:border-[#7DA627] transition">
                    {uploadingThumb ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white/40" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-white/30 mb-1" />
                        <span className="text-[10px] text-white/30">Cliquez pour uploader</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files[0], setThumbnailUrl, setUploadingThumb)}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Spec sheet */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                Image Fiche Technique
              </label>
              <div
                className="relative rounded-lg border border-dashed border-white/10 overflow-hidden"
                style={{ background: "#1a1a1a" }}
              >
                {specSheetUrl ? (
                  <div className="relative">
                    <img src={specSheetUrl} alt="Fiche technique" className="w-full h-40 object-contain" />
                    <button
                      type="button"
                      onClick={() => setSpecSheetUrl("")}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-red-500/80"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 cursor-pointer hover:border-[#7DA627] transition">
                    {uploadingSpec ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white/40" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-white/30 mb-1" />
                        <span className="text-[10px] text-white/30">Cliquez pour uploader</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files[0], setSpecSheetUrl, setUploadingSpec)}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Notes / Conseils (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes personnelles, conseils de trade, astuces…"
              className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:border-[#7DA627] outline-none placeholder:text-white/20 resize-none"
              style={{ background: "#1a1a1a" }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7DA627, #5e8a1c)" }}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Ajouter au Wiki
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}