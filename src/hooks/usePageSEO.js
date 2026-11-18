import { useEffect } from "react";
import { SITE_URL, SITE_NAME, SITE_LOCALE, DEFAULT_IMAGE } from "@/lib/seoRoutes";
import { pickOgBanner } from "@/lib/ogImages";

function upsertMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * usePageSEO — sets title, description, canonical, OpenGraph, Twitter and JSON-LD
 * for the current public page. Every page gets a valid OpenGraph image: the
 * route's thematic visual, then the site default.
 * @param {object} opts
 * @param {string} [opts.title]       Full <title> (format: "Page — Matrix Hub")
 * @param {string} [opts.description] Unique meta description
 * @param {string} [opts.path]        Canonical path (defaults to the current URL)
 * @param {string} [opts.image]       OpenGraph image
 * @param {string} [opts.imageAlt]    English description of the OpenGraph image
 * @param {string} [opts.type]        og:type
 * @param {boolean} [opts.noindex]    Keep the page out of search results
 * @param {object} [opts.schema]      JSON-LD object for this page
 */
export default function usePageSEO({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  noindex = false,
  schema,
} = {}) {
  useEffect(() => {
    document.documentElement.lang = "fr";

    upsertMeta(
      "name",
      "robots",
      noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large"
    );

    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", SITE_LOCALE);
    upsertMeta("name", "twitter:card", "summary_large_image");

    if (!title && !description) return;

    if (title) {
      document.title = title;
      upsertMeta("property", "og:title", title);
      upsertMeta("name", "twitter:title", title);
    }
    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }

    const currentPath = path || window.location.pathname;
    const canonical = SITE_URL + currentPath;
    upsertLink("canonical", canonical);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:type", type);

    const banner = pickOgBanner(currentPath);
    const ogImage = image || banner.url || DEFAULT_IMAGE;
    const ogImageAlt = imageAlt || banner.alt;
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("property", "og:image:secure_url", ogImage);
    upsertMeta("property", "og:image:width", String(banner.width));
    upsertMeta("property", "og:image:height", String(banner.height));
    upsertMeta("property", "og:image:alt", ogImageAlt);
    upsertMeta("name", "twitter:image", ogImage);
    upsertMeta("name", "twitter:image:alt", ogImageAlt);

    const scriptId = "matrix-page-jsonld";
    let script = document.getElementById(scriptId);
    if (schema) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = scriptId;
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    } else if (script) {
      script.remove();
    }
  }, [title, description, path, image, imageAlt, type, noindex, schema]);
}