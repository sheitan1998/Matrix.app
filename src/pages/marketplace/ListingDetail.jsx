import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, Share2, MessageCircle, MapPin, Tag, Ruler, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CONDITION_LABELS = {
  neuf_avec_etiquette: "Neuf avec étiquette",
  neuf_sans_etiquette: "Neuf sans étiquette",
  tres_bon_etat: "Très bon état",
  bon_etat: "Bon état",
  satisfaisant: "Satisfaisant",
};

export default function ListingDetail() {
  const { id } = useParams();
  const [photoIdx, setPhotoIdx] = useState(0);

  const { data: listing } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => base44.entities.Listing.filter({ id }),
    select: (d) => d[0],
  });

  if (!listing) return <div className="p-10 text-muted-foreground">Chargement...</div>;

  const photos = listing.photos?.length ? listing.photos : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
        <Link to="/market" className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold truncate">{listing.title}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-8">
        {/* Photos */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-secondary/40 border border-border mb-3">
            {photos[photoIdx] ? (
              <img src={photos[photoIdx]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Pas de photo</div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {photos.map((p, i) => (
                <button key={i} onClick={() => setPhotoIdx(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === photoIdx ? "border-orange-500" : "border-border"}`}>
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-black">{listing.price} €</p>
            <h1 className="text-xl font-bold mt-1">{listing.title}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {listing.condition && (
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                {CONDITION_LABELS[listing.condition]}
              </span>
            )}
            {listing.size && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-xs font-semibold">
                <Ruler className="w-3 h-3" /> Taille {listing.size}
              </span>
            )}
            {listing.brand && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-xs font-semibold">
                <Tag className="w-3 h-3" /> {listing.brand}
              </span>
            )}
            {listing.color && (
              <span className="px-3 py-1 rounded-full bg-secondary text-xs font-semibold">{listing.color}</span>
            )}
          </div>

          {listing.description && (
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
            </div>
          )}

          {listing.location && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" /> {listing.location}
            </p>
          )}

          {/* Seller */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
              {listing.seller_name?.[0] || "?"}
            </div>
            <div>
              <p className="font-semibold text-sm">{listing.seller_name}</p>
              <p className="text-xs text-muted-foreground">Vendeur</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 h-11 font-bold" style={{ background: "hsl(25 100% 55%)" }}
              onClick={() => toast.success("Message envoyé au vendeur !")}>
              <MessageCircle className="w-4 h-4 mr-2" /> Contacter
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11"
              onClick={() => toast.success("Ajouté aux favoris")}>
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11"
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Lien copié"); }}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}