import React, { useState, useEffect, useRef } from "react";
import { X, Gamepad2, Image as ImageIcon, Upload, Users, Globe, Link2, Radio } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { uploadImageWithToast } from "@/lib/imageModeration";
import MultiTagSelect from "@/components/prospecteurs/MultiTagSelect";
import TagSelector from "@/components/prospecteurs/TagSelector";
import { findForbiddenLink } from "@/lib/serverLinkRules";

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

const MAX_GALLERY = 5;
const LIVE_PROTOCOLS = [
  { value: "minecraft", label: "Minecraft" },
  { value: "fivem", label: "FiveM / GTA RP" },
  { value: "tcp", label: "Autre (test du port)" },
];

const slugifyName = (text) =>
  (text || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

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
    tags: editAd?.tags || [],
    additional_info: editAd?.additional_info || "",
    player_count_needed: editAd?.player_count_needed || 1,
    availability_hours: editAd?.availability_hours || "",
    player_pseudo: editAd?.player_pseudo || "",
    ip: editAd?.ip || "",
    port: editAd?.port || "",
    live_tracking_enabled: !!editAd?.live_tracking_enabled,
    live_protocol: editAd?.live_protocol || "minecraft",
  });
  const [gallery, setGallery] = useState(Array.isArray(editAd?.gallery_images) ? editAd.gallery_images.slice(0, MAX_GALLERY) : []);
  const [galleryUrl, setGalleryUrl] = useState("");
  const galleryInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(editAd?.profile_image || editAd?.logo_url || "");
  const [coverImage, setCoverImage] = useState(editAd?.cover_image || editAd?.banner_url || "");
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
      const result = await uploadImageWithToast(file, { usage: type === "profile" ? "icon" : "banner" });
      if (type === "profile") setProfileImage(result.file_url);
      else setCoverImage(result.file_url);
    } catch { /* error already toasted */ }
    finally { setUploadingField(""); }
  };

  const handleGalleryUpload = async (files) => {
    const room = MAX_GALLERY - gallery.length;
    const picked = Array.from(files || []).slice(0, room);
    if (picked.length === 0) return;
    setUploadingField("gallery");
    try {
      const urls = [];
      for (const file of picked) {
        try {
          const result = await uploadImageWithToast(file, { usage: "gallery" });
          if (result?.file_url) urls.push(result.file_url);
        } catch { /* error already toasted */ }
      }
      setGallery((prev) => [...prev, ...urls].slice(0, MAX_GALLERY));
    } finally {
      setUploadingField("");
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleGalleryUrlAdd = () => {
    const url = galleryUrl.trim();
    if (!url) return;
    if (!url.startsWith("https://")) {
      toast.error("L'URL de l'image doit commencer par https://");
      return;
    }
    if (gallery.includes(url)) {
      toast.error("Cette image est déjà dans la galerie");
      return;
    }
    if (gallery.length >= MAX_GALLERY) return;
    setGallery((prev) => [...prev, url]);
    setGalleryUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    const forbidden = findForbiddenLink(
      form.title,
      form.description,
      form.additional_info,
      form.discord_link,
      form.website_url
    );
    if (forbidden) {
      toast.error(forbidden);
      return;
    }

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

    const livePort = parseInt(form.port, 10);
    const liveOn = !isPlayerAd && form.live_tracking_enabled && form.ip.trim() !== "";

    const data = {
      ...form,
      ip: isPlayerAd ? "" : form.ip.trim(),
      port: isPlayerAd || !(livePort > 0 && livePort <= 65535) ? 0 : livePort,
      live_tracking_enabled: liveOn,
      gallery_images: isPlayerAd ? [] : gallery.slice(0, MAX_GALLERY),
      type: adType,
      profile_image: profileImage,
      logo_url: profileImage,
      cover_image: isPlayerAd ? "" : coverImage,
      banner_url: isPlayerAd ? "" : coverImage,
      discord_link: isPlayerAd ? "" : form.discord_link,
      website_url: isPlayerAd ? "" : (form.website_url.trim().startsWith("https://") ? form.website_url.trim() : ""),
      games: form.games || [],
      categories: (form.categories || []).slice(0, 3),
      tags: isPlayerAd ? [] : (form.tags || []),
      category_slugs: form.category_slugs || (form.categories && form.categories.length > 0
        ? form.categories.map((c) => availableCategories.find((ac) => ac.name === c)?.slug || slugifyName(c))
        : []),
      game: (form.games && form.games[0]) || form.game || "",
      category: (form.categories && form.categories[0]) || form.category || "",
      category_slug: form.category_slugs?.[0] || form.category_slug || (form.category ? slugifyName(form.category) : ""),
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

          {/* Games (player ads only) */}
          {isPlayerAd && (
            <div>
              <label className={labelClass}>
                <Gamepad2 className="w-3 h-3 inline mr-1" />
                Jeux *
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
              {(form.games || []).length === 0 && (
                <p className="text-[9px] text-red-400 mt-1">Sélectionne au moins un jeu</p>
              )}
            </div>
          )}

          {/* Categories (server only) — sélection multiple */}
          {!isPlayerAd && (
            <div>
              <label className={labelClass}>Catégories</label>
              <MultiTagSelect
                options={availableCategories.map((c) => ({ value: c.name, label: c.name }))}
                value={form.categories || []}
                onChange={(names) => {
                  const slugs = names.map(
                    (name) => availableCategories.find((c) => c.name === name)?.slug || slugifyName(name)
                  );
                  setForm((prev) => ({
                    ...prev,
                    categories: names,
                    category_slugs: slugs,
                    category: names[0] || "",
                    category_slug: slugs[0] || "",
                  }));
                }}
                placeholder="Sélectionner une ou plusieurs catégories"
                max={3}
              />
              <p className="text-[9px] text-white/25 mt-1">
                3 catégories maximum — désélectionne-en une pour en choisir une autre.
              </p>
            </div>
          )}

          {/* Étiquettes / tags (serveur uniquement)  5 maximum */}
          {!isPlayerAd && (
            <div>
              <label className={labelClass}>
                Étiquettes / Tags
                <span className="text-white/20 ml-1 normal-case tracking-normal">(optionnel)</span>
              </label>
              <TagSelector
                value={form.tags || []}
                onChange={(tags) => handleChange("tags", tags)}
                max={5}
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

          {/* Suivi en direct + galerie (serveur uniquement) */}
          {!isPlayerAd && (
            <div className="space-y-3 rounded-lg p-3" style={{ background: "rgba(138,79,255,0.04)", border: "1px solid rgba(138,79,255,0.15)" }}>
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span className={`${labelClass} !mb-0 flex items-center`}>
                  <Radio className="w-3 h-3 inline mr-1" />
                  Compteur de joueurs en direct
                  <span className="text-white/20 ml-1 normal-case tracking-normal">(optionnel)</span>
                </span>
                <input
                  type="checkbox"
                  checked={form.live_tracking_enabled}
                  onChange={(e) => handleChange("live_tracking_enabled", e.target.checked)}
                  className="accent-purple-500 w-4 h-4"
                />
              </label>
              {form.live_tracking_enabled && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className={labelClass}>IP / adresse</label>
                      <input
                        type="text"
                        maxLength={253}
                        value={form.ip}
                        onChange={(e) => handleChange("ip", e.target.value)}
                        placeholder="play.monserveur.fr"
                        className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/25 outline-none"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Port</label>
                      <input
                        type="number"
                        min="1"
                        max="65535"
                        value={form.port}
                        onChange={(e) => handleChange("port", e.target.value)}
                        placeholder="25565"
                        className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/25 outline-none"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Type de jeu</label>
                    <select
                      value={form.live_protocol}
                      onChange={(e) => handleChange("live_protocol", e.target.value)}
                      className="w-full h-10 px-3 rounded-lg text-sm text-white outline-none"
                      style={inputStyle}
                    >
                      {LIVE_PROTOCOLS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-white/25 mt-1">
                      Affiche « 12/64 en ligne » ou « Hors ligne » à côté du titre. « Autre » indique seulement si le port répond.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {!isPlayerAd && (
            <div>
              <label className={labelClass}>
                <ImageIcon className="w-3 h-3 inline mr-1" />
                Galerie de la fiche ({gallery.length}/{MAX_GALLERY})
                <span className="text-white/20 ml-1 normal-case tracking-normal">(visible sur la fiche uniquement)</span>
              </label>
              {gallery.length > 0 && (
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {gallery.map((url, i) => (
                    <div
                      key={`${url}-${i}`}
                      className="relative aspect-square rounded-lg overflow-hidden"
                      style={{ border: "1px solid rgba(138,79,255,0.2)" }}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded flex items-center justify-center text-white"
                        style={{ background: "rgba(239,68,68,0.85)" }}
                        aria-label="Supprimer l'image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {gallery.length < MAX_GALLERY && (
                <div className="flex items-center gap-2">
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleGalleryUpload(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploadingField === "gallery"}
                    className="h-9 px-3 rounded-lg text-[10px] font-bold transition flex items-center gap-1 tap-sm shrink-0"
                    style={inputStyle}
                  >
                    <Upload className="w-3 h-3" />
                    {uploadingField === "gallery" ? "..." : "Ajouter"}
                  </button>
                  <input
                    type="url"
                    value={galleryUrl}
                    onChange={(e) => setGalleryUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleGalleryUrlAdd(); } }}
                    placeholder="ou URL https://..."
                    className="flex-1 min-w-0 h-9 px-3 rounded-lg text-xs text-white placeholder:text-white/25 outline-none"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={handleGalleryUrlAdd}
                    className="h-9 px-2 rounded-lg text-[10px] font-bold tap-sm shrink-0"
                    style={inputStyle}
                  >
                    OK
                  </button>
                </div>
              )}
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