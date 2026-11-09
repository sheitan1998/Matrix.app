import React, { useState } from "react";
import { X, Youtube, Twitch } from "lucide-react";

const PLATFORM_OPTIONS = [
  { key: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000", hint: "youtube.com ou youtu.be" },
  { key: "twitch", label: "Twitch", icon: Twitch, color: "#9146FF", hint: "twitch.tv" },
];

export default function CreateCreatorModal({ onClose, onSubmit }) {
  const [platform, setPlatform] = useState("youtube");
  const [name, setName] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const current = PLATFORM_OPTIONS.find((p) => p.key === platform);

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      setError("Indique le pseudo de ta chaîne (2 caractères minimum).");
      return;
    }
    const url = channelUrl.trim();
    const validHost = platform === "youtube"
      ? /(youtube\.com|youtu\.be)/i.test(url)
      : /twitch\.tv/i.test(url);
    if (!/^https?:\/\//i.test(url) || !validHost) {
      setError(`Le lien doit être une URL ${current.label} valide (${current.hint}).`);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        platform,
        channel_url: url,
        description: description.trim(),
      });
    } catch {
      setError("Erreur lors de la publication. Réessaie dans un instant.");
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
          <h2 className="text-sm font-black tracking-wider uppercase text-white">Publier ma chaîne</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
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
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
              Lien direct de la chaîne *
            </label>
            <input
              type="url"
              value={channelUrl}
              onChange={(e) => { setChannelUrl(e.target.value); setError(""); }}
              placeholder={`https://${current.hint.split(" ")[0]}/...`}
              className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
              style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.2)" }}
            />
          </div>

          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">Description *</label>
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

          {error && <p className="text-[10px] text-red-400">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-10 rounded-lg text-xs font-black tracking-wider uppercase text-white transition disabled:opacity-50 tap-sm"
            style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)", boxShadow: "0 0 15px rgba(138,79,255,0.3)" }}
          >
            {submitting ? "Publication..." : "Publier ma chaîne"}
          </button>
        </div>
      </div>
    </div>
  );
}