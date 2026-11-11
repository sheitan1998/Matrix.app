import React from "react";
import { Plus, Trash2 } from "lucide-react";
import BotSwitch from "./BotSwitch";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

const newTimer = () => ({
  id: `t${Date.now()}`,
  name: "Nouveau minuteur",
  messages: [""],
  intervalMinutes: 15,
  minLines: 5,
  enabled: true,
});

export default function TimersEditor({ timers = [], onChange }) {
  const update = (index, patch) => {
    onChange(timers.map((timer, i) => (i === index ? { ...timer, ...patch } : timer)));
  };

  return (
    <div className="space-y-3">
      {timers.length === 0 && (
        <p className="text-[11px] text-white/35">Aucun message automatique. Ajoute un minuteur pour que le bot parle tout seul.</p>
      )}

      {timers.map((timer, index) => (
        <div key={timer.id} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <div className="flex items-center gap-2">
            <input
              value={timer.name || ""}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="Nom du minuteur"
              className={`${fieldClass} flex-1`}
              style={fieldStyle}
            />
            <button
              type="button"
              onClick={() => onChange(timers.filter((_, i) => i !== index))}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 tap-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2">
            <BotLabel>Messages envoyés à tour de rôle</BotLabel>
            <textarea
              rows={3}
              value={(timer.messages || []).join("\n")}
              onChange={(e) => update(index, { messages: e.target.value.split("\n") })}
              placeholder={"Un message par ligne\n$(user) pense à follow !"}
              className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
              style={fieldStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <BotLabel>Intervalle (minutes)</BotLabel>
              <input
                type="number"
                min={1}
                value={timer.intervalMinutes ?? 15}
                onChange={(e) => update(index, { intervalMinutes: Number(e.target.value) })}
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
            <div>
              <BotLabel>Lignes de chat minimum</BotLabel>
              <input
                type="number"
                min={0}
                value={timer.minLines ?? 0}
                onChange={(e) => update(index, { minLines: Number(e.target.value) })}
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
          </div>

          <BotSwitch
            checked={timer.enabled !== false}
            onChange={(value) => update(index, { enabled: value })}
            label="Minuteur activé"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...timers, newTimer()])}
        className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition tap-sm"
        style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.35)", color: "#c084fc" }}
      >
        <Plus className="w-3.5 h-3.5" /> Ajouter un minuteur
      </button>
    </div>
  );
}