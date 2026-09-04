import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Film, Play, Clock, ArrowLeft, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useProgression } from "@/context/ProgressionContext";
import SpaceBackground from "@/components/SpaceBackground";
import TrixWalletBar from "@/components/TrixWalletBar";
import ProjectEditor from "@/components/video/ProjectEditor";

export default function VideoStudio() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { trackActivity } = useProgression();
  const [user, setUser] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["video-projects"],
    queryFn: () => base44.entities.VideoProject.filter({}, "-updated_date", 50),
  });

  const myProjects = projects.filter(p => p.owner_email === user?.email);

  const createProject = async (name, resolution) => {
    const proj = await base44.entities.VideoProject.create({
      name, resolution,
      owner_email: user.email,
      owner_name: user.full_name,
      timeline_data: { clips: [], textOverlays: [], audioTracks: [], duration: 0 },
      status: "draft",
    });
    qc.invalidateQueries({ queryKey: ["video-projects"] });
    setShowCreate(false);
    setEditingProject(proj);
    trackActivity("video_projects");
    toast.success("Projet créé !");
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Supprimer ce projet ?")) return;
    await base44.entities.VideoProject.delete(id);
    qc.invalidateQueries({ queryKey: ["video-projects"] });
    toast.success("Projet supprimé");
  };

  // If editing, show editor
  if (editingProject) {
    return (
      <ProjectEditor
        project={editingProject}
        user={user}
        onClose={() => { setEditingProject(null); qc.invalidateQueries({ queryKey: ["video-projects"] }); }}
        onUpdate={(updated) => setEditingProject(updated)}
      />
    );
  }

  return (
    <SpaceBackground overlay={0.6}>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 backdrop-blur-xl" style={{ background: "rgba(10,10,12,0.85)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition"><ArrowLeft className="w-5 h-5 text-white" /></button>
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-purple-400" />
            <span className="font-black text-white">Video Studio</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <TrixWalletBar />
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
              <Plus className="w-4 h-4" /> Nouveau projet
            </button>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-8">
          {/* Hero */}
          <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(10,10,12,0.6))", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <Film className="w-8 h-8" style={{ color: "#a855f7" }} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Video Studio</h1>
                <p className="text-sm text-purple-300 mt-1">Crée. Monte. Exporte.</p>
                <p className="text-xs text-white/50 mt-2 max-w-md">Studio de montage intégré. Timeline, import média, texte, audio. Sauvegarde automatique.</p>
              </div>
            </div>
          </div>

          {/* Projects */}
          <section>
            <h3 className="text-lg font-black text-white mb-4">Mes projets</h3>
            {isLoading ? (
              <p className="text-sm text-white/40">Chargement...</p>
            ) : myProjects.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(18,18,20,0.6)", border: "1px dashed rgba(139,92,246,0.3)" }}>
                <Film className="w-10 h-10 text-purple-400/50 mx-auto mb-3" />
                <p className="text-sm text-white/50 mb-4">Aucun projet. Crée ton premier projet vidéo !</p>
                <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                  <Plus className="w-4 h-4" /> Nouveau projet
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {myProjects.map((p) => (
                  <div key={p.id} className="rounded-2xl overflow-hidden cursor-pointer group" style={{ background: "rgba(18,18,20,0.6)", border: "1px solid rgba(255,255,255,0.06)" }} onClick={() => setEditingProject(p)}>
                    <div className="relative aspect-video">
                      {p.thumbnail_url ? <img src={p.thumbnail_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(10,10,12,0.4))" }}><Film className="w-8 h-8 text-purple-400/40" /></div>}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" style={{ background: "rgba(0,0,0,0.5)" }}><Play className="w-7 h-7 text-white fill-white" /></div>
                      <span className="absolute top-2 left-2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded" style={{ background: "rgba(139,92,246,0.8)" }}>{p.resolution}</span>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white truncate">{p.name}</p>
                        <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3 h-3" /></button>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{p.duration || "0:00"} · {p.status === "draft" ? "Brouillon" : p.status === "editing" ? "En cours" : "Exporté"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {showCreate && (
          <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={createProject} />
        )}
      </div>
    </SpaceBackground>
  );
}

function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [res, setRes] = useState("1080p");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl p-6 space-y-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-black text-lg text-white">Nouveau projet</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du projet" autoFocus
          className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-white placeholder:text-muted-foreground outline-none text-sm" />
        <div className="flex gap-2">
          {["720p", "1080p", "4K"].map(r => (
            <button key={r} onClick={() => setRes(r)} className={`flex-1 h-9 rounded-xl text-xs font-bold transition ${res === r ? "bg-purple-600 text-white" : "bg-secondary text-white/50"}`}>{r}</button>
          ))}
        </div>
        <button onClick={() => onCreate(name.trim(), res)} disabled={!name.trim()}
          className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
          Créer le projet
        </button>
      </div>
    </div>
  );
}