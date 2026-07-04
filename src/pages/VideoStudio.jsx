import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Film, Upload, Play, Clock, ArrowLeft, Trash2, X, Type, Music, Save, Layers, Video, Volume2, Undo2, Redo2 } from "lucide-react";
import { toast } from "sonner";
import SpaceBackground from "@/components/SpaceBackground";

export default function VideoStudio() {
  const nav = useNavigate();
  const qc = useQueryClient();
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
          <button onClick={() => setShowCreate(true)} className="ml-auto flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
            <Plus className="w-4 h-4" /> Nouveau projet
          </button>
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

function ProjectEditor({ project, user, onClose, onUpdate }) {
  const nav = useNavigate();
  const [timeline, setTimeline] = useState(project.timeline_data || { clips: [], textOverlays: [], audioTracks: [], duration: 0 });
  const [activeTab, setActiveTab] = useState("media");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("video");
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [selectedClip, setSelectedClip] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const autoSaveRef = useRef(null);
  const videoRef = useRef(null);

  // Auto-save
  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => saveProject(true), 3000);
    return () => clearTimeout(autoSaveRef.current);
  }, [timeline]);

  const pushHistory = (newTimeline) => {
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(JSON.parse(JSON.stringify(newTimeline)));
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIdx > 0) { setHistoryIdx(historyIdx - 1); setTimeline(history[historyIdx - 1]); }
  };
  const redo = () => {
    if (historyIdx < history.length - 1) { setHistoryIdx(historyIdx + 1); setTimeline(history[historyIdx + 1]); }
  };

  const saveProject = async (auto = false) => {
    setSaving(true);
    try {
      const duration = calcDuration(timeline);
      const updated = await base44.entities.VideoProject.update(project.id, {
        timeline_data: timeline,
        duration: formatDuration(duration),
        status: "editing",
      });
      onUpdate({ ...project, timeline_data: timeline, duration: formatDuration(duration), status: "editing" });
      if (!auto) toast.success("Projet sauvegardé");
    } catch (e) { if (!auto) toast.error("Erreur de sauvegarde"); }
    setSaving(false);
  };

  const addMedia = () => {
    if (!mediaUrl.trim()) return;
    const clip = { id: Date.now().toString(), type: mediaType, url: mediaUrl.trim(), start: 0, trimStart: 0, trimEnd: 0, duration: 5 };
    const newTimeline = { ...timeline, clips: [...(timeline.clips || []), clip] };
    setTimeline(newTimeline);
    pushHistory(newTimeline);
    setMediaUrl("");
    toast.success("Média ajouté");
  };

  const addText = () => {
    if (!textInput.trim()) return;
    const overlay = { id: Date.now().toString(), text: textInput.trim(), color: textColor, start: 0, duration: 3 };
    const newTimeline = { ...timeline, textOverlays: [...(timeline.textOverlays || []), overlay] };
    setTimeline(newTimeline);
    pushHistory(newTimeline);
    setTextInput("");
    toast.success("Texte ajouté");
  };

  const addAudio = () => {
    if (!mediaUrl.trim()) return;
    const track = { id: Date.now().toString(), url: mediaUrl.trim(), start: 0, volume: 1 };
    const newTimeline = { ...timeline, audioTracks: [...(timeline.audioTracks || []), track] };
    setTimeline(newTimeline);
    pushHistory(newTimeline);
    setMediaUrl("");
    toast.success("Audio ajouté");
  };

  const removeClip = (id) => {
    const newTimeline = { ...timeline, clips: timeline.clips.filter(c => c.id !== id) };
    setTimeline(newTimeline);
    pushHistory(newTimeline);
    setSelectedClip(null);
  };

  const moveClip = (id, dir) => {
    const clips = [...(timeline.clips || [])];
    const idx = clips.findIndex(c => c.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= clips.length) return;
    [clips[idx], clips[newIdx]] = [clips[newIdx], clips[idx]];
    const newTimeline = { ...timeline, clips };
    setTimeline(newTimeline);
    pushHistory(newTimeline);
  };

  const trimClip = (id, field, value) => {
    const clips = timeline.clips.map(c => c.id === id ? { ...c, [field]: Math.max(0, value) } : c);
    const newTimeline = { ...timeline, clips };
    setTimeline(newTimeline);
  };

  const removeText = (id) => {
    const newTimeline = { ...timeline, textOverlays: timeline.textOverlays.filter(t => t.id !== id) };
    setTimeline(newTimeline);
    pushHistory(newTimeline);
  };

  const removeAudio = (id) => {
    const newTimeline = { ...timeline, audioTracks: timeline.audioTracks.filter(a => a.id !== id) };
    setTimeline(newTimeline);
    pushHistory(newTimeline);
  };

  const calcDuration = (tl) => {
    const clipDur = (tl.clips || []).reduce((sum, c) => sum + (c.duration || 5), 0);
    return clipDur || 0;
  };

  function formatDuration(sec) {
    return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
  }

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setMediaUrl(file_url);
      toast.success("Fichier importé");
    } catch (e) { toast.error("Erreur d'import"); }
    setUploading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0c" }}>
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3" style={{ background: "rgba(10,10,12,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition"><ArrowLeft className="w-5 h-5 text-white" /></button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white truncate">{project.name}</p>
          <p className="text-[10px] text-white/40">{project.resolution} · {saving ? "Sauvegarde..." : "Sauvegardé"}</p>
        </div>
        <button onClick={undo} disabled={historyIdx <= 0} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 transition"><Undo2 className="w-4 h-4" /></button>
        <button onClick={redo} disabled={historyIdx >= history.length - 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 transition"><Redo2 className="w-4 h-4" /></button>
        <button onClick={() => saveProject(false)} disabled={saving} className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
          <Save className="w-4 h-4" /> Sauvegarder
        </button>
      </div>

      {/* Preview */}
      <div className="shrink-0 flex items-center justify-center p-4" style={{ background: "#000" }}>
        <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden" style={{ background: "#111" }}>
          {(timeline.clips || []).length > 0 ? (
            <video ref={videoRef} src={timeline.clips[0]?.url} className="w-full h-full object-contain" controls />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Film className="w-12 h-12 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/30">Aperçu — importe un média pour commencer</p>
              </div>
            </div>
          )}
          {/* Text overlays */}
          {(timeline.textOverlays || []).map((t) => (
            <div key={t.id} className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg" style={{ background: "rgba(0,0,0,0.6)", color: t.color }}>
              <p className="text-sm font-bold">{t.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tools panel */}
      <div className="shrink-0 flex gap-1 px-4 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { key: "media", label: "Média", icon: Video },
          { key: "text", label: "Texte", icon: Type },
          { key: "audio", label: "Audio", icon: Music },
        ].map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === t.key ? "bg-purple-600/20 text-purple-300" : "text-white/40 hover:text-white"}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tool content */}
      <div className="shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {activeTab === "media" && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              <button onClick={() => setMediaType("video")} className={`px-2 py-1 rounded text-[10px] font-bold ${mediaType === "video" ? "bg-purple-600 text-white" : "bg-secondary text-white/50"}`}>Vidéo</button>
              <button onClick={() => setMediaType("image")} className={`px-2 py-1 rounded text-[10px] font-bold ${mediaType === "image" ? "bg-purple-600 text-white" : "bg-secondary text-white/50"}`}>Image</button>
            </div>
            <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="URL du média ou importe un fichier" className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-secondary border border-border text-white placeholder:text-white/30 outline-none text-xs" />
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/70 hover:text-white cursor-pointer" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <Upload className="w-3.5 h-3.5" /> {uploading ? "..." : "Importer"}
              <input type="file" accept="video/*,image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
            </label>
            <button onClick={addMedia} disabled={!mediaUrl.trim()} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-40" style={{ background: "#8b5cf6" }}><Plus className="w-3.5 h-3.5" /></button>
          </div>
        )}
        {activeTab === "text" && (
          <div className="flex flex-wrap items-center gap-2">
            <input value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Texte à afficher" className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-secondary border border-border text-white placeholder:text-white/30 outline-none text-xs" />
            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-8 h-8 rounded-lg bg-transparent cursor-pointer" />
            <button onClick={addText} disabled={!textInput.trim()} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-40" style={{ background: "#8b5cf6" }}><Plus className="w-3.5 h-3.5" /></button>
          </div>
        )}
        {activeTab === "audio" && (
          <div className="flex flex-wrap items-center gap-2">
            <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="URL du fichier audio" className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-secondary border border-border text-white placeholder:text-white/30 outline-none text-xs" />
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/70 hover:text-white cursor-pointer" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <Upload className="w-3.5 h-3.5" /> {uploading ? "..." : "Importer"}
              <input type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
            </label>
            <button onClick={addAudio} disabled={!mediaUrl.trim()} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-40" style={{ background: "#8b5cf6" }}><Plus className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3 max-w-5xl mx-auto">
          {/* Clips track */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Clips vidéo/image</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 min-h-[64px]">
              {(timeline.clips || []).length === 0 ? (
                <div className="flex-1 rounded-xl flex items-center justify-center" style={{ border: "1px dashed rgba(255,255,255,0.08)", minHeight: 56 }}>
                  <p className="text-[10px] text-white/30">Ajoute des clips ici</p>
                </div>
              ) : (
                (timeline.clips || []).map((clip, idx) => (
                  <div key={clip.id} onClick={() => setSelectedClip(clip)} className={`relative rounded-xl overflow-hidden shrink-0 cursor-pointer transition ${selectedClip?.id === clip.id ? "ring-2 ring-purple-500" : ""}`}
                    style={{ width: 100, height: 56, border: "1px solid rgba(255,255,255,0.08)" }}>
                    {clip.type === "video" ? (
                      <video src={clip.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={clip.url} className="w-full h-full object-cover" alt="" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5" style={{ background: "rgba(0,0,0,0.7)" }}>
                      <p className="text-[8px] text-white truncate">{clip.type === "video" ? "🎬" : "🖼"} Clip {idx + 1}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedClip && (
              <div className="mt-2 p-3 rounded-xl flex flex-wrap items-center gap-3" style={{ background: "rgba(18,18,20,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <p className="text-[10px] font-bold text-white/60">Clip sélectionné</p>
                <button onClick={() => moveClip(selectedClip.id, -1)} className="w-7 h-7 rounded-lg bg-secondary text-white/60 hover:text-white flex items-center justify-center text-xs">←</button>
                <button onClick={() => moveClip(selectedClip.id, 1)} className="w-7 h-7 rounded-lg bg-secondary text-white/60 hover:text-white flex items-center justify-center text-xs">→</button>
                <label className="flex items-center gap-1 text-[10px] text-white/50">Durée: <input type="number" value={selectedClip.duration} onChange={e => { const v = parseInt(e.target.value) || 1; trimClip(selectedClip.id, "duration", v); setSelectedClip({ ...selectedClip, duration: v }); }} className="w-12 px-1 py-0.5 rounded bg-secondary text-white text-[10px]" />s</label>
                <button onClick={() => removeClip(selectedClip.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-500/10 transition"><Trash2 className="w-3 h-3" /> Supprimer</button>
              </div>
            )}
          </div>

          {/* Text overlays */}
          {(timeline.textOverlays || []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Textes</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(timeline.textOverlays || []).map((t) => (
                  <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(18,18,20,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="text-xs font-bold" style={{ color: t.color }}>T</span>
                    <p className="text-xs text-white truncate max-w-[150px]">{t.text}</p>
                    <button onClick={() => removeText(t.id)} className="text-white/30 hover:text-red-400"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio tracks */}
          {(timeline.audioTracks || []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-3.5 h-3.5 text-green-400" />
                <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Pistes audio</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(timeline.audioTracks || []).map((a) => (
                  <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(18,18,20,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Music className="w-3 h-3 text-green-400" />
                    <p className="text-xs text-white truncate max-w-[150px]">Audio</p>
                    <button onClick={() => removeAudio(a.id)} className="text-white/30 hover:text-red-400"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}