import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { normalizeAppAssetUrl } from "@/lib/urlUtils";

/**
 * Reusable image upload field for admin config panels.
 * - Shows a preview thumbnail if a value is set
 * - Uploads to public storage via Core.UploadPublicFile
 * - Allows clearing the value
 */
export default function ImageUploadField({ label, value, onChange, hint, aspect = "wide" }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      onChange(normalizeAppAssetUrl(file_url));
      toast.success("Image uploadée");
    } catch {
      toast.error("Erreur lors de l'upload");
    }
    setUploading(false);
  };

  const h = aspect === "wide" ? "h-24" : "h-32";

  return (
    <div>
      {label && <label className="text-[10px] font-bold text-white/50 mb-1 block">{label}</label>}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL de l'image ou emoji"
          className="flex-1 px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white"
        />
        <label className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-bold text-white/60 border border-white/10 hover:bg-white/5 shrink-0">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
        </label>
        {value && (
          <button
            onClick={() => onChange("")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 border border-white/10 shrink-0"
            title="Effacer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {hint && <p className="text-[9px] text-white/30 mt-1">{hint}</p>}
      {value && (
        <div className={`mt-2 w-full ${h} rounded-lg overflow-hidden border border-white/10 relative`}>
          {value.match(/^https?:\/\//) ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: "rgba(0,0,0,0.3)" }}>
              {value}
            </div>
          )}
        </div>
      )}
    </div>
  );
}