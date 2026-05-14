import React, { useState, useEffect } from "react";
import { X, Camera, Star, Package, TrendingUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ListingCard from "./ListingCard";
import { toast } from "sonner";

export default function SellerProfile({ onClose }) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ seller_bio: "", seller_location: "", seller_avatar: "" });

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setForm({
        seller_bio: u.seller_bio || "",
        seller_location: u.seller_location || "",
        seller_avatar: u.avatar_url || "",
      });
    }).catch(() => {});
  }, []);

  const { data: myListings = [] } = useQuery({
    queryKey: ["my-listings", user?.email],
    queryFn: () => base44.entities.Listing.filter({ seller_email: user.email }, "-created_date", 20),
    enabled: !!user?.email,
  });

  const save = async () => {
    setSaving(true);
    await base44.auth.updateMe({ seller_bio: form.seller_bio, seller_location: form.seller_location });
    toast.success("Profil mis à jour !");
    setSaving(false);
    setEditing(false);
  };

  const active = myListings.filter((l) => !l.is_sold);
  const sold = myListings.filter((l) => l.is_sold);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden flex flex-col max-h-[92vh] overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(25 100% 55% / 0.1), transparent)" }}>
          <span className="font-black text-lg">Mon profil vendeur</span>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="overflow-y-auto overscroll-contain flex-1">
          {/* Profile card */}
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-secondary border border-border">
                  {user?.avatar_url
                    ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-black text-lg">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                {user?.seller_location && <p className="text-xs text-muted-foreground mt-0.5">📍 {user.seller_location}</p>}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "En vente", value: active.length, icon: Package, color: "text-primary" },
                { label: "Vendus", value: sold.length, icon: TrendingUp, color: "text-orange-500" },
                { label: "Éval.", value: "⭐ 5.0", icon: Star, color: "text-yellow-400" },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-2xl bg-secondary/40">
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Bio */}
            {!editing ? (
              <div>
                <p className="text-sm text-muted-foreground mb-3">{user?.seller_bio || "Aucune bio renseignée."}</p>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="w-full rounded-xl">
                  ✏️ Modifier mon profil
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea placeholder="Ta bio vendeur..." value={form.seller_bio}
                  onChange={(e) => setForm({ ...form, seller_bio: e.target.value })}
                  className="bg-secondary/60 resize-none h-20" />
                <Input placeholder="Localisation (ex: Paris)" value={form.seller_location}
                  onChange={(e) => setForm({ ...form, seller_location: e.target.value })}
                  className="bg-secondary/60" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditing(false)}>Annuler</Button>
                  <Button size="sm" className="flex-1 font-bold" onClick={save} disabled={saving}
                    style={{ background: "hsl(25 100% 55%)", color: "white" }}>
                    <Save className="w-3.5 h-3.5 mr-1" /> {saving ? "..." : "Sauvegarder"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* My listings */}
          <div className="p-5 space-y-4">
            <p className="font-bold text-sm">Mes articles en vente ({active.length})</p>
            {active.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun article en vente</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {active.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
            {sold.length > 0 && (
              <>
                <p className="font-bold text-sm text-muted-foreground">Vendus ({sold.length})</p>
                <div className="grid grid-cols-2 gap-3">
                  {sold.slice(0, 4).map((l) => <ListingCard key={l.id} listing={l} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}