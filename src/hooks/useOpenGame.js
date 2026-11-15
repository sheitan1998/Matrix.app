import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CLIENT_GAMES, buildOpenGameClient } from "@/lib/openGameClient";

// Les jeux à API limitante (GW2, Dota 2) sont chargés depuis le navigateur ;
// le serveur fournit en parallèle les onglets couverts par les wikis ouverts.
export default function useOpenGame(slug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    const serverCall = base44.functions
      .invoke("openGameApi", { action: "game", game: slug })
      .then((res) => {
        if (res.data?.error) throw new Error(res.data.error);
        return res.data;
      });

    try {
      if (CLIENT_GAMES.has(slug)) {
        const [client, server] = await Promise.all([
          buildOpenGameClient(slug).catch(() => null),
          serverCall.catch(() => null),
        ]);
        if (!client && !server) throw new Error("Sources temporairement indisponibles");

        const tabs = { ...(server?.tabs || {}) };
        Object.entries(client?.tabs || {}).forEach(([key, tab]) => {
          if (tab?.items?.length) tabs[key] = tab;
        });
        setData({ slug, tabs });
      } else {
        setData(await serverCall);
      }
    } catch (err) {
      setError(err?.message || "Impossible de contacter la source ouverte");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}