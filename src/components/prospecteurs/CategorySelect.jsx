import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CategorySelect({ value, onChange, options, placeholder = "— Sélectionner —" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = value
    ? options.find((o) => o.name === value)?.name || value
    : "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 px-3 rounded-lg text-sm text-white outline-none flex items-center justify-between transition"
        style={{
          background: "rgba(138, 79, 255, 0.05)",
          border: "1px solid rgba(138, 79, 255, 0.2)",
        }}
      >
        <span className={selectedLabel ? "text-white" : "text-white/30"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg overflow-y-auto scrollbar-thin max-h-52"
          style={{
            background: "#130f1e",
            border: "1px solid rgba(138, 79, 255, 0.3)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              onChange({ name: "", slug: "" });
              setOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-white/50 hover:text-white transition flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(138,79,255,0.1)" }}
          >
            {placeholder}
            {!value && <Check className="w-3.5 h-3.5 text-[#8a4fff]" />}
          </button>
          {options.map((c) => {
            const isSelected = c.name === value;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm transition flex items-center justify-between"
                style={{
                  background: isSelected ? "rgba(138, 79, 255, 0.15)" : "transparent",
                  color: isSelected ? "#fff" : "rgba(255,255,255,0.7)",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "rgba(138,79,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                {c.name}
                {isSelected && <Check className="w-3.5 h-3.5 text-[#a855f7]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}