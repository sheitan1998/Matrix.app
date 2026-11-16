import React from "react";
import BotSwitch from "./BotSwitch";
import TagListInput from "./TagListInput";
import { MODERATION_WARNING } from "./botDefaults";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

const cardStyle = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.15)" };

export default function ModerationEditor({ value = {}, actions = [], onChange, note }) {
  const filters = value.filters || {};
  const moderation = value.moderation || {};
  const links = filters.links || {};
  const caps = filters.caps || {};
  const repetitions = filters.repetitions || {};
  const blacklist = filters.blacklist || {};

  const patchFilter = (key, patch) => onChange({ filters: { ...filters, [key]: { ...(filters[key] || {}), ...patch } } });
  const patchModeration = (patch) => onChange({ moderation: { ...moderation, ...patch } });

  return (
    <div className="space-y-3">
      {note && (
        <p className="text-[11px] px-2.5 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>{note}</p>
      )}

      <div className="rounded-xl p-3" style={cardStyle}>
        <BotSwitch
          checked={links.enabled === true}
          onChange={(enabled) => patchFilter("links", { enabled })}
          label="Anti-liens"
          description="Supprime les liens non autorisés envoyés dans le chat."
        />
        {links.enabled && (
          <div className="mt-2 space-y-2">
            <BotLabel>Domaines autorisés</BotLabel>
            <TagListInput
              value={links.whitelist || []}
              onChange={(whitelist) => patchFilter("links", { whitelist })}
              placeholder="youtube.com"
            />
            <BotSwitch
              checked={links.allowClips === true}
              onChange={(allowClips) => patchFilter("links", { allowClips })}
              label="Autoriser les clips"
              description="Les liens de clips de la chaîne restent toujours visibles."
            />
          </div>
        )}
      </div>

      <div className="rounded-xl p-3" style={cardStyle}>
        <BotSwitch
          checked={repetitions.enabled === true}
          onChange={(enabled) => patchFilter("repetitions", { enabled })}
          label="Anti-spam / répétition"
          description="Messages identiques et caractères répétés."
        />
        {repetitions.enabled && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <BotLabel>Messages identiques max</BotLabel>
              <input type="number" min={1} value={repetitions.maxSameMessages ?? 3} onChange={(event) => patchFilter("repetitions", { maxSameMessages: Number(event.target.value) })} className={fieldClass} style={fieldStyle} />
            </div>
            <div>
              <BotLabel>Caractères répétés max</BotLabel>
              <input type="number" min={2} value={repetitions.maxRepeatedChars ?? 15} onChange={(event) => patchFilter("repetitions", { maxRepeatedChars: Number(event.target.value) })} className={fieldClass} style={fieldStyle} />
            </div>
          </div>
        )}
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <BotSwitch
            checked={caps.enabled === true}
            onChange={(enabled) => patchFilter("caps", { enabled })}
            label="Majuscules excessives"
            description="Bloque les messages écrits en majuscules."
          />
          {caps.enabled && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <BotLabel>Longueur min.</BotLabel>
                <input type="number" min={1} value={caps.minLength ?? 15} onChange={(event) => patchFilter("caps", { minLength: Number(event.target.value) })} className={fieldClass} style={fieldStyle} />
              </div>
              <div>
                <BotLabel>Seuil de majuscules (%)</BotLabel>
                <input type="number" min={1} max={100} value={caps.maxPercent ?? 70} onChange={(event) => patchFilter("caps", { maxPercent: Number(event.target.value) })} className={fieldClass} style={fieldStyle} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl p-3" style={cardStyle}>
        <BotSwitch
          checked={blacklist.enabled === true}
          onChange={(enabled) => patchFilter("blacklist", { enabled })}
          label="Mots et expressions interdits"
          description="Le caractère * sert de joker."
        />
        {blacklist.enabled && (
          <div className="mt-2">
            <TagListInput
              value={blacklist.words || []}
              onChange={(words) => patchFilter("blacklist", { words })}
              placeholder="mot interdit"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl p-3" style={cardStyle}>
        <BotLabel>Action par défaut sur infraction</BotLabel>
        <select
          value={moderation.action || "delete"}
          onChange={(event) => patchModeration({ action: event.target.value })}
          className={fieldClass}
          style={fieldStyle}
        >
          {actions.map((action) => <option key={action.key} value={action.key}>{action.label}</option>)}
        </select>
        <div className="mt-2">
          <BotLabel>Message d'avertissement</BotLabel>
          <textarea
            rows={2}
            value={moderation.warning || ""}
            onChange={(event) => patchModeration({ warning: event.target.value })}
            placeholder={MODERATION_WARNING}
            className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
            style={fieldStyle}
          />
          <p className="text-[10px] text-white/30 mt-1">Variables : {"{user}"}, {"{reason}"}</p>
        </div>
      </div>
    </div>
  );
}