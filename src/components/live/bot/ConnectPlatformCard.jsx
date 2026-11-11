import React, { useState } from "react";
import { AlertTriangle, Loader2, Twitch, Youtube } from "lucide-react";
import { fieldClass, fieldStyle, BotLabel } from "./botUi";

const PLATFORMS = {
  twitch: { icon: Twitch, title: "Connecter Twitch", color: "#a855f7", hint: "Autorise le bot à lire et écrire dans le chat, et à modérer." },
  youtube: { icon: Youtube, title: "Connecter YouTube", color: "#ef4444", hint: "Les messages du bot apparaîtront au nom du compte connecté." },
};

export default function ConnectPlatformCard({ platform, busy, onConnect }) {
  const meta = PLATFORMS[platform];
  const Icon = meta.icon;
  const [mode, setMode] = useState("own");
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (platform === "twitch" && mode === "bot" && !/^[a-zA-Z0-9_]{3,25}$/.test(target.trim().replace(/^@/, ""))) {
      setError("Indique le pseudo Twitch du streamer (3 à 25 caractères).");
      return;
    }
    setError("");
    onConnect(platform === "twitch" ? { action: "startTwitch", accountMode: mode, target } : { action: "startYouTube" });
  };

  return (
    <section className="rounded-2xl p-5" style={{ background: "rgba(18,9,28,0.8)", border: `1px solid ${meta.color}45`, boxShadow: `0 0 24px ${meta.color}14` }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${meta.color}1f`, border: `1px solid ${meta.color}55` }}>
          <Icon className="w-5 h-5" style={{ color: meta.color }} />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">{meta.title}</h2>
          <p className="text-[11px] text-white/40">{meta.hint}</p>
        </div>
      </div>

      {platform === "twitch" && (
        <div className="mt-4 space-y-3">
          <div>
            <BotLabel>Compte utilisé</BotLabel>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "own", label: "Mon compte streamer" },
                { key: "bot", label: "Compte bot modérateur" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => { setMode(opt.key); setError(""); }}
                  className="h-10 rounded-xl text-xs font-bold transition tap-sm"
                  style={{
                    background: mode === opt.key ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${mode === opt.key ? "rgba(168,85,247,0.6)" : "rgba(255,255,255,0.1)"}`,
                    color: mode === opt.key ? "#fff" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {mode === "bot" && (
            <div>
              <BotLabel>Pseudo Twitch du streamer</BotLabel>
              <input
                value={target}
                onChange={(e) => { setTarget(e.target.value); setError(""); }}
                placeholder="ex : matrixgaming"
                className={fieldClass}
                style={fieldStyle}
              />
              <p className="mt-2 text-[11px] px-2.5 py-2 rounded-lg flex items-start gap-1.5" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)", color: "#fde68a" }}>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Ce compte doit être modérateur de la chaîne (commande /mod sur Twitch).
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-[11px] text-red-400">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="mt-4 h-10 px-5 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 transition disabled:opacity-50 tap-sm"
        style={{ background: `linear-gradient(135deg, ${meta.color}, #6d28d9)`, boxShadow: `0 0 18px ${meta.color}40` }}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
        {busy ? "Redirection..." : meta.title}
      </button>
      <p className="mt-3 text-[10px] text-white/30">
        Une fois connecté, le worker applique la configuration en une trentaine de secondes.
      </p>
    </section>
  );
}