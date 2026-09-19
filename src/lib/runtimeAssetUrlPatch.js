import { CANONICAL_APP_ORIGIN } from "@/lib/canonicalOrigin";

const TAURI_HOST_SUFFIX = ".tauri.localhost";
const ASSET_PATH_RE = /^\/(?:media|icons)\//i;
const RESOURCE_PATH_RE = /^\/(?:manifest\.json|sw\.js)(?:[?#].*)?$/i;
const CSS_MEDIA_URL_RE = /url\((['"]?)(\/media\/[^)'"]+)\1\)/gi;

function isTauriRuntime() {
  if (typeof window === "undefined") return false;
  const { protocol, hostname } = window.location;
  return protocol === "tauri:" || hostname === "tauri.localhost" || hostname.endsWith(TAURI_HOST_SUFFIX);
}

function shouldCanonicalizePath(value) {
  if (typeof value !== "string") return false;
  return ASSET_PATH_RE.test(value) || RESOURCE_PATH_RE.test(value);
}

function toCanonicalUrl(path) {
  try {
    return new URL(path, CANONICAL_APP_ORIGIN).toString();
  } catch {
    return path;
  }
}

function patchAttribute(el, attrName) {
  const rawValue = el.getAttribute(attrName);
  if (!rawValue || !shouldCanonicalizePath(rawValue)) return;
  el.setAttribute(attrName, toCanonicalUrl(rawValue));
}

function patchStyleAttribute(el) {
  const rawStyle = el.getAttribute("style");
  if (!rawStyle || !rawStyle.includes("/media/")) return;
  const patchedStyle = rawStyle.replace(CSS_MEDIA_URL_RE, (_, quote, path) => {
    const q = quote || "";
    return `url(${q}${toCanonicalUrl(path)}${q})`;
  });
  if (patchedStyle !== rawStyle) {
    el.setAttribute("style", patchedStyle);
  }
}

function patchNode(node) {
  if (!(node instanceof Element)) return;
  patchAttribute(node, "src");
  patchAttribute(node, "poster");
  patchAttribute(node, "href");
  patchStyleAttribute(node);
  node.querySelectorAll("[src],[poster],[href],[style*='/media/']").forEach((child) => {
    patchAttribute(child, "src");
    patchAttribute(child, "poster");
    patchAttribute(child, "href");
    patchStyleAttribute(child);
  });
}

export function initRuntimeAssetUrlPatch() {
  if (!isTauriRuntime()) return;

  patchNode(document.documentElement);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        patchNode(mutation.target);
        continue;
      }
      mutation.addedNodes.forEach((node) => patchNode(node));
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src", "poster", "href", "style"],
  });
}
