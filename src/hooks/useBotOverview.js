import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// État temps réel du worker : en ligne, dernière synchro, statistiques du jour.
export default function useBotOverview() {
  const [overview, setOverview] = useState(null);

  const reload = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("botConfig", { action: "state" });
      if (res.data && !res.data.error) setOverview(res.data);
    } catch {
      // le worker peut être momentanément injoignable
    }
  }, []);

  useEffect(() => {
    reload();
    const interval = setInterval(() => {
      if (!document.hidden) reload();
    }, 60000);
    return () => clearInterval(interval);
  }, [reload]);

  return { overview, reloadOverview: reload };
}