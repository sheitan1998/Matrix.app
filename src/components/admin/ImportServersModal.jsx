import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

// Parse une ligne CSV en respectant les guillemets
const parseCsvLine = (line) => {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; } else quoted = !quoted;
    } else if (ch === "," && !quoted) { out.push(cur); cur = ""; } else cur += ch;
  }
  out.push(cur);
  return out.map((v) => v.trim());
};

export const parseImport = (text) => {
  const raw = text.trim();
  if (!raw) return [];
  if (raw.startsWith("[") || raw.startsWith("{")) {
    const json = JSON.parse(raw);
    return Array.isArray(json) ? json : json.servers || json.items || [];
  }
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = cells[i] || ""; });
    if (typeof row.tags === "string") row.tags = row.tags.split(/[;|]/).map((t) => t.trim()).filter(Boolean);
    return row;
  });
};

export default function ImportServersModal({ onClose, onImported }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (file) setText(await file.text());
  };

  const submit = async () => {
    let items;
    try {
      items = parseImport(text);
    } catch {
      toast.error("Format invalide (CSV ou JSON attendu)");
      return;
    }
    if (!items.length) { toast.error("Aucune fiche détectée"); return; }
    setBusy(true);
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "adminImportAds", items });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`${res.data.created} fiche(s) importée(s)${res.data.errors?.length ? ` — ${res.data.errors.length} ignorée(s)` : ""}`);
      if (res.data.errors?.length) toast.error(res.data.errors.slice(0, 3).join(" · "));
      onImported();
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Import impossible");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl p-4 space-y-3"
        style={{ background: "#12101c", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-2"><Upload className="w-4 h-4 text-purple-400" /> Import rapide</h3>
          <button type="button" onClick={onClose} className="text-white/40"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-[11px] text-white/50">
          CSV (en-têtes) ou JSON. Champs : name, category, description, invite_url, logo_url, banner_url, tags (séparés par « ; » en CSV).
          Les fiches sont créées avec 0 vote et rattachées à ton compte admin.
        </p>
        <input type="file" accept=".csv,.json,text/csv,application/json" onChange={onFile} className="text-[11px] text-white/60" />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          placeholder={'name,category,description,invite_url,logo_url,banner_url,tags\n"Mon serveur",Minecraft,"Description...",https://discord.gg/xxx,,,"survie;pvp"'}
          className="w-full rounded-lg p-2 text-[11px] text-white font-mono placeholder:text-white/20 outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy || !text.trim()}
          className="w-full h-10 rounded-lg text-xs font-bold text-white disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
        >
          {busy ? "Import en cours..." : "Importer"}
        </button>
      </div>
    </div>
  );
}
