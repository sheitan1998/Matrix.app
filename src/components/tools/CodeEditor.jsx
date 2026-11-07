import React, { useMemo, useRef, useState } from "react";
import { X, Play, Download, Copy, Code2 } from "lucide-react";

const LANG_COLORS = { html: "#22d3ee", css: "#38bdf8", js: "#fbbf24" };

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const hlJS = (code) =>
  escapeHtml(code).replace(
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|if|else|for|while|new|class|import|from|export|default|await|async|try|catch|throw|typeof|of|in|true|false|null|this)\b)|(\b\d+(?:\.\d+)?\b)/g,
    (m, c, s, k, n) => {
      if (c) return `<span style="color:#64748b">${c}</span>`;
      if (s) return `<span style="color:#a3e635">${s}</span>`;
      if (k) return `<span style="color:#f472b6">${k}</span>`;
      return `<span style="color:#fbbf24">${n}</span>`;
    }
  );

const hlCSS = (code) =>
  escapeHtml(code).replace(
    /(\/\*[\s\S]*?\*\/)|(#[0-9a-fA-F]{3,8}\b)|(-?[\w-]+)(?=\s*:)|([\w-]+)(?=\s*\{)/g,
    (m, c, hex, prop, sel) => {
      if (c) return `<span style="color:#64748b">${c}</span>`;
      if (hex) return `<span style="color:#fbbf24">${hex}</span>`;
      if (prop) return `<span style="color:#38bdf8">${prop}</span>`;
      return `<span style="color:#f472b6">${sel}</span>`;
    }
  );

const hlHTML = (code) =>
  escapeHtml(code).replace(
    /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([\w-]+)|([\w-]+)(=)|("[^"]*"|'[^']*')/g,
    (m, comment, open, tag, attr, eq, str) => {
      if (comment) return `<span style="color:#64748b">${comment}</span>`;
      if (open) return `<span style="color:#64748b">${open}</span><span style="color:#f472b6">${tag || ""}</span>`;
      if (attr) return `<span style="color:#22d3ee">${attr}</span>${eq || ""}`;
      return `<span style="color:#a3e635">${str}</span>`;
    }
  );

const highlight = (code, lang) => (lang === "css" ? hlCSS(code) : lang === "js" ? hlJS(code) : hlHTML(code));

const STARTER = {
  html: `<div class="card">\n  <h1>Hello MATRIX</h1>\n  <p>Modifie ce code directement.</p>\n  <button id="go">Cliquer</button>\n</div>`,
  css: `body {\n  background: #0a050f;\n  color: #fff;\n  font-family: Inter, sans-serif;\n  display: grid;\n  place-items: center;\n  height: 100vh;\n}\n.card {\n  padding: 32px;\n  border: 1px solid #a855f7;\n  border-radius: 16px;\n  box-shadow: 0 0 30px rgba(168,85,247,0.4);\n}\nbutton {\n  margin-top: 12px;\n  background: #a855f7;\n  border: 0;\n  color: #fff;\n  padding: 8px 16px;\n  border-radius: 8px;\n}`,
  js: `document.getElementById("go")?.addEventListener("click", () => {\n  alert("MATRIX Code Editor");\n});`,
};

export default function CodeEditor({ onClose }) {
  const [lang, setLang] = useState("html");
  const [code, setCode] = useState(STARTER);
  const [runKey, setRunKey] = useState(0);
  const preRef = useRef(null);
  const areaRef = useRef(null);

  const srcDoc = useMemo(
    () => `<!doctype html><html><head><meta charset="utf-8"><style>${code.css}</style></head><body>${code.html}<script>${code.js}<\/script></body></html>`,
    [runKey]
  );

  const syncScroll = () => {
    if (!preRef.current || !areaRef.current) return;
    preRef.current.scrollTop = areaRef.current.scrollTop;
    preRef.current.scrollLeft = areaRef.current.scrollLeft;
  };

  const download = () => {
    const blob = new Blob([code[lang]], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `matrix.${lang === "js" ? "js" : lang}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const current = code[lang] || "";

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(20,184,166,0.14)", border: "1px solid rgba(20,184,166,0.4)", boxShadow: "0 0 12px rgba(20,184,166,0.3)" }}>
            <Code2 className="h-4 w-4 text-[#2dd4bf]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Éditeur de Code</h2>
            <p className="text-[10px] text-white/40">HTML · CSS · JS avec aperçu live</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {["html", "css", "js"].map((l) => (
            <button key={l} onClick={() => setLang(l)} className="rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase transition" style={{
              background: lang === l ? `${LANG_COLORS[l]}22` : "rgba(255,255,255,0.04)",
              border: `1px solid ${lang === l ? `${LANG_COLORS[l]}80` : "rgba(255,255,255,0.08)"}`,
              color: lang === l ? LANG_COLORS[l] : "rgba(255,255,255,0.4)",
            }}>{l}</button>
          ))}
          <button onClick={() => setRunKey((k) => k + 1)} className="ml-1 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-[#2dd4bf] tap-sm" style={{ background: "rgba(20,184,166,0.14)", border: "1px solid rgba(20,184,166,0.4)" }}>
            <Play className="h-3 w-3" /> Exécuter
          </button>
          <button onClick={download} title="Télécharger" className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <Download className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => navigator.clipboard.writeText(current)} title="Copier" className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-2">
        <div className="relative min-h-[220px] overflow-hidden rounded-xl" style={{ background: "#0b0812", border: "1px solid rgba(20,184,166,0.25)" }}>
          <pre
            ref={preRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre p-3 font-mono text-[11px] leading-[1.6]"
            dangerouslySetInnerHTML={{ __html: highlight(current, lang) + "\n" }}
          />
          <textarea
            ref={areaRef}
            value={current}
            onChange={(e) => setCode({ ...code, [lang]: e.target.value })}
            onScroll={syncScroll}
            spellCheck={false}
            className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-3 font-mono text-[11px] leading-[1.6] text-transparent caret-white outline-none"
          />
          <span className="pointer-events-none absolute bottom-1.5 right-2 font-mono text-[9px] uppercase tracking-wider" style={{ color: `${LANG_COLORS[lang]}88` }}>{lang}</span>
        </div>

        <div className="relative min-h-[220px] overflow-hidden rounded-xl bg-white" style={{ border: "1px solid rgba(20,184,166,0.25)" }}>
          <iframe key={runKey} title="Aperçu" srcDoc={srcDoc} sandbox="allow-scripts" className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}