import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, ShoppingBag, Coins, Euro, Package } from "lucide-react";
import { formatTrix } from "@/lib/format";
import TrixIcon from "@/components/TrixIcon";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

const RARITY_COLORS = {
  common: "#9ca3af", rare: "#3b82f6", epic: "#a855f7", legendary: "#f59e0b",
};

const CATEGORY_LABELS = {
  badge: "Badges", avatar_animation: "Animations", profile_cover: "Couvertures",
};

export default function CosmeticSalesDashboard() {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopItems, trixTx] = await Promise.all([
          base44.entities.MatrixShopItem.list("-created_date", 200),
          base44.entities.TrixTransaction.list("-created_date", 500),
        ]);
        setItems(shopItems || []);
        setTransactions(trixTx || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();

    // Real-time subscriptions
    const unsubItems = base44.entities.MatrixShopItem.subscribe(() => fetchData());
    const unsubTx = base44.entities.TrixTransaction.subscribe(() => fetchData());
    return () => { unsubItems(); unsubTx(); };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-white/10 rounded-full animate-spin" style={{ borderTopColor: "#a855f7" }} />
      </div>
    );
  }

  // Calculate sales from transactions
  const totalTrixRevenue = transactions.reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const totalSales = transactions.length;
  const totalEuroRevenue = totalTrixRevenue / 100; // 1€ = 100 Trix

  // Sales by item (from transaction descriptions)
  const salesByItem = {};
  transactions.forEach(t => {
    const desc = t.description || "";
    // Extract item name from "Achat cosmétique: <name> (-<amount> Trix)"
    const match = desc.match(/Achat cosmétique:\s*(.+?)\s*\(/);
    const name = match ? match[1] : "Inconnu";
    if (!salesByItem[name]) salesByItem[name] = { count: 0, revenue: 0 };
    salesByItem[name].count++;
    salesByItem[name].revenue += Math.abs(t.amount || 0);
  });

  const topItems = Object.entries(salesByItem)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 8)
    .map(([name, data]) => ({ name: name.length > 20 ? name.substring(0, 18) + "…" : name, ventes: data.count, revenus: data.revenue }));

  // Sales by category
  const salesByCategory = {};
  items.forEach(item => {
    const cat = item.category || "other";
    const catLabel = CATEGORY_LABELS[cat] || cat;
    if (!salesByCategory[catLabel]) salesByCategory[catLabel] = 0;
    salesByCategory[catLabel] += salesByItem[item.name]?.count || 0;
  });
  const categoryData = Object.entries(salesByCategory).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ["#a855f7", "#3b82f6", "#f59e0b", "#22C55E", "#ec4899"];

  // Sales over last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayTx = transactions.filter(t => {
      const td = new Date(t.created_date);
      return td >= d && td < next;
    });
    last7Days.push({
      jour: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][d.getDay()],
      ventes: dayTx.length,
      trix: dayTx.reduce((s, t) => s + Math.abs(t.amount || 0), 0),
    });
  }

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <ShoppingBag className="w-4 h-4 mb-1.5" style={{ color: "#a855f7" }} />
          <p className="text-[10px] text-white/40 uppercase">Ventes totales</p>
          <p className="text-xl font-black text-white">{totalSales}</p>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <TrixIcon size={16} />
          <p className="text-[10px] text-white/40 uppercase mt-0.5">Revenus Trix</p>
          <p className="text-xl font-black text-white">{formatTrix(totalTrixRevenue)}</p>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(34,197,94,0.15)" }}>
          <Euro className="w-4 h-4 mb-1.5" style={{ color: "#22C55E" }} />
          <p className="text-[10px] text-white/40 uppercase">Revenus €</p>
          <p className="text-xl font-black text-white">{totalEuroRevenue.toFixed(2).replace(".", ",")}€</p>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <Package className="w-4 h-4 mb-1.5" style={{ color: "#3b82f6" }} />
          <p className="text-[10px] text-white/40 uppercase">Produits actifs</p>
          <p className="text-xl font-black text-white">{items.filter(i => i.is_active).length}</p>
        </div>
      </div>

      {/* Sales over 7 days */}
      <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" style={{ color: "#a855f7" }} />
          Ventes des 7 derniers jours
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="jour" stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", fontSize: "12px" }}
              labelStyle={{ color: "#fff" }}
            />
            <Bar dataKey="ventes" fill="#a855f7" radius={[6, 6, 0, 0]} name="Ventes" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top selling items */}
        <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-sm font-bold text-white mb-4">Top cosmétiques vendus</h3>
          {topItems.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-8">Aucune vente enregistrée</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", fontSize: "12px" }}
                />
                <Bar dataKey="ventes" fill="#a855f7" radius={[0, 6, 6, 0]} name="Ventes" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sales by category */}
        <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-sm font-bold text-white mb-4">Ventes par catégorie</h3>
          {categoryData.every(c => c.value === 0) ? (
            <p className="text-xs text-white/30 text-center py-8">Aucune vente enregistrée</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fontSize: 10, fill: "#fff" }}>
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Trix revenue trend */}
      <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrixIcon size={16} />
          Revenus Trix (7 derniers jours)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="jour" stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <Tooltip
              contentStyle={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", fontSize: "12px" }}
              labelStyle={{ color: "#fff" }}
            />
            <Line type="monotone" dataKey="trix" stroke="#fbbf24" strokeWidth={2} dot={{ fill: "#fbbf24", r: 4 }} name="Trix" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent transactions */}
      <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-sm font-bold text-white mb-3">Transactions récentes</h3>
        {transactions.length === 0 ? (
          <p className="text-xs text-white/30 text-center py-4">Aucune transaction</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
            {transactions.slice(0, 20).map(tx => (
              <div key={tx.id} className="flex items-center justify-between text-xs py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 truncate">{tx.description || "Achat"}</p>
                  <p className="text-[9px] text-white/30">{new Date(tx.created_date).toLocaleString("fr-FR")}</p>
                </div>
                <span className="font-mono font-bold shrink-0 ml-2" style={{ color: "#fbbf24" }}>
                  -{formatTrix(Math.abs(tx.amount || 0))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}