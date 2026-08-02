import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { History, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { formatTrix, formatTimeAgo } from "@/lib/format";

const FILTERS = [
  { key: "all", label: "Tout" },
  { key: "gain", label: "Gains" },
  { key: "spend", label: "Dépenses" },
];

export default function TransactionHistory({ user }) {
  const [filter, setFilter] = useState("all");

  const { data: transactions = [] } = useQuery({
    queryKey: ["mp-transactions", user?.email],
    queryFn: () => base44.entities.TrixTransaction.filter({ user_email: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const filtered = transactions.filter(t => {
    if (filter === "gain") return t.amount > 0;
    if (filter === "spend") return t.amount < 0;
    return true;
  });

  const totalGain = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalSpend = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Solde</p>
          <p className="text-lg font-black text-white font-mono mt-1">{formatTrix(user?.trix_balance || 0)}</p>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
          <p className="text-[10px] text-green-400/60 uppercase tracking-wider">Gains</p>
          <p className="text-lg font-black text-green-400 font-mono mt-1">+{formatTrix(totalGain)}</p>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <p className="text-[10px] text-red-400/60 uppercase tracking-wider">Dépenses</p>
          <p className="text-lg font-black text-red-400 font-mono mt-1">{formatTrix(totalSpend)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition"
            style={filter === f.key
              ? { background: "rgba(168,85,247,0.2)", color: "#fff", border: "1px solid rgba(168,85,247,0.4)" }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Transactions list */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {filtered.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8">Aucune transaction</p>
        ) : (
          <div className="space-y-1">
            {filtered.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: tx.amount > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)" }}>
                    {tx.amount > 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{tx.description || "Transaction"}</p>
                    <p className="text-[10px] text-white/40">{formatTimeAgo(tx.created_date)} · {tx.type}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm shrink-0" style={{ color: tx.amount > 0 ? "#22C55E" : "#ef4444" }}>
                  {tx.amount > 0 ? "+" : ""}{formatTrix(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}