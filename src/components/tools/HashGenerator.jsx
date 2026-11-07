import React, { useState } from "react";
import { X, Copy, Check, Hash, Upload } from "lucide-react";

const ALGOS = ["SHA-256", "SHA-1", "SHA-384", "SHA-512"];

async function digestHex(text, algo) {
  const bytes = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest(algo, bytes);
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HashGenerator({ onClose }) {
  const [text, setText] = useState("");
  const [algo, setAlgo] = useState("SHA-256");
  const [hash, setHash] = useState("");
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const [upper, setUpper] = useState(false);

  const compute = async (value = text, algorithm = algo) => {
    setHash(await digestHex(value, algorithm));
    setCopied(false);
  };

  React.useEffect(() => {
    if (!text) { setHash(""); return; }
    const t = setTimeout(() => compute(text, algo), 180);
    return () => clearTimeout(t);
  }, [text, algo]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const result = await crypto.subtle.digest(algo, buffer);
    setHash(Array.from(new Uint8Array(result)).map((b) => b.toString(16).padStart(2, "0")).join(""));
    setText("");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(upper ? hash.toUpperCase() : hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shown = upper ? hash.toUpperCase() : hash;

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(132,204,22,0.14)", border: "1px solid rgba(132,204,22,0.4)", boxShadow: "0 0 12px rgba(132,204,22,0.3)" }}>
            <Hash className="h-4 w-4 text-[#84cc16]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Générateur de Hash</h2>
            <p className="text-[10px] text-white/40">Empreinte cryptographique instantanée</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {ALGOS.map((a) => (
          <button key={a} onClick={() => setAlgo(a)} className="rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition" style={{
            background: algo === a ? "rgba(132,204,22,0.18)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${algo === a ? "rgba(132,204,22,0.5)" : "rgba(255,255,255,0.08)"}`,
            color: algo === a ? "#d9f99d" : "rgba(255,255,255,0.45)",
          }}>{a}</button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setFileName(""); }}
        placeholder="Saisissez le texte à hacher…"
        className="h-28 w-full resize-none rounded-xl bg-black/30 p-3 font-mono text-xs text-white outline-none focus:border-[#84cc16]"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
      />

      <div className="mt-2 flex items-center gap-2">
        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white/60 hover:text-white" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Upload className="h-3 w-3" /> Hacher un fichier
          <input type="file" className="hidden" onChange={onFile} />
        </label>
        {fileName && <span className="truncate text-[10px] text-white/40">{fileName}</span>}
        <button onClick={() => setUpper((v) => !v)} className="ml-auto rounded-lg px-2 py-1 text-[9px] font-bold text-white/40 hover:text-white" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {upper ? "MAJUSCULES" : "minuscules"}
        </button>
      </div>

      <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(132,204,22,0.06)", border: "1px solid rgba(132,204,22,0.28)" }}>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">{algo}</p>
          <button onClick={copy} disabled={!hash} className="flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-bold text-[#84cc16] disabled:opacity-30 tap-sm" style={{ background: "rgba(132,204,22,0.12)" }}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? "Copié" : "Copier"}
          </button>
        </div>
        <p className="break-all font-mono text-[11px] leading-relaxed text-[#e5ffb0]">{shown || "—"}</p>
      </div>
    </div>
  );
}