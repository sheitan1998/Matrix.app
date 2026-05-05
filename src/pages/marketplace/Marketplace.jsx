import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Search, SlidersHorizontal } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ListingCard from "@/components/marketplace/ListingCard";
import ListingForm from "@/components/marketplace/ListingForm";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "vetements_femme", label: "Femme" },
  { key: "vetements_homme", label: "Homme" },
  { key: "vetements_enfant", label: "Enfant" },
  { key: "chaussures", label: "Chaussures" },
  { key: "accessoires", label: "Accessoires" },
  { key: "sport", label: "Sport" },
  { key: "maison", label: "Maison" },
  { key: "electronique", label: "Électronique" },
  { key: "livres", label: "Livres" },
  { key: "autre", label: "Autre" },
];

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);

  const { data: listings = [], refetch } = useQuery({
    queryKey: ["listings"],
    queryFn: () => base44.entities.Listing.list("-created_date", 80),
  });

  const filtered = listings.filter((l) => {
    if (l.is_sold) return false;
    if (category !== "all" && l.category !== category) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.brand?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl px-4 lg:px-8 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-black text-lg">
            <span style={{ color: "hsl(25 100% 55%)" }}>M</span>ATRIX Market
          </span>
          <div className="flex-1 flex items-center gap-2 max-w-sm ml-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="pl-9 h-8 bg-secondary/60 border-border"
              />
            </div>
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1 shrink-0"
              style={{ background: "hsl(25 100% 55%)", color: "white" }}>
              <Plus className="w-4 h-4" /> Vendre
            </Button>
          </div>
        </div>
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={cn(
                "shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition",
                category === c.key
                  ? "border-transparent text-white"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
              style={category === c.key ? { background: "hsl(25 100% 55%)" } : {}}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-semibold">Aucun article trouvé</p>
            <p className="text-sm mt-1">Sois le premier à vendre quelque chose !</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>

      {showForm && <ListingForm onClose={() => { setShowForm(false); refetch(); }} />}
    </div>
  );
}