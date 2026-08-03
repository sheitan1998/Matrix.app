import React, { useState, useRef, useMemo } from "react";
import { X, Download, Plus, Trash2 } from "lucide-react";

const COLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DEFAULT_ROWS = 15;
const DEFAULT_COLS = 8;

export default function Spreadsheet({ onClose }) {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [data, setData] = useState({});
  const [selected, setSelected] = useState({ r: 0, c: 0 });
  const inputRef = useRef(null);

  const getCell = (r, c) => data[`${r}-${c}`] || "";
  const setCell = (r, c, val) => {
    setData(prev => ({ ...prev, [`${r}-${c}`]: val }));
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
        const v = parseFloat(data[`${r}-${c}`]);
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
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push(getDisplay(r, c));
      csv += row.join(",") + "\n";
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tableur-matrix.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const cellW = "w-20 min-w-[80px] max-w-[200px]";

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black text-white">Tableur Matrix</h2>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1 px-2 h-7 rounded-lg text-[10px] font-bold text-white" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <Download className="w-3 h-3" /> CSV
          </button>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => setRows(r => r + 1)} className="flex items-center gap-1 px-2 h-6 rounded text-[9px] font-bold text-white" style={{ background: "rgba(138,79,255,0.15)" }}>
          <Plus className="w-2.5 h-2.5" /> Ligne
        </button>
        <button onClick={() => setCols(c => Math.min(c + 1, 26))} className="flex items-center gap-1 px-2 h-6 rounded text-[9px] font-bold text-white" style={{ background: "rgba(138,79,255,0.15)" }}>
          <Plus className="w-2.5 h-2.5" /> Colonne
        </button>
        <button onClick={() => setData({})} className="flex items-center gap-1 px-2 h-6 rounded text-[9px] font-bold text-red-400" style={{ background: "rgba(239,68,68,0.1)" }}>
          <Trash2 className="w-2.5 h-2.5" /> Vider
        </button>
        <span className="text-[9px] text-white/30 ml-auto">Formules: =SUM(A1:A5) =AVG(B1:B3) =MIN(C1:C10) =MAX(D1:D5)</span>
      </div>

      <div className="overflow-auto scrollbar-thin rounded-lg" style={{ maxHeight: "60vh", border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="border-collapse text-[10px]">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-20 w-8 h-7" style={{ background: "#1a1525", border: "1px solid rgba(255,255,255,0.06)" }} />
              {Array.from({ length: cols }).map((_, c) => (
                <th key={c} className="sticky top-0 z-10 h-7 px-1 font-bold text-white/50 text-center" style={{ background: "#1a1525", border: "1px solid rgba(255,255,255,0.06)", minWidth: "80px" }}>
                  {COLS[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                <td className="sticky left-0 z-10 w-8 h-7 text-center font-bold text-white/40" style={{ background: "#1a1525", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {r + 1}
                </td>
                {Array.from({ length: cols }).map((_, c) => {
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