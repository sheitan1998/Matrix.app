import React, { useState, useEffect, useRef } from "react";
import { X, Gamepad2, Image as ImageIcon, Upload, Users, Globe, Link2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { uploadImageWithToast } from "@/lib/imageModeration";
import MultiTagSelect from "@/components/prospecteurs/MultiTagSelect";
import CategorySelect from "@/components/prospecteurs/CategorySelect";

const GAMES = [
  "GTA RP", "GTA V", "Minecraft", "Rust", "ARK: Survival Evolved", "Palworld",
  "Valheim", "Garry's Mod", "FiveM", "Roblox", "Fortnite", "Counter-Strike 2",
  "League of Legends", "Valorant", "World of Warcraft", "Genshin Impact",
  "Call of Duty", "Apex Legends", "Rocket League", "Among Us", "Destiny 2",
  "Overwatch 2", "Elden Ring", "Cyberpunk 2077", "RuneScape", "Metin 2",
  "Dofus", "Albion Online", "Black Desert Online", "Final Fantasy XIV",
  "The Elder Scrolls Online", "New World", "Lost Ark", "DayZ", "7 Days to Die",
  "Project Zomboid", "Don't Starve Together", "Terraria", "Stardew Valley",
  "Pokémon", "Super Smash Bros", "Super Mario", "Animal Crossing", "Splatoon",
  "FIFA / EA FC", "NBA 2K", "Madden NFL", "Gran Turismo", "Forza Horizon",
  "Autre",
];

const inputStyle = {
  background: "#0d0814",
  border: "1px solid rgba(138, 79, 255, 0.18)",
};
const labelClass = "text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block";

export default function CreateAdModal({ onClose, onSubmit, initialType = "server", editAd = null }) {
  const adType = editAd?.type || initialType;
  const isPlayerAd = adType === "player";

  const [form, setForm] = useState({
    title: editAd?.title || "",
    description: editAd?.description || "",
    discord_link: editAd?.discord_link || "",
    website_url: editAd?.website_url || "",
    game: editAd?.game || "",
    category: editAd?.category || "",
    category_slug: editAd?.category_slug || "",
    games: editAd?.games || (editAd?.game ? [editAd.game] : []),
    categories: editAd?.categories || (editAd?.category ? [editAd.category] : []),
    category_slugs: editAd?.category_slugs || (editAd?.category_slug ? [editAd.category_slug] : []),
    additional_info: editAd?.additional_info || "",
    max_players: editAd?.max_players || 0,
    player_count_needed: editAd?.player_count_needed || 1,
    availability_hours: editAd?.availability_hours || "",
    player_pseudo: editAd?.player_pseudo || "",
  });
  const [profileImage, setProfileImage] = useState(editAd?.profile_image || "");
  const [coverImage, setCoverImage] = useState(editAd?.cover_image || "");
  const [uploadingField, setUploadingField] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverCategories, setServerCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await base44.entities.ServerCategory.list("sort_order", 200);
        setServerCategories(cats || []);
      } catch { /* silent fallback */ }
    };
    fetchCategories();
  }, []);

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    setUploadingField(type);
    try {
      const result = await uploadImageWithToast(file);
      if (type === "profile") setProfileImage(result.file_url);
      else setCoverImage(result.file_url);
    } catch { /* error already toasted */ }
    finally { setUploadingField(""); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    if (isPlayerAd) {
      if ((form.games || []).length === 0 || !form.availability_hours.trim()) return;
    } else {
      const webUrl = form.website_url.trim();
      if (webUrl && !webUrl.startsWith("https://")) {
        toast.error("Le lien du site web doit commencer par https://");
        return;
      }
    }

    setSubmitting(true);
    const slugify = (text) =>
      text.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const data = {
      ...form,
      type: adType,
      profile_image: profileImage,
      cover_image: isPlayerAd ? "" : coverImage,
      discord_link: isPlayerAd ? "" : form.discord_link,
      website_url: isPlayerAd ? "" : (form.website_url.trim().startsWith("https://") ? form.website_url.trim() : ""),
      games: form.games || [],
      categories: form.categories || [],
      category_slugs: form.category_slugs || (form.categories && form.categories.length > 0
        ? form.categories.map((c) => availableCategories.find((ac) => ac.name === c)?.slug || slugify(c))
        : []),
      game: (form.games && form.games[0]) || form.game || "",
      category: (form.categories && form.categories[0]) || form.category || "",
      category_slug: form.category_slugs?.[0] || form.category_slug || (form.category ? slugify(form.category) : ""),
    };
    await onSubmit(data);
    setSubmitting(false);
  };

  const filteredCategories = serverCategories;
  const availableCategories = filteredCategories.length > 0
    ? filteredCategories
    : ["Gaming", "RP / Roleplay", "Communauté", "Compétitif", "Casual", "Créatif"].map(name => ({ name, slug: "" }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(8, 4, 14, 0.88)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden max-h-[92vh] overflow-y-auto scrollbar-thin"
        style={{ background: "#100a18", border: "1px solid rgba(138, 79, 255, 0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
          style={{ background: "#100a18", borderBottom: "1px solid rgba(138, 79, 255, 0.12)" }}
        >
          <div>
            <h2 className="text-sm font-black tracking-wide text-white">
              {editAd ? "Modifier" : isPlayerAd ? "Recherche joueur" : "Publier un serveur"}
            </h2>
            <p className="text-[10px] text-white/30 mt-0.5">
              {isPlayerAd ? "Trouve des coéquipiers" : "Tous les serveurs sont les bienvenus"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Images row */}
          <div className="flex gap-3">
            {/* Profile image */}
            <div className="flex-1">
              <label className={labelClass}>Logo / Photo</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                  style={{ background: "rgba(138,79,255,0.06)", border: "1px solid rgba(138,79,255,0.15)" }}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-white/15" />
                  )}
                </div>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], "profile")}
                />
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  disabled={uploadingField === "profile"}
                  className="h-8 px-3 rounded-lg text-[10px] font-bold transition flex items-center gap-1 tap-sm"
                  style={inputStyle}
                >
                  <Upload className="w-3 h-3" />
                  {uploadingField === "profile" ? "..." : "Choisir"}
                </button>
              </div>
            </div>

            {/* Cover image (server only) */}
            {!isPlayerAd && (
              <div className="flex-1">
                <label className={labelClass}>Bannière</label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                    style={{ background: "rgba(138,79,255,0.06)", border: "1px solid rgba(138,79,255,0.15)" }}
                  >
                    {coverImage ? (
                      <img src={coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-white/15" />
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], "cover")}
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingField === "cover"}
                    className="h-8 px-3 rounded-lg text-[10px] font-bold transition flex items-center gap-1 tap-sm"
                    style={inputStyle}
                  >
                    <Upload className="w-3 h-3" />
                    {uploadingField === "cover" ? "..." : "Choisir"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className={labelClass}>
              {isPlayerAd ? "Titre de ta recherche *" : "Nom du serveur *"}
            </label>
            <input
              type="text"
              required
              maxLength={60}
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder={isPlayerAd ? "Ex: Recherche coéquipiers Valorant" : "Ex: ALPHA PRIME SERVER"}
              className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/25 outline-none focus:border-purple-500/40 transition"
              style={inputStyle}
            />
          </div>

          {/* Games */}
          <div>
            <label className={labelClass}>
              <Gamepad2 className="w-3 h-3 inline mr-1" />
              Jeux {isPlayerAd ? "*" : "(optionnel)"}
            </label>
            <MultiTagSelect
              options={GAMES}
              value={form.games || []}
              onChange={(games) => {
                setForm((prev) => ({ ...prev, games, game: games[0] || prev.game }));
              }}
              placeholder="Sélectionner un ou plusieurs jeux"
              max={10}
            />
            {isPlayerAd && (form.games || []).length === 0 && (
              <p className="text-[9px] text-red-400 mt-1">Sélectionne au moins un jeu</p>
            )}
          </div>

          {/* Category (server only) */}
          {!isPlayerAd && (
            <div>
              <label className={labelClass}>Catégorie</label>
              <CategorySelect
                value={form.category || ""}
                onChange={(c) => {
                  const name = c.name;
                  const slug = c.slug || (name ? name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : "");
                  setForm((prev) => ({
                    ...prev,
                    category: name,
                    category_slug: slug,
                    categories: name ? [name] : [],
                    category_slugs: slug ? [slug] : [],
                  }));
                }}
                options={availableCategories}
                placeholder="— Sélectionner une catégorie —"
              />
            </div>
          )}

          {/* Player-specific fields */}
          {isPlayerAd && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    <Users className="w-3 h-3 inline mr-1" />
                    Joueurs recherchés *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={form.player_count_needed || ""}
                    onChange={(e) => handleChange("player_count_needed", parseInt(e.target.value) || 1)}
                    placeholder="Ex: 2"
                    className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/25 outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass}>Disponibilité *</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={form.availability_hours}
                    onChange={(e) => handleChange("availability_hours", e.target.value)}
                    placeholder="Ex: 18h-22h"
                    className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/25 outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Pseudo (optionnel)</label>
                <input
                  type="text"
                  maxLength={30}
                  value={form.player_pseudo}
                  onChange={(e) => handleChange("player_pseudo", e.target.value)}
                  placeholder="Ex: ProGamer123"
                  className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/25 outline-none"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {/* Max players (server only) */}
          {!isPlayerAd && (
            <div>
              <label className={labelClass}>Nombre maximum de joueurs</label>
              <input
                type="number"
                min="0"
                max="9999"
                value={form.max_players || ""}
                onChange={(e) => handleChange("max_players", parseInt(e.target.value) || 0)}
                placeholder="Ex: 300"
                className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/25 outline-none"
                style={inputStyle}
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className={labelClass}>Description *</label>
            <textarea
              required
              maxLength={400}
              rows={3}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={isPlayerAd ? "Décris ce que tu recherches..." : "Décris ton serveur..."}
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-white/25 outline-none resize-none"
              style={inputStyle}
            />
          </div>

          {/* Additional info (server only) */}
          {!isPlayerAd && (
            <div>
              <label className={labelClass}>Informations supplémentaires</label>
              <textarea
                maxLength={300}
                rows={2}
                value={form.additional_info}
                onChange={(e) => handleChange("additional_info", e.target.value)}
                placeholder="Règles, événements, contenu..."
                className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-white/25 outline-none resize-none"
                style={inputStyle}
              />
            </div>
          )}

          {/* Links (server only) */}
          {!isPlayerAd && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>
                  <Link2 className="w-3 h-3 inline mr-1" />
                  Lien d'invitation
                  <span className="text-white/20 ml-1 normal-case tracking-normal">(optionnel)</span>
                </label>
                <input
                  type="url"
                  value={form.discord_link}
                  onChange={(e) => handleChange("discord_link", e.target.value)}
                  placeholder="https://discord.gg/... ou lien Nexus"
                  className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/25 outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Globe className="w-3 h-3 inline mr-1" />
                  Site web
                  <span className="text-white/20 ml-1 normal-case tracking-normal">(optionnel)</span>
                </label>
                <input
                  type="url"
                  value={form.website_url}
                  onChange={(e) => handleChange("website_url", e.target.value)}
                  placeholder="https://monsite.com"
                  className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/25 outline-none"
                  style={inputStyle}
                />
                <p className="text-[9px] text-white/25 mt-1">Le lien doit commencer par https://</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || uploadingField !== ""}
            className="w-full h-11 rounded-lg text-xs font-black tracking-wider uppercase transition tap-sm disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #8a4fff, #5b21b6)",
              color: "#fff",
              boxShadow: "0 0 12px rgba(138, 79, 255, 0.2)",
            }}
          >
            {submitting ? "Enregistrement..." : editAd ? "Enregistrer" : isPlayerAd ? "Publier la recherche" : "Publier le serveur"}
          </button>
        </form>
      </div>
    </div>
  );
}