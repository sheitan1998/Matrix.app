import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Calculator, Coins, ChevronRight, MessageCircle, Youtube, Home, FileText } from "lucide-react";
import CalculatorTool from "@/components/tools/Calculator";
import NotepadManager from "@/components/tools/NotepadManager";
import UnitConverterTool from "@/components/tools/UnitConverter";
import Spreadsheet from "@/components/tools/Spreadsheet";
import PaintTool from "@/components/tools/PaintTool";
import HeaderActions from "@/components/layout/HeaderActions";
import { Table, Palette } from "lucide-react";

const TOOLS = [
{ id: "calc", label: "Calculatrice de Bureau", desc: "Opérations basiques, scientifiques et financières.", icon: Calculator, color: "#FF4D4D" },
{ id: "convert", label: "Convertisseur d'Unités", desc: "Convertissez distances, poids, volumes, et devises.", icon: Coins, color: "#FFD700" },
{ id: "notepad-mgr", label: "Gestionnaire de Blocs-notes", desc: "Créez et gérez plusieurs blocs-notes personnels.", icon: FileText, color: "#22C55E" },
{ id: "spreadsheet", label: "Tableur Matrix", desc: "Tableur fonctionnel avec formules SUM, AVG, MIN, MAX et export CSV.", icon: Table, color: "#3b82f6" },
{ id: "paint", label: "Paint Matrix", desc: "Outil de dessin avec pinceau, gomme, couleurs et export PNG.", icon: Palette, color: "#ec4899" }];


const BG_URL = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/891f5968b_Gemini_Generated_Image_vsevw4vsevw4vsev.png";

export default function Outils() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTool, setActiveTool] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden" style={{ backgroundColor: "#0a050f" }}>
      {/* Space background */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `url(${BG_URL})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(10,5,15,0.55)" }} />

      <div className="relative z-10 min-h-screen flex flex-col px-4 sm:px-6 lg:px-10 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <button onClick={() => nav("/")} className="flex items-center gap-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">MATRIX</h1>
          </button>
          <HeaderActions />
        </header>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link to="/" className="flex items-center gap-1 text-white/50 hover:text-white transition">
            <Home className="w-3.5 h-3.5" /> Accueil
          </Link>
          <span className="text-white/30">›</span>
          <span className="text-white font-semibold">Outils de Bureau</span>
        </div>

        {/* Tool cards */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {TOOLS.map((tool, i) =>
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTool(tool.id)}
              className="relative rounded-2xl p-6 text-left flex flex-col gap-4 overflow-hidden"
              style={{
                background: "rgba(15,10,25,0.7)",
                border: `2px solid ${tool.color}`,
                boxShadow: `0 0 24px ${tool.color}30, inset 0 0 12px ${tool.color}10`,
                backdropFilter: "blur(8px)"
              }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${tool.color}, transparent 70%)` }} />
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${tool.color}1a`, border: `1px solid ${tool.color}40` }}>
                  <tool.icon className="w-7 h-7" style={{ color: tool.color }} />
                </div>
                <div className="relative flex-1">
                  <h2 className="text-lg font-black text-white mb-1">{tool.label}</h2>
                  <p className="text-xs leading-relaxed text-white/50">{tool.desc}</p>
                </div>
                <div className="relative flex items-center justify-end">
                  <ChevronRight className="w-6 h-6" style={{ color: tool.color }} />
                </div>
              </motion.button>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 flex flex-col items-center gap-3 pb-4">
          <div className="flex items-center gap-4">
            

            
            

            
          </div>
        </footer>
      </div>

      {/* Tool modals */}
      <AnimatePresence>
        {activeTool &&
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setActiveTool(null)}>
            <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className={`w-full rounded-2xl ${activeTool === "paint" ? "max-w-5xl h-[85vh]" : activeTool === "spreadsheet" ? "max-w-4xl h-[80vh]" : activeTool === "notepad-mgr" ? "max-w-3xl max-h-[85vh] overflow-y-auto scrollbar-thin" : "max-w-md max-h-[85vh] overflow-y-auto scrollbar-thin"}`}
            style={{ background: "#13101a", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}>
              {activeTool === "calc" && <CalculatorTool onClose={() => setActiveTool(null)} />}
              {activeTool === "notepad-mgr" && <NotepadManager onClose={() => setActiveTool(null)} />}
              {activeTool === "convert" && <UnitConverterTool onClose={() => setActiveTool(null)} />}
              {activeTool === "spreadsheet" && <Spreadsheet onClose={() => setActiveTool(null)} />}
              {activeTool === "paint" && <PaintTool onClose={() => setActiveTool(null)} />}
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

    </div>);

}