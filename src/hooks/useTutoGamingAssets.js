import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Hook partagé : charge tous les assets visuels Tuto Gaming depuis la DB,
 * avec souscription temps réel. Retourne un map { [asset_key]: asset }.
 * Les pages publiques utilisent ce map avec fallback sur les constantes codées en dur.
 */
export function useTutoGamingAssets() {
  const [assets, setAssets] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAssets = useCallback(async () => {
    try {
      const page = await base44.entities.TutoGamingAsset.filter({}, { sort: "sort_order", limit: 100 });
      const items = page.items || [];
      const map = {};
      for (const item of items) {
        if (item.asset_key) map[item.asset_key] = item;
      }
      setAssets(map);
    } catch {
      /* silent — fallback to constants */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssets();
    const unsubscribe = base44.entities.TutoGamingAsset.subscribe((event) => {
      setAssets((prev) => {
        const next = { ...prev };
        if (event.type === "delete") {
          delete next[event.data?.asset_key];
        } else {
          if (event.data?.asset_key) next[event.data.asset_key] = event.data;
        }
        return next;
      });
    });
    return () => { unsubscribe(); };
  }, [fetchAssets]);

  return { assets, loading, refresh: fetchAssets };
}

/**
 * Récupère l'URL d'un asset par sa clé, avec fallback.
 */
export function getAssetUrl(assets, key, fallback) {
  const asset = assets[key];
  if (asset && asset.image_url) return asset.image_url;
  return fallback;
}

/**
 * Récupère un champ texte d'un asset, avec fallback.
 */
export function getAssetField(assets, key, field, fallback) {
  const asset = assets[key];
  if (asset && asset[field] != null && asset[field] !== "") return asset[field];
  return fallback;
}