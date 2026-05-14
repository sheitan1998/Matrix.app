import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Plus, Flame, Star, Crown, Rocket, User, ChevronRight, ShoppingBag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ListingCard from "@/components/marketplace/ListingCard";
import ListingForm from "@/components/marketplace/ListingForm";
import SellerProfile from "@/components/marketplace/SellerProfile";
import PublicSellerPage from "@/components/marketplace/PublicSellerPage";

const TOP_MODELS = [
  { name: "Sophie", city: "Paris", avatar: "https://images.unsplash.com/photo-1494790108755-2616b9e77b93?w=120&h=120&fit=crop&crop=face", sales: 247, rating: 4.9, badge: "⭐ Top Vendeur" },
  { name: "Léa", city: "Lyon", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=120&h=120&fit=crop&crop=face", sales: 189, rating: 4.8, badge: "🔥 Populaire" },
  { name: "Emma", city: "Bordeaux", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&h=120&fit=crop&crop=face", sales: 156, rating: 5.0, badge: "💎 Certifié" },
  { name: "Clara", city: "Marseille", avatar: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=120&h=120&fit=crop&crop=face", sales: 134, rating: 4.9, badge: "🚀 Montée" },
  { name: "Jade", city: "Nantes", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face", sales: 112, rating: 4.7, badge: "✨ Nouveau" },
];

const CATEGORY_ICONS = {
  vetements_femme: "👗", vetements_homme: "👔", vetements_enfant: "🧸",
  chaussures: "👟", accessoires: "👜", sport: "⚽", maison: "🏠",
  electronique: "💻", livres: "📚", autre: "📦"
};
const CATEGORIES_BROWSE = [
  { key: "vetements_femme", label: "Femme" },
  { key: "vetements_homme", label: "Homme" },
  { key: "chaussures", label: "Chaussures" },
  { key: "accessoires", label: "Accessoires" },
  { key: "sport", label: "Sport" },
  { key: "electronique", label: "Électronique" },
];

export default function MarketHome() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [viewingSeller, setViewingSeller] = useState(null);

  const { data: listings = [], refetch } = useQuery({
    queryKey: ["listings-home"],
    queryFn: () => base44.entities.Listing.list("-created_date", 60),
  });

  const available = listings.filter((l) => !l.is_sold);
  const trending = [...available].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8);
  const newest = available.slice(0, 10);
  const boosted = available.filter((l) => l.is_boosted).slice(0, 4);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) nav(`/market?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/90 backdrop-blur-xl px-4 lg:px-8 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition"><ArrowLeft className="w-5 h-5" /></Link>
            <span className="font-black text-xl">
              <span style={{ color: "hsl(25 100% 55%)" }}>M</span>ATRIX Market
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/market/subscription"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0"
                style={{ borderColor: "hsl(25 100% 55% / 0.4)", background: "hsl(25 100% 55% / 0.1)", color: "hsl(25 100% 55%)" }}>
                <Rocket className="w-3.5 h-3.5" /> Abonnement
              </Link>
              <button onClick={() => setShowProfile(true)}
                className="p-2 rounded-xl border border-border hover:bg-secondary transition text-muted-foreground hover:text-foreground">
                <User className="w-4 h-4" />
              </button>
              <Button size="sm" onClick={() => setShowForm(true)} className="gap-1 shrink-0 font-bold"
                style={{ background: "hsl(25 100% 55%)", color: "white" }}>
                <Plus className="w-4 h-4" /> Vendre
              </Button>
            </div>
          </div>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un article, une marque..."
              className="pl-12 h-12 rounded-2xl bg-secondary/60 border-border text-base" />
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

        {/* Hero banner */}
        <div className="relative rounded-3xl overflow-hidden h-44 sm:h-56"
          style={{ background: "linear-gradient(135deg, hsl(25 100% 20%) 0%, hsl(15 100% 15%) 50%, hsl(35 100% 18%) 100%)" }}>
          <div className="absolute inset-0 flex flex-col justify-center px-8 gap-3 z-10">
            <p className="font-black text-2xl sm:text-3xl text-white">Vends ce que <br /><span style={{ color: "hsl(25 100% 55%)" }}>tu n'utilises plus</span></p>
            <Button onClick={() => setShowForm(true)} size="sm" className="w-fit gap-2 font-bold rounded-2xl"
              style={{ background: "hsl(25 100% 55%)", color: "white" }}>
              <ShoppingBag className="w-4 h-4" /> Commencer à vendre
            </Button>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20"
            style={{ background: "radial-gradient(circle at 80% 50%, hsl(25 100% 55%), transparent 60%)" }} />
        </div>

        {/* Top Models / Sellers */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-trix" /> Top Vendeurs
            </h2>
            <span className="text-xs text-muted-foreground">Ce mois-ci</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {TOP_MODELS.map((m) => (
              <button key={m.name} onClick={() => setViewingSeller(m)}
                className="shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border border-border bg-card/60 hover:border-orange-500/40 hover:bg-orange-500/5 transition w-28">
                <div className="relative">
                  <img src={m.avatar} className="w-14 h-14 rounded-full object-cover border-2" style={{ borderColor: "hsl(25 100% 55%)" }} alt={m.name} />
                  <div className="absolute -bottom-1 -right-1 text-xs">⭐</div>
                </div>
                <p className="font-bold text-xs">{m.name}</p>
                <p className="text-[10px] text-muted-foreground">{m.city}</p>
                <p className="text-[10px] font-semibold" style={{ color: "hsl(25 100% 55%)" }}>{m.sales} ventes</p>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary">{m.badge}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: ShoppingBag, label: "Articles", value: available.length, color: "hsl(25 100% 55%)" },
            { icon: TrendingUp, label: "Tendances", value: trending.length, color: "hsl(135 100% 50%)" },
            { icon: Crown, label: "En avant", value: boosted.length, color: "hsl(45 100% 55%)" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 p-3 rounded-2xl border border-border bg-card/40">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <p className="font-black text-lg" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <section>
          <h2 className="font-black text-lg mb-3">Parcourir par catégorie</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES_BROWSE.map((c) => (
              <Link key={c.key} to={`/market?cat=${c.key}`}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border hover:border-orange-500/50 hover:bg-orange-500/5 transition group">
                <span className="text-2xl group-hover:scale-110 transition-transform">{CATEGORY_ICONS[c.key]}</span>
                <span className="text-xs font-semibold text-center">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Boosted */}
        {boosted.length > 0 && (
          <section>
            <h2 className="font-black text-lg mb-3 flex items-center gap-2"><Crown className="w-5 h-5 text-trix" /> Articles mis en avant</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {boosted.map((l) => <ListingCard key={l.id} listing={l} boosted onSellerClick={(email) => setViewingSeller({ email })} />)}
            </div>
          </section>
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-lg flex items-center gap-2"><Flame className="w-5 h-5 text-live" /> Tendances</h2>
              <Link to="/market?sort=trending" className="text-sm font-semibold flex items-center gap-1" style={{ color: "hsl(25 100% 55%)" }}>
                Voir tout <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {trending.map((l) => <ListingCard key={l.id} listing={l} onSellerClick={(email) => setViewingSeller({ email })} />)}
            </div>
          </section>
        )}

        {/* Newest */}
        {newest.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-lg flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Nouveautés</h2>
              <Link to="/market" className="text-sm font-semibold flex items-center gap-1" style={{ color: "hsl(25 100% 55%)" }}>
                Explorer <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {newest.map((l) => <ListingCard key={l.id} listing={l} onSellerClick={(email) => setViewingSeller({ email })} />)}
            </div>
          </section>
        )}

        {available.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-4xl mb-4">🛍️</p>
            <p className="text-lg font-semibold">Le marché est vide</p>
            <Button className="mt-4" onClick={() => setShowForm(true)} style={{ background: "hsl(25 100% 55%)", color: "white" }}>
              <Plus className="w-4 h-4 mr-2" /> Mettre en vente
            </Button>
          </div>
        )}
      </div>

      {showForm && <ListingForm onClose={() => { setShowForm(false); refetch(); }} />}
      {showProfile && <SellerProfile onClose={() => setShowProfile(false)} />}
      {viewingSeller && <PublicSellerPage seller={viewingSeller} onClose={() => setViewingSeller(null)} />}
    </div>
  );
}