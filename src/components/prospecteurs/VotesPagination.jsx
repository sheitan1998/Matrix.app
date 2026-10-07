import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BTN_STYLE = { background: "rgba(138,79,255,0.08)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" };
const BTN_CLASS = "h-7 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition tap-sm disabled:opacity-30";

export default function VotesPagination({ page, hasMore, disabled, onChange }) {
  if (page === 0 && !hasMore) return null;
  return (
    <div className="flex items-center justify-between gap-2 mt-2">
      <button onClick={() => onChange(page - 1)} disabled={disabled || page === 0} className={BTN_CLASS} style={BTN_STYLE}>
        <ChevronLeft className="w-3 h-3" /> Précédent
      </button>
      <span
        className="h-7 px-2.5 rounded-lg text-[10px] font-bold font-mono flex items-center"
        style={{ background: "rgba(138,79,255,0.2)", color: "#fff", border: "1px solid rgba(138,79,255,0.4)" }}
      >
        Page {page + 1}
      </span>
      <button onClick={() => onChange(page + 1)} disabled={disabled || !hasMore} className={BTN_CLASS} style={BTN_STYLE}>
        Suivant <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}