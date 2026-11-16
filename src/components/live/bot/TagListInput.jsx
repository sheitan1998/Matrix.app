import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { fieldStyle } from "./botUi";

// Liste de tags : mots interdits, domaines autorisés, rôles…
export default function TagListInput({ value = [], onChange, placeholder = "Ajouter…" }) {
  const [entry, setEntry] = useState("");

  const add = () => {
    const clean = entry.trim();
    setEntry("");
    if (!clean || value.includes(clean)) return;
    onChange([...value, clean]);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          value={entry}
          onChange={(event) => setEntry(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 h-9 px-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none"
          style={fieldStyle}
        />
        <button
          type="button"
          onClick={add}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 tap-sm"
          style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.35)", color: "#c084fc" }}
          title="Ajouter"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-white"
              style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.32)" }}
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="w-4 h-4 rounded flex items-center justify-center tap-sm"
                style={{ color: "rgba(255,255,255,0.5)" }}
                title="Retirer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}