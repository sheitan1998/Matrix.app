import React from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "music", label: "Musique" },
  { key: "gaming", label: "Gaming" },
  { key: "education", label: "Éducation" },
  { key: "entertainment", label: "Divertissement" },
  { key: "sports", label: "Sports" },
  { key: "news", label: "Actualités" },
  { key: "tech", label: "Tech" },
  { key: "comedy", label: "Humour" },
  { key: "lifestyle", label: "Lifestyle" },
];

export default function CategoryChips({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {CATEGORIES.map((c) => (
        <button
          key={c.key}
          onClick={() => onChange(c.key)}
          className={cn(
            "px-4 h-9 rounded-lg text-sm font-medium whitespace-nowrap transition-all border",
            active === c.key
              ? "bg-foreground text-background border-foreground"
              : "bg-secondary/60 text-foreground border-border hover:bg-secondary"
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}