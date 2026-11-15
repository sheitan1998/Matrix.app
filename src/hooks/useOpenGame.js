import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CLIENT_GAMES, buildOpenGameClient } from "@/lib/openGameClient";

export default function useOpenGame(slug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      if (CLIENT_GAMES.has(slug)) {
        setData(await buildOpenGameClient(slug));
        return;
      }
      const res = await base44.functions.invoke("openGameApi", { action: "game", game: slug });
      if (res.data?.error) throw new Error(res.data.error);
      setData(res.data);
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