import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export default function useBotIntegrations() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("botConfig", { action: "list" });
      setIntegrations(res.data?.integrations || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { integrations, loading, reload };
}