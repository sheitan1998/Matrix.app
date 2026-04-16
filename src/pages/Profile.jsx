import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Coins, Crown, LogOut, Upload, Radio, History } from "lucide-react";
import { formatTrix, formatTimeAgo } from "@/lib/format";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      setUser(me);
      if (me) {
        const tx = await base44.entities.TrixTransaction.filter({ user_email: me.email }, "-created_date", 20);
        setTransactions(tx);
      }
    })();
  }, []);

  if (!user) return <div className="p-8 text-muted-foreground">Chargement...</div>;

  return (
    <div className="px-4 lg:px-6 py-10 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center gap-5 p-6 rounded-2xl bg-card border border-border">
        <div className="w-20 h-20 rounded-full gradient-matrix flex items-center justify-center text-3xl font-black text-background shrink-0">
          {user.full_name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black truncate">{user.full_name}</h1>
            {user.is_premium && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full gradient-premium text-white text-xs font-bold">
                <Crown className="w-3 h-3" /> PREMIUM
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={() => base44.auth.logout()} className="rounded-full">
          <LogOut className="w-4 h-4 mr-1.5" /> Déconnexion
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/trix-store" className="p-5 rounded-2xl bg-card border border-border hover:border-trix/40 transition group">
          <Coins className="w-6 h-6 text-trix" />
          <p className="text-xs text-muted-foreground mt-3">Solde TRIX</p>
          <p className="text-2xl font-black font-mono mt-1">{formatTrix(user.trix_balance || 0)}</p>
        </Link>
        <Link to="/premium" className="p-5 rounded-2xl bg-card border border-border hover:border-premium/40 transition">
          <Crown className="w-6 h-6 text-premium" />
          <p className="text-xs text-muted-foreground mt-3">Abonnement</p>
          <p className="text-2xl font-black mt-1">{user.is_premium ? "Premium" : "Gratuit"}</p>
        </Link>
        <Link to="/upload" className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition">
          <Radio className="w-6 h-6 text-primary" />
          <p className="text-xs text-muted-foreground mt-3">Créer</p>
          <p className="text-2xl font-black mt-1">Publier</p>
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-5">
          <History className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-bold text-lg">Historique TRIX</h2>
        </div>
        <div className="space-y-2">
          {transactions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Aucune transaction</p>
          )}
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{tx.description}</p>
                <p className="text-xs text-muted-foreground">{formatTimeAgo(tx.created_date)}</p>
              </div>
              <span className={`font-mono font-bold ${tx.amount > 0 ? "text-primary" : "text-muted-foreground"}`}>
                {tx.amount > 0 ? "+" : ""}{formatTrix(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}