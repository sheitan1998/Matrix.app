import React, { useEffect, useState } from "react";
import { Plus, Trash2, Send, Loader2, Users, Eye, FileVideo } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = ["YouTube", "Twitch", "TikTok", "Instagram", "X / Twitter", "Autre"];
const MAX_LINKS = 5;

const inputStyle = { background: "rgba(0,0,0,0.35)", border: "1px solid rgba(168,85,247,0.25)" };
const inputClass = "w-full h-10 px-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:border-purple-400 transition";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-white/40">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function ProgramApplicationForm({ mode = "affiliate", defaultName = "", defaultPseudo = "", submitting, onSubmit }) {
  const isPartner = mode === "partner";
  const [name, setName] = useState(defaultName);
  const [pseudo, setPseudo] = useState(defaultPseudo);
  const [description, setDescription] = useState("");
  const [links, setLinks] = useState([""]);
  const [stats, setStats] = useState({ platform: "YouTube", subscribers: "", views: "", contents: "" });

  useEffect(() => { setName(defaultName); }, [defaultName]);
  useEffect(() => { setPseudo(defaultPseudo); }, [defaultPseudo]);

  const setStat = (key) => (e) => setStats((s) => ({ ...s, [key]: e.target.value }));
  const updateLink = (index, value) => setLinks((l) => l.map((item, i) => (i === index ? value : item)));
  const addLink = () => setLinks((l) => (l.length >= MAX_LINKS ? l : [...l, ""]));
  const removeLink = (index) => setLinks((l) => (l.length === 1 ? [""] : l.filter((_, i) => i !== index)));

  const submit = () => {
    const validLinks = links.map((l) => l.trim()).filter((l) => /^https?:\/\/\S+\.\S+/.test(l));
    if (!name.trim()) { toast.error("Indiquez votre nom."); return; }
    if (!pseudo.trim()) { toast.error("Indiquez votre pseudo."); return; }
    if (description.trim().length < 20) { toast.error("Décrivez votre projet (20 caractères minimum)."); return; }
    if (validLinks.length === 0) { toast.error("Ajoutez au moins un lien valide vers vos réseaux."); return; }
    if (isPartner && (!stats.subscribers || !stats.views || !stats.contents)) {
      toast.error("Renseignez vos statistiques (abonnés, vues, contenus).");
      return;
    }

    onSubmit({
      name: name.trim(),
      pseudo: pseudo.trim(),
      description: description.trim(),
      links: validLinks,
      ...(isPartner
        ? { platform: stats.platform, subscribers: stats.subscribers, views: stats.views, contents: stats.contents }
        : {}),
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Nom">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Pseudo">
          <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Votre pseudo Matrix" className={inputClass} style={inputStyle} />
        </Field>
      </div>

      {isPartner && (
        <>
          <Field label="Plateforme principale">
            <select
              value={stats.platform}
              onChange={setStat("platform")}
              className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,215,0,0.25)" }}
            >
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Abonnés">
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input value={stats.subscribers} onChange={setStat("subscribers")} inputMode="numeric" placeholder="10 000"
                  className="w-full h-10 pl-9 pr-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none"
                  style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(168,85,247,0.25)" }} />
              </div>
            </Field>
            <Field label="Vues cumulées">
              <div className="relative">
                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input value={stats.views} onChange={setStat("views")} inputMode="numeric" placeholder="100 000"
                  className="w-full h-10 pl-9 pr-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none"
                  style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(168,85,247,0.25)" }} />
              </div>
            </Field>
            <Field label="Contenus publiés">
              <div className="relative">
                <FileVideo className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input value={stats.contents} onChange={setStat("contents")} inputMode="numeric" placeholder="5"
                  className="w-full h-10 pl-9 pr-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none"
                  style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(168,85,247,0.25)" }} />
              </div>
            </Field>
          </div>
        </>
      )}

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Votre parcours, votre audience, comment vous mettrez Matrix en avant…"
          className="w-full p-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none resize-none"
          style={inputStyle}
        />
      </Field>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-white/40">Réseaux sociaux</span>
          {links.length < MAX_LINKS && (
            <button onClick={addLink} className="flex items-center gap-1 text-[11px] font-bold text-purple-300 hover:text-white transition">
              <Plus className="w-3 h-3" /> Ajouter un réseau
            </button>
          )}
        </div>
        <div className="mt-1.5 space-y-2">
          {links.map((value, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={value}
                onChange={(e) => updateLink(index, e.target.value)}
                placeholder="https://youtube.com/@votre-chaine"
                className="flex-1 min-w-0 h-10 px-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none"
                style={inputStyle}
              />
              <button
                onClick={() => removeLink(index)}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition hover:opacity-80"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                title="Retirer ce lien"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/35 mt-1.5">YouTube, Twitch, TikTok, Instagram… jusqu'à {MAX_LINKS} liens.</p>
      </div>

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full h-11 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
        style={isPartner
          ? { background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#1a1305" }
          : { background: "linear-gradient(135deg, #a855f7, #6d28d9)", color: "#fff" }}
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {isPartner ? "Envoyer ma candidature Partenaire" : "Valider mon inscription Affilié"}
      </button>
    </div>
  );
}