import React, { useEffect, useRef, useState } from "react";
import { X, Youtube, Twitch, Loader2, RefreshCw, ImageOff } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PLATFORM_OPTIONS = [
  { key: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000", hint: "youtube.com ou youtu.be" },
  { key: "twitch", label: "Twitch", icon: Twitch, color: "#9146FF", hint: "twitch.tv" },
];

const MAX_PER_PLATFORM = 3;

export default function CreateCreatorModal({ channel, ownedCounts = {}, onClose, onSaved }) {
  const isEdit = !!channel;
  const [platform, setPlatform] = useState(channel?.platform || "youtube");
  const [name, setName] = useState(channel?.name || "");
  const [channelUrl, setChannelUrl] = useState(channel?.channel_url || "");
  const [description, setDescription] = useState(channel?.description || "");
  const [avatarUrl, setAvatarUrl] = useState(channel?.avatar_url || "");
  const [bannerUrl, setBannerUrl] = useState(channel?.banner_url || "");
  const [fetching, setFetching] = useState(false);
  const [metaError, setMetaError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const lastFetched = useRef("");

  const current = PLATFORM_OPTIONS.find((p) => p.key === platform) || PLATFORM_OPTIONS[0];
  const used = Math.max(0, (ownedCounts[platform] || 0) - (isEdit && channel.platform === platform ? 1 : 0));
  const quotaReached = !isEdit && used >= MAX_PER_PLATFORM;

  const urlIsValid = /^https?:\/\//i.test(channelUrl.trim()) &&
    (platform === "youtube"
      ? /(youtube\.com|youtu\.be)/i.test(channelUrl)
      : /twitch\.tv/i.test(channelUrl));

  const loadMeta = async (url, force = false) => {
    const target = url.trim();
    if (!urlIsValid || !target) return;
    if (!force && lastFetched.current === `${platform}:${target}`) return;
    lastFetched.current = `${platform}:${target}`;
    setFetching(true);
    setMetaError("");
    try {
      const res = await base44.functions.invoke("creatorSearch", {
        action: "fetchChannelMeta",
        url: target,
        platform,
      });
      const meta = res.data?.meta;
      if (!meta) {
        setMetaError("Aucun visuel trouvé pour ce lien. Une bannière Matrix sera utilisée.");
        return;
      }
      if (meta.name && !name.trim()) setName(meta.name);
      if (meta.avatar_url) setAvatarUrl(meta.avatar_url);
      if (meta.banner_url) setBannerUrl(meta.banner_url);
      if (meta.description && !description.trim()) setDescription(meta.description.slice(0, 1000));
    } catch {
      setMetaError("Récupération impossible pour le moment. Tu peux réessayer ou publier sans visuel.");
    } finally {
      setFetching(false);
    }
  };

  // Récupération automatique dès que le lien est complet (et rafraîchissement à l'ouverture en édition).
  useEffect(() => {
    const url = channelUrl.trim();
    if (!/^https?:\/\//i.test(url) || url.length < 15) return;
    const timer = setTimeout(() => loadMeta(url), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelUrl, platform]);

  useEffect(() => {
    if (isEdit && channel?.channel_url) loadMeta(channel.channel_url, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (quotaReached) {
      setError(`Quota maximal de ${MAX_PER_PLATFORM} chaînes atteint pour cette catégorie.`);
      return;
    }
    if (name.trim().length < 2) {
      setError("Indique le pseudo de ta chaîne (2 caractères minimum).");
      return;
    }
    if (!urlIsValid) {
      setError(`Le lien doit être une URL ${current.label} valide (${current.hint}).`);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("creatorSearch", {
        action: "saveChannel",
        id: channel?.id,
        name: name.trim(),
        platform,
        channel_url: channelUrl.trim(),
        description: description.trim(),
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
      });
      if (res.data?.error) throw new Error(res.data.error);
      onSaved?.(res.data.channel);
    } catch (err) {
      const code = err?.response?.data?.error || err?.message;
      if (code === "quota_reached") {
        setError(`Quota maximal de ${MAX_PER_PLATFORM} chaînes atteint pour cette catégorie.`);
      } else if (code === "invalid_url") {
        setError(`Le lien doit être une URL ${current.label} valide.`);
      } else {
        setError("Erreur lors de l'enregistrement. Réessaie dans un instant.");
      }
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin"
        style={{ background: "#12091c", border: "1px solid rgba(138,79,255,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(138,79,255,0.2)" }}>
          <h2 className="text-sm font-black tracking-wider uppercase text-white">
            {isEdit ? "Modifier ma chaîne" : "Publier ma chaîne"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Aperçu de la carte */}
          <div
            className="relative rounded-xl overflow-hidden"
            style={{ border: `1px solid ${current.color}45`, background: "#0f0718" }}
          >
            <div
              className="relative h-20"
              style={
                bannerUrl
                  ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: `linear-gradient(135deg, ${current.color}55 0%, #1a0a2e 75%)` }
              }
            >
              {!bannerUrl && (
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: `linear-gradient(${current.color}40 1px, transparent 1px), linear-gradient(90deg, ${current.color}40 1px, transparent 1px)`,
                    backgroundSize: "18px 18px",
                  }}
                />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.05) 0%, rgba(18,9,28,0.9) 100%)" }} />
              <div
                className="absolute -bottom-5 left-3 w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center text-base font-black text-white"
                style={{ background: `linear-gradient(135deg, ${current.color}, #1a0a2e)`, boxShadow: `0 0 12px ${current.color}50`, border: "1px solid rgba(255,255,255,0.12)" }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Logo de la chaîne" className="w-full h-full object-cover" />
                ) : (
                  name?.[0]?.toUpperCase() || <ImageOff className="w-4 h-4 text-white/40" />
                )}
              </div>
              <span
                className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: `${current.color}25`, color: current.color, border: `1px solid ${current.color}55` }}
              >
                {current.label}
              </span>
            </div>
            <div className="pt-6 px-3 pb-3">
              <p className="text-sm font-black text-white truncate">{name || "Nom de la chaîne"}</p>
              <p className="text-[9px] text-white/35">Aperçu de la carte Best Creator</p>
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">Plateforme</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORM_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = platform === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { setPlatform(opt.key); setError(""); }}
                    className="h-11 rounded-lg flex items-center justify-center gap-2 text-xs font-black transition tap-sm"
                    style={{
                      background: isActive ? `${opt.color}25` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isActive ? `${opt.color}aa` : "rgba(255,255,255,0.08)"}`,
                      color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                      boxShadow: isActive ? `0 0 14px ${opt.color}40` : "none",
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? opt.color : undefined }} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[9px] text-white/35 mt-1.5">
              {MAX_PER_PLATFORM - used} / {MAX_PER_PLATFORM} emplacement{MAX_PER_PLATFORM - used !== 1 ? "s" : ""} restant
              {MAX_PER_PLATFORM - used !== 1 ? "s" : ""} en {current.label}
            </p>
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
              Lien direct de la chaîne *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={channelUrl}
                onChange={(e) => { setChannelUrl(e.target.value); setError(""); setMetaError(""); }}
                placeholder={`https://${current.hint.split(" ")[0]}/...`}
                className="flex-1 min-w-0 h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.2)" }}
              />
              <button
                type="button"
                onClick={() => loadMeta(channelUrl, true)}
                disabled={fetching || !urlIsValid}
                title="Récupérer le logo et la bannière"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white/70 transition disabled:opacity-40 tap-sm shrink-0"
                style={{ background: "rgba(138,79,255,0.12)", border: "1px solid rgba(138,79,255,0.25)" }}
              >
                {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[9px] text-white/35 mt-1">
              {fetching ? "Récupération du logo et de la bannière..." : "Logo et bannière récupérés automatiquement depuis la plateforme."}
            </p>
            {metaError && <p className="text-[9px] text-amber-400/80 mt-1">{metaError}</p>}
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">Pseudo de la chaîne *</label>
            <input
              type="text"
              maxLength={60}
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Ex: MATRIX Gaming"
              className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
              style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.2)" }}
            />
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">Description</label>
            <textarea
              rows={4}
              maxLength={1000}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(""); }}
              placeholder="Présente ta chaîne, ton contenu, tes horaires de live..."
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 outline-none resize-none"
              style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.2)" }}
            />
          </div>

          {quotaReached && (
            <p className="text-[10px] font-bold text-amber-400">
              Quota maximal de {MAX_PER_PLATFORM} chaînes atteint pour cette catégorie.
            </p>
          )}
          {error && <p className="text-[10px] text-red-400">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || quotaReached}
            className="w-full h-10 rounded-lg text-xs font-black tracking-wider uppercase text-white transition disabled:opacity-50 disabled:cursor-not-allowed tap-sm"
            style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)", boxShadow: "0 0 15px rgba(138,79,255,0.3)" }}
          >
            {submitting ? "Enregistrement..." : isEdit ? "Enregistrer les modifications" : "Publier ma chaîne"}
          </button>
        </div>
      </div>
    </div>
  );
}