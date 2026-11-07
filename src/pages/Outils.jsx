import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Calculator, Coins, Table, Palette, FileText, Code2, FolderOpen, Gauge, FileDown, Hash, TrendingUp, Home } from "lucide-react";
import CalculatorTool from "@/components/tools/Calculator";
import NotepadManager from "@/components/tools/NotepadManager";
import UnitConverterTool from "@/components/tools/UnitConverter";
import Spreadsheet from "@/components/tools/Spreadsheet";
import PaintTool from "@/components/tools/PaintTool";
import CurrencyConverter from "@/components/tools/CurrencyConverter";
import CodeEditor from "@/components/tools/CodeEditor";
import FileManager from "@/components/tools/FileManager";
import SpeedTest from "@/components/tools/SpeedTest";
import PdfMatrix from "@/components/tools/PdfMatrix";
import HashGenerator from "@/components/tools/HashGenerator";
import ToolCard from "@/components/tools/ToolCard";
import HeaderActions from "@/components/layout/HeaderActions";
import { useProgression } from "@/context/ProgressionContext";

const TOOLS = [
  { id: "calc", label: "Calculatrice de Bureau", desc: "Opérations basiques, scientifiques et financières.", icon: Calculator, color: "#FF4D4D" },
  { id: "convert", label: "Convertisseur d'Unités", desc: "Distances, poids, volumes, températures et devises.", icon: Coins, color: "#FFD700" },
  { id: "currency", label: "Convertisseur de Devises", desc: "Taux de change en direct et conversion mondiale.", icon: TrendingUp, color: "#22D3EE" },
  { id: "notepad-mgr", label: "Gestionnaire de Blocs-notes", desc: "Créez et gérez plusieurs blocs-notes personnels.", icon: FileText, color: "#22C55E" },
  { id: "spreadsheet", label: "Tableur Matrix", desc: "Formules SUM, AVG, MIN, MAX et export CSV.", icon: Table, color: "#3B82F6" },
  { id: "code", label: "Éditeur de Code", desc: "HTML, CSS et JS avec coloration syntaxique et aperçu live.", icon: Code2, color: "#14B8A6" },
  { id: "files", label: "Gestionnaire de Fichiers", desc: "Organisez vos dossiers et documents locaux.", icon: FolderOpen, color: "#A855F7" },
  { id: "speed", label: "Testeur de Connexion", desc: "Mesurez le débit Internet, la latence et la gigue.", icon: Gauge, color: "#F97316" },
  { id: "pdf", label: "PDF Matrix", desc: "Composez un document et exportez-le en PDF paginé.", icon: FileDown, color: "#F43F5E" },
  { id: "hash", label: "Générateur de Hash", desc: "Empreintes SHA-1, SHA-256, SHA-384 et SHA-512.", icon: Hash, color: "#84CC16" },
  { id: "paint", label: "Paint Matrix Avancé", desc: "Calques, brosses avancées et outils de retouche photo.", icon: Palette, color: "#EC4899", badge: "PRO" },
];

const MODAL_SIZE = {
  paint: "max-w-6xl h-[88vh]",
  code: "max-w-6xl h-[88vh]",
  files: "max-w-4xl h-[80vh]",
  spreadsheet: "max-w-4xl h-[80vh]",
  "notepad-mgr": "max-w-3xl max-h-[85vh]",
  currency: "max-w-2xl max-h-[88vh]",
  pdf: "max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin",
  hash: "max-w-xl max-h-[88vh] overflow-y-auto scrollbar-thin",
  speed: "max-w-md",
  calc: "max-w-md max-h-[85vh] overflow-y-auto scrollbar-thin",
  convert: "max-w-md max-h-[85vh] overflow-y-auto scrollbar-thin",
};

export default function Outils() {
  const nav = useNavigate();
  const { trackActivity } = useProgression();
  const [user, setUser] = useState(null);
  const [activeTool, setActiveTool] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const open = (id) => {
    setActiveTool(id);
    trackActivity("tools_used");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent">
      <div className="relative z-10 flex min-h-screen flex-col px-4 py-4 sm:px-6 lg:px-10">
        <header className="mb-5 flex items-center justify-between">
          <button onClick={() => nav("/")} className="flex items-center gap-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">MATRIX</h1>
          </button>
          <HeaderActions />
        </header>

        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link to="/" className="flex items-center gap-1 text-foreground/50 transition hover:text-foreground">
            <Home className="h-3.5 w-3.5" /> Accueil
          </Link>
          <span className="text-foreground/30">›</span>
          <span className="font-semibold text-foreground">Outils de Bureau</span>
        </div>

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground sm:text-2xl">Boîte à outils Matrix</h2>
            <p className="mt-1 text-xs text-foreground/45">
              {TOOLS.length} outils de productivité, de création et de diagnostic — sans installation.
            </p>
          </div>
        </div>

        <div className="mb-10 grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} onOpen={() => open(tool.id)} />
          ))}
        </div>

        <footer className="mt-auto pb-4" />
      </div>

      <AnimatePresence>
        {activeTool && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
            onClick={() => setActiveTool(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className={`w-full overflow-hidden rounded-2xl ${MODAL_SIZE[activeTool] || "max-w-md"}`}
              style={{ background: "#13101a", border: "1px solid rgba(255,255,255,0.08)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {activeTool === "calc" && <CalculatorTool onClose={() => setActiveTool(null)} />}
              {activeTool === "convert" && <UnitConverterTool onClose={() => setActiveTool(null)} />}
              {activeTool === "currency" && <CurrencyConverter onClose={() => setActiveTool(null)} />}
              {activeTool === "notepad-mgr" && <NotepadManager onClose={() => setActiveTool(null)} user={user} />}
              {activeTool === "spreadsheet" && <Spreadsheet onClose={() => setActiveTool(null)} user={user} />}
              {activeTool === "code" && <CodeEditor onClose={() => setActiveTool(null)} />}
              {activeTool === "files" && <FileManager onClose={() => setActiveTool(null)} user={user} />}
              {activeTool === "speed" && <SpeedTest onClose={() => setActiveTool(null)} />}
              {activeTool === "pdf" && <PdfMatrix onClose={() => setActiveTool(null)} />}
              {activeTool === "hash" && <HashGenerator onClose={() => setActiveTool(null)} />}
              {activeTool === "paint" && <PaintTool onClose={() => setActiveTool(null)} user={user} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}