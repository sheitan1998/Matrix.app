import React, { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AccordionBlock({ title, content, image_url, link_url, link_label, buttons = [], defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="accordion-block w-full rounded-lg overflow-hidden"
      style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", display: "block" }}
      data-accordion="true"
      data-open={open}>
      
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 transition hover:bg-white/[0.03] tap-sm text-center underline uppercase italic"
        style={{ minHeight: "44px" }}
        aria-expanded={open}>
        
        <span className="text-sm font-bold text-white uppercase tracking-tight flex-1">{title}</span>
        <ChevronDown
          className="w-4 h-4 text-white/40 transition-transform duration-300 shrink-0 ml-2"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
        
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open ? "2000px" : "0",
          opacity: open ? 1 : 0,
          paddingTop: open ? "4px" : "0",
          paddingBottom: open ? "16px" : "0"
        }}>
        
        <div className="px-4">
          {content &&
          <div className="text-sm text-white/70 leading-relaxed rich-text-content">
              <ReactMarkdown breaks>{content}</ReactMarkdown>
            </div>
          }
          {image_url &&
          <img
            src={image_url}
            alt={title}
            className="rounded-lg w-full block mx-32 pl-64 pr-64"
            loading="lazy"
            style={{ display: "block" }} />

          }
          {/* Primary link (legacy single link) */}
          {link_url &&
          <a
            href={link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-[#7DA627] hover:underline">
            
              <ExternalLink className="w-3 h-3" />
              {link_label || "En savoir plus"}
            </a>
          }
          {/* Custom action buttons (multi-univers, redirige vers pages dédiées) */}
          {buttons.length > 0 &&
          <div className="mt-3 flex flex-wrap gap-2">
              {buttons.map((btn, i) =>
            <a
              key={i}
              href={btn.url}
              target={btn.url?.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
              style={{
                background: btn.color || "linear-gradient(135deg, #7DA627, #5e8a1c)"
              }}>
              
                  {btn.icon && <span>{btn.icon}</span>}
                  {btn.label}
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
            )}
            </div>
          }
        </div>
      </div>
    </div>);

}