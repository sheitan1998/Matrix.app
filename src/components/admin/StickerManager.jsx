import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, X, Upload } from "lucide-react";
import { toast } from "sonner";

export default function StickerManager() {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", pack: "Default", image_url: "", sort_order: 0 });
  const [uploading, setUploading] = useState(false);

  const fetchStickers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Sticker.filter({}, "sort_order", 200);
      setStickers(res?.items || res || []);
    } catch { setStickers([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStickers(); }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setForm(prev => ({ ...prev, image_url: file_url }));
      toast.success("Image uploadée");
    } catch { toast.error("Erreur d'upload"); }
    setUploading(false);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.image_url.trim()) {
      toast.error("Nom et image requis");
      return;
    }
    try {
      await base44.entities.Sticker.create({
        name: form.name.trim(),
        pack: form.pack.trim() || "Default",
        image_url: form.image_url,
        sort_order: form.sort_order || 0,
        is_active: true,
      });
      toast.success("Sticker ajouté");
      setShowForm(false);
      setForm({ name: "", pack: "Default", image_url: "", sort_order: 0 });
      fetchStickers();
    } catch { toast.error("Erreur lors de la création"); }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.Sticker.delete(id);
      setStickers(prev => prev.filter(s => s.id !== id));
      toast.success("Sticker supprimé");
    } catch { toast.error("Erreur de suppression"); }
  };

  const handleToggle = async (sticker) => {
    try {
      await base44.entities.Sticker.update(sticker.id, { is_active: !sticker.is_active });
      fetchStickers();
    } catch { toast.error("Erreur"); }
  };

  const packs = [...new Set(stickers.map(s => s.pack || "Default"))];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-white">Stickers</h3>
          <p className="text-xs text-white/40">{stickers.length} sticker(s) · {packs.length} pack(s)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition"
          style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? "Fermer" : "Ajouter"}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 rounded-xl space-y-3" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)" }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Nom</label>
              <input
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom du sticker"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/5 text-white text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase">Pack</label>
              <input
                value={form.pack}
                onChange={e => setForm(prev => ({ ...prev, pack: e.target.value }))}
                placeholder="Default"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/5 text-white text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase">Image du sticker</label>
            <div className="flex items-center gap-2 mt-1">
              {form.image_url ? (
                <img src={form.image_url} alt="" className="w-16 h-16 rounded-lg object-contain" style={{ background: "rgba(0,0,0,0.3)" }} />
              ) : (
                <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <Upload className="w-5 h-5 text-white/30" />
                </div>
              )}
              <label className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-white/60 cursor-pointer text-center transition hover:bg-white/5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {uploading ? "Upload..." : "Choisir une image"}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files?.[0])} disabled={uploading} />
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
              Créer le sticker
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-white/50 hover:text-white transition" style={{ background: "rgba(255,255,255,0.03)" }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : stickers.length === 0 ? (
        <p className="text-center text-sm text-white/30 py-8">Aucun sticker. Cliquez sur "Ajouter" pour en créer un.</p>
      ) : (
        <div className="space-y-4">
          {packs.map(pack => (
            <div key={pack}>
              <p className="text-[10px] font-bold uppercase text-white/40 mb-2">{pack}</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {stickers.filter(s => (s.pack || "Default") === pack).map(s => (
                  <div key={s.id} className="relative group rounded-lg overflow-hidden" style={{ aspectRatio: "1", background: "rgba(0,0,0,0.2)" }}>
                    <img src={s.image_url} alt={s.name} className={`w-full h-full object-contain ${!s.is_active ? "opacity-30" : ""}`} />
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition" style={{ background: "rgba(0,0,0,0.6)" }}>
                      <button onClick={() => handleToggle(s)} className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition" style={{ background: s.is_active ? "rgba(34,197,94,0.3)" : "rgba(168,85,247,0.3)" }} title={s.is_active ? "Désactiver" : "Activer"}>
                        {s.is_active ? "✓" : "✕"}
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="w-7 h-7 rounded-full flex items-center justify-center transition" style={{ background: "rgba(239,68,68,0.3)" }} title="Supprimer">
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}