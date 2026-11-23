import React, { useRef, useState } from "react";
import { X, Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadImageWithToast } from "@/lib/imageModeration";

export const MAX_GALLERY = 5;

const fieldStyle = {
  background: "#0d0814",
  border: "1px solid rgba(138, 79, 255, 0.18)",
};

/**
 * Éditeur de galerie (5 images max) : envoi compressé vers R2 via
 * uploadImageWithToast (usage "gallery") ou ajout par URL https.
 */
export default function GalleryEditor({ value = [], onChange, onUploadingChange, labelClass = "" }) {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const gallery = Array.isArray(value) ? value : [];

  const setBusy = (busy) => {
    setUploading(busy);
    onUploadingChange?.(busy);
  };

  const handleUpload = async (files) => {
    const picked = Array.from(files || []).slice(0, MAX_GALLERY - gallery.length);
    if (picked.length === 0) return;
    setBusy(true);
    try {
      const urls = [];
      for (const file of picked) {
        try {
          const result = await uploadImageWithToast(file, { usage: "gallery" });
          if (result?.file_url) urls.push(result.file_url);
        } catch { /* error already toasted */ }
      }
      onChange([...gallery, ...urls].slice(0, MAX_GALLERY));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleUrlAdd = () => {
    const next = url.trim();
    if (!next) return;
    if (!next.startsWith("https://")) {
      toast.error("L'URL de l'image doit commencer par https://");
      return;
    }
    if (gallery.includes(next)) {
      toast.error("Cette image est déjà dans la galerie");
      return;
    }
    if (gallery.length >= MAX_GALLERY) return;
    onChange([...gallery, next]);
    setUrl("");
  };

  return (
    <div>
      <label className={labelClass}>
        <ImageIcon className="w-3 h-3 inline mr-1" />
        Galerie de la fiche ({gallery.length}/{MAX_GALLERY})
        <span className="text-white/20 ml-1 normal-case tracking-normal">(visible sur la fiche uniquement)</span>
      </label>
      {gallery.length > 0 && (
        <div className="grid grid-cols-5 gap-1.5 mb-2">
          {gallery.map((img, i) => (
            <div
              key={`${img}-${i}`}
              className="relative aspect-square rounded-lg overflow-hidden"
              style={{ border: "1px solid rgba(138,79,255,0.2)" }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(gallery.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded flex items-center justify-center text-white tap-sm"
                style={{ background: "rgba(239,68,68,0.85)" }}
                aria-label="Supprimer l'image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {gallery.length < MAX_GALLERY && (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="h-9 px-3 rounded-lg text-[10px] font-bold text-white transition flex items-center gap-1 tap-sm shrink-0"
            style={fieldStyle}
          >
            <Upload className="w-3 h-3" />
            {uploading ? "..." : "Ajouter"}
          </button>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlAdd(); } }}
            placeholder="ou URL https://..."
            className="flex-1 min-w-0 h-9 px-3 rounded-lg text-xs text-white placeholder:text-white/25 outline-none"
            style={fieldStyle}
          />
          <button
            type="button"
            onClick={handleUrlAdd}
            className="h-9 px-2 rounded-lg text-[10px] font-bold text-white tap-sm shrink-0"
            style={fieldStyle}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
