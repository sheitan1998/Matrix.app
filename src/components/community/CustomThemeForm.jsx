import React, { useState, useRef } from "react";
import { Plus, Upload, Loader2, X } from "lucide-react";
import { buildCustomTheme } from "@/lib/visualThemes";
import { uploadServerMedia } from "@/lib/serverMedia";
import { toast } from "sonner";

const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" };

export default function CustomThemeForm({ onCreate, accent }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎨");
  const [themeAccent, setThemeAccent] = useState("#ff2fd0");
  const [bgFrom, setBgFrom] = useState("#0b0420");
  const [bgTo, setBgTo] = useState("#1e0638");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const preview = buildCustomTheme({ id: "preview", name: name || "Aperçu", emoji, accent: themeAccent, bg_from: bgFrom, bg_to: bgTo, image_url: imageUrl });

  const colors = [
    { label: "Accent", value: themeAccent, set: setThemeAccent },
    { label: "Fond 1", value: bgFrom, set: setBgFrom },
    { label: "Fond 2", value: bgTo, set: setBgTo },
  ];

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadServerMedia(file);
      setImageUrl(file_url);
      toast.success("Image importée !");
    } catch (err) {
      toast.error(err?.message || "Erreur lors de l'upload");
    }
    setUploading(false);
  };

  const submit = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), emoji: emoji.trim() || "🎨", accent: themeAccent, bg_from: bgFrom, bg_to: bgTo, image_url: imageUrl || undefined });
    setName("");
    setImageUrl("");
  };

  return (
    <div className="p-3 rounded-2xl border space-y-3" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
      <p className="text-xs font-bold text-white">Nouveau thème</p>
      <div className="flex gap-2">
        <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4}
          className="w-10 h-8 text-center rounded-xl outline-none text-white" style={inputStyle} />
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="Nom du thème..."
          className="flex-1 h-8 px-3 text-xs rounded-xl outline-none text-white placeholder:text-white/30" style={inputStyle} />
      </div>

      {/* Image import for background */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Image de fond (optionnel)</p>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleImageUpload(e.target.files?.[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="h-8 px-3 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border border-white/10 hover:bg-white/5 transition disabled:opacity-50">
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {uploading ? "Upload..." : "Importer une image"}
          </button>
          {imageUrl && (
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setImageUrl("")}
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>
        {imageUrl && <p className="text-[9px] text-white/30 mt-1">L'image sert de fond, les couleurs créent un overlay.</p>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {colors.map((c) => (
          <label key={c.label} className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground">
            <input type="color" value={c.value} onChange={(e) => c.set(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent" />
            {c.label}
          </label>
        ))}
      </div>
      <div className="h-14 rounded-xl flex items-center justify-center gap-2 border" style={{ background: preview.bg, borderColor: preview.border }}>
        <span className="text-lg">{preview.emoji}</span>
        <span className="text-xs font-bold" style={{ color: preview.accent }}>{preview.label}</span>
      </div>
      <button onClick={submit} disabled={!name.trim()}
        className="w-full h-9 rounded-xl text-xs font-bold text-black flex items-center justify-center gap-1 transition hover:opacity-90 disabled:opacity-40"
        style={{ background: accent }}>
        <Plus className="w-3.5 h-3.5" /> Créer le thème
      </button>
    </div>
  );
}