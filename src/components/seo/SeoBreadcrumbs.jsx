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
      

















      
    </nav>);

}