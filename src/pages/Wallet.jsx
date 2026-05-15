import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Coins, TrendingUp, TrendingDown, ShoppingBag, Dices, Trophy, Zap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/format";
import { useWallet } from "@/hooks/useWallet";

const CHALLENGES = [
  { id: "c1", title: "Première mise gagnante", reward: 100, icon: "🎰", desc: "Gagne ta première partie au casino" },
  { id: "c2", title: "Achète un article", reward: 50, icon: "🛍️", desc: "Effectue ton premier achat sur le market" },
  { id: "c3", title: "Rejoins un vocal", reward: 75, icon: "🎙️", desc: "Connecte-toi à un salon vocal communautaire" },
  { id: "c4", title: "Envoie 10 messages", reward: 30, icon: "💬", desc: "Participe activement à la communauté" },
  { id: "c5", title: "Regarde 5 vidéos", reward: 25, icon: "▶️", desc: "Explore le contenu de la plateforme" },
  { id: "c6", title: "Fais un don TRIX", reward: 150, icon: "💎", desc: "Soutiens un créateur avec des TRIX" },
];

const UNIVERSE_META = {
  casino: { icon: Dices, color: "#f59e0b", label: "Casino" },
  market: { icon: ShoppingBag, color: "hsl(25 100% 55%)", label: "Market" },
  community: { icon: Zap, color: "#a855f7", label: "Community" },
  general: { icon: Coins, color: "hsl(var(--primary))", label: "Général" },
};

const TYPE_META = {
  casino_win: { label: "Gain casino", positive: true },
  casino_loss: { label: "Perte casino", positive: false },
  market_purchase: { label: "Achat market", positive: false },
  market_sale: { label: "Vente market", positive: true },
  challenge_reward: { label: "Récompense défi", positive: true },
  deposit: { label: "Dépôt", positive: true },
  withdrawal: { label: "Retrait", positive: false },
};

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [completedChallenges, setCompletedChallenges] = useState(() => {
    const saved = localStorage.getItem("completed_challenges");
    return saved ? JSON.parse(saved) : [];
  });
  const { balance, addTransaction } = useWallet();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: walletTx = [] } = useQuery({
    queryKey: ["wallet-tx", user?.email],
    queryFn: () => base44.entities.WalletTransaction.filter({ user_email: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const totalWon = walletTx.filter((t) => t.type === "casino_win").reduce((s, t) => s + t.amount, 0);
  const totalSpent = walletTx.filter((t) => t.type === "market_purchase").reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalEarned = walletTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const claimChallenge = async (challenge) => {
    if (completedChallenges.includes(challenge.id)) return;
    await addTransaction("challenge_reward", challenge.reward, `Défi : ${challenge.title}`, "community");
    const updated = [...completedChallenges, challenge.id];
    setCompletedChallenges(updated);
    localStorage.setItem("completed_challenges", JSON.stringify(updated));
  };

  const tabs = [
    { key: "overview", label: "Vue d'ensemble" },
    { key: "casino", label: "Casino" },
    { key: "market", label: "Market" },
    { key: "challenges", label: "Défis" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/profile" className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-black text-xl">💰 Portefeuille</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Balance card */}
        <div className="rounded-3xl p-6 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(135 100% 10%), hsl(135 80% 6%))", border: "1px solid hsl(135 100% 50% / 0.2)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(135 100% 50%), transparent 50%)" }} />
          <p className="text-sm text-muted-foreground font-semibold mb-1">Solde disponible</p>
          <p className="text-5xl font-black text-primary mb-1">{balance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">🪙 Jetons MATRIX</p>
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-lg font-black text-green-400">+{totalEarned.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Total gagné</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-red-400">-{totalSpent.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Total dépensé</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-yellow-400">{totalWon.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Casino</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary/40 rounded-2xl">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition",
                activeTab === t.key ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Dernières transactions</p>
            {walletTx.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Coins className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Aucune transaction</p>
                <p className="text-xs mt-1">Commence par relever des défis !</p>
              </div>
            )}
            {walletTx.slice(0, 20).map((tx) => {
              const uMeta = UNIVERSE_META[tx.universe] || UNIVERSE_META.general;
              const tMeta = TYPE_META[tx.type] || { label: tx.type, positive: tx.amount > 0 };
              const Icon = uMeta.icon;
              return (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card/40">
                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
                    style={{ background: uMeta.color + "20" }}>
                    <Icon className="w-4 h-4" style={{ color: uMeta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{tx.description || tMeta.label}</p>
                    <p className="text-[10px] text-muted-foreground">{uMeta.label} · {formatTimeAgo(tx.created_date)}</p>
                  </div>
                  <span className={cn("font-mono font-black text-sm", tx.amount > 0 ? "text-primary" : "text-destructive")}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount} 🪙
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Casino history */}
        {activeTab === "casino" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 text-center">
                <p className="text-2xl font-black text-yellow-400">{walletTx.filter((t) => t.type === "casino_win").length}</p>
                <p className="text-xs text-muted-foreground">Parties gagnées</p>
              </div>
              <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
                <p className="text-2xl font-black text-red-400">{walletTx.filter((t) => t.type === "casino_loss").length}</p>
                <p className="text-xs text-muted-foreground">Parties perdues</p>
              </div>
            </div>
            {walletTx.filter((t) => t.universe === "casino").map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl border border-border bg-card/40">
                <div>
                  <p className="text-sm font-semibold">{tx.description}</p>
                  <p className="text-[10px] text-muted-foreground">{formatTimeAgo(tx.created_date)}</p>
                </div>
                <span className={cn("font-mono font-black", tx.amount > 0 ? "text-green-400" : "text-red-400")}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount} 🪙
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Market history */}
        {activeTab === "market" && (
          <div className="space-y-3">
            {walletTx.filter((t) => t.universe === "market").length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Aucun article acheté</p>
              </div>
            )}
            {walletTx.filter((t) => t.universe === "market").map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl border border-border bg-card/40">
                <div>
                  <p className="text-sm font-semibold">{tx.description}</p>
                  <p className="text-[10px] text-muted-foreground">{formatTimeAgo(tx.created_date)}</p>
                </div>
                <span className={cn("font-mono font-black", tx.amount > 0 ? "text-green-400" : "text-orange-400")}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount} 🪙
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Challenges */}
        {activeTab === "challenges" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Complète des défis pour gagner des jetons !</p>
            {CHALLENGES.map((c) => {
              const done = completedChallenges.includes(c.id);
              return (
                <div key={c.id} className={cn("flex items-center gap-3 p-4 rounded-2xl border transition",
                  done ? "border-primary/20 bg-primary/5 opacity-60" : "border-border bg-card/40 hover:border-primary/30")}>
                  <span className="text-2xl shrink-0">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-primary">+{c.reward} 🪙</p>
                    {done ? (
                      <span className="text-[10px] text-primary font-semibold">✓ Réclamé</span>
                    ) : (
                      <Button size="sm" onClick={() => claimChallenge(c)}
                        className="mt-1 h-7 text-[10px] font-bold px-2 rounded-xl"
                        style={{ background: "hsl(135 100% 50%)", color: "#0a0a0a" }}>
                        Réclamer
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}