import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useWallet() {
  const [balance, setBalanceState] = useState(0);
  const [user, setUser] = useState(null);

  // Load balance from server (user.trix_balance), not localStorage
  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then((u) => {
        if (!mounted) return;
        setUser(u);
        setBalanceState(u?.trix_balance ?? 0);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Update balance: persists to the User entity via auth.updateMe so it's in the DB
  const setBalance = useCallback((valOrFn) => {
    setBalanceState((prev) => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      if (user) {
        base44.auth.updateMe({ trix_balance: next }).catch(() => {});
      }
      return next;
    });
  }, [user]);

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