import React from "react";

export const fieldClass =
  "w-full h-10 px-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:border-purple-400/60";
export const fieldStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.22)" };

export function BotLabel({ children }) {
  return <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">{children}</label>;
}

export default function BotField({ label, hint, children }) {
  return (
    <div className="min-w-0">
      {label && <BotLabel>{label}</BotLabel>}
      {children}
      {hint && <p className="text-[10px] text-white/30 mt-1">{hint}</p>}
    </div>
  );
}