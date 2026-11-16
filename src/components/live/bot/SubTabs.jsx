import React from "react";

export default function SubTabs({ items, value, onChange, accent = "#a855f7" }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto no-scrollbar" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.15)" }}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = value === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className="flex-1 min-w-[104px] h-9 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition tap-sm"
            style={active
              ? { background: `linear-gradient(135deg, ${accent}, #6d28d9)`, color: "#fff", boxShadow: `0 0 14px ${accent}35` }
              : { color: "rgba(255,255,255,0.5)" }}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}