import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { fieldClass, fieldStyle } from "./botUi";

const TYPES = [
  { key: "delete", label: "Supprimer" },
  { key: "timeout", label: "Timeout" },
  { key: "warn", label: "Avertir" },
];

export default function EscalationEditor({ steps = [], onChange }) {
  const update = (index, patch) => onChange(steps.map((step, i) => (i === index ? { ...step, ...patch } : step)));

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 w-4 shrink-0">{index + 1}.</span>
          <select
            value={step.type || "delete"}
            onChange={(e) => update(index, { type: e.target.value })}
            className={`${fieldClass} !h-9 flex-1`}
            style={fieldStyle}
          >
            {TYPES.map((type) => <option key={type.key} value={type.key}>{type.label}</option>)}
          </select>
          {step.type === "timeout" && (
            <input
              type="number"
              min={1}
              value={step.seconds ?? 60}
              onChange={(e) => update(index, { seconds: Number(e.target.value) })}
              className={`${fieldClass} !h-9 w-20 shrink-0`}
              style={fieldStyle}
              title="Durée en secondes"
            />
          )}
          <button
            type="button"
            onClick={() => onChange(steps.filter((_, i) => i !== index))}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 tap-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
            title="Retirer cette sanction"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...steps, { type: "delete" }])}
        className="h-8 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 tap-sm"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}
      >
        <Plus className="w-3 h-3" /> Étape
      </button>
    </div>
  );
}