import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Hash, Volume2, MessageSquare, Folder, Eye, EyeOff, Lock } from "lucide-react";

const MODES = {
  category: { icon: Folder, label: "une catégorie", color: "#8b5cf6", article: "la" },
  text: { icon: Hash, label: "un salon textuel", color: "#3b82f6", article: "le" },
  voice: { icon: Volume2, label: "un salon vocal", color: "#10b981", article: "le" },
  forum: { icon: MessageSquare, label: "un salon forum", color: "#f59e0b", article: "le" },
};

export default function ChannelCreateModal({ show, mode, theme, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [isNsfw, setIsNsfw] = useState(false);
  const [slowmode, setSlowmode] = useState(0);
  const [readPerm, setReadPerm] = useState("everyone");
  const [writePerm, setWritePerm] = useState("everyone");
  const [creating, setCreating] = useState(false);

  if (!show) return null;

  const modeInfo = MODES[mode] || MODES.text;
  const ModeIcon = modeInfo.icon;
  const accent = theme?.accent || "hsl(var(--primary))";
  const isCategory = mode === "category";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || creating) return;
    setCreating(true);
    const channel = {
      id: Date.now().toString(),
      name: name.trim().toLowerCase().replace(/\s+/g, "-"),
      type: mode,
      topic: topic.trim(),
      is_nsfw: isNsfw,
      slowmode_seconds: slowmode,
      permissions: { read: readPerm, write: writePerm },
    };
    try {
      await onCreate(channel);
    } finally {
      setCreating(false);
      setName("");
      setTopic("");
      setIsNsfw(false);
      setSlowmode(0);
      setReadPerm("everyone");
      setWritePerm("everyone");
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: modeInfo.color + "20" }}
            >
              <ModeIcon className="w-4 h-4" style={{ color: modeInfo.color }} />
            </div>
            <h2 className="font-black text-white text-sm">
              Créer {modeInfo.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition tap-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Name */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Nom {isCategory ? "de la catégorie" : "du salon"}
            </label>
            <div className="flex items-center gap-2">
              {!isCategory && (
                <ModeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                placeholder={isCategory ? "nouvelle-categorie" : "nouveau-salon"}
                className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-white placeholder:text-muted-foreground outline-none text-sm focus:border-primary"
              />
            </div>
          </div>

          {/* Topic */}
          {!isCategory && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Sujet / Description
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={2}
                placeholder="De quoi parle ce salon ?"
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-white placeholder:text-muted-foreground outline-none text-sm focus:border-primary resize-none"
              />
            </div>
          )}

          {/* Permissions */}
          {!isCategory && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Permissions
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-white/60 mb-1 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Qui peut voir
                  </label>
                  <select
                    value={readPerm}
                    onChange={(e) => setReadPerm(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-secondary border border-border text-white text-xs outline-none"
                  >
                    <option value="everyone">Tout le monde</option>
                    <option value="mods">Modérateurs+</option>
                    <option value="admin">Admins uniquement</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-white/60 mb-1 flex items-center gap-1">
                    <EyeOff className="w-3 h-3" /> Qui peut écrire
                  </label>
                  <select
                    value={writePerm}
                    onChange={(e) => setWritePerm(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-secondary border border-border text-white text-xs outline-none"
                  >
                    <option value="everyone">Tout le monde</option>
                    <option value="mods">Modérateurs+</option>
                    <option value="admin">Admins uniquement</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Settings — text */}
          {mode === "text" && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Paramètres
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/80">Mode lent (secondes)</span>
                <input
                  type="number"
                  min="0"
                  max="21600"
                  value={slowmode}
                  onChange={(e) => setSlowmode(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded-lg bg-secondary border border-border text-white text-xs outline-none text-center"
                />
              </div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-white/80">Contenu NSFW</span>
                <input
                  type="checkbox"
                  checked={isNsfw}
                  onChange={(e) => setIsNsfw(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
              </label>
            </div>
          )}

          {/* Settings — forum */}
          {mode === "forum" && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Paramètres
              </p>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-white/80">Contenu NSFW</span>
                <input
                  type="checkbox"
                  checked={isNsfw}
                  onChange={(e) => setIsNsfw(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
              </label>
            </div>
          )}

          {/* Category hint */}
          {isCategory && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Les catégories permettent d'organiser vos salons. Créez des salons à
              l'intérieur en faisant un clic droit dans la liste des salons.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:text-white transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!name.trim() || creating}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-50"
              style={{ background: accent }}
            >
              {creating ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}