import React from "react";
import { Plus } from "lucide-react";
import CommandRow from "./CommandRow";

const emptyCommand = () => ({ name: "", response: "", level: "everyone", enabled: true, cooldown: 0 });

export default function CommandsEditor({ commands = [], onChange, variables = [], prefix = "!" }) {
  const update = (index, patch) => onChange(commands.map((command, i) => (i === index ? { ...command, ...patch } : command)));

  return (
    <div className="space-y-3">
      {commands.length === 0 && (
        <p className="text-[11px] text-white/35">Aucune commande personnalisée. Ajoute par exemple !discord ou !setup.</p>
      )}

      {commands.map((command, index) => (
        <CommandRow
          key={`${command.name || "cmd"}-${index}`}
          command={command}
          variables={variables}
          prefix={prefix}
          onChange={(patch) => update(index, patch)}
          onDelete={() => onChange(commands.filter((_, i) => i !== index))}
        />
      ))}

      <button
        type="button"
        onClick={() => onChange([...commands, emptyCommand()])}
        className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition tap-sm"
        style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.35)", color: "#c084fc" }}
      >
        <Plus className="w-3.5 h-3.5" /> Ajouter une commande
      </button>
    </div>
  );
}