import React, { useState } from "react";
import { Hash, Plus, Search, X } from "lucide-react";
import { SERVER_TAGS, MAX_SERVER_TAGS, normalizeTag } from "@/lib/serverTags";

/**
 * Sélecteur d'étiquettes : catalogue prédéfini filtrable + création libre.
 * value: string[] — max 5 étiquettes, pas de doublon (insensible à la casse).
 */
export default function TagSelector({ value = [], onChange, max = MAX_SERVER_TAGS }) {
  const [query, setQuery] = useState("");
  const atMax = value.length >= max;

  const addTag = (raw) => {
    const label = normalizeTag(raw);
    if (!label) return;
    if (value.length >= max) return;
    if (value.some((tag) => tag.toLowerCase() === label.toLowerCase())) return;
    onChange([...value, label]);
    setQuery("");
  };

  const toggleTag = (label) => {
    if (value.includes(label)) {
      onChange(value.filter((tag) => tag !== label));
      return;
    }
    addTag(label);
  };

  const q = query.trim().toLowerCase();
  const suggestions = SERVER_TAGS.filter(
    (tag) =>
      !value.some((selected) => selected.toLowerCase() === tag.toLowerCase()) &&
      (!q || tag.toLowerCase().includes(q))
  ).slice(0, 60);

  const canCreate =
    q.length > 0 && !value.some((tag) => tag.toLowerCase() === q) && !atMax;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(query);
    } else if (event.key === "Backspace" && !query && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      {/* Étiquettes sélectionnées */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold"
              style={{ background: "rgba(168,85,247,0.18)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.35)" }}
            >
              #{tag}
              <button type="button" onClick={() => toggleTag(tag)} className="hover:text-white transition tap-sm">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Recherche + compteur */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={atMax ? "Limite atteinte (5 max)" : "Rechercher ou créer une étiquette..."}
            className="w-full h-9 pl-8 pr-2 rounded-lg text-xs text-white placeholder:text-white/30 outline-none"
            style={{ background: "#0d0814", border: "1px solid rgba(138,79,255,0.18)" }}
          />
        </div>
        <span className="text-[9px] font-bold whitespace-nowrap" style={{ color: atMax ? "#fbbf24" : "rgba(255,255,255,0.35)" }}>
          {value.length}/{max}
        </span>
      </div>

      {canCreate && (
        <button
          type="button"
          onClick={() => addTag(query)}
          className="mt-1.5 inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold transition tap-sm"
          style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          <Plus className="w-2.5 h-2.5" /> Créer « {normalizeTag(query)} »
        </button>
      )}

      {/* Catalogue */}
      <div
        className="mt-1.5 max-h-32 overflow-y-auto scrollbar-thin rounded-lg p-2 flex flex-wrap gap-1"
        style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.2)" }}
      >
        {suggestions.length === 0 && (
          <span className="text-[9px] text-white/30 px-1 py-1">
            {atMax ? "Désélectionne une étiquette pour en choisir une autre." : "Aucune étiquette trouvée — crée la tienne."}
          </span>
        )}
        {suggestions.map((tag) => {
          const disabled = atMax;
          return (
            <button
              key={tag}
              type="button"
              disabled={disabled}
              onClick={() => toggleTag(tag)}
              className="inline-flex items-center gap-0.5 px-2 py-1 rounded text-[9px] font-bold transition tap-sm"
              style={
                disabled
                  ? { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.05)", cursor: "not-allowed" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              <Hash className="w-2 h-2" />
              {tag}
            </button>
          );
        })}
      </div>
      <p className="text-[9px] text-white/25 mt-1">
        5 étiquettes maximum · Entrée ou virgule pour valider une étiquette personnalisée.
      </p>
    </div>
  );
}