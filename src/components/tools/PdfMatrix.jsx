import React, { useState } from "react";
import { X, FileText, Download, Loader2 } from "lucide-react";

export default function PdfMatrix({ onClose }) {
  const [title, setTitle] = useState("Document MATRIX");
  const [author, setAuthor] = useState("MATRIX");
  const [content, setContent] = useState("");
  const [orientation, setOrientation] = useState("portrait");
  const [fontSize, setFontSize] = useState(11);
  const [pageNumbers, setPageNumbers] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!content.trim()) { setError("Ajoutez du contenu avant de générer le PDF."); return; }
    setBusy(true);
    setError("");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(20, 16, 28);
      const titleLines = doc.splitTextToSize(title || "Document MATRIX", contentWidth);
      doc.text(titleLines, margin, 26);
      let y = 26 + titleLines.length * 8 + 2;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120, 116, 132);
      doc.text(`${author || "MATRIX"} · ${new Date().toLocaleDateString("fr-FR")}`, margin, y);
      y += 9;

      doc.setDrawColor(168, 85, 247);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      doc.setTextColor(28, 25, 36);
      doc.setFontSize(Number(fontSize) || 11);
      const paragraphs = content.split("\n");
      const lineHeight = (Number(fontSize) || 11) * 0.52;

      paragraphs.forEach((paragraph) => {
        const lines = doc.splitTextToSize(paragraph || " ", contentWidth);
        lines.forEach((line) => {
          if (y > pageHeight - margin - 8) {
            doc.addPage();
            y = margin + 4;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });
        y += lineHeight * 0.35;
      });

      if (pageNumbers) {
        const total = doc.getNumberOfPages();
        for (let p = 1; p <= total; p++) {
          doc.setPage(p);
          doc.setFontSize(8);
          doc.setTextColor(140, 136, 150);
          doc.text(`${p} / ${total}`, pageWidth - margin, pageHeight - 10, { align: "right" });
        }
      }

      doc.save(`${(title || "document").replace(/[^\w\s-]/g, "").trim() || "document"}.pdf`);
    } catch (e) {
      setError("La génération a échoué. Réessayez.");
    }
    setBusy(false);
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(244,63,94,0.14)", border: "1px solid rgba(244,63,94,0.4)", boxShadow: "0 0 12px rgba(244,63,94,0.3)" }}>
            <FileText className="h-4 w-4 text-[#f43f5e]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">PDF Matrix</h2>
            <p className="text-[10px] text-white/40">Composez et exportez un PDF propre</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-white/35">Titre</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 w-full rounded-lg bg-black/30 px-2.5 text-xs text-white outline-none focus:border-[#f43f5e]" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-white/35">Auteur</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} className="h-9 w-full rounded-lg bg-black/30 px-2.5 text-xs text-white outline-none focus:border-[#f43f5e]" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-white/35">Contenu</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Rédigez ici le contenu de votre document…"
            className="h-40 w-full resize-none rounded-lg bg-black/30 p-2.5 text-xs leading-relaxed text-white outline-none focus:border-[#f43f5e]"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className="h-8 rounded-lg bg-black/30 px-2 text-[10px] text-white outline-none" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <option value="portrait">A4 Portrait</option>
            <option value="landscape">A4 Paysage</option>
          </select>
          <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="h-8 rounded-lg bg-black/30 px-2 text-[10px] text-white outline-none" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            {[9, 10, 11, 12, 14].map((s) => <option key={s} value={s}>{s} pt</option>)}
          </select>
          <button onClick={() => setPageNumbers((v) => !v)} className="h-8 rounded-lg px-2 text-[10px] font-bold" style={{
            background: pageNumbers ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${pageNumbers ? "rgba(244,63,94,0.45)" : "rgba(255,255,255,0.08)"}`,
            color: pageNumbers ? "#fda4af" : "rgba(255,255,255,0.4)",
          }}>
            Pagination
          </button>
          <span className="ml-auto text-[10px] text-white/30">{content.length} car.</span>
        </div>

        {error && <p className="text-[10px] text-rose-300">{error}</p>}

        <button onClick={generate} disabled={busy} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-black text-black disabled:opacity-50" style={{ background: "linear-gradient(135deg,#f43f5e,#fb7185)", boxShadow: "0 0 20px rgba(244,63,94,0.35)" }}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {busy ? "Génération…" : "Générer le PDF"}
        </button>
      </div>
    </div>
  );
}