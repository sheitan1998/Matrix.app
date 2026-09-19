import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Crown, Upload, X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRESET_GIFS = [
  { url: "https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif", label: "Feu" },
  { url: "https://media.giphy.com/media/26xBwdIuRJiAIqHIA/giphy.gif", label: "Galaxie" },
  { url: "https://media.giphy.com/media/xT9IgG50Lg7rusOk94/giphy.gif", label: "Néon" },
  { url: "https://media.giphy.com/media/l0HlTy9x8FZo0XO1i/giphy.gif", label: "Vague" },
  { url: "https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif", label: "Étoile" },
  { url: "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif", label: "Matrix" },
];

export function NitroAvatar({ url, name, size = "md", className }) {
  const sizeMap = { sm: "w-7 h-7", md: "w-10 h-10", lg: "w-16 h-16", xl: "w-20 h-20" };
  const textMap = { sm: "text-xs", md: "text-sm", lg: "text-lg", xl: "text-2xl" };
  const isGif = url && (url.endsWith(".gif") || url.includes("giphy.com"));

  return (
    <div className={cn("rounded-full overflow-hidden shrink-0 relative", sizeMap[size], className)}>
      {url ? (
        <img src={url} alt={name || "avatar"} className="w-full h-full object-cover" />
      ) : (
        <div className={cn("w-full h-full flex items-center justify-center font-black text-white gradient-matrix", textMap[size])}>
          {(name || "?")[0].toUpperCase()}
        </div>
      )}
      {isGif && (
        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-premium flex items-center justify-center">
          <Sparkles className="w-1.5 h-1.5 text-white" />
        </div>
      )}
    </div>
  );
}

export default function NitroAvatarPicker({ user, onSave, onClose }) {
  const [selected, setSelected] = useState(user?.animated_avatar || user?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const isNitro = user?.is_premium;

  const uploadGif = async (file) => {
    if (!file.type.includes("gif") && !file.type.includes("image")) {
      toast.error("Fichier non supporté");
      return;
    }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    setSelected(file_url);
    setUploading(false);
    toast.success("GIF uploadé !");
  };

  const save = async () => {
    await base44.auth.updateMe({ animated_avatar: selected });
    toast.success("Avatar mis à jour !");
    onSave?.(selected);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card border border-border rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-premium" />
            <p className="font-black">Avatar Animé <span className="text-premium">Nitro</span></p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Preview */}
          <div className="flex flex-col items-center gap-3">
            <NitroAvatar url={selected} name={user?.full_name} size="xl" />
            <p className="text-sm font-semibold">{user?.full_name}</p>
          </div>

          {!isNitro ? (
            <div className="text-center p-4 rounded-2xl border border-premium/30 bg-premium/5">
              <Crown className="w-8 h-8 text-premium mx-auto mb-2" />
              <p className="font-bold text-sm">Nitro requis</p>
              <p className="text-xs text-muted-foreground mt-1">Les avatars GIF animés sont réservés aux membres Nitro.</p>
              <Button size="sm" className="mt-3 gradient-premium text-white font-bold border-0">
                Passer à Nitro
              </Button>
            </div>
          ) : (
            <>
              {/* GIF presets */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">GIFs Nitro exclusifs</p>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_GIFS.map((g) => (
                    <button key={g.url} onClick={() => setSelected(g.url)}
                      className={cn("relative rounded-xl overflow-hidden aspect-square border-2 transition",
                        selected === g.url ? "border-premium scale-105" : "border-transparent hover:border-premium/40")}>
                      <img src={g.url} alt={g.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[9px] text-center font-bold text-white">
                        {g.label}
                      </div>
                      {selected === g.url && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-premium flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom upload */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Importer un GIF</p>
                <button onClick={() => fileRef.current?.click()}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-premium/30 hover:border-premium/60 transition text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Envoi en cours..." : "Importer un GIF (.gif)"}
                </button>
                <input ref={fileRef} type="file" accept="image/gif,image/*" className="hidden"
                  onChange={(e) => e.target.files[0] && uploadGif(e.target.files[0])} />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl">Annuler</Button>
            {isNitro && (
              <Button onClick={save} className="flex-1 rounded-2xl gradient-premium text-white border-0 font-bold">
                <Check className="w-4 h-4 mr-1" /> Appliquer
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}