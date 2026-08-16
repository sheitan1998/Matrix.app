import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, LayoutGrid, FolderTree } from "lucide-react";
import { base44 } from "@/api/base44Client";
import WikiItemList from "@/components/admin/WikiItemList";
import CategoryManager from "@/components/admin/CategoryManager";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState("items");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setAuthChecked(true);
    }).catch(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0518" }}>
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0d0518" }}>
        <p className="text-sm text-white/40">Accès réservé aux administrateurs.</p>
        <Link to="/" className="text-xs font-bold text-white/60 hover:text-white">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0d0518" }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition mb-2 tap-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold">Retour à l'admin</span>
            </Link>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">
              Dashboard Wiki — Farming Simulator 25
            </h1>
          </div>
          <Link
            to="/admin/add-item"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm"
            style={{ background: "linear-gradient(135deg, #7DA627, #5e8a1c)" }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter un élément</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/10">
          <button
            onClick={() => setTab("items")}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 -mb-px tap-sm ${
              tab === "items" ? "text-white border-[#7DA627]" : "text-white/40 border-transparent hover:text-white/60"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Éléments Wiki
          </button>
          <button
            onClick={() => setTab("categories")}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 -mb-px tap-sm ${
              tab === "categories" ? "text-white border-[#7DA627]" : "text-white/40 border-transparent hover:text-white/60"
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Catégories
          </button>
        </div>

        {/* Content */}
        {tab === "items" ? <WikiItemList /> : <CategoryManager />}
      </div>
    </div>
  );
}