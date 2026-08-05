import React, { useState, useRef, useEffect } from "react";
import { X, Download, Plus, Trash2, FileText, Copy } from "lucide-react";

const COLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DEFAULT_ROWS = 15;
const DEFAULT_COLS = 8;
const STORAGE_KEY = "matrix_spreadsheet_files";

function loadFiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveFiles(files) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(files)); } catch {}
}

function createNewFile(name) {
  return { id: `sheet_${Date.now()}`, name: name || "Sans titre", rows: DEFAULT_ROWS, cols: DEFAULT_COLS, data: {} };
}

export default function Spreadsheet({ onClose }) {
  const [files, setFiles] = useState(() => {
    const saved = loadFiles();
    if (saved && saved.length > 0) return saved;
    return [createNewFile("Tableur 1")];
  });
  const [activeId, setActiveId] = useState(() => files[0]?.id);
  const [selected, setSelected] = useState({ r: 0, c: 0 });
  const inputRef = useRef(null);

  const activeFile = files.find(f => f.id === activeId) || files[0];

  useEffect(() => { saveFiles(files); }, [files]);

  const updateActiveFile = (updates) => {
    setFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, ...updates } : f));
  };

  const setData = (data) => updateActiveFile({ data });

  const getCell = (r, c) => activeFile.data[`${r}-${c}`] || "";
  const setCell = (r, c, val) => {
    setData({ ...activeFile.data, [`${r}-${c}`]: val });
  };

  const parseFormula = (val) => {
    if (!val) return "";
    const s = String(val).trim();
    if (!s.startsWith("=")) return s;
    const expr = s.slice(1).toUpperCase();
    const m = expr.match(/^(SUM|AVG|MIN|MAX)\((.+)\)$/);
    if (!m) return s;
    const [, fn, range] = m;
    const cells = range.split(":");
    if (cells.length !== 2) return s;
    const [start, end] = cells;
    const sc = COLS.indexOf(start[0]);
    const sr = parseInt(start.slice(1)) - 1;
    const ec = COLS.indexOf(end[0]);
    const er = parseInt(end.slice(1)) - 1;
    if (sc < 0 || ec < 0 || isNaN(sr) || isNaN(er)) return s;
    const values = [];
    for (let r = sr; r <= er; r++) {
      for (let c = sc; c <= ec; c++) {
        const v = parseFloat(activeFile.data[`${r}-${c}`]);
        if (!isNaN(v)) values.push(v);
      }
    }
    if (values.length === 0) return "0";
    switch (fn) {
      case "SUM": return values.reduce((a, b) => a + b, 0).toString();
      case "AVG": return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
      case "MIN": return Math.min(...values).toString();
      case "MAX": return Math.max(...values).toString();
      default: return s;
    }
  };

  const getDisplay = (r, c) => {
    const raw = getCell(r, c);
    if (String(raw).startsWith("=")) return parseFormula(raw);
    return raw;
  };

  const exportCSV = () => {
    let csv = "";
    for (let r = 0; r < activeFile.rows; r++) {
      const row = [];
      for (let c = 0; c < activeFile.cols; c++) row.push(getDisplay(r, c));
      csv += row.join(",") + "\n";
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeFile.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addFile = () => {
    const newFile = createNewFile(`Tableur ${files.length + 1}`);
    setFiles(prev => [...prev, newFile]);
    setActiveId(newFile.id);
  };

  const duplicateFile = () => {
    const newFile = createNewFile(`${activeFile.name} (copie)`);
    newFile.rows = activeFile.rows;
    newFile.cols = activeFile.cols;
    newFile.data = { ...activeFile.data };
    setFiles(prev => [...prev, newFile]);
    setActiveId(newFile.id);
  };

  const deleteFile = () => {
    if (files.length <= 1) return;
    const remaining = files.filter(f => f.id !== activeFile.id);
    setFiles(remaining);
    setActiveId(remaining[0].id);
  };

  const renameFile = (name) => updateActiveFile({ name });

  return (
    <div className="p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black text-white">Tableur Matrix</h2>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1 px-2 h-7 rounded-lg text-[10px] font-bold text-white tap-sm" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <Download className="w-3 h-3" /> CSV
          </button>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File tabs */}
      <div className="flex items-center gap-1 mb-2 overflow-x-auto scrollbar-thin pb-1">
        {files.map(f => (
          <button key={f.id} onClick={() => setActiveId(f.id)}
            className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-[10px] font-bold whitespace-nowrap transition tap-sm"
            style={{
              background: f.id === activeFile.id ? "rgba(138,79,255,0.25)" : "rgba(255,255,255,0.03)",
              border: f.id === activeFile.id ? "1px solid rgba(138,79,255,0.4)" : "1px solid rgba(255,255,255,0.06)",
              color: f.id === activeFile.id ? "#fff" : "rgba(255,255,255,0.4)",
            }}>
            <FileText className="w-3 h-3" /> {f.name}
          </button>
        ))}
        <button onClick={addFile} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white shrink-0 tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* File actions */}
      <div className="flex items-center gap-2 mb-2">
        <input value={activeFile.name} onChange={e => renameFile(e.target.value)}
          className="px-2 h-6 rounded text-[10px] text-white bg-transparent outline-none flex-1 max-w-[160px]"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
        <button onClick={duplicateFile} className="flex items-center gap-1 px-2 h-6 rounded text-[9px] font-bold text-white/60 tap-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
          <Copy className="w-2.5 h-2.5" /> Dupliquer
        </button>
        <button onClick={deleteFile} disabled={files.length <= 1} className="flex items-center gap-1 px-2 h-6 rounded text-[9px] font-bold text-red-400 disabled:opacity-30 tap-sm" style={{ background: "rgba(239,68,68,0.1)" }}>
          <Trash2 className="w-2.5 h-2.5" /> Suppr.
        </button>
        <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.1)" }} />
        <button onClick={() => updateActiveFile({ rows: activeFile.rows + 1 })} className="flex items-center gap-1 px-2 h-6 rounded text-[9px] font-bold text-white tap-sm" style={{ background: "rgba(138,79,255,0.15)" }}>
          <Plus className="w-2.5 h-2.5" /> Ligne
        </button>
        <button onClick={() => updateActiveFile({ cols: Math.min(activeFile.cols + 1, 26) })} className="flex items-center gap-1 px-2 h-6 rounded text-[9px] font-bold text-white tap-sm" style={{ background: "rgba(138,79,255,0.15)" }}>
          <Plus className="w-2.5 h-2.5" /> Colonne
        </button>
        <button onClick={() => setData({})} className="flex items-center gap-1 px-2 h-6 rounded text-[9px] font-bold text-red-400 tap-sm" style={{ background: "rgba(239,68,68,0.1)" }}>
          <Trash2 className="w-2.5 h-2.5" /> Vider
        </button>
        <span className="text-[9px] text-white/30 ml-auto hidden sm:inline">=SUM(A1:A5) =AVG(B1:B3)</span>
      </div>

      {/* Grid */}
      <div className="overflow-auto scrollbar-thin rounded-lg flex-1" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="border-collapse text-[10px]">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-20 w-8 h-7" style={{ background: "#1a1525", border: "1px solid rgba(255,255,255,0.06)" }} />
              {Array.from({ length: activeFile.cols }).map((_, c) => (
                <th key={c} className="sticky top-0 z-10 h-7 px-1 font-bold text-white/50 text-center" style={{ background: "#1a1525", border: "1px solid rgba(255,255,255,0.06)", minWidth: "80px" }}>
                  {COLS[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: activeFile.rows }).map((_, r) => (
              <tr key={r}>
                <td className="sticky left-0 z-10 w-8 h-7 text-center font-bold text-white/40" style={{ background: "#1a1525", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {r + 1}
                </td>
                {Array.from({ length: activeFile.cols }).map((_, c) => {
                  const isSel = selected.r === r && selected.c === c;
                  const display = getDisplay(r, c);
                  const isFormula = String(getCell(r, c)).startsWith("=");
                  return (
                    <td
                      key={c}
                      onClick={() => { setSelected({ r, c }); setTimeout(() => inputRef.current?.focus(), 0); }}
                      className="h-7 px-1 cursor-cell"
                      style={{
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: isSel ? "rgba(138,79,255,0.15)" : "transparent",
                        color: isFormula ? "#a855f7" : "#fff",
                        minWidth: "80px",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isSel ? (
                        <input
                          ref={inputRef}
                          value={getCell(r, c)}
                          onChange={e => setCell(r, c, e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") { e.preventDefault(); setSelected({ r: r + 1, c }); }
                            if (e.key === "Tab") { e.preventDefault(); setSelected({ r, c: c + 1 }); }
                          }}
                          className="w-full h-full bg-transparent outline-none text-white text-[10px]"
                        />
                      ) : (
                        display
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}