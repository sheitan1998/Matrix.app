import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useValorantData(tab) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const action = tab === "agents" ? "getAgents" : tab === "weapons" ? "getWeapons" : tab === "skins" ? "getSkins" : null;
      if (!action) { setLoading(false); return; }
      const res = await base44.functions.invoke("valorantApi", { action });
      setData(res?.data || []);
    } catch (err) {
      setError(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}