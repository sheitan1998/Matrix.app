import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Coins, Crown, LogOut, Radio, History, LayoutDashboard, Upload, Trash2, AlertTriangle, Wallet, Sparkles } from "lucide-react";
import { formatTrix, formatTimeAgo } from "@/lib/format";
import NitroAvatarPicker, { NitroAvatar } from "@/components/NitroAvatarPicker";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-5 p-6 rounded-2xl bg-card border border-border">
        <button onClick={() => setShowAvatarPicker(true)} className="shrink-0 relative group">
          <NitroAvatar url={user.animated_avatar || user.avatar_url} name={user.full_name} size="xl" />
          {user.is_premium && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-premium flex items-center justify-center border-2 border-background">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black truncate">{user.full_name}</h1>
            {user.is_premium && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full gradient-premium text-white text-xs font-bold">
                <Crown className="w-3 h-3" /> PREMIUM
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => base44.auth.logout()} className="rounded-full">
            <LogOut className="w-4 h-4 mr-1.5" /> Déconnexion
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 mr-1.5" /> Supprimer le compte
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/wallet" className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition group">
          <Wallet className="w-6 h-6 text-primary" />
          <p className="text-xs text-muted-foreground mt-3">Portefeuille</p>
          <p className="text-2xl font-black font-mono mt-1">{formatTrix(user.trix_balance || 0)} 🪙</p>
        </Link>
        <Link to="/premium" className="p-5 rounded-2xl bg-card border border-border hover:border-premium/40 transition">
          <Crown className="w-6 h-6 text-premium" />
          <p className="text-xs text-muted-foreground mt-3">Abonnement</p>
          <p className="text-2xl font-black mt-1">{user.is_premium ? "Premium ✓" : "Gratuit"}</p>
        </Link>
      </div>

      {/* Creator tools */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <h2 className="font-bold text-lg mb-4">Espace Créateur</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link
            to="/dashboard"
            className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition group"
          >
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-sm">Dashboard</p>
              <p className="text-xs text-muted-foreground">Stats & gestion de ta chaîne</p>
            </div>
          </Link>
          <Link
            to="/upload"
            className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition group"
          >
            <Upload className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-sm">Publier une vidéo</p>
              <p className="text-xs text-muted-foreground">Mise en ligne de contenu</p>
            </div>
          </Link>
          <Link
            to="/studio"
            className="flex flex-col items-start gap-3 p-4 rounded-xl border border-border hover:border-live/40 hover:bg-live/5 transition group"
          >
            <Radio className="w-6 h-6 text-live" />
            <div>
              <p className="font-semibold text-sm">Lancer un Live</p>
              <p className="text-xs text-muted-foreground">Diffusion en direct via OBS</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Transaction history */}
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
      {/* Delete account confirmation dialog */}
      {showAvatarPicker && (
        <NitroAvatarPicker user={user} onClose={() => setShowAvatarPicker(false)} onSave={(url) => setUser((u) => ({ ...u, animated_avatar: url }))} />
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-destructive/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-black text-lg">Supprimer le compte</h3>
                <p className="text-xs text-muted-foreground">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Toutes tes données, vidéos, transactions TRIX et abonnements seront définitivement supprimés. Tu ne pourras pas récupérer ton compte.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-full">
                Annuler
              </Button>
              <Button
                onClick={() => { setShowDeleteConfirm(false); base44.auth.logout(); }}
                className="flex-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}