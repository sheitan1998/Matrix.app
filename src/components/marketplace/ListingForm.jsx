import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Plus } from "lucide-react";
import { useProgression } from "@/context/ProgressionContext";
import MobileSelect from "./MobileSelect";
import { toast } from "sonner";

const CATEGORIES = [
  { key: "vetements_femme", label: "Vêtements Femme" },
  { key: "vetements_homme", label: "Vêtements Homme" },
  { key: "vetements_enfant", label: "Vêtements Enfant" },
  { key: "chaussures", label: "Chaussures" },
  { key: "accessoires", label: "Accessoires" },
  { key: "sport", label: "Sport" },
  { key: "maison", label: "Maison" },
  { key: "electronique", label: "Électronique" },
  { key: "livres", label: "Livres" },
  { key: "autre", label: "Autre" },
];

const CONDITIONS = [
  { key: "neuf_avec_etiquette", label: "Neuf avec étiquette" },
  { key: "neuf_sans_etiquette", label: "Neuf sans étiquette" },
  { key: "tres_bon_etat", label: "Très bon état" },
  { key: "bon_etat", label: "Bon état" },
  { key: "satisfaisant", label: "Satisfaisant" },
];

const SIZES = ["XXS","XS","S","M","L","XL","XXL","3XL","36","37","38","39","40","41","42","43","44","45","Unique"];

export default function ListingForm({ onClose }) {
  const { trackActivity } = useProgression();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", price: "", category: "vetements_femme",
    size: "", brand: "", condition: "tres_bon_etat", color: "", location: "",
  });

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const uploadPhoto = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPhotos((p) => [...p, file_url]);
    setUploading(false);
  };

  const submit = async () => {
    if (!form.title || !form.price || !user) return;
    setSaving(true);
    await base44.entities.Listing.create({
      ...form,
      price: parseFloat(form.price),
      photos,
      seller_email: user.email,
      seller_name: user.full_name,
      seller_avatar: user.avatar_url || "",
    });
    toast.success("Article mis en vente !");
    trackActivity("marketplace_listings");
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden flex flex-col max-h-[90vh] overscroll-contain">
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h2 className="font-black text-lg">Mettre en vente</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="overflow-y-auto overscroll-contain flex-1 p-5 space-y-4">
          {/* Photos */}
          <div>
            <p className="text-sm font-semibold mb-2">Photos (max 5)</p>
            <div className="flex gap-2 flex-wrap">
              {photos.map((p, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                    className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadPhoto(e.target.files[0])} />
                </label>
              )}
            </div>
          </div>

          <Input placeholder="Titre de l'article *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Prix (€) *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input placeholder="Marque" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>

          <MobileSelect
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            options={CATEGORIES}
            placeholder="Catégorie"
          />

          <MobileSelect
            value={form.condition}
            onChange={(v) => setForm({ ...form, condition: v })}
            options={CONDITIONS}
            placeholder="État de l'article"
          />

          <div className="grid grid-cols-2 gap-3">
            <MobileSelect
              value={form.size}
              onChange={(v) => setForm({ ...form, size: v })}
              options={[{ key: "", label: "Taille" }, ...SIZES.map((s) => ({ key: s, label: s }))]}
              placeholder="Taille"
            />
            <Input placeholder="Couleur" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          </div>

          <Input placeholder="Localisation (ex: Paris 75001)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Textarea placeholder="Description de l'article..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-24" />
        </div>
        <div className="p-5 border-t border-border shrink-0">
          <Button onClick={submit} disabled={saving || uploading || !form.title || !form.price}
            className="w-full h-11 font-bold" style={{ background: "hsl(25 100% 55%)" }}>
            {saving ? "Publication..." : uploading ? "Upload photo..." : "Mettre en vente"}
          </Button>
        </div>
      </div>
    </div>
  );
}