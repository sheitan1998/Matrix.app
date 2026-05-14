import React, { useState } from "react";
import { X, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMOJIS = ["🎮","🎵","💻","⚽","🎨","🎬","😂","📰","🚀","🔥","💎","👑","🌍","🎯","🏆"];
const COLORS = ["#7c3aed","#2563eb","#059669","#dc2626","#d97706","#db2777","#0891b2","#65a30d"];
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
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon_emoji: "🚀",
    banner_color: "#7c3aed",
    theme: "autre",
    is_public: true,
  });

  const create = async () => {
    if (!form.name.trim()) { toast.error("Donne un nom à ton serveur"); return; }
    setSaving(true);
    const user = await base44.auth.me();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await base44.entities.Server.create({
      ...form,
      owner_email: user.email,
      owner_name: user.full_name,
      invite_code: code,
      members_count: 1,
    });
    toast.success(`Serveur "${form.name}" créé ! 🎉`);
    setSaving(false);
    onCreated?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden flex flex-col max-h-[90vh] overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0"
          style={{ background: form.banner_color + "22" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl border border-border/60"
              style={{ background: form.banner_color + "40" }}>
              {form.icon_emoji}
            </div>
            <div>
              <p className="font-black text-base">{form.name || "Mon serveur"}</p>
              <p className="text-xs text-muted-foreground">{form.is_public ? "🌍 Public" : "🔒 Privé"}</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="overflow-y-auto overscroll-contain flex-1 p-5 space-y-5">
          {/* Step 1: Name + Description */}
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

          {/* Emoji */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Icône</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => setForm({ ...form, icon_emoji: e })}
                  className={cn("w-9 h-9 rounded-xl text-lg flex items-center justify-center border-2 transition",
                    form.icon_emoji === e ? "border-primary bg-primary/10" : "border-border hover:border-border/80")}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Couleur</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setForm({ ...form, banner_color: c })}
                  className={cn("w-8 h-8 rounded-full border-4 transition", form.banner_color === c ? "border-white scale-110" : "border-transparent")}
                  style={{ background: c }} />
              ))}
            </div>
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
          </div>
        </div>

        <div className="p-5 border-t border-border shrink-0">
          <Button onClick={create} disabled={saving || !form.name.trim()} className="w-full h-11 font-bold rounded-2xl bg-primary text-primary-foreground">
            {saving ? "Création..." : "Créer le serveur 🚀"}
          </Button>
        </div>
      </div>
    </div>
  );
}