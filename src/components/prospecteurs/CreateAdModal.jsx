import React, { useState } from "react";
import { X, Gamepad2, Medal } from "lucide-react";

const GAMES = ["Valorant", "League of Legends", "Fortnite", "CS2", "Apex Legends", "Minecraft", "Rocket League", "Autre"];
const RANKS = ["Fer", "Bronze", "Argent", "Or", "Platine", "Diamant", "Master", "Predator", "Peu importe"];

export default function CreateAdModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    discord_link: "",
    game: "",
    rank_tier: "",
    max_players: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.discord_link.trim()) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  const inputStyle = {
    background: "rgba(138, 79, 255, 0.05)",
    border: "1px solid rgba(138, 79, 255, 0.2)",
  };

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
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
          style={{ background: "#12091c", borderBottom: "1px solid rgba(138, 79, 255, 0.2)" }}
        >
          <h2 className="text-sm font-black tracking-wider uppercase text-white">
            Publier votre serveur
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
              Titre de l'annonce *
            </label>
            <input
              type="text"
              required
              maxLength={60}
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: ALPHA PRIME SERVER"
              className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
              style={inputStyle}
            />
          </div>

          {/* Game */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" />
              Jeu
            </label>
            <div className="relative">
              <select
                value={form.game}
                onChange={(e) => handleChange("game", e.target.value)}
                className="w-full h-10 px-3 rounded-lg text-sm text-white outline-none appearance-none cursor-pointer"
                style={inputStyle}
              >
                <option value="" style={{ background: "#12091c" }}>Sélectionner le jeu</option>
                {GAMES.map((g) => (
                  <option key={g} value={g} style={{ background: "#12091c" }}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rank */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
              <Medal className="w-3 h-3" />
              Rank recherché
            </label>
            <div className="relative">
              <select
                value={form.rank_tier}
                onChange={(e) => handleChange("rank_tier", e.target.value)}
                className="w-full h-10 px-3 rounded-lg text-sm text-white outline-none appearance-none cursor-pointer"
                style={inputStyle}
              >
                <option value="" style={{ background: "#12091c" }}>Sélectionner le rank</option>
                {RANKS.map((r) => (
                  <option key={r} value={r} style={{ background: "#12091c" }}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Max players */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
              Nombre maximum de joueurs
            </label>
            <input
              type="number"
              min="0"
              max="999"
              value={form.max_players || ""}
              onChange={(e) => handleChange("max_players", parseInt(e.target.value) || 0)}
              placeholder="Ex: 300"
              className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
              Description du serveur *
            </label>
            <textarea
              required
              maxLength={300}
              rows={3}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Décrivez votre serveur..."
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-white/30 outline-none resize-none"
              style={inputStyle}
            />
          </div>

          {/* Discord link */}
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
              Lien du serveur Discord *
            </label>
            <input
              type="url"
              required
              value={form.discord_link}
              onChange={(e) => handleChange("discord_link", e.target.value)}
              placeholder="https://discord.gg/..."
              className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
              style={inputStyle}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 rounded-lg text-xs font-black tracking-wider uppercase transition tap-sm"
            style={{
              background: "linear-gradient(135deg, #8a4fff, #5b21b6)",
              color: "#fff",
              boxShadow: "0 0 15px rgba(138, 79, 255, 0.3)",
            }}
          >
            {submitting ? "Publication..." : "Publier l'annonce"}
          </button>
        </form>
      </div>
    </div>
  );
}