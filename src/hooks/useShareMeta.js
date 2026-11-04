import { useEffect } from "react";

const SITE_URL = "https://matrix-hub.base44.app";

const MANAGED_TAGS = [
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:image"],
  ["property", "og:url"],
  ["property", "og:type"],
  ["name", "twitter:card"],
  ["name", "twitter:title"],
  ["name", "twitter:description"],
  ["name", "twitter:image"],
];

function readTag(attr, key) {
  const el = document.head.querySelector(`meta[${attr}="${key}"]`);
  return el ? el.getAttribute("content") : null;
}

function writeTag(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function truncate(value, max = 200) {
  if (!value) return "";
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * Applique des balises Open Graph / Twitter dynamiques (titre, description, image)
 * quand une fiche mod est ouverte, puis restaure l'état précédent à la fermeture.
 */
export default function useShareMeta({ title, description, image, path }) {
  useEffect(() => {
    if (!title) return undefined;

    const previousTitle = document.title;
    const previousTags = MANAGED_TAGS.map(([attr, key]) => ({
      attr,
      key,
      content: readTag(attr, key),
    }));

    const url = path ? new URL(path, SITE_URL).href : undefined;
    const summary = truncate(description) || `${title} sur MATRIX — mods Farming Simulator 25.`;

    document.title = title;
    writeTag("property", "og:title", title);
    writeTag("property", "og:description", summary);
    writeTag("property", "og:type", "article");
    if (image) writeTag("property", "og:image", image);
    if (url) writeTag("property", "og:url", url);
    writeTag("name", "twitter:card", image ? "summary_large_image" : "summary");
    writeTag("name", "twitter:title", title);
    writeTag("name", "twitter:description", summary);
    if (image) writeTag("name", "twitter:image", image);

    return () => {
      document.title = previousTitle;
      previousTags.forEach(({ attr, key, content }) => {
        if (content === null) {
          document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
        } else {
          writeTag(attr, key, content);
        }
      });
    };
  }, [title, description, image, path]);
}