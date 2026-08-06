import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

const GROWTH_PER_SECOND = 50; // Must match backend constant
const POLL_INTERVAL = 3000;   // Poll server every 3s
const SMOOTH_INTERVAL = 200;  // Smooth interpolation every 200ms

/**
 * Real-time global jackpot hook.
 * - Polls the server every 3 seconds for the authoritative amount.
 * - Between polls, interpolates smoothly (+50 coins/sec) so the display
 *   continuously increases for all users simultaneously.
 * - All users see the same amount because the value comes from the server.
 */
export function useCasinoJackpot() {
  const [jackpot, setJackpot] = useState(1_000_000);
  const [jackpotInfo, setJackpotInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const serverAmountRef = useRef(1_000_000);
  const lastPollRef = useRef(Date.now());

  useEffect(() => {
    let mounted = true;

    const fetchJackpot = async () => {
      try {
        const res = await base44.functions.invoke("casinoEngine", { action: "getJackpot" });
        if (!mounted || !res.data) return;
        serverAmountRef.current = res.data.amount || 1_000_000;
        lastPollRef.current = Date.now();
        setJackpotInfo(res.data);
      } catch {
        // silent — will retry next poll
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchJackpot();
    const pollTimer = setInterval(fetchJackpot, POLL_INTERVAL);

    // Smooth interpolation between polls
    const smoothTimer = setInterval(() => {
      const elapsed = (Date.now() - lastPollRef.current) / 1000;
      const interpolated = serverAmountRef.current + Math.floor(elapsed * GROWTH_PER_SECOND);
      setJackpot(interpolated);
    }, SMOOTH_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(pollTimer);
      clearInterval(smoothTimer);
    };
  }, []);

  return { jackpot, jackpotInfo, loading };
}

/**
 * Casino engine API helpers — thin wrappers around base44.functions.invoke.
 */
export async function casinoPlaceBet(game, bet, betType = null) {
  const res = await base44.functions.invoke("casinoEngine", {
    action: "placeBet",
    game,
    bet,
    betType,
  });
  return res.data;
}

export async function casinoGetBalance() {
  const res = await base44.functions.invoke("casinoEngine", { action: "getBalance" });
  return res.data?.balance ?? 5000;
}

// casinoAddCoins has been removed for security — casino coin purchases
// must go through a verified payment flow, not a direct backend call.