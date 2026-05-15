import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const WALLET_KEY = "matrix_wallet_balance";

export function useWallet() {
  const [balance, setBalanceState] = useState(() => {
    const saved = localStorage.getItem(WALLET_KEY);
    return saved ? parseInt(saved, 10) : 1000;
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const setBalance = useCallback((valOrFn) => {
    setBalanceState((prev) => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      localStorage.setItem(WALLET_KEY, String(next));
      return next;
    });
  }, []);

  const addTransaction = useCallback(async (type, amount, description, universe = "general") => {
    if (!user) return;
    setBalance((b) => b + amount);
    await base44.entities.WalletTransaction.create({
      user_email: user.email,
      type,
      amount,
      description,
      universe,
    });
  }, [user, setBalance]);

  return { balance, setBalance, addTransaction, user };
}