import React, { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ServerCustomEmojis({ server, onUpdate, boostLevel, accent }) {
  const emojis = server.custom_emojis || [];
  const maxEmojis = boostLevel >= 4 ? 50 : 10;
  const [uploading, setUploading] = useState(false);

  const handleAdd = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (emojis.length >= maxEmojis) {
      toast.error(`Limite atteinte (${maxEmojis} emojis max)`);
      return;
    }
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      const name = file.name.replace(/\.[^.]+$/, "").slice(0, 20);
      const updated = [...emojis, { name, url: res.file_url }];
      await onUpdate({ custom_emojis: updated });
      toast.success("Emoji ajouté");
    } catch {
      toast.error("Erreur lors de l'upload");
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleRemove = async (idx) => {
    const updated = emojis.filter((_, i) => i !== idx);
    await onUpdate({ custom_emojis: updated });
    toast.success("Emoji supprimé");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Emojis personnalisés</p>
        <span className="text-[10px] text-white/40">{emojis.length}/{maxEmojis}</span>
      </div>

      {emojis.length > 0 && (
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 mb-3">
          {emojis.map((emoji, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <img src={emoji.url} alt={emoji.name} className="w-full aspect-square object-contain p-1" />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition tap-sm"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {emojis.length < maxEmojis && (
        <label
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition border border-dashed tap-sm"
          style={{ borderColor: accent + "40", background: "rgba(255,255,255,0.03)" }}
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> <span className="text-xs text-white/60">Upload…</span></>
          ) : (
            <><Plus className="w-4 h-4" style={{ color: accent }} /> <span className="text-xs text-white/60">Ajouter un emoji</span></>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleAdd} disabled={uploading} />
        </label>
      )}

      {emojis.length >= maxEmojis && (
        <p className="text-[10px] text-white/30 text-center py-2">Limite atteinte ({maxEmojis} emojis)</p>
      )}

      {boostLevel < 4 && (
        <p className="text-[10px] text-white/30 mt-1.5">🔒 Limite étendue à 50 emojis au Niveau 4</p>
      )}
    </div>
  );
}