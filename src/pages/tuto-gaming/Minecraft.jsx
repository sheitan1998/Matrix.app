import React, { useState } from "react";
import { Blocks, BookOpen, Gamepad2, LibraryBig } from "lucide-react";
import { Link } from "react-router-dom";
import ModrinthCatalogue from "@/components/minecraft/ModrinthCatalogue";
import MinecraftEncyclopedia from "@/components/minecraft/MinecraftEncyclopedia";

const TABS = [
  { id: "catalogue", label: "Catalogue Mods, Modpacks & Shaders", icon: Blocks },
  { id: "encyclopedia", label: "Encyclopédie & Guide de Craft", icon: LibraryBig },
];

export default function Minecraft() {
  const [activeTab, setActiveTab] = useState("catalogue");

  return (
    <main className="relative min-h-[calc(100vh-68px)] overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 12% 5%, rgba(52,211,153,0.14), transparent 28%),
            radial-gradient(circle at 88% 22%, rgba(34,197,94,0.1), transparent 24%),
            linear-gradient(rgba(52,211,153,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "auto, auto, 32px 32px, 32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-8 overflow-hidden rounded-3xl border border-emerald-300/20 bg-[#07130d]/70 p-5 shadow-2xl shadow-emerald-950/25 backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-emerald-300/25 bg-emerald-300/10 shadow-lg shadow-emerald-950/40">
                <Blocks className="h-7 w-7 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300/70">Univers MATRIX</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">Hub Minecraft</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                  Explorez les créations Modrinth en temps réel et consultez les données de craft de Minecraft Java.
                </p>
              </div>
            </div>

            <Link
              to="/tuto-gaming"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-purple-300/30 bg-purple-400/10 px-5 py-3 text-sm font-black text-purple-100 transition hover:border-purple-300/60 hover:bg-purple-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
            >
              <Gamepad2 className="h-5 w-5" />
              Guides & Tutos Gaming
            </Link>
          </div>

          <nav className="mt-7 grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-black/25 p-2 sm:grid-cols-2" aria-label="Sections Minecraft">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={activeTab === id ? "page" : undefined}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                  activeTab === id
                    ? "bg-emerald-300 text-emerald-950 shadow-lg shadow-emerald-950/30"
                    : "text-white/50 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </header>

        <div className="rounded-3xl border border-white/10 bg-[#07100c]/55 p-4 backdrop-blur-xl sm:p-6 lg:p-8">
          {activeTab === "catalogue" ? <ModrinthCatalogue /> : <MinecraftEncyclopedia />}
        </div>

        <footer className="mt-5 flex items-start gap-2 text-xs leading-5 text-white/30">
          <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Les noms officiels des contenus Minecraft restent ceux fournis par la source open source. Les champs non publiés par la source sont indiqués comme non disponibles.
        </footer>
      </div>
    </main>
  );
}

