import { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

/** Quota Matrix AI : état serveur + compte à rebours temps réel. */
export default function useAiQuota() {
  const [quota, setQuota] = useState(null);
  const [now, setNow] = useState(Date.now());
  const refreshing = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("matrixAi", { action: "status" });
      setQuota(res.data);
      return res.data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const resetAt = quota?.next_reset_at ? new Date(quota.next_reset_at).getTime() : 0;
  const remainingMs = resetAt ? Math.max(0, resetAt - now) : 0;

  useEffect(() => {
    if (!quota || !resetAt || remainingMs > 0 || refreshing.current) return;
    refreshing.current = true;
    refresh().finally(() => {
      refreshing.current = false;
    });
  }, [remainingMs, resetAt, quota, refresh]);

  return { quota, setQuota, refresh, remainingMs };
}

export function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return {
    h,
    m,
    s,
    label: h > 0 ? `${pad(h)}h ${pad(m)}m` : `${pad(m)}m ${pad(s)}s`,
    clock: `${pad(h)}:${pad(m)}:${pad(s)}`,
  };
}