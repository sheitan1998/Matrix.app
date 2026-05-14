import React from "react";
import { X, Star, Package, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ListingCard from "./ListingCard";

export default function PublicSellerPage({ seller, onClose }) {
  const { data: listings = [] } = useQuery({
    queryKey: ["seller-listings", seller?.email],
    queryFn: () => seller?.email ? base44.entities.Listing.filter({ seller_email: seller.email }, "-created_date", 30) : Promise.resolve([]),
    enabled: !!seller?.email,
  });

  const active = listings.filter((l) => !l.is_sold);
  const sold = listings.filter((l) => l.is_sold);

  // For mock top-models (no real email)
  const isMock = !seller?.email;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden flex flex-col max-h-[92vh] overscroll-contain">
        {/* Header */}
        <div className="relative h-28 shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(25 100% 20%), hsl(15 100% 15%))" }}>
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60">
            <X className="w-4 h-4" />
          </button>
          <div className="absolute -bottom-8 left-5">
            {seller?.avatar
              ? <img src={seller.avatar} className="w-16 h-16 rounded-2xl border-4 border-card object-cover" alt={seller.name} />
              : <div className="w-16 h-16 rounded-2xl border-4 border-card bg-secondary flex items-center justify-center text-2xl">👤</div>}
          </div>
        </div>

        <div className="overflow-y-auto overscroll-contain flex-1 pt-10 px-5 pb-5 space-y-4">
          {/* Info */}
          <div className="flex items-end justify-between">
            <div>
              <p className="font-black text-xl">{seller?.name || seller?.email?.split("@")[0] || "Vendeur"}</p>
              {seller?.city && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {seller.city}</p>}
              {seller?.badge && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary mt-1 inline-block">{seller.badge}</span>}
            </div>
            <div className="flex items-center gap-1 text-yellow-400 font-bold">
              <Star className="w-4 h-4 fill-yellow-400" />
              <span>{seller?.rating || "5.0"}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "En vente", value: isMock ? "—" : active.length },
              { label: "Vendus", value: isMock ? seller?.sales || "—" : sold.length },
              { label: "Note", value: seller?.rating || "5.0" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-2xl bg-secondary/40">
                <p className="text-lg font-black" style={{ color: "hsl(25 100% 55%)" }}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Listings */}
          {!isMock && (
            <>
              <p className="font-bold text-sm">Articles en vente ({active.length})</p>
              {active.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucun article en vente actuellement</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {active.map((l) => <ListingCard key={l.id} listing={l} />)}
                </div>
              )}
            </>
          )}

          {isMock && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-3xl mb-2">🛍️</p>
              <p className="text-sm">Ce vendeur n'a pas encore de page publique</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}