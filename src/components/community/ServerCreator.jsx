import React, { useState, useRef } from "react";
import { X, Globe, Lock, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProgression } from "@/context/ProgressionContext";
import { uploadServerMedia } from "@/lib/serverMedia";
import AnimatedMedia from "@/components/community/AnimatedMedia";

const THEMES = [
  { key: "gaming", label: "Gaming 🎮" },
  { key: "music", label: "Musique 🎵" },
  { key: "tech", label: "Tech 💻" },
  { key: "sport", label: "Sport ⚽" },
  { key: "art", label: "Art 🎨" },
  { key: "cinema", label: "Cinéma 🎬" },
  { key: "humour", label: "Humour 😂" },
  { key: "news", label: "Actu 📰" },
  { key: "autre", label: "Autre 📦" },
];

export default function ServerCreator({ onClose, onCreated }) {
  const [saving, setSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [iconUrl, setIconUrl] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    theme: "autre",
    is_public: true,
  });
  const fileInputRef = useRef(null);
  const { trackActivity } = useProgression();

  const handleIconUpload = async (file) => {
    if (!file) return;
    setUploadingIcon(true);
    try {
      const { file_url } = await uploadServerMedia(file);
      setIconUrl(file_url);
      toast.success("Avatar mis à jour !");
    } catch (err) {
      toast.error(err?.message || "Erreur lors de l'upload");
    }
    setUploadingIcon(false);
  };

  const create = async () => {
    if (!form.name.trim()) { toast.error("Donne un nom à ton serveur"); return; }
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await base44.entities.Server.create({
        ...form,
        icon_url: iconUrl || undefined,
        icon_emoji: "🏠",
        banner_color: "#7c3aed",
        owner_email: user.email,
        owner_name: user.full_name,
        invite_code: code,
        members_count: 1,
      });
      toast.success(`Serveur "${form.name}" créé ! 🎉`);
      trackActivity("create_server");
      onCreated?.();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Erreur lors de la création");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden flex flex-col max-h-[90vh] overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0"
          style={{ background: "rgba(124,58,237,0.12)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center border border-border/60"
              style={{ background: "rgba(124,58,237,0.25)" }}>
              {iconUrl
                ? <AnimatedMedia src={iconUrl} className="w-full h-full object-cover" />
                : <span className="text-xl">🏠</span>}
            </div>
            <div>
              <p className="font-black text-base">{form.name || "Mon serveur"}</p>
              <p className="text-xs text-muted-foreground">{form.is_public ? "🌍 Public" : "🔒 Privé"}</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="overflow-y-auto overscroll-contain flex-1 p-5 space-y-5">
          {/* Name + Description */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Informations</p>
            <Input
              placeholder="Nom du serveur *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-secondary/60"
            />
            <Textarea
              placeholder="Description (optionnel)..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-secondary/60 h-20 resize-none"
            />
          </div>

          {/* Avatar (icon URL + upload) */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Avatar du serveur</p>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border shrink-0 flex items-center justify-center"
                style={{ background: "rgba(124,58,237,0.15)" }}>
                {iconUrl
                  ? <AnimatedMedia src={iconUrl} className="w-full h-full object-cover" />
                  : <span className="text-2xl">🏠</span>}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm"
                className="hidden"
                onChange={(e) => handleIconUpload(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingIcon}
                className="h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-border hover:bg-secondary transition disabled:opacity-50 tap-sm"
              >
                {uploadingIcon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploadingIcon ? "Upload..." : "Importer une image"}
              </button>
            </div>
            <Input
              placeholder="Ou colle une URL d'image/vidéo..."
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              className="bg-secondary/60 mt-2 h-9 text-xs"
            />
          </div>

          {/* Theme */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Thème</p>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <button key={t.key} onClick={() => setForm({ ...form, theme: t.key })}
                  className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold border transition",
                    form.theme === t.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Visibilité</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setForm({ ...form, is_public: true })}
                className={cn("flex items-center gap-2 p-3 rounded-2xl border-2 transition text-sm font-semibold",
                  form.is_public ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>
                <Globe className="w-4 h-4" /> Public
              </button>
              <button onClick={() => setForm({ ...form, is_public: false })}
                className={cn("flex items-center gap-2 p-3 rounded-2xl border-2 transition text-sm font-semibold",
                  !form.is_public ? "border-premium bg-premium/10 text-premium" : "border-border text-muted-foreground")}>
                <Lock className="w-4 h-4" /> Privé
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              ⚠️ Même public, ton serveur n'apparaîtra que dans la recherche. Les utilisateurs doivent le rejoindre explicitement.
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-border shrink-0">
          <Button onClick={create} disabled={saving || uploadingIcon || !form.name.trim()} className="w-full h-11 font-bold rounded-2xl bg-primary text-primary-foreground">
            {saving ? "Création..." : "Créer le serveur 🚀"}
          </Button>
        </div>
      </div>
    </div>
  );
}