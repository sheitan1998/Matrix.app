import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/seoRoutes";

/**
 * SeoBreadcrumbs — fil d'Ariane visible + données structurées BreadcrumbList.
 * items: [{ label, href }] — le dernier élément est la page courante (sans href).
 */
export default function SeoBreadcrumbs({ items = [], className = "" }) {
  const key = JSON.stringify(items);

  useEffect(() => {
    const parsed = JSON.parse(key);
    if (!parsed.length) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "matrix-breadcrumb-jsonld";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: parsed.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        ...(item.href ? { item: SITE_URL + item.href } : {})
      }))
    });
    document.getElementById("matrix-breadcrumb-jsonld")?.remove();
    document.head.appendChild(script);
    return () => script.remove();
  }, [key]);

  if (!items.length) return null;

  return (
    <nav aria-label="Fil d'Ariane" className={`mb-3 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1 text-[10px] text-white/45 hidden">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="w-3 h-3 text-white/20" aria-hidden="true" />}
              {isLast || !item.href ?
              <span aria-current={isLast ? "page" : undefined} className="text-white/70 font-bold">
                  {item.label}
                </span> :

              <Link to={item.href} className="hover:text-white transition tap-sm">
                  {item.label}
                </Link>
              }
            </li>);

        })}
      </ol>
    </nav>);

}