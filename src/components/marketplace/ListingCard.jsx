import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function ListingCard({ listing }) {
  const photo = listing.photos?.[0];

  return (
    <Link to={`/market/${listing.id}`} className="group block">
      <div className="aspect-square rounded-xl overflow-hidden bg-secondary/40 border border-border mb-2 relative">
        {photo ? (
          <img src={photo} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-muted-foreground">📦</div>
        )}
        <button className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition">
          <Heart className="w-3 h-3" />
        </button>
      </div>
      <p className="font-bold text-sm truncate">{listing.title}</p>
      <p className="font-black text-base mt-0.5" style={{ color: "hsl(25 100% 55%)" }}>{listing.price} €</p>
      {listing.size && <p className="text-xs text-muted-foreground">Taille {listing.size}</p>}
      {listing.brand && <p className="text-xs text-muted-foreground">{listing.brand}</p>}
    </Link>
  );
}