import React, { useState } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";

const ENDPOINTS = [
  { name: "botGetConfig", method: "GET", use: "configuration du worker" },
  { name: "botPushStatus", method: "POST", use: "état du bot" },
  { name: "botPushStats", method: "POST", use: "statistiques du jour" },
  { name: "botPushTokens", method: "POST", use: "jetons renouvelés" },
];

const BASE = "https://matrix-hub.base44.app/functions/";

export default function WorkerEndpoints() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");

  const copy = async (name) => {
    try {
      await navigator.clipboard.writeText(`${BASE}${name}`);
      setCopied(name);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  return (
    <section className="rounded-2xl overflow-hidden" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(168,85,247,0.14)" }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left tap-sm"
      >
        <span className="text-[11px] font-black uppercase tracking-wider text-white/60">Configuration technique Worker (API)</span>
        <span className="flex items-center gap-2">
          <span className="text-[10px] text-white/25 hidden sm:inline">en-tête x-api-key</span>
          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {ENDPOINTS.map((endpoint) => (
              <div key={endpoint.name} className="flex items-center gap-2 px-2.5 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgba(168,85,247,0.16)", color: "#c084fc" }}>{endpoint.method}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-mono font-semibold text-white truncate">{endpoint.name}</p>
                  <p className="text-[9px] text-white/30 truncate">{endpoint.use}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copy(endpoint.name)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 tap-sm"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                  title="Copier l'adresse"
                >
                  {copied === endpoint.name ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/30 mt-2.5">
            La clé est le secret BOT_API_KEY de l'application. Le worker interroge la configuration, il n'est jamais appelé par Matrix.
          </p>
        </div>
      )}
    </section>
  );
}