import React from "react";
import { LayoutGrid } from "lucide-react";

export default function ShopTabs({ categories = [], active, onChange }) {
  const tabs = [{ key: "overview", label: "Vue d'ensemble" }, ...categories.map((c) => ({ key: c.key, label: c.label, icon: c.icon }))];

  return (
    <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition"
            style={
              isActive
                ? {
                    background: "linear-gradient(135deg, rgba(168,85,247,0.35), rgba(109,40,217,0.35))",
                    color: "#fff",
                    border: "1px solid rgba(196,181,253,0.55)",
                    boxShadow: "0 0 20px rgba(139,92,246,0.28)",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }
            }
          >
            {tab.key === "overview" ? (
              <LayoutGrid className="h-3.5 w-3.5" />
            ) : (
              <span className="text-sm leading-none">{tab.icon || "✨"}</span>
            )}
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}