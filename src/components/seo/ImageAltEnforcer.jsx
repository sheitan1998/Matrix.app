import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { contextualAlt } from "@/lib/imageAlt";

/**
 * ImageAltEnforcer — garantit qu'aucune image du site ne reste sans alt anglais.
 * S'applique à toutes les pages, sous-pages et routes dynamiques, y compris
 * les images injectées après le chargement.
 */
export default function ImageAltEnforcer() {
  const { pathname } = useLocation();

  useEffect(() => {
    const apply = () => {
      document.querySelectorAll("img").forEach((img) => {
        const next = contextualAlt(pathname, img.getAttribute("alt"));
        if (next) img.setAttribute("alt", next);
      });
    };

    apply();
    const delayed = setTimeout(apply, 700);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target.tagName === "IMG") {
          const next = contextualAlt(pathname, mutation.target.getAttribute("alt"));
          if (next) mutation.target.setAttribute("alt", next);
          continue;
        }
        apply();
        return;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["alt"],
    });

    return () => {
      clearTimeout(delayed);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}