import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Plus, TrendingUp, Flame, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ListingCard from "@/components/marketplace/ListingCard";
import ListingForm from "@/components/marketplace/ListingForm";

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
      {/* Hero Header */}
      <div className="border-b border-border bg-background/90 backdrop-blur-xl px-4 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-black text-xl">
              <span style={{ color: "hsl(25 100% 55%)" }}>M</span>ATRIX Market
            </span>
            <Button size="sm" onClick={() => setShowForm(true)} className="ml-auto gap-1 shrink-0 font-bold"
              style={{ background: "hsl(25 100% 55%)", color: "white" }}>
              <Plus className="w-4 h-4" /> Vendre
            </Button>
          </div>
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un article, une marque..."
              className="pl-12 h-12 rounded-2xl bg-secondary/60 border-border text-base"
            />
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Category grid */}
        <section>
          <h2 className="font-black text-lg mb-3 flex items-center gap-2">
            <span className="text-muted-foreground">Parcourir par</span> catégorie
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES_BROWSE.map((c) => (
              <Link
                key={c.key}
                to={`/market?cat=${c.key}`}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border hover:border-orange-500/50 hover:bg-orange-500/5 transition group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{CATEGORY_ICONS[c.key]}</span>
                <span className="text-xs font-semibold text-center">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Boosted (Mise en avant) */}
        {boosted.length > 0 && (
          <section>
            <h2 className="font-black text-lg mb-3 flex items-center gap-2">
              <Crown className="w-5 h-5 text-trix" />
              Articles mis en avant
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {boosted.map((l) => <ListingCard key={l.id} listing={l} boosted />)}
            </div>
          </section>
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <section>
            <h2 className="font-black text-lg mb-3 flex items-center gap-2">
              <Flame className="w-5 h-5 text-live" />
              Tendances du moment
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {trending.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
            <Link to="/market?sort=trending" className="block text-center mt-3 text-sm font-semibold" style={{ color: "hsl(25 100% 55%)" }}>
              Voir tout →
            </Link>
          </section>
        )}

        {/* Newest */}
        {newest.length > 0 && (
          <section>
            <h2 className="font-black text-lg mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Nouveautés
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {newest.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
            <Link to="/market" className="block text-center mt-3 text-sm font-semibold" style={{ color: "hsl(25 100% 55%)" }}>
              Explorer tous les articles →
            </Link>
          </section>
        )}

        {available.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-4xl mb-4">🛍️</p>
            <p className="text-lg font-semibold">Le marché est vide</p>
            <p className="text-sm mt-1">Sois le premier à vendre quelque chose !</p>
            <Button className="mt-4" onClick={() => setShowForm(true)} style={{ background: "hsl(25 100% 55%)", color: "white" }}>
              <Plus className="w-4 h-4 mr-2" /> Mettre en vente
            </Button>
          </div>
        )}
      </div>

      {showForm && <ListingForm onClose={() => { setShowForm(false); refetch(); }} />}
    </div>
  );
}