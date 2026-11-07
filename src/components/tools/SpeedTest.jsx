import React, { useRef, useState } from "react";
import { X, Gauge, Wifi, ArrowDown, ArrowUp, Activity, Loader2, Radio, ShieldCheck } from "lucide-react";

const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
const DOWN_URL = "https://speed.cloudflare.com/__down";
const UP_URL = "https://speed.cloudflare.com/__up";

const scoreQuality = ({ ping, jitter, download }) => {
  let score = 0;
  if (ping !== null) score += Math.max(0, Math.min(40, 40 - (ping - 20) / 7));
  if (jitter !== null) score += Math.max(0, Math.min(20, 20 - jitter * 2));
  if (download !== null) score += Math.max(0, Math.min(40, 40 * (Math.log10(Math.max(1, download)) / 2)));
  return Math.round(score);
};

const qualityLabel = (score) => {
  if (score >= 85) return { label: "Excellente", color: "#22c55e" };
  if (score >= 65) return { label: "Très bonne", color: "#84cc16" };
  if (score >= 45) return { label: "Correcte", color: "#f59e0b" };
  if (score > 0) return { label: "Faible", color: "#ef4444" };
  return { label: "—", color: "#94a3b8" };
};

const fmt = (v, digits = 1) => (v === null || !Number.isFinite(v) ? "—" : v.toFixed(digits));

export default function SpeedTest({ onClose }) {
  const [stage, setStage] = useState("idle");
  const [ping, setPing] = useState(null);
  const [minPing, setMinPing] = useState(null);
  const [jitter, setJitter] = useState(null);
  const [download, setDownload] = useState(null);
  const [upload, setUpload] = useState(null);
  const [liveDownload, setLiveDownload] = useState(null);
  const [progress, setProgress] = useState(0);
  const [sampleCount, setSampleCount] = useState(0);
  const [error, setError] = useState("");
  const running = useRef(false);

  const measureLatency = async () => {
    const samples = [];
    for (let i = 0; i < 10; i++) {
      if (!running.current) break;
      const url = `${DOWN_URL}?bytes=0&measId=${uuid()}`;
      const start = performance.now();
      try {
        const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(6000) });
        await res.arrayBuffer();
        samples.push(performance.now() - start);
        setSampleCount(samples.length);
      } catch {
        /* ignore a failed probe */
      }
    }
    const valid = samples.length > 2 ? samples.slice(2) : samples;
    if (!valid.length) throw new Error("latency");
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
    const min = Math.min(...valid);
    const jit = valid.length > 1
      ? valid.slice(1).reduce((acc, v, i) => acc + Math.abs(v - valid[i]), 0) / (valid.length - 1)
      : 0;
    setPing(avg);
    setMinPing(min);
    setJitter(jit);
    setProgress(20);
  };

  const measureDownload = async () => {
    const target = 30000000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let received = 0;
    const start = performance.now();
    try {
      const res = await fetch(`${DOWN_URL}?bytes=${target}&measId=${uuid()}`, { cache: "no-store", signal: controller.signal });
      const reader = res.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        const elapsed = (performance.now() - start) / 1000;
        if (elapsed > 0.15) {
          const mbps = (received * 8) / elapsed / 1e6;
          setLiveDownload(mbps);
          setProgress(20 + Math.min(50, (received / target) * 50));
        }
      }
    } catch {
      /* timeout or abort: use what was measured */
    } finally {
      clearTimeout(timeout);
    }
    const elapsed = (performance.now() - start) / 1000;
    if (!received || !elapsed) throw new Error("download");
    setDownload((received * 8) / elapsed / 1e6);
    setProgress(70);
  };

  const measureUpload = async () => {
    const size = 4000000;
    const payload = new Blob([new Uint8Array(size)], { type: "application/octet-stream" });
    const start = performance.now();
    const res = await fetch(`${UP_URL}?measId=${uuid()}`, {
      method: "POST",
      body: payload,
      headers: { "content-type": "application/octet-stream" },
      signal: AbortSignal.timeout(25000),
    });
    await res.arrayBuffer();
    const elapsed = (performance.now() - start) / 1000;
    if (!elapsed) throw new Error("upload");
    setUpload((size * 8) / elapsed / 1e6);
    setProgress(100);
  };

  const run = async () => {
    running.current = true;
    setError("");
    setStage("latency");
    setPing(null); setMinPing(null); setJitter(null); setDownload(null); setUpload(null);
    setLiveDownload(null); setProgress(4); setSampleCount(0);
    try {
      await measureLatency();
    } catch {
      setError("Latence injoignable. Vérifiez votre connexion Internet.");
      setStage("done");
      running.current = false;
      return;
    }
    setStage("download");
    try {
      await measureDownload();
    } catch {
      setError("Le test de débit descendant a échoué (réseau ou pare-feu).");
    }
    setStage("upload");
    try {
      await measureUpload();
    } catch {
      setError((prev) => prev || "Le test de débit montant a échoué (réseau ou pare-feu).");
    }
    running.current = false;
    setStage("done");
  };

  const score = scoreQuality({ ping, jitter, download });
  const quality = qualityLabel(score);
  const busy = stage === "latency" || stage === "download" || stage === "upload";

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(249,115,22,0.14)", border: "1px solid rgba(249,115,22,0.4)", boxShadow: "0 0 12px rgba(249,115,22,0.3)" }}>
            <Gauge className="h-4 w-4 text-[#f97316]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Testeur de Connexion</h2>
            <p className="text-[10px] text-white/40">Débit réel · latence · gigue</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.25)" }}>
        <div className="mb-1 flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-widest text-white/35">
          <Radio className="h-2.5 w-2.5" /> Débit descendant
        </div>
        <p className="text-4xl font-black text-white">
          {stage === "download" && download === null ? fmt(liveDownload) : fmt(download)}
          <span className="ml-1 text-sm font-bold text-[#f97316]">Mbps</span>
        </p>
        <div className="mx-auto mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full transition-all duration-300" style={{
            width: `${download === null ? progress : Math.min(100, (download / 400) * 100)}%`,
            background: "linear-gradient(90deg,#f97316,#22c55e)",
            boxShadow: "0 0 12px rgba(34,197,94,0.5)",
          }} />
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-[10px]">
          <span className="font-bold" style={{ color: quality.color }}>{quality.label}</span>
          {score > 0 && <span className="text-white/30">· score {score}/100</span>}
        </div>

        <button onClick={run} disabled={busy} className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl text-[11px] font-black text-black disabled:opacity-60" style={{ background: busy ? "rgba(249,115,22,0.6)" : "linear-gradient(135deg,#f97316,#22c55e)" }}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wifi className="h-3.5 w-3.5" />}
          {stage === "latency" ? `Mesure de la latence ${sampleCount}/10` :
            stage === "download" ? `Débit descendant ${Math.round(progress)}%` :
              stage === "upload" ? "Débit montant…" :
                stage === "done" ? "Relancer le test" : "Lancer le test"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          { label: "Latence", value: ping === null ? "—" : `${fmt(ping, 0)} ms`, sub: minPing === null ? "" : `min ${fmt(minPing, 0)} ms`, icon: Activity, color: "#22c55e" },
          { label: "Gigue", value: jitter === null ? "—" : `${fmt(jitter, 1)} ms`, sub: jitter === null ? "" : jitter < 10 ? "stable" : "instable", icon: Activity, color: "#84cc16" },
          { label: "Descendant", value: download === null ? "—" : `${fmt(download)} Mbps`, sub: "", icon: ArrowDown, color: "#f97316" },
          { label: "Montant", value: upload === null ? "—" : `${fmt(upload)} Mbps`, sub: "", icon: ArrowUp, color: "#a855f7" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="mb-1 flex items-center justify-between gap-1">
              <span className="flex items-center gap-1">
                <stat.icon className="h-3 w-3" style={{ color: stat.color }} />
                <span className="text-[9px] uppercase tracking-wider text-white/35">{stat.label}</span>
              </span>
              {stat.sub && <span className="text-[8px] text-white/25">{stat.sub}</span>}
            </div>
            <p className="text-sm font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {stage === "done" && ping !== null && (
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {[
            { label: "Jeux", ok: ping < 60 && jitter < 15 },
            { label: "4K / VOD", ok: download !== null && download > 25 },
            { label: "Visio", ok: download !== null && download > 5 && upload !== null && upload > 2 && ping < 150 },
          ].map((use) => (
            <div key={use.label} className="flex items-center justify-center gap-1 rounded-lg py-1.5 text-[9px] font-bold" style={{
              background: use.ok ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${use.ok ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.06)"}`,
              color: use.ok ? "#86efac" : "rgba(255,255,255,0.3)",
            }}>
              <ShieldCheck className="h-2.5 w-2.5" /> {use.label}
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-2 rounded-lg px-2 py-1.5 text-[10px] text-amber-300" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>{error}</p>}

      <p className="mt-2 text-center text-[8px] leading-relaxed text-white/25">
        Mesures réelles depuis votre navigateur vers le réseau de référence Cloudflare (latence en 10 échantillons, débit sur 30 Mo / 4 Mo).
      </p>
    </div>
  );
}