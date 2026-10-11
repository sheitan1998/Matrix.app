import { useEffect, useRef } from "react";

/**
 * Cache global des images déjà préchargées (URL → true si chargée).
 * Persiste entre les montages/démontages de composants.
 */
const imageCache = new Set();

/**
 * Précharge une liste d'URLs d'images en arrière-plan.
 * Les images déjà en cache ne sont pas re-téléchargées.
 *
 * @param {string[]} urls - Liste d'URLs d'images à précharger
 * @returns {void}
 */
export function preloadImages(urls) {
  if (!urls || !urls.length) return;
  for (const url of urls) {
    if (!url || imageCache.has(url)) continue;
    imageCache.add(url);
    const img = new Image();
    img.src = url;
  }
}

/**
 * Hook React qui précharge une liste d'images au montage du composant.
 * Idéal pour précharger les assets casino dès l'arrivée sur l'app.
 *
 * @param {string[]} urls - Liste d'URLs d'images à précharger
 * @param {boolean} enabled - Activer/désactiver le préchargement (défaut: true)
 */
export function useAssetPreloader(urls, enabled = true) {
  const urlsRef = useRef(urls);
  urlsRef.current = urls;

  useEffect(() => {
    if (!enabled) return;
    preloadImages(urlsRef.current);
  }, [enabled]);
}

/**
 * Vérifie si une image est déjà en cache.
 * @param {string} url
 * @returns {boolean}
 */
export function isImageCached(url) {
  return imageCache.has(url);
}