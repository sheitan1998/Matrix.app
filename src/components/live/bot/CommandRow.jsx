import React from "react";
import { Trash2 } from "lucide-react";
import BotSwitch from "./BotSwitch";
import { COMMAND_LEVELS } from "./botDefaults";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

export default function CommandRow({ command, variables = [], prefix = "!", onChange, onDelete }) {
  const append = (token) => {
    const next = `${command.response || ""}${command.response ? " " : ""}${token}`;
    onChange({ response: next });
  };

  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.15)" }}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-black text-white/40 shrink-0">{prefix}</span>
        <input
          value={command.name || ""}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="discord"
          className={`${fieldClass} flex-1`}
          style={fieldStyle}
        />
        <button
          type="button"
          onClick={onDelete}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 tap-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2">
        <BotLabel>Réponse du bot</BotLabel>
        <textarea
          rows={2}
          value={command.response || ""}
          onChange={(event) => onChange({ response: event.target.value })}
          placeholder="Rejoins le Discord : discord.gg/matrix"
          className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
          style={fieldStyle}
        />
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {variables.map((variable) => (
            <button
              key={variable.token}
              type="button"
              onClick={() => append(variable.token)}
              className="px-2 py-1 rounded-lg text-[10px] font-semibold transition tap-sm"
              style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", color: "#d8b4fe" }}
            >
              {variable.token}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <BotLabel>Cooldown (secondes)</BotLabel>
          <input
            type="number"
            min={0}
            value={command.cooldown ?? 0}
            onChange={(event) => onChange({ cooldown: Number(event.target.value) })}
            className={fieldClass}
            style={fieldStyle}
          />
        </div>
        <div>
          <BotLabel>Permission requise</BotLabel>
          <select
            value={command.level || "everyone"}
            onChange={(event) => onChange({ level: event.target.value })}
            className={fieldClass}
            style={fieldStyle}
          >
            {COMMAND_LEVELS.map((level) => <option key={level.key} value={level.key}>{level.label}</option>)}
          </select>
        </div>
      </div>

      <BotSwitch
        checked={command.enabled !== false}
        onChange={(value) => onChange({ enabled: value })}
        label="Commande active"
      />
    </div>
  );
}