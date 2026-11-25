import { SITE_URL, SITE_NAME } from "@/lib/seoRoutes";

/** Texte sur une ligne, sans espaces superflus. */
export function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

/** Extrait coupé proprement à la limite de mots. */
export function excerpt(value, max = 155) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, "").replace(/[,;:.\s]+$/, "") + "…";
}

/** Libellé lisible déduit d'un slug, utilisé seulement si le nom réel n'est pas chargé. */
export function slugLabel(slug) {
  const text = cleanText(String(slug || "").replace(/[-_]+/g, " "));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Fil d'Ariane : Accueil > Guides gaming > jeu > page. `items` = [{ name, path }]. */
export function breadcrumbNode(items) {
  const list = items.filter((item) => item?.name && item?.path);
  if (list.length < 2) return null;
  return {
    "@type": "BreadcrumbList",
    itemListElement: list.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: SITE_URL + item.path,
    })),
  };
}

/** HowTo : uniquement à partir d'étapes réelles (titre obligatoire). */
export function howToNode({ name, description, image, steps = [] }) {
  const valid = steps.filter((step) => cleanText(step?.title));
  if (!name || !valid.length) return null;
  return {
    "@type": "HowTo",
    name,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    inLanguage: "fr-FR",
    step: valid.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: cleanText(step.title),
      text: cleanText(step.description) || cleanText(step.title),
    })),
  };
}

/** Article : les dates ne sont émises que si les champs réels existent. */
export function articleNode({ headline, description, image, path, created, updated }) {
  if (!headline) return null;
  const url = SITE_URL + path;
  return {
    "@type": "Article",
    headline: excerpt(headline, 110),
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(created ? { datePublished: created } : {}),
    ...(updated ? { dateModified: updated } : {}),
    inLanguage: "fr-FR",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL + "/" },
  };
}

export function graph(...nodes) {
  const list = nodes.filter(Boolean);
  return list.length ? { "@context": "https://schema.org", "@graph": list } : undefined;
}
