import React, { useState } from "react";
import { X, Gauge, Wifi, ArrowDown, Activity, Loader2 } from "lucide-react";

const quality = (mbps) => {
  if (mbps === null) return { label: "—", color: "#94a3b8" };
  if (mbps >= 100) return { label: "Excellent", color: "#22c55e" };
  if (mbps >= 30) return { label: "Très bon", color: "#84cc16" };
  if (mbps >= 10) return { label: "Correct", color: "#f59e0b" };
  return { label: "Faible", color: "#ef4444" };
};

export default function SpeedTest({ onClose }) {
  const [status, setStatus] = useState("idle");
  const [ping, setPing] = useState(null);
  const [jitter, setJitter] = useState(null);
  const [down, setDown] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const measurePing = async () => {
    const samples = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      try {
        await fetch(`${window.location.origin}/manifest.json?ping=${Date.now()}-${i}`, { cache: "no-store" });
      } catch {}
      samples.push(performance.now() - start);
    }
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    const jit = samples.slice(1).reduce((acc, v, i) => acc + Math.abs(v - samples[i]), 0) / (samples.length - 1);
    setPing(Math.round(avg));
    setJitter(Math.round(jit));
  };

  const measureDownload = async () => {
    const bytes = 12000000;
    const res = await fetch(`https://speed.cloudflare.com/__down?bytes=${bytes}`, { cache: "no-store" });
    if (!res.ok || !res.body) throw new Error("stream unavailable");
    const reader = res.body.getReader();
    let received = 0;
    const start = performance.now();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      if (performance.now() - start > 0) {
        const mbps = (received * 8) / ((performance.now() - start) / 1000) / 1e6;
        setDown(Math.round(mbps * 10) / 10);
        setProgress(Math.min(99, Math.round((received / bytes) * 100)));
      }
    }
    const elapsed = (performance.now() - start) / 1000;
    setDown(Math.round(((received * 8) / elapsed / 1e6) * 10) / 10);
    setProgress(100);
  };

  const run = async () => {
    setStatus("ping");
    setError("");
    setDown(null);
    setProgress(0);
    await measurePing();
    setStatus("download");
    try {
      await measureDownload();
      setStatus("done");
    } catch {
      setError("Le serveur de mesure est injoignable. La latence reste disponible.");
      setStatus("done");
    }
  };

  const q = quality(down);
  const busy = status === "ping" || status === "download";

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(249,115,22,0.14)", border: "1px solid rgba(249,115,22,0.4)", boxShadow: "0 0 12px rgba(249,115,22,0.3)" }}>
            <Gauge className="h-4 w-4 text-[#f97316]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Testeur de Connexion</h2>
            <p className="text-[10px] text-white/40">Débit descendant et latence</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.25)" }}>
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/35">Débit descendant</p>
        <p className="my-1 text-4xl font-black text-white">
          {down === null ? "—" : down}
          <span className="ml-1 text-sm font-bold text-[#f97316]">Mbps</span>
        </p>
        <div className="mx-auto h-1.5 w-full max-w-xs overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full transition-all duration-200" style={{ width: `${down === null ? 0 : Math.min(100, (down / 200) * 100)}%`, background: "linear-gradient(90deg,#f97316,#22c55e)", boxShadow: "0 0 12px rgba(34,197,94,0.5)" }} />
        </div>
        <p className="mt-2 text-[10px] font-bold" style={{ color: q.color }}>{q.label}</p>

        <button onClick={run} disabled={busy} className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl text-[11px] font-black text-black disabled:opacity-60" style={{ background: busy ? "rgba(249,115,22,0.6)" : "linear-gradient(135deg,#f97316,#22c55e)" }}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wifi className="h-3.5 w-3.5" />}
          {status === "ping" ? "Mesure de la latence…" : status === "download" ? `Téléchargement ${progress}%` : "Lancer le test"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          { label: "Latence", value: ping === null ? "—" : `${ping} ms`, icon: Activity, color: "#22c55e" },
          { label: "Gigue", value: jitter === null ? "—" : `${jitter} ms`, icon: Activity, color: "#84cc16" },
          { label: "Débit", value: down === null ? "—" : `${down} Mbps`, icon: ArrowDown, color: "#f97316" },
          { label: "Qualité", value: q.label, icon: Gauge, color: q.color },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="mb-1 flex items-center gap-1.5">
              <stat.icon className="h-3 w-3" style={{ color: stat.color }} />
              <span className="text-[9px] uppercase tracking-wider text-white/35">{stat.label}</span>
            </div>
            <p className="text-sm font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {error && <p className="mt-2 text-[10px] text-amber-300">{error}</p>}
      <p className="mt-2 text-center text-[9px] text-white/25">Test réalisé depuis votre navigateur — résultat indicatif.</p>
    </div>
  );
}