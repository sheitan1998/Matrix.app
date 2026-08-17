import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function AccordionBlock({ title, content, image_url, link_url, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-white/[0.03]"
      >
        <span className="text-sm font-bold text-white uppercase tracking-tight">{title}</span>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1">
          {content && (
            <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{content}</p>
          )}
          {image_url && (
            <img src={image_url} alt={title} className="mt-2 rounded-lg w-full" loading="lazy" />
          )}
          {link_url && (
            <a href={link_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs font-bold text-[#7DA627] hover:underline">
              En savoir plus →
            </a>
          )}
        </div>
      )}
    </div>
  );
}