import React from "react";
import { Plus, Trash2 } from "lucide-react";
import BotSwitch from "./BotSwitch";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

const SLASH = [
  { key: "slashHelp", label: "/help — liste des commandes" },
  { key: "slashLive", label: "/live — statut du live" },
  { key: "slashRank", label: "/rank — niveau du membre" },
  { key: "slashClear", label: "/clear — supprime des messages" },
];

export default function DiscordCommandsModule({ discord = {}, onChange }) {
  const custom = Array.isArray(discord.customSlash) ? discord.customSlash : [];
  const set = (patch) => onChange(patch);

  const update = (index, patch) => set({
    customSlash: custom.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
  });

  return (
    <div className="space-y-3">
      <BotSwitch
        checked={discord.slashCommandsEnabled !== false}
        onChange={(value) => set({ slashCommandsEnabled: value })}
        label="Commandes slash"
        description="Raccourcis disponibles pour les membres du serveur."
      />

      {discord.slashCommandsEnabled !== false && (
        <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.15)" }}>
          {SLASH.map((item) => (
            <BotSwitch
              key={item.key}
              checked={discord[item.key] !== false}
              onChange={(value) => set({ [item.key]: value })}
              label={item.label}
            />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <BotLabel>Commandes personnalisées</BotLabel>
        {custom.map((entry, index) => (
          <div key={index} className="rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.15)" }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white/40 shrink-0">/</span>
              <input
                value={entry.name || ""}
                onChange={(event) => update(index, { name: event.target.value })}
                placeholder="regles"
                className={`${fieldClass} flex-1`}
                style={fieldStyle}
              />
              <button
                type="button"
                onClick={() => set({ customSlash: custom.filter((_, i) => i !== index) })}
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 tap-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              value={entry.response || ""}
              onChange={(event) => update(index, { response: event.target.value })}
              placeholder="Réponse du bot"
              className={fieldClass}
              style={fieldStyle}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => set({ customSlash: [...custom, { name: "", response: "" }] })}
          className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition tap-sm"
          style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.35)", color: "#c084fc" }}
        >
          <Plus className="w-3.5 h-3.5" /> Ajouter une commande
        </button>
      </div>
    </div>
  );
}