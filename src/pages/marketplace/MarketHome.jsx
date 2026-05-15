import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Plus, Flame, Star, Crown, Rocket, User, ChevronRight, ShoppingBag, TrendingUp, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ListingCard from "@/components/marketplace/ListingCard";
import ListingForm from "@/components/marketplace/ListingForm";
import SellerProfile from "@/components/marketplace/SellerProfile";
import PublicSellerPage from "@/components/marketplace/PublicSellerPage";

const ACCENT = "hsl(25 100% 55%)";

const TOP_MODELS = [
  { name: "Sophie", city: "Paris", avatar: "https://images.unsplash.com/photo-1494790108755-2616b9e77b93?w=160&h=160&fit=crop&crop=face", sales: 247, rating: 4.9, badge: "⭐ Top" },
  { name: "Léa", city: "Lyon", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=160&h=160&fit=crop&crop=face", sales: 189, rating: 4.8, badge: "🔥 Hot" },
  { name: "Emma", city: "Bordeaux", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=160&fit=crop&crop=face", sales: 156, rating: 5.0, badge: "💎 Pro" },
  { name: "Clara", city: "Marseille", avatar: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=160&h=160&fit=crop&crop=face", sales: 134, rating: 4.9, badge: "🚀 ++" },
  { name: "Jade", city: "Nantes", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&crop=face", sales: 112, rating: 4.7, badge: "✨ New" },
];

const FASHION_BANNERS = [
  { img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", label: "Nouvelle collection" },
  { img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80", label: "Mode printemps" },
  { img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80", label: "Tendances" },
];

const CATEGORIES = [
  { key: "vetements_femme", label: "Femme", emoji: "👗", img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200&h=200&fit=crop" },
  { key: "vetements_homme", label: "Homme", emoji: "👔", img: "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=200&h=200&fit=crop" },
  { key: "chaussures", label: "Chaussures", emoji: "👟", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop" },
  { key: "accessoires", label: "Accessoires", emoji: "👜", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop" },
  { key: "sport", label: "Sport", emoji: "⚽", img: "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=200&h=200&fit=crop" },
  { key: "electronique", label: "Tech", emoji: "💻", img: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=200&h=200&fit=crop" },
];

export default function MarketHome() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [viewingSeller, setViewingSeller] = useState(null);
  const [bannerIdx, setBannerIdx] = useState(0);

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
      <div className="border-b border-border bg-background/95 backdrop-blur-xl px-4 lg:px-8 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition"><ArrowLeft className="w-5 h-5" /></Link>
            <span className="font-black text-2xl">
              <span style={{ color: ACCENT }}>M</span>ATRIX Market
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/market/subscription"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0"
                style={{ borderColor: ACCENT + "66", background: ACCENT + "18", color: ACCENT }}>
                <Rocket className="w-3.5 h-3.5" /> Pro
              </Link>
              <button onClick={() => setShowProfile(true)}
                className="p-2 rounded-xl border border-border hover:bg-secondary transition text-muted-foreground hover:text-foreground">
                <User className="w-4 h-4" />
              </button>
              <Button size="sm" onClick={() => setShowForm(true)} className="gap-1 shrink-0 font-bold"
                style={{ background: ACCENT, color: "white" }}>
                <Plus className="w-4 h-4" /> Vendre
              </Button>
            </div>
          </div>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Robe, Jordan 1, Vintage Levi's..."
              className="pl-12 h-12 rounded-2xl bg-secondary/60 border-border text-base" />
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">

        {/* Hero — fashion photo banner */}
        <div className="relative rounded-3xl overflow-hidden h-52 sm:h-72 cursor-pointer group"
          onClick={() => setBannerIdx((i) => (i + 1) % FASHION_BANNERS.length)}>
          <img src={FASHION_BANNERS[bannerIdx].img}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            alt="Fashion banner" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />
          <div className="absolute inset-0 flex flex-col justify-center px-8 gap-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Nouveautés</p>
            <p className="font-black text-3xl sm:text-4xl text-white leading-tight">{FASHION_BANNERS[bannerIdx].label}</p>
            <Button onClick={(e) => { e.stopPropagation(); setShowForm(true); }} size="sm" className="w-fit gap-2 font-bold rounded-2xl"
              style={{ background: ACCENT, color: "white" }}>
              <ShoppingBag className="w-4 h-4" /> Vendre maintenant
            </Button>
          </div>
          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {FASHION_BANNERS.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === bannerIdx ? ACCENT : "rgba(255,255,255,0.4)" }} />
            ))}
          </div>
        </div>

        {/* Top Sellers with fashion vibe */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-xl flex items-center gap-2">
              <Crown className="w-5 h-5 text-trix" /> Top Vendeurs
            </h2>
            <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-secondary">Ce mois-ci</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {TOP_MODELS.map((m) => (
              <button key={m.name} onClick={() => setViewingSeller(m)}
                className="shrink-0 flex flex-col items-center gap-2 group">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 transition group-hover:scale-105"
                    style={{ borderColor: ACCENT + "80" }}>
                    <img src={m.avatar} className="w-full h-full object-cover" alt={m.name} />
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-xs px-1.5 py-0.5 rounded-full font-bold text-white"
                    style={{ background: ACCENT, fontSize: "9px" }}>{m.badge}</span>
                </div>
                <p className="font-bold text-xs text-center">{m.name}</p>
                <p className="text-[10px] text-muted-foreground">{m.city}</p>
                <p className="text-[10px] font-black" style={{ color: ACCENT }}>{m.sales} ventes</p>
              </button>
            ))}
          </div>
        </section>

        {/* Category grid with photos */}
        <section>
          <h2 className="font-black text-xl mb-4 flex items-center gap-2"><Tag className="w-5 h-5" style={{ color: ACCENT }} /> Catégories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map((c) => (
              <Link key={c.key} to={`/market?cat=${c.key}`}
                className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-border group-hover:border-orange-500/60 transition relative">
                  <img src={c.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={c.label} />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition" />
                  <span className="absolute bottom-2 left-0 right-0 text-center text-xl">{c.emoji}</span>
                </div>
                <span className="text-xs font-bold text-center">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: ShoppingBag, label: "En vente", value: available.length, color: ACCENT },
            { icon: TrendingUp, label: "Tendances", value: trending.length, color: "hsl(135 100% 50%)" },
            { icon: Crown, label: "Mis en avant", value: boosted.length, color: "hsl(45 100% 55%)" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 p-4 rounded-2xl border border-border bg-card/50">
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
              <p className="font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Boosted */}
        {boosted.length > 0 && (
          <section>
            <h2 className="font-black text-xl mb-4 flex items-center gap-2"><Crown className="w-5 h-5 text-trix" /> En vedette</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {boosted.map((l) => <ListingCard key={l.id} listing={l} onSellerClick={(email) => setViewingSeller({ email })} />)}
            </div>
          </section>
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-xl flex items-center gap-2"><Flame className="w-5 h-5 text-live" /> Tendances</h2>
              <Link to="/market" className="text-sm font-semibold flex items-center gap-1" style={{ color: ACCENT }}>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-xl flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Nouveautés</h2>
              <Link to="/market" className="text-sm font-semibold flex items-center gap-1" style={{ color: ACCENT }}>
                Explorer <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {newest.map((l) => <ListingCard key={l.id} listing={l} onSellerClick={(email) => setViewingSeller({ email })} />)}
            </div>
          </section>
        )}

        {available.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop" className="rounded-3xl mx-auto mb-6 opacity-40 object-cover" alt="" />
            <p className="text-xl font-black mb-2">Le marché est vide</p>
            <p className="text-sm mb-6">Sois le premier à vendre quelque chose !</p>
            <Button onClick={() => setShowForm(true)} style={{ background: ACCENT, color: "white" }} className="font-bold">
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