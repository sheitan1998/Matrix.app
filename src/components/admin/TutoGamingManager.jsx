import React, { useState } from "react";
import { FileText, FolderTree, LayoutGrid, Fence, ArrowUpDown, Gamepad2 } from "lucide-react";
import AddWikiItemForm from "@/components/admin/AddWikiItemForm";
import WikiItemList from "@/components/admin/WikiItemList";
import CategoryManager from "@/components/admin/CategoryManager";
import ReorderManager from "@/components/admin/ReorderManager";
import BlockManager from "@/components/admin/BlockManager";
import FarmingSimPopupManager from "@/components/admin/FarmingSimPopupManager";

const SUB_TABS = [
  { id: "guides", label: "Guides & Fiches", icon: FileText, color: "#22c55e" },
  { id: "categories", label: "Catégories", icon: FolderTree, color: "#3b82f6" },
  { id: "blocks", label: "Blocs de contenu", icon: LayoutGrid, color: "#a855f7" },
  { id: "popups", label: "Pop-ups", icon: Fence, color: "#f59e0b" },
  { id: "reorder", label: "Réorganisation", icon: ArrowUpDown, color: "#ec4899" },
];

export default function TutoGamingManager() {
  const [subTab, setSubTab] = useState("guides");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(15,10,25,0.6)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Gamepad2 className="w-4 h-4" style={{ color: "#22c55e" }} />
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Tuto & Entraide Gaming</h3>
        </div>
        <p className="text-[10px] text-white/40">Guides, fiches d'entraide et contenu par jeu. Structure extensible pour ajouter de futurs jeux.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {SUB_TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${subTab === t.id ? "text-white" : "text-white/40 bg-white/5"}`}
              style={subTab === t.id ? {
                background: `${t.color}20`,
                border: `1px solid ${t.color}80`,
              } : { border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: subTab === t.id ? t.color : undefined }} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {subTab === "guides" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(15,10,25,0.6)" }}>
              <h4 className="text-sm font-black text-white uppercase tracking-tight mb-4">Ajouter un élément</h4>
              <AddWikiItemForm onSaved={() => setSubTab("guides")} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight mb-3">Éléments existants</h4>
              <WikiItemList />
            </div>
          </div>
        )}
        {subTab === "categories" && <CategoryManager />}
        {subTab === "blocks" && <BlockManager />}
        {subTab === "popups" && <FarmingSimPopupManager />}
        {subTab === "reorder" && <ReorderManager />}
      </div>
    </div>
  );
}