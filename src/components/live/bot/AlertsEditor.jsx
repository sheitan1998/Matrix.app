import React from "react";
import BotSwitch from "./BotSwitch";
import { fieldStyle, BotLabel } from "./botUi";

// Alertes chat : un interrupteur + un message par évènement.
export default function AlertsEditor({ value = {}, fields = [], defaults = {}, onChange }) {
  const patch = (key, changes) => onChange({ ...value, [key]: { ...(value[key] || {}), ...changes } });

  return (
    <div className="space-y-3">
      {fields.map((field) => {
        const alert = value[field.key] || {};
        const fallback = defaults[field.key] || {};
        return (
          <div key={field.key} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.15)" }}>
            <BotSwitch
              checked={alert.enabled === true}
              onChange={(enabled) => patch(field.key, { enabled })}
              label={field.label}
              description={field.description}
            />

            {alert.enabled && (
              <div className="mt-2 space-y-2">
                {field.minViewers && (
                  <div className="w-32">
                    <BotLabel>Viewers minimum</BotLabel>
                    <input
                      type="number"
                      min={1}
                      value={alert.minViewers ?? fallback.minViewers ?? 5}
                      onChange={(event) => patch(field.key, { minViewers: Number(event.target.value) })}
                      className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                      style={fieldStyle}
                    />
                  </div>
                )}
                <div>
                  <BotLabel>Message du bot</BotLabel>
                  <textarea
                    rows={2}
                    value={alert.message || ""}
                    onChange={(event) => patch(field.key, { message: event.target.value })}
                    placeholder={fallback.message || ""}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
                    style={fieldStyle}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
      <p className="text-[10px] text-white/30">Variables disponibles : {"{user}"}, {"{viewers}"}, {"{amount}"}.</p>
    </div>
  );
}