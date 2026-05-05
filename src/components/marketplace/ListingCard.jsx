import React from "react";
import { Link } from "react-router-dom";
import { Heart, Zap } from "lucide-react";

const CONDITION_LABELS = {
  neuf_avec_etiquette: "Neuf ✨",
  neuf_sans_etiquette: "Neuf",
  tres_bon_etat: "TBE",
  bon_etat: "Bon état",
  satisfaisant: "OK",
};

const CONDITION_COLORS = {
  neuf_avec_etiquette: "bg-primary/20 text-primary",
  neuf_sans_etiquette: "bg-primary/10 text-primary",
  tres_bon_etat: "bg-blue-500/15 text-blue-400",
  bon_etat: "bg-yellow-500/15 text-yellow-400",
  satisfaisant: "bg-muted text-muted-foreground",
};

export default function ListingCard({ listing, boosted }) {
  const photo = listing.photos?.[0];

  return (
    <Link to={`/market/${listing.id}`} className="group block">
      <div className={`relative rounded-2xl overflow-hidden border mb-2 ${boosted ? "border-trix/50 ring-1 ring-trix/20" : "border-border"}`}>
        <div className="aspect-[3/4] bg-secondary/40">
          {photo ? (
            <img src={photo} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">📦</div>
          )}
        </div>

        {/* Boosted badge */}
        {boosted && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: "hsl(45 100% 55%)", color: "#000" }}>
            <Zap className="w-2.5 h-2.5" /> Mis en avant
          </div>
        )}

        {/* Condition badge */}
        {listing.condition && (
          <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${CONDITION_COLORS[listing.condition] || "bg-muted text-muted-foreground"}`}>
            {CONDITION_LABELS[listing.condition] || listing.condition}
          </div>
        )}

        <button className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-0.5">
        <p className="font-black text-base" style={{ color: "hsl(25 100% 55%)" }}>{listing.price} €</p>
        <p className="text-sm font-medium truncate mt-0.5">{listing.title}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {listing.size && (
            <span className="px-1.5 py-0.5 rounded-md bg-secondary text-xs font-semibold">
              {listing.size}
            </span>
          )}
          {listing.brand && (
            <span className="text-xs text-muted-foreground truncate">{listing.brand}</span>
          )}
        </div>
      </div>
    </Link>
  );
}