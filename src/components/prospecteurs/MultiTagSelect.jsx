import React from "react";
import { X } from "lucide-react";

/**
 * Multi-select tag picker: click tags to toggle them on/off.
 * options: [{ value, label }] or string[].
 * value: string[] of selected values.
 */
export default function MultiTagSelect({ options = [], value = [], onChange, placeholder = "Sélectionner...", max = null }) {
  const opts = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );

  const toggle = (val) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      if (max && value.length >= max) return;
      onChange([...value, val]);
    }
  };

  const selected = opts.filter((o) => value.includes(o.value));

  return (
    <div>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selected.map((o) => (
            <span
              key={o.value}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold"
              style={{ background: "rgba(138,79,255,0.2)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.3)" }}
            >
              {o.label}
              <button
                type="button"
                onClick={() => toggle(o.value)}
                className="hover:text-white transition tap-sm"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Available options */}
      <div
        className="max-h-32 overflow-y-auto scrollbar-thin rounded-lg p-2 flex flex-wrap gap-1"
        style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.2)" }}
      >
        {opts.length === 0 && (
          <span className="text-[9px] text-white/30 px-1 py-1">{placeholder}</span>
        )}
        {opts.map((o) => {
          const isSelected = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className="px-2 py-1 rounded text-[9px] font-bold transition tap-sm"
              style={
                isSelected
                  ? { background: "linear-gradient(135deg, #8a4fff, #5b21b6)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {max && (
        <p className="text-[8px] text-white/30 mt-1">{value.length}/{max} sélectionnés</p>
      )}
    </div>
  );
}