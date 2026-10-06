import React, { useState, useEffect, useRef } from "react";
import { X, Gamepad2, Image as ImageIcon, Upload, Users, Clock, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { uploadImageWithToast } from "@/lib/imageModeration";
import MultiTagSelect from "@/components/prospecteurs/MultiTagSelect";

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
const CATEGORIES = [
  "Gaming", "RP / Roleplay", "Communauté", "Compétitif", "Casual", "Créatif",
  "Survie", "PVE", "PVP", "Moddé", "Semi-Vanilla", "Hardcore", "Mini-Jeux",
  "Événementiel", "Autre",
];

export default function CreateAdModal({ onClose, onSubmit, initialType = "server", initialServerType = "nexus", editAd = null }) {
  const [adType, setAdType] = useState(editAd?.type || initialType);
  const [serverSubType, setServerSubType] = useState(editAd?.server_type || initialServerType);
  const [form, setForm] = useState({
    title: editAd?.title || "",
    description: editAd?.description || "",
    discord_link: editAd?.discord_link || "",
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

  // Fetch dynamic categories from ServerCategory entity (managed in admin)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await base44.entities.ServerCategory.list("sort_order", 200);
        setServerCategories(cats || []);
      } catch { /* silent fallback to hardcoded */ }
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
      if (type === "profile") {
        setProfileImage(result.file_url);
      } else {
        setCoverImage(result.file_url);
      }
    } catch { /* error already toasted */ }
    finally {
      setUploadingField("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (adType === "server") {
      if (!form.title.trim() || !form.description.trim() || !form.discord_link.trim()) return;
      const link = form.discord_link.trim().toLowerCase();
      if (serverSubType === "nexus") {
        if (link.includes("discord.gg") || link.includes("discord.com") || link.includes("discordapp.com")) {
          toast.error("Les liens Discord ne sont pas acceptés dans la catégorie Nexus. Utilisez un lien de serveur Nexus.");
          return;
        }
      } else {
        if (!link.includes("discord.gg") && !link.includes("discord.com") && !link.includes("discordapp.com")) {
          toast.error("Un lien Discord est requis pour la catégorie Serveurs Discord.");
          return;
        }
      }
    } else {
      if (!form.title.trim() || !form.description.trim() || (form.games || []).length === 0 || !form.availability_hours.trim()) return;
    }
    setSubmitting(true);
    const slugify = (text) => text.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const data = {
      ...form,
      type: adType,
      server_type: adType === "server" ? serverSubType : undefined,
      profile_image: profileImage,
      cover_image: adType === "server" ? coverImage : "",
      discord_link: adType === "server" ? form.discord_link : "",
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

  // Filter categories by selected server type (nexus/discord/both)
  const filteredCategories = serverCategories.filter(
    (c) => c.type === serverSubType || c.type === "both"
  );
  const availableCategories = filteredCategories.length > 0 ? filteredCategories : CATEGORIES.map(name => ({ name, slug: "" }));

  const inputStyle = {
    background: "rgba(138, 79, 255, 0.05)",
    border: "1px solid rgba(138, 79, 255, 0.2)",
  };
  const labelClass = "text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10, 5, 15, 0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin"
        style={{ background: "#12091c", border: "1px solid rgba(138, 79, 255, 0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
          style={{ background: "#12091c", borderBottom: "1px solid rgba(138, 79, 255, 0.2)" }}
        >
          <h2 className="text-sm font-black tracking-wider uppercase text-white">
            {editAd ? "Modifier l'annonce" : adType === "server" ? "Publier un serveur" : "Recherche joueur"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type toggle */}
        <div className="px-5 pt-4">
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(138, 79, 255, 0.05)" }}>
            <button
              type="button"
              onClick={() => setAdType("server")}
              className="flex-1 h-8 rounded-md text-[10px] font-bold tracking-wider uppercase transition tap-sm"
              style={adType === "server"
                ? { background: "linear-gradient(135deg, #8a4fff, #5b21b6)", color: "#fff" }
                : { color: "rgba(255,255,255,0.4)" }}
            >
              Serveur
            </button>
            <button
              type="button"
              onClick={() => setAdType("player")}
              className="flex-1 h-8 rounded-md text-[10px] font-bold tracking-wider uppercase transition tap-sm"
              style={adType === "player"
                ? { background: "linear-gradient(135deg, #8a4fff, #5b21b6)", color: "#fff" }
                : { color: "rgba(255,255,255,0.4)" }}
            >
              Recherche Joueur
            </button>
          </div>
          {/* Server sub-type: Nexus vs Discord */}
          {adType === "server" && (
            <div className="flex gap-1 mt-2">
              <button
                type="button"
                onClick={() => setServerSubType("nexus")}
                className="flex-1 h-7 rounded-md text-[9px] font-bold tracking-wider uppercase transition tap-sm"
                style={serverSubType === "nexus"
                  ? { background: "rgba(0, 242, 255, 0.15)", color: "#00F2FF", border: "1px solid rgba(0, 242, 255, 0.3)" }
                  : { color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                Nexus
              </button>
              <button
                type="button"
                onClick={() => setServerSubType("discord")}
                className="flex-1 h-7 rounded-md text-[9px] font-bold tracking-wider uppercase transition tap-sm"
                style={serverSubType === "discord"
                  ? { background: "rgba(88, 101, 242, 0.15)", color: "#5865F2", border: "1px solid rgba(88, 101, 242, 0.3)" }
                  : { color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                Discord
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Profile image (both types) */}
          <div>
            <label className={labelClass}>Photo de profil (optionnel)</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ background: "rgba(138, 79, 255, 0.1)", border: "1px solid rgba(138, 79, 255, 0.2)" }}>
                {profileImage ? (
                  <img src={profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-white/20" />
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
                {uploadingField === "profile" ? "Upload..." : "Choisir"}
              </button>
            </div>
          </div>

          {/* Cover image (server only) */}
          {adType === "server" && (
            <div>
              <label className={labelClass}>Image de couverture (optionnel)</label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ background: "rgba(138, 79, 255, 0.1)", border: "1px solid rgba(138, 79, 255, 0.2)" }}>
                  {coverImage ? (
                    <img src={coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-white/20" />
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
                  {uploadingField === "cover" ? "Upload..." : "Choisir"}
                </button>
              </div>
            </div>
          )}

          {/* Player pseudo (player only) */}
          {adType === "player" && (
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" />
                Nom ou pseudo (optionnel)
              </label>
              <input
                type="text"
                maxLength={30}
                value={form.player_pseudo}
                onChange={(e) => handleChange("player_pseudo", e.target.value)}
                placeholder="Ex: ProGamer123"
                className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                style={inputStyle}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className={labelClass}>
              {adType === "server" ? "Titre du serveur *" : "Titre de votre recherche *"}
            </label>
            <input
              type="text"
              required
              maxLength={60}
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder={adType === "server" ? "Ex: ALPHA PRIME SERVER" : "Ex: Recherche coéquipiers Valorant"}
              className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
              style={inputStyle}
            />
          </div>

          {/* Games (multi-select) */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" />
              Jeux {adType === "player" ? "*" : "(optionnel)"}
            </label>
            <MultiTagSelect
              options={GAMES}
              value={form.games || []}
              onChange={(games) => {
                setForm((prev) => ({
                  ...prev,
                  games,
                  game: games[0] || prev.game,
                }));
              }}
              placeholder="Sélectionner un ou plusieurs jeux"
              max={10}
            />
            {adType === "player" && (form.games || []).length === 0 && (
              <p className="text-[9px] text-red-400 mt-1">Sélectionne au moins un jeu</p>
            )}
          </div>

          {/* Categories (multi-select, server only) */}
          {adType === "server" && (
            <div>
              <label className={labelClass}>Catégories du serveur</label>
              <MultiTagSelect
                options={availableCategories.map((c) => ({ value: c.name, label: c.name }))}
                value={form.categories || []}
                onChange={(cats) => {
                  const slugs = cats
                    .map((name) => availableCategories.find((c) => c.name === name)?.slug)
                    .filter(Boolean);
                  setForm((prev) => ({
                    ...prev,
                    categories: cats,
                    category: cats[0] || prev.category,
                    category_slugs: slugs,
                    category_slug: slugs[0] || prev.category_slug,
                  }));
                }}
                placeholder="Sélectionner une ou plusieurs catégories"
                max={8}
              />
            </div>
          )}

          {/* Player count needed (player only) */}
          {adType === "player" && (
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Nombre de joueurs recherchés *
              </label>
              <input
                type="number"
                min="1"
                max="99"
                required
                value={form.player_count_needed || ""}
                onChange={(e) => handleChange("player_count_needed", parseInt(e.target.value) || 1)}
                placeholder="Ex: 2"
                className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                style={inputStyle}
              />
            </div>
          )}

          {/* Availability hours (player only) */}
          {adType === "player" && (
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Disponibilité (en heures) *
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={form.availability_hours}
                onChange={(e) => handleChange("availability_hours", e.target.value)}
                placeholder="Ex: 18h-22h, 20h/semaine, tous les soirs 3h"
                className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                style={inputStyle}
              />
            </div>
          )}

          {/* Max players (server only) */}
          {adType === "server" && (
            <div>
              <label className={labelClass}>Nombre maximum de joueurs</label>
              <input
                type="number"
                min="0"
                max="9999"
                value={form.max_players || ""}
                onChange={(e) => handleChange("max_players", parseInt(e.target.value) || 0)}
                placeholder="Ex: 300"
                className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                style={inputStyle}
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className={labelClass}>
              {adType === "server" ? "Description du serveur *" : "Description de votre recherche *"}
            </label>
            <textarea
              required
              maxLength={400}
              rows={3}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={adType === "server" ? "Décrivez votre serveur..." : "Décrivez ce que vous recherchez..."}
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-white/30 outline-none resize-none"
              style={inputStyle}
            />
          </div>

          {/* Additional info (server only) */}
          {adType === "server" && (
            <div>
              <label className={labelClass}>Informations supplémentaires</label>
              <textarea
                maxLength={300}
                rows={2}
                value={form.additional_info}
                onChange={(e) => handleChange("additional_info", e.target.value)}
                placeholder="Règles, événements, contenu..."
                className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-white/30 outline-none resize-none"
                style={inputStyle}
              />
            </div>
          )}

          {/* Server link (Nexus or Discord based on sub-type) */}
          {adType === "server" && (
            <div>
              <label className={labelClass}>
                {serverSubType === "nexus" ? "Lien du serveur Nexus *" : "Lien d'invitation Discord *"}
              </label>
              <input
                type="url"
                required
                value={form.discord_link}
                onChange={(e) => handleChange("discord_link", e.target.value)}
                placeholder={serverSubType === "nexus" ? "https://matrix.app/serveur/..." : "https://discord.gg/..."}
                className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                style={inputStyle}
              />
              <p className="text-[9px] text-white/30 mt-1">
                {serverSubType === "nexus"
                  ? "⚠️ Seuls les liens de serveurs Nexus sont acceptés."
                  : "⚠️ Un lien Discord valide est requis."}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || uploadingField !== ""}
            className="w-full h-10 rounded-lg text-xs font-black tracking-wider uppercase transition tap-sm disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #8a4fff, #5b21b6)",
              color: "#fff",
              boxShadow: "0 0 15px rgba(138, 79, 255, 0.3)",
            }}
          >
            {submitting ? "Enregistrement..." : editAd ? "Enregistrer les modifications" : adType === "server" ? "Publier le serveur" : "Publier la recherche"}
          </button>
        </form>
      </div>
    </div>
  );
}