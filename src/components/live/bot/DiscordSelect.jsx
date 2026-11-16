import React, { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { fieldClass, fieldStyle } from "./botUi";

// Menu déroulant avec recherche : salons et rôles Discord.
export default function DiscordSelect({
  value,
  onChange,
  groups = [],
  placeholder = "Sélectionner…",
  emptyLabel = "",
  disabled = false,
  loading = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => groups.flatMap((group) => group.items || []).find((item) => item.value === value) || null,
    [groups, value],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        items: (group.items || []).filter((item) => !needle
          || String(item.label || "").toLowerCase().includes(needle)
          || String(item.value).includes(needle)),
      }))
      .filter((group) => group.items.length);
  }, [groups, query]);

  const pick = (next) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => { setOpen((prev) => !prev); setQuery(""); }}
        className={`${fieldClass} flex items-center gap-2 text-left disabled:opacity-50`}
        style={fieldStyle}
      >
        {selected?.color && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: selected.color }} />}
        <span className={`flex-1 truncate text-[13px] ${selected ? "text-white" : "text-white/30"}`}>
          {loading ? "Chargement des salons…" : selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
      </button>

      {open && !disabled && !loading && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden"
            style={{ background: "#120a1c", border: "1px solid rgba(168,85,247,0.35)", boxShadow: "0 18px 44px rgba(0,0,0,0.6)" }}
          >
            <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Search className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher…"
                className="w-full bg-transparent text-xs text-white placeholder:text-white/25 outline-none"
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {emptyLabel && (
                <button
                  type="button"
                  onClick={() => pick("")}
                  className="w-full text-left px-3 py-2 text-[13px] transition hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {emptyLabel}
                </button>
              )}
              {filtered.map((group) => (
                <div key={group.label}>
                  <p className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {group.label}
                  </p>
                  {group.items.map((item) => (
                    <button
                      key={`${group.label}-${item.value}`}
                      type="button"
                      onClick={() => pick(item.value)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left transition hover:bg-white/5"
                    >
                      {item.color && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />}
                      <span className="flex-1 truncate text-[13px] text-white/80">{item.label}</span>
                      {item.hint && <span className="text-[9px] shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>{item.hint}</span>}
                      {item.value === value && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "#c084fc" }} />}
                    </button>
                  ))}
                </div>
              ))}
              {!filtered.length && <p className="px-3 py-3 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>Aucun résultat</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}