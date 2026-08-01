import React from "react";
import { cn } from "@/lib/utils";

export default function SearchFilters({ filters, active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-border pb-3">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
            active === f.id
              ? "bg-foreground text-background"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}