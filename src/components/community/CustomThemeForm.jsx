import React, { useState } from "react";
import { Plus } from "lucide-react";
import { buildCustomTheme } from "@/lib/visualThemes";

const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" };

export default function CustomThemeForm({ onCreate, accent }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎨");
  const [themeAccent, setThemeAccent] = useState("#ff2fd0");
  const [bgFrom, setBgFrom] = useState("#0b0420");
  const [bgTo, setBgTo] = useState("#1e0638");
  const preview = buildCustomTheme({ id: "preview", name: name || "Aperçu", emoji, accent: themeAccent, bg_from: bgFrom, bg_to: bgTo });

  const colors = [
    { label: "Accent", value: themeAccent, set: setThemeAccent },
    { label: "Fond 1", value: bgFrom, set: setBgFrom },
    { label: "Fond 2", value: bgTo, set: setBgTo },
  ];

  const submit = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), emoji: emoji.trim() || "🎨", accent: themeAccent, bg_from: bgFrom, bg_to: bgTo });
    setName("");
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