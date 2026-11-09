import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, RotateCcw, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CREATOR_DEFAULT_VISUALS } from "@/lib/creatorDefaults";
import { normalizeAppAssetUrl } from "@/lib/urlUtils";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

// Réduit l'image avant l'envoi pour garder des cartes rapides à charger.
async function prepareImage(file, maxWidth) {
  const bitmap = typeof createImageBitmap === "function"
    ? await createImageBitmap(file).catch(() => null)
    : null;
  if (!bitmap) return file;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) return file;
  return new File([blob], `${file.name.replace(/\.\w+$/, "")}.jpg`, { type: "image/jpeg" });
}

async function uploadVisual(file, maxWidth) {
  const prepared = await prepareImage(file, maxWidth);
  const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: prepared });
  if (!file_url) throw new Error("no_url");
  return normalizeAppAssetUrl(file_url) || file_url;
}

function VisualSlot({ label, hint, customUrl, displayUrl, maxWidth, color, onUploaded, onReset }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Choisis un fichier image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Image trop lourde (8 Mo maximum).");
      return;
    }
    setLoading(true);
    try {
      const publicUrl = await uploadVisual(file, maxWidth);
      onUploaded(publicUrl);
    } catch {
      // En cas d'échec, le visuel cyberpunk par défaut reprend sa place immédiatement.
      onReset();
      setError("Envoi impossible : le visuel par défaut a été réappliqué.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">{label}</label>
        {customUrl && (
          <button
            type="button"
            onClick={() => { setError(""); onReset(); }}
            className="flex items-center gap-1 text-[9px] font-bold text-white/40 hover:text-white transition tap-sm"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Visuel par défaut
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className="relative w-full h-20 rounded-lg overflow-hidden flex items-center justify-center transition"
        style={{
          background: "rgba(138,79,255,0.05)",
          border: `1px dashed ${color}66`,
        }}
      >
        {displayUrl ? (
          <>
            <img src={displayUrl} alt={label} className="absolute inset-0 w-full h-full object-cover" />
            <span
              className="relative z-10 flex items-center gap-1 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider text-white"
              style={{ background: "rgba(10,5,15,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <Upload className="w-2.5 h-2.5" />
              Changer
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-1 text-white/45">
            <ImagePlus className="w-4 h-4" style={{ color }} />
            <span className="text-[9px] font-bold">{loading ? "Envoi..." : hint}</span>
          </span>
        )}
        {loading && (
          <span className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: "rgba(10,5,15,0.7)" }}>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          </span>
        )}
      </button>

      {error && <p className="text-[9px] text-amber-400/90 mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

export default function CreatorVisualFields({ platform, color, avatarUrl, bannerUrl, onChange }) {
  const defaults = CREATOR_DEFAULT_VISUALS[platform] || {};

  return (
    <div className="rounded-lg p-3 space-y-2.5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${color}33` }}>
      <div>
        <p className="text-[10px] font-black text-white">Logo & bannière</p>
        <p className="text-[9px] text-white/40 leading-snug">
          L'extraction automatique n'existe pas sur cette plateforme. Ajoute tes images (ou garde les visuels
          cyberpunk par défaut).
        </p>
      </div>

      <VisualSlot
        label="Logo / Avatar"
        hint="Ajouter le logo"
        customUrl={avatarUrl}
        displayUrl={avatarUrl || defaults.avatar_url}
        maxWidth={500}
        color={color}
        onUploaded={(url) => onChange({ avatar_url: url, banner_url: bannerUrl })}
        onReset={() => onChange({ avatar_url: "", banner_url: bannerUrl })}
      />

      <VisualSlot
        label="Bannière"
        hint="Ajouter la bannière"
        customUrl={bannerUrl}
        displayUrl={bannerUrl || defaults.banner_url}
        maxWidth={1280}
        color={color}
        onUploaded={(url) => onChange({ avatar_url: avatarUrl, banner_url: url })}
        onReset={() => onChange({ avatar_url: avatarUrl, banner_url: "" })}
      />
    </div>
  );
}