import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function AccordionBlock({ title, content, image_url, link_url, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="accordion-block w-full rounded-lg overflow-hidden"
      style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", display: "block" }}
      data-accordion="true"
      data-open={open}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-white/[0.03] tap-sm"
        style={{ minHeight: "44px" }}
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-white uppercase tracking-tight flex-1">{title}</span>
        <ChevronDown
          className="w-4 h-4 text-white/40 transition-transform duration-300 shrink-0 ml-2"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open ? "2000px" : "0",
          opacity: open ? 1 : 0,
          paddingTop: open ? "4px" : "0",
          paddingBottom: open ? "16px" : "0",
        }}
      >
        <div className="px-4">
          {content && (
            <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{content}</p>
          )}
          {image_url && (
            <img
              src={image_url}
              alt={title}
              className="mt-2 rounded-lg w-full block"
              loading="lazy"
              style={{ display: "block" }}
            />
          )}
          {link_url && (
            <a
              href={link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs font-bold text-[#7DA627] hover:underline"
            >
              En savoir plus →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}