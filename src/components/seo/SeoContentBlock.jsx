import React from "react";
import { Link } from "react-router-dom";

/**
 * SeoContentBlock — bloc de texte statique pour les pages à contenu dynamique.
 * Fournit du contenu crawlable dès le chargement initial (H2 + paragraphes + liens internes).
 */
export default function SeoContentBlock({ eyebrow, title, intro, sections = [], links = [] }) {
  return (
    <section
      aria-label={title}
      className="mt-6 rounded-2xl p-5 sm:p-6"
      style={{
        background: "rgba(18,9,28,0.6)",
        border: "1px solid rgba(168,85,247,0.18)",
      }}
    >
      {eyebrow && (
        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#a855f7" }}>
          {eyebrow}
        </p>
      )}
      <h2 className="text-base sm:text-lg font-black text-white mb-2">{title}</h2>
      {intro && <p className="text-xs sm:text-sm leading-relaxed text-white/60">{intro}</p>}

      {sections.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-black uppercase tracking-wider text-white/90 mb-1">
                {section.title}
              </h3>
              <p className="text-[11px] sm:text-xs leading-relaxed text-white/50">{section.text}</p>
            </div>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className="text-[11px] font-bold underline decoration-purple-500/40 hover:text-white transition"
                style={{ color: "#d8b4fe" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}