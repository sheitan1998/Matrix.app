import React from "react";
import BotSwitch from "./BotSwitch";
import EscalationEditor from "./EscalationEditor";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

const FILTERS = [
  { key: "blacklist", label: "Blacklist", hint: "Mots et expressions interdits. Le caractère * sert de joker.", listKey: "words", listLabel: "Mots interdits" },
  { key: "caps", label: "Excess Caps", hint: "Trop de majuscules.", numbers: [{ key: "minLength", label: "Longueur min." }, { key: "maxPercent", label: "% max majuscules" }] },
  { key: "emotes", label: "Excess Emotes", hint: "Trop d'émotes dans un message.", numbers: [{ key: "maxEmotes", label: "Émotes max" }] },
  { key: "links", label: "Links", hint: "Liens non autorisés.", listKey: "whitelist", listLabel: "Domaines autorisés" },
  { key: "symbols", label: "Excess Symbols", hint: "Trop de symboles ou de caractères consécutifs.", numbers: [{ key: "minLength", label: "Longueur min." }, { key: "maxPercent", label: "% max symboles" }, { key: "maxConsecutive", label: "Consécutifs max" }] },
  { key: "repetitions", label: "Repetitions", hint: "Messages ou caractères répétés.", numbers: [{ key: "maxSameMessages", label: "Mêmes messages max" }, { key: "windowSeconds", label: "Fenêtre (sec)" }, { key: "maxRepeatedChars", label: "Chars répétés max" }, { key: "maxRepeatedWords", label: "Mots répétés max" }] },
];

const EXEMPTS = [
  { key: "regulars", label: "Regulars" },
  { key: "subscribers", label: "Subscribers" },
  { key: "moderators", label: "Moderators" },
];

export default function ChatFiltersEditor({ filters = {}, onChange }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] px-2.5 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
        Sur YouTube, un timeout coûte 200 unités de quota, une suppression 20. Le streamer et les modérateurs sont toujours exemptés.
      </p>

      {FILTERS.map((meta) => {
        const filter = filters[meta.key] || {};
        const patch = (value) => onChange(meta.key, value);
        return (
          <div key={meta.key} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.15)" }}>
            <BotSwitch
              checked={filter.enabled === true}
              onChange={(value) => patch({ enabled: value })}
              label={meta.label}
              description={meta.hint}
            />

            {filter.enabled && (
              <div className="mt-2 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <BotLabel>Niveau exempté</BotLabel>
                    <select
                      value={filter.exempt || "regulars"}
                      onChange={(e) => patch({ exempt: e.target.value })}
                      className={fieldClass}
                      style={fieldStyle}
                    >
                      {EXEMPTS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <BotLabel>Mémoire des infractions (min)</BotLabel>
                    <input
                      type="number"
                      min={1}
                      value={filter.offenseWindowMinutes ?? 30}
                      onChange={(e) => patch({ offenseWindowMinutes: Number(e.target.value) })}
                      className={fieldClass}
                      style={fieldStyle}
                    />
                  </div>
                </div>

                {meta.listKey && (
                  <div>
                    <BotLabel>{meta.listLabel} (un par ligne)</BotLabel>
                    <textarea
                      rows={3}
                      value={(filter[meta.listKey] || []).join("\n")}
                      onChange={(e) => patch({ [meta.listKey]: e.target.value.split("\n") })}
                      placeholder={meta.key === "links" ? "youtube.com\ntwitch.tv" : "mot\nautre mot*"}
                      className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
                      style={fieldStyle}
                    />
                  </div>
                )}

                {meta.numbers && (
                  <div className="grid grid-cols-2 gap-2">
                    {meta.numbers.map((field) => (
                      <div key={field.key}>
                        <BotLabel>{field.label}</BotLabel>
                        <input
                          type="number"
                          min={1}
                          value={filter[field.key] ?? 0}
                          onChange={(e) => patch({ [field.key]: Number(e.target.value) })}
                          className={fieldClass}
                          style={fieldStyle}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <BotLabel>Sanctions progressives</BotLabel>
                  <EscalationEditor
                    steps={filter.escalation || []}
                    onChange={(escalation) => patch({ escalation })}
                  />
                  <p className="text-[10px] text-white/30 mt-1.5">
                    Variables de message : $(user), $(filter), $(reason)
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}