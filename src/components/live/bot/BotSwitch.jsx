import React from "react";

export default function BotSwitch({ checked, onChange, label, description, disabled }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        {description && <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full shrink-0 transition tap-sm disabled:opacity-40"
        style={{
          background: checked ? "linear-gradient(135deg, #a855f7, #6d28d9)" : "rgba(255,255,255,0.12)",
          border: `1px solid ${checked ? "rgba(192,132,252,0.6)" : "rgba(255,255,255,0.15)"}`,
          boxShadow: checked ? "0 0 14px rgba(168,85,247,0.45)" : "none",
        }}
      >
        <span
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: checked ? 24 : 4 }}
        />
      </button>
    </div>
  );
}