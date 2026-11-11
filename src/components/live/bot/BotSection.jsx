import React from "react";

export default function BotSection({ icon: Icon, title, description, action, children }) {
  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(18,9,28,0.75)", border: "1px solid rgba(168,85,247,0.18)" }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(168,85,247,0.12)" }}>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.3)" }}
          >
            <Icon className="w-4 h-4" style={{ color: "#c084fc" }} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black text-white">{title}</h2>
          {description && <p className="text-[11px] text-white/40 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}