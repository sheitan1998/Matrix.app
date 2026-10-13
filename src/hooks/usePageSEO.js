import { useEffect } from "react";

const SITE_URL = "https://matrix-hub.base44.app";

function upsertMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * usePageSEO — sets document title, meta description and OpenGraph tags.
 * @param {object} opts
 * @param {string} opts.title       Full <title> for the page
 * @param {string} opts.description Meta description
 * @param {string} [opts.path]      Page path (for og:url)
 */
export default function usePageSEO({ title, description, path }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
    }
    if (title) {
      upsertMeta("property", "og:title", title);
    }
    if (path) {
      upsertMeta("property", "og:url", SITE_URL + path);
    }
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", "MATRIX");
  }, [title, description, path]);
}