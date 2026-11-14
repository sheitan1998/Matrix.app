import { useCallback, useEffect, useState } from "react";
import { casinoGetBalance } from "@/hooks/useCasinoJackpot";

const CASINO_BALANCE_KEY = "matrix_casino_coins";

export default function useCasinoCoins() {
  const [coins, setCoinsState] = useState(() => {
    const stored = localStorage.getItem(CASINO_BALANCE_KEY);
    return stored ? parseInt(stored, 10) : 5000;
  });

  const setCoins = useCallback((valueOrFn) => {
    setCoinsState((prev) => {
      const next = typeof valueOrFn === "function" ? valueOrFn(prev) : valueOrFn;
      localStorage.setItem(CASINO_BALANCE_KEY, String(next));
      return next;
    });
  }, []);

  const refreshBalance = useCallback(() => {
    return casinoGetBalance()
      .then((serverBalance) => {
        setCoins(serverBalance);
        return serverBalance;
      })
      .catch(() => null);
  }, [setCoins]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  return [coins, setCoins, refreshBalance];
}