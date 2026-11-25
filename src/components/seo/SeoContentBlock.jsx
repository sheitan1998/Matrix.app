import React, { useEffect, useId } from "react";
import { Link } from "react-router-dom";

/**
 * SeoContentBlock — bloc de texte statique pour les pages à contenu dynamique.
 * Fournit du contenu crawlable dès le chargement initial (H2/H3 + paragraphes + liens internes),
 * ainsi qu'une FAQ optionnelle accompagnée de ses données structurées FAQPage.
 * Props JSON-LD optionnelles (sans effet visuel) :
 *  - itemList : [{ name, url }] → ItemList
 *  - howTo    : { name, description?, steps: [{ name, text }] } → HowTo
 *  - breadcrumb : [{ name, url }] → BreadcrumbList
 * Chaque instance utilise des identifiants de script uniques (useId).
 */
function useJsonLd(suffix, instanceId, dataKey) {
  useEffect(() => {
    if (!dataKey) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = `matrix-${suffix}-jsonld-${instanceId}`;
    script.textContent = dataKey;
    document.head.appendChild(script);
    return () => script.remove();
  }, [suffix, instanceId, dataKey]);
}

export default function SeoContentBlock({ eyebrow, title, intro, sections = [], faq = [], links = [], itemList, howTo, breadcrumb }) {
  const instanceId = useId().replace(/:/g, "");
  const ctx = "https://schema.org";

  const faqData = faq.length ?
  JSON.stringify({
    "@context": ctx,
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  }) :
  "";

  const itemListData = itemList?.length ?
  JSON.stringify({
    "@context": ctx,
    "@type": "ItemList",
    itemListElement: itemList.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { url: item.url } : {})
    }))
  }) :
  "";

  const howToData = howTo?.steps?.length ?
  JSON.stringify({
    "@context": ctx,
    "@type": "HowTo",
    name: howTo.name || title,
    ...(howTo.description ? { description: howTo.description } : {}),
    step: howTo.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text
    }))
  }) :
  "";

  const breadcrumbData = breadcrumb?.length ?
  JSON.stringify({
    "@context": ctx,
    "@type": "BreadcrumbList",
    itemListElement: breadcrumb.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {})
    }))
  }) :
  "";

  useJsonLd("faq", instanceId, faqData);
  useJsonLd("itemlist", instanceId, itemListData);
  useJsonLd("howto", instanceId, howToData);
  useJsonLd("breadcrumb", instanceId, breadcrumbData);

  return (
    <section
      aria-label={title}
      className="mt-6 rounded-2xl p-5 sm:p-6"
      style={{
        background: "rgba(18,9,28,0.6)",
        border: "1px solid rgba(168,85,247,0.18)"
      }}>
      
      {eyebrow &&
      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#a855f7" }}>
          {eyebrow}
        </p>
      }
      <h2 className="text-base sm:text-lg font-black text-white mb-2">{title}</h2>
      {intro && <p className="text-xs sm:text-sm leading-relaxed text-white/60">{intro}</p>}

      {sections.length > 0 &&
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
          {sections.map((section) =>
        <div key={section.title}>
              <h3 className="text-xs font-black uppercase tracking-wider text-white/90 mb-1">
                {section.title}
              </h3>
              <p className="text-[11px] sm:text-xs leading-relaxed text-white/50">{section.text}</p>
            </div>
        )}
        </div>
      }

      {faq.length > 0 &&
      <div className="mt-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-white/90 mb-2">
            Questions fréquentes
          </h3>
          <dl className="space-y-3">
            {faq.map((item) =>
          <div key={item.question}>
                <dt className="text-[11px] sm:text-xs font-bold text-white/85">{item.question}</dt>
                <dd className="text-[11px] sm:text-xs leading-relaxed text-white/50 mt-0.5">
                  {item.answer}
                </dd>
              </div>
          )}
          </dl>
        </div>
      }

          {links.length > 0 &&
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {links.map((link) =>
        <li key={link.href}>
              <Link to={link.href} className="text-[11px] sm:text-xs font-bold text-purple-400 hover:text-purple-300 transition">
                {link.label}
              </Link>
            </li>
        )}
        </ul>
      }
    </section>);

}