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

  // Update balance: local state only. trix_balance is FLS-locked (admin write only);
  // all persistent credits/debits must go through server-side functions (walletSpend, stripePayment).
  const setBalance = useCallback((valOrFn) => {
    setBalanceState((prev) => typeof valOrFn === "function" ? valOrFn(prev) : valOrFn);
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