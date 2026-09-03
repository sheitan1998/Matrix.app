import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus, Film, Upload, ArrowLeft, X, Type, Music,
  Save, Undo2, Redo2,
  Scissors, Link2, Magnet, ZoomIn, Wand2, ArrowLeftRight, Star,
  Sparkles, ChevronDown,
} from "lucide-react";
import ClipProperties from "@/components/video/ClipProperties";
import VideoExporter from "@/components/video/VideoExporter";
import PreviewStage from "@/components/video/PreviewStage";
import TimelineClip from "@/components/video/TimelineClip";

const NAV_ITEMS = [
  { key: "media", label: "Media Library", icon: Film },
  { key: "text", label: "Textes & Titres", icon: Type },
  { key: "audio", label: "Audio & Music", icon: Music },
  { key: "transitions", label: "Transitions", icon: ArrowLeftRight },
  { key: "fx", label: "FX", icon: Wand2 },
  { key: "star", label: "Premium", icon: Star },
];

const TRACKS = [
  { key: "v1", label: "Video 1", color: "rgba(124,58,237,0.2)", border: "rgba(124,58,237,0.4)" },
  { key: "v2", label: "Video 2", color: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)" },
  { key: "a1", label: "Audio 1", color: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)" },
  { key: "a2", label: "Audio 2", color: "rgba(20,184,166,0.15)", border: "rgba(20,184,166,0.3)" },
];

export default function ProjectEditor({ project, user, onClose, onUpdate }) {
  const nav = useNavigate();
  const [timeline, setTimeline] = useState(
    project.timeline_data || { clips: [], textOverlays: [], audioTracks: [], duration: 0 }
  );
  const [navTab, setNavTab] = useState("media");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("video");
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [selectedClip, setSelectedClip] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [magnet, setMagnet] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [mixerVolumes, setMixerVolumes] = useState({ v1: 80, v2: 70, a1: 60, a2: 50 });
  const autoSaveRef = useRef(null);

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
      await base44.entities.VideoProject.update(project.id, {
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
    setTimeline(newTimeline); pushHistory(newTimeline); setMediaUrl("");
    toast.success("Média ajouté");
  };

  const addText = () => {
    if (!textInput.trim()) return;
    const overlay = { id: Date.now().toString(), text: textInput.trim(), color: textColor, start: 0, duration: 3 };
    const newTimeline = { ...timeline, textOverlays: [...(timeline.textOverlays || []), overlay] };
    setTimeline(newTimeline); pushHistory(newTimeline); setTextInput("");
    toast.success("Texte ajouté");
  };

  const addAudio = () => {
    if (!mediaUrl.trim()) return;
    const track = { id: Date.now().toString(), url: mediaUrl.trim(), start: 0, volume: 1 };
    const newTimeline = { ...timeline, audioTracks: [...(timeline.audioTracks || []), track] };
    setTimeline(newTimeline); pushHistory(newTimeline); setMediaUrl("");
    toast.success("Audio ajouté");
  };

  const removeClip = (id) => {
    const newTimeline = { ...timeline, clips: timeline.clips.filter(c => c.id !== id) };
    setTimeline(newTimeline); pushHistory(newTimeline); setSelectedClip(null);
  };

  const moveClip = (id, dir) => {
    const clips = [...(timeline.clips || [])];
    const idx = clips.findIndex(c => c.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= clips.length) return;
    [clips[idx], clips[newIdx]] = [clips[newIdx], clips[idx]];
    const newTimeline = { ...timeline, clips };
    setTimeline(newTimeline); pushHistory(newTimeline);
  };

  const updateClip = (id, updates) => {
    const clips = timeline.clips.map(c => c.id === id ? { ...c, ...updates } : c);
    const newTimeline = { ...timeline, clips };
    setTimeline(newTimeline);
    setSelectedClip(prev => prev ? { ...prev, ...updates } : prev);
    pushHistory(newTimeline);
  };

  const updateTextOverlay = (id, updates) => {
    const textOverlays = (timeline.textOverlays || []).map(t => t.id === id ? { ...t, ...updates } : t);
    const newTimeline = { ...timeline, textOverlays };
    setTimeline(newTimeline);
    pushHistory(newTimeline);
  };

  const handleSeek = useCallback((t) => setPlayhead(t), []);

  const splitClip = (id) => {
    const clip = timeline.clips.find(c => c.id === id);
    if (!clip) return;
    const halfDur = (clip.duration || 5) / 2;
    const first = { ...clip, id: `${clip.id}_a`, duration: halfDur };
    const second = { ...clip, id: `${clip.id}_b`, duration: halfDur };
    const idx = timeline.clips.findIndex(c => c.id === id);
    const clips = [...timeline.clips];
    clips.splice(idx, 1, first, second);
    const newTimeline = { ...timeline, clips };
    setTimeline(newTimeline); pushHistory(newTimeline); setSelectedClip(first);
    toast.success("Clip coupé en deux");
  };

  const mergeClip = (id) => {
    const idx = timeline.clips.findIndex(c => c.id === id);
    if (idx < 0 || idx >= timeline.clips.length - 1) return;
    const current = timeline.clips[idx];
    const next = timeline.clips[idx + 1];
    const merged = { ...current, id: `${current.id}_m`, duration: (current.duration || 5) + (next.duration || 5) };
    const clips = [...timeline.clips];
    clips.splice(idx, 2, merged);
    const newTimeline = { ...timeline, clips };
    setTimeline(newTimeline); pushHistory(newTimeline); setSelectedClip(merged);
    toast.success("Clips fusionnés");
  };

  const removeText = (id) => {
    const newTimeline = { ...timeline, textOverlays: timeline.textOverlays.filter(t => t.id !== id) };
    setTimeline(newTimeline); pushHistory(newTimeline);
  };

  const removeAudio = (id) => {
    const newTimeline = { ...timeline, audioTracks: timeline.audioTracks.filter(a => a.id !== id) };
    setTimeline(newTimeline); pushHistory(newTimeline);
  };

  const calcDuration = (tl) => (tl.clips || []).reduce((sum, c) => sum + (c.duration || 5), 0) || 0;
  function formatDuration(sec) { return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`; }

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      // Auto-add to timeline based on current nav tab
      const isAudio = file.type?.startsWith("audio") || navTab === "audio";
      const isImage = file.type?.startsWith("image");
      const clipType = isAudio ? "audio" : isImage ? "image" : "video";
      if (isAudio) {
        const track = { id: Date.now().toString(), url: file_url, start: 0, volume: 1 };
        const newTimeline = { ...timeline, audioTracks: [...(timeline.audioTracks || []), track] };
        setTimeline(newTimeline); pushHistory(newTimeline);
      } else {
        const clip = { id: Date.now().toString(), type: clipType, url: file_url, start: 0, trimStart: 0, trimEnd: 0, duration: 5, name: file.name };
        const newTimeline = { ...timeline, clips: [...(timeline.clips || []), clip] };
        setTimeline(newTimeline); pushHistory(newTimeline);
      }
      toast.success("Fichier ajouté à la timeline");
    } catch (e) { toast.error("Erreur d'import"); }
    setUploading(false);
  };

  const setEffect = (key, value) => {
    if (!selectedClip) return;
    const currentEffects = selectedClip.effects || {};
    updateClip(selectedClip.id, { effects: { ...currentEffects, [key]: value } });
  };

  const totalMedia = (timeline.clips || []).length + (timeline.textOverlays || []).length + (timeline.audioTracks || []).length;
  const audioTracks = timeline.audioTracks || [];
  const sfxTracks = audioTracks.slice(0, Math.ceil(audioTracks.length / 2));
  const bgmTracks = audioTracks.slice(Math.ceil(audioTracks.length / 2));
  const totalDuration = calcDuration(timeline) || 30;

  const togglePlay = () => setIsPlaying(p => !p);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0a0a0c" }}>
      {/* ===== Header ===== */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-2.5" style={{ background: "#121214", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition tap-sm">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white truncate">{project.name}</p>
          <p className="text-[10px] text-white/40">{project.resolution} - {saving ? "Sauvegarde..." : "Sauvegardé"}</p>
        </div>
        <button onClick={undo} disabled={historyIdx <= 0} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 transition tap-sm"><Undo2 className="w-4 h-4" /></button>
        <button onClick={redo} disabled={historyIdx >= history.length - 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 transition tap-sm"><Redo2 className="w-4 h-4" /></button>
        <button onClick={() => saveProject(false)} disabled={saving} className="flex items-center gap-2 h-8 px-4 rounded-lg text-xs font-bold text-white transition disabled:opacity-50" style={{ background: "#7c3aed" }}>
          <Save className="w-3.5 h-3.5" /> {saving ? "..." : "Sauvegarder"}
        </button>
        <VideoExporter timeline={timeline} projectName={project.name} resolution={project.resolution} />
        <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ border: "1.5px solid rgba(168,85,247,0.4)" }}>
          {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="text-xs font-bold text-white">{(user?.full_name || user?.email || "U")[0]?.toUpperCase()}</span>}
        </div>
      </header>

      {/* ===== Main 3-column layout ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* --- Left sidebar --- */}
        <div className="flex shrink-0" style={{ background: "#121214" }}>
          {/* Nav icons strip */}
          <div className="w-12 flex flex-col items-center gap-1 py-3" style={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}>
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => setNavTab(item.key)} title={item.label}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition tap-sm"
                style={navTab === item.key ? { background: "rgba(124,58,237,0.2)", color: "#a855f7" } : { color: "rgba(255,255,255,0.3)" }}>
                <item.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          {/* Panel content */}
          <div className="w-56 flex flex-col" style={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="px-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">{NAV_ITEMS.find(n => n.key === navTab)?.label}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
              {/* Media Library */}
              {navTab === "media" && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <button onClick={() => setMediaType("video")} className={`flex-1 px-2 py-1 rounded text-[10px] font-bold ${mediaType === "video" ? "bg-purple-600 text-white" : "bg-white/5 text-white/50"}`}>Vidéo</button>
                    <button onClick={() => setMediaType("image")} className={`flex-1 px-2 py-1 rounded text-[10px] font-bold ${mediaType === "image" ? "bg-purple-600 text-white" : "bg-white/5 text-white/50"}`}>Image</button>
                  </div>
                  <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="URL du média" className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/5 text-white placeholder:text-white/30 outline-none text-[11px]" />
                  <label className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold text-white/70 hover:text-white cursor-pointer" style={{ border: "1px dashed rgba(124,58,237,0.3)" }}>
                    <Upload className="w-3.5 h-3.5" /> {uploading ? "Import..." : "Importer un fichier"}
                    <input type="file" accept="video/*,image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
                  </label>
                  <button onClick={addMedia} disabled={!mediaUrl.trim()} className="w-full py-1.5 rounded-lg text-[11px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-1.5" style={{ background: "#7c3aed" }}>
                    <Plus className="w-3.5 h-3.5" /> Ajouter au montage
                  </button>
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {(timeline.clips || []).map((clip, idx) => (
                      <div key={clip.id} onClick={() => setSelectedClip(clip)} className={`relative rounded-lg overflow-hidden cursor-pointer aspect-video ${selectedClip?.id === clip.id ? "ring-2 ring-purple-500" : ""}`} style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                        {clip.type === "video" ? <video src={clip.url} className="w-full h-full object-cover" muted /> : <img src={clip.url} className="w-full h-full object-cover" alt="" />}
                        <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5" style={{ background: "rgba(0,0,0,0.7)" }}>
                          <p className="text-[8px] text-white truncate">{clip.type === "video" ? "🎬" : "🖼"} {idx + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Texts & Titles */}
              {navTab === "text" && (
                <div className="space-y-2">
                  <input value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Texte à afficher" className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/5 text-white placeholder:text-white/30 outline-none text-[11px]" />
                  <div className="flex items-center gap-2">
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-8 h-8 rounded-lg bg-transparent cursor-pointer" />
                    <span className="text-[10px] text-white/40">Couleur du texte</span>
                  </div>
                  <button onClick={addText} disabled={!textInput.trim()} className="w-full py-1.5 rounded-lg text-[11px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-1.5" style={{ background: "#7c3aed" }}>
                    <Plus className="w-3.5 h-3.5" /> Ajouter le texte
                  </button>
                  <div className="space-y-1.5 mt-2">
                    {(timeline.textOverlays || []).map(t => (
                      <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="text-[10px] font-bold" style={{ color: t.color }}>T</span>
                        <p className="text-[10px] text-white truncate flex-1">{t.text}</p>
                        <button onClick={() => removeText(t.id)} className="text-white/30 hover:text-red-400"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Audio & Music */}
              {navTab === "audio" && (
                <div className="space-y-2">
                  <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="URL du fichier audio" className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/5 text-white placeholder:text-white/30 outline-none text-[11px]" />
                  <label className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold text-white/70 hover:text-white cursor-pointer" style={{ border: "1px dashed rgba(124,58,237,0.3)" }}>
                    <Upload className="w-3.5 h-3.5" /> {uploading ? "Import..." : "Importer"}
                    <input type="file" accept="audio/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
                  </label>
                  <button onClick={addAudio} disabled={!mediaUrl.trim()} className="w-full py-1.5 rounded-lg text-[11px] font-bold text-white disabled:opacity-40 flex items-center justify-center gap-1.5" style={{ background: "#7c3aed" }}>
                    <Plus className="w-3.5 h-3.5" /> Ajouter l'audio
                  </button>
                  <div className="rounded-lg p-2 mt-2" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-[9px] font-bold text-white/40 mb-1.5">FORME D'ONDE</p>
                    <div className="flex items-end gap-0.5 h-8">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className="flex-1 rounded-sm" style={{ background: "rgba(124,58,237,0.4)", height: `${20 + Math.abs(Math.sin(i * 0.5)) * 50 + (i % 3) * 15}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {(timeline.audioTracks || []).map(a => (
                      <div key={a.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <Music className="w-3 h-3 text-green-400" />
                        <p className="text-[10px] text-white truncate flex-1">Audio</p>
                        <button onClick={() => removeAudio(a.id)} className="text-white/30 hover:text-red-400"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Transitions */}
              {navTab === "transitions" && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Fondu", value: "fade" },
                    { label: "Glisser", value: "slide" },
                    { label: "Zoom", value: "zoom" },
                    { label: "Rotation", value: "rotate" },
                    { label: "Volet", value: "wipe" },
                    { label: "Flash", value: "flash" },
                  ].map(t => (
                    <button key={t.value} onClick={() => { if (!selectedClip) { toast.error("Sélectionne un clip d'abord"); return; } updateClip(selectedClip.id, { transition: t.value }); toast.success(`Transition "${t.label}" appliquée`); }}
                      className={`aspect-video rounded-lg flex items-center justify-center text-[10px] font-bold transition ${selectedClip?.transition === t.value ? "text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                      style={{ background: selectedClip?.transition === t.value ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedClip?.transition === t.value ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.05)"}` }}>{t.label}</button>
                  ))}
                </div>
              )}
              {/* FX */}
              {navTab === "fx" && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Néon", fx: { brightness: 120, contrast: 140, saturation: 200 } },
                    { label: "Glitch", fx: { brightness: 90, contrast: 130, saturation: 150 } },
                    { label: "VHS", fx: { brightness: 110, contrast: 80, saturation: 60, blur: 1 } },
                    { label: "Flou", fx: { blur: 5 } },
                    { label: "Glow", fx: { brightness: 130, contrast: 110, saturation: 130 } },
                    { label: "Chrome", fx: { brightness: 100, contrast: 150, saturation: 0 } },
                    { label: "Rétro", fx: { brightness: 95, contrast: 120, saturation: 80 } },
                    { label: "HDR", fx: { brightness: 110, contrast: 160, saturation: 140 } },
                  ].map(t => (
                    <button key={t.label} onClick={() => { if (!selectedClip) { toast.error("Sélectionne un clip d'abord"); return; } updateClip(selectedClip.id, { effects: { ...selectedClip.effects, ...t.fx } }); toast.success(`Effet "${t.label}" appliqué`); }}
                      className="aspect-video rounded-lg flex items-center justify-center text-[10px] font-bold text-white/50 hover:text-white hover:bg-white/5 transition" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <Sparkles className="w-3 h-3 mr-1" /> {t.label}
                    </button>
                  ))}
                </div>
              )}
              {/* Premium */}
              {navTab === "star" && (
                <div className="text-center py-8">
                  <Star className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(251,191,36,0.4)" }} />
                  <p className="text-[11px] text-white/40">Templates Premium bientôt disponibles</p>
                </div>
              )}
            </div>
            {/* Info box */}
            <div className="p-3 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="text-[10px] text-white/40">Projet Actuel : <span className="text-white/70 font-bold">{project.name}</span></p>
              <p className="text-[10px] text-white/40">Dernière mod. : <span className="text-white/70">Il y a 1 min</span></p>
              <p className="text-[10px] text-white/40">Total Média : <span className="text-white/70 font-bold">{totalMedia}</span></p>
            </div>
          </div>
        </div>

        {/* --- Center: Preview + Timeline --- */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Preview stage with multi-clip playback, text overlays, transitions */}
          <PreviewStage
            clips={timeline.clips || []}
            textOverlays={timeline.textOverlays || []}
            duration={calcDuration(timeline)}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onSeek={handleSeek}
            playhead={playhead}
            onUpdateText={updateTextOverlay}
          />

          {/* Timeline */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#121214", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-3 py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <button onClick={() => selectedClip && splitClip(selectedClip.id)} disabled={!selectedClip} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition disabled:opacity-30 tap-sm" title="Couper"><Scissors className="w-3.5 h-3.5" /></button>
              <button onClick={() => selectedClip && mergeClip(selectedClip.id)} disabled={!selectedClip} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition disabled:opacity-30 tap-sm" title="Fusionner"><Link2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => setMagnet(!magnet)} className="w-7 h-7 rounded-lg flex items-center justify-center transition tap-sm" style={magnet ? { background: "rgba(124,58,237,0.2)", color: "#a855f7" } : { color: "rgba(255,255,255,0.5)" }} title="Magnet"><Magnet className="w-3.5 h-3.5" /></button>
              <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.06)" }} />
              <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition tap-sm" title="Zoom out"><ZoomIn className="w-3.5 h-3.5" /></button>
              <span className="text-[10px] text-white/30 font-mono">{zoom.toFixed(2)}x</span>
              <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition tap-sm" title="Zoom in"><Plus className="w-3.5 h-3.5" /></button>
              <div className="flex-1" />
              <span className="text-[10px] text-white/30 font-mono">{formatDuration(calcDuration(timeline))}</span>
            </div>

            {/* Time ruler */}
            <div className="flex items-center px-1 py-0.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div className="w-16 shrink-0" />
              <div className="flex-1 relative h-5">
                {Array.from({ length: Math.max(4, Math.ceil(totalDuration / 5)) }).map((_, i) => (
                  <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${(i / Math.ceil(totalDuration / 5)) * 100}%` }}>
                    <div className="w-px h-2" style={{ background: "rgba(255,255,255,0.1)" }} />
                    <span className="text-[8px] text-white/30 font-mono">00:{String(i * 5).padStart(2, "0")}</span>
                  </div>
                ))}
                {/* Playhead line */}
                <div className="absolute top-0 bottom-0 w-px pointer-events-none" style={{ left: `${(playhead / totalDuration) * 100}%`, background: "#ec4899", zIndex: 5 }} />
              </div>
            </div>

            {/* Tracks */}
            <div className="flex-1 overflow-y-auto scrollbar-thin relative">
              {/* Playhead overlay spanning all tracks */}
              <div className="absolute top-0 bottom-0 w-0.5 pointer-events-none z-10" style={{ left: `calc(64px + (100% - 64px) * ${playhead / totalDuration})`, background: "#ec4899" }} />

              {/* Video 1 — clips (draggable) */}
              <TrackRow label="Video 1">
                {(timeline.clips || []).length === 0 ? (
                  <EmptyTrack label="Ajoute des clips" />
                ) : (
                  <DragDropContext onDragEnd={(result) => {
                    if (!result.destination || result.destination.index === result.source.index) return;
                    const clips = [...(timeline.clips || [])];
                    const [moved] = clips.splice(result.source.index, 1);
                    clips.splice(result.destination.index, 0, moved);
                    const newTimeline = { ...timeline, clips };
                    setTimeline(newTimeline); pushHistory(newTimeline);
                  }}>
                    <Droppable droppableId="clips" direction="horizontal">
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="flex items-center gap-1">
                          {(timeline.clips || []).map((clip, idx) => {
                            // Compute cumulative start offset for this clip
                            let offset = 0;
                            for (let i = 0; i < idx; i++) offset += timeline.clips[i].duration || 5;
                            return (
                              <Draggable key={clip.id} draggableId={clip.id} index={idx}>
                                {(dragProvided) => (
                                  <TimelineClip
                                    clip={clip}
                                    index={idx}
                                    zoom={zoom}
                                    isSelected={selectedClip?.id === clip.id}
                                    offsetSec={offset}
                                    onSelect={setSelectedClip}
                                    onRemove={removeClip}
                                    onResize={updateClip}
                                    provided={dragProvided}
                                  />
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </TrackRow>

              {/* Video 2 — text overlays */}
              <TrackRow label="Video 2">
                {(timeline.textOverlays || []).length === 0 ? (
                  <EmptyTrack label="Textes" />
                ) : (timeline.textOverlays || []).map(t => (
                  <div key={t.id} className="rounded-lg flex items-center px-2 h-10 shrink-0" style={{ width: 100 * zoom, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
                    <Type className="w-3 h-3 text-blue-300 mr-1.5 shrink-0" />
                    <span className="text-[10px] text-white truncate">{t.text}</span>
                    <button onClick={() => removeText(t.id)} className="ml-auto text-white/30 hover:text-red-400 shrink-0"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
              </TrackRow>

              {/* Audio 1 — SFX */}
              <TrackRow label="Audio 1">
                {sfxTracks.length === 0 ? (
                  <EmptyTrack label="SFX" />
                ) : sfxTracks.map(a => (
                  <div key={a.id} className="rounded-lg flex items-center px-2 h-10 shrink-0" style={{ width: 180 * zoom, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
                    <div className="flex items-end gap-0.5 h-5 flex-1">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div key={i} className="flex-1 rounded-sm" style={{ background: "rgba(34,197,94,0.5)", height: `${25 + Math.abs(Math.sin(i * 0.8)) * 50 + (i % 4) * 12}%` }} />
                      ))}
                    </div>
                    <button onClick={() => removeAudio(a.id)} className="ml-2 text-white/30 hover:text-red-400 shrink-0"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
              </TrackRow>

              {/* Audio 2 — BGM */}
              <TrackRow label="Audio 2">
                {bgmTracks.length === 0 ? (
                  <EmptyTrack label="BGM" />
                ) : bgmTracks.map(a => (
                  <div key={a.id} className="rounded-lg flex items-center px-2 h-10 shrink-0" style={{ width: 180 * zoom, background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.3)" }}>
                    <div className="flex items-end gap-0.5 h-5 flex-1">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div key={i} className="flex-1 rounded-sm" style={{ background: "rgba(20,184,166,0.5)", height: `${25 + Math.abs(Math.sin(i * 0.6)) * 50 + (i % 3) * 12}%` }} />
                      ))}
                    </div>
                    <button onClick={() => removeAudio(a.id)} className="ml-2 text-white/30 hover:text-red-400 shrink-0"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
              </TrackRow>
            </div>

            {/* Selected clip properties */}
            {selectedClip && (
              <div className="shrink-0 px-3 py-2" style={{ background: "rgba(18,18,20,0.9)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <ClipProperties
                  clip={selectedClip}
                  onUpdate={updates => updateClip(selectedClip.id, updates)}
                  onSplit={() => splitClip(selectedClip.id)}
                  onMerge={() => mergeClip(selectedClip.id)}
                  onMoveLeft={() => moveClip(selectedClip.id, -1)}
                  onMoveRight={() => moveClip(selectedClip.id, 1)}
                  onDelete={() => removeClip(selectedClip.id)}
                  onClose={() => setSelectedClip(null)}
                  hasNext={timeline.clips.findIndex(c => c.id === selectedClip.id) < timeline.clips.length - 1}
                  hasPrev={timeline.clips.findIndex(c => c.id === selectedClip.id) > 0}
                />
              </div>
            )}
          </div>
        </div>

        {/* --- Right panel: Effects + Mixer --- */}
        <div className="w-64 shrink-0 flex flex-col overflow-y-auto scrollbar-thin" style={{ background: "#121214", borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
          {/* Effects */}
          <div className="p-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <button onClick={() => {}} className="flex items-center justify-between w-full mb-3">
              <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Brightness & Contrast</p>
              <ChevronDown className="w-3.5 h-3.5 text-white/30" />
            </button>
            {!selectedClip ? (
              <p className="text-[10px] text-white/30 italic py-3">Sélectionne un clip pour modifier les effets</p>
            ) : (
              <div className="space-y-3">
                <EffectSlider label="Luminosité" value={selectedClip.effects?.brightness ?? 100} min={0} max={200} onChange={v => setEffect("brightness", v)} />
                <EffectSlider label="Contraste" value={selectedClip.effects?.contrast ?? 100} min={0} max={200} onChange={v => setEffect("contrast", v)} />
                <EffectSlider label="Flou" value={selectedClip.effects?.blur ?? 0} min={0} max={20} onChange={v => setEffect("blur", v)} />
              </div>
            )}

            {/* Keyframes graph */}
            <div className="mt-4">
              <p className="text-[10px] font-bold text-white/40 mb-1.5">IMAGES-CLÉS</p>
              <div className="relative rounded-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", height: 90 }}>
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="kfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(124,58,237,0.3)" />
                      <stop offset="100%" stopColor="rgba(124,58,237,0)" />
                    </linearGradient>
                  </defs>
                  <path d="M 5 90 L 95 10" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
                  <path d="M 5 90 L 95 10 L 95 95 L 5 95 Z" fill="url(#kfGrad)" />
                  <circle cx="5" cy="90" r="3" fill="#a855f7" />
                  <circle cx="95" cy="10" r="3" fill="#a855f7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Audio Mixer */}
          <div className="p-3 flex-1">
            <p className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-3">Audio Mixer</p>
            <div className="flex items-end justify-around gap-2" style={{ height: 180 }}>
              {[
                { key: "v1", label: "V1" }, { key: "v2", label: "V2" },
                { key: "a1", label: "A1" }, { key: "a2", label: "A2" },
              ].map(ch => (
                <div key={ch.key} className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-bold text-white/40">{ch.label}</span>
                  <div className="relative w-7 rounded-lg" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", height: 120 }}>
                    <div className="absolute bottom-0 left-0 right-0 rounded-b-lg" style={{ height: `${mixerVolumes[ch.key]}%`, background: "linear-gradient(to top, rgba(124,58,237,0.3), rgba(124,58,237,0.05))" }} />
                    <div className="absolute left-1/2 -translate-x-1/2 w-5 h-2 rounded" style={{ bottom: `calc(${mixerVolumes[ch.key]}% - 4px)`, background: "#7c3aed", boxShadow: "0 0 6px rgba(124,58,237,0.6)" }} />
                    <input type="range" min={0} max={100} value={mixerVolumes[ch.key]}
                      onChange={e => setMixerVolumes(prev => ({ ...prev, [ch.key]: parseInt(e.target.value) }))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ writingMode: "vertical-lr", direction: "rtl" }} />
                  </div>
                  <span className="text-[8px] font-mono text-white/30">{mixerVolumes[ch.key] > 75 ? "0dB" : mixerVolumes[ch.key] > 50 ? "-6dB" : mixerVolumes[ch.key] > 25 ? "-12dB" : "-30dB"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackRow({ label, children }) {
  return (
    <div className="flex items-stretch" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
      <div className="w-16 shrink-0 flex items-center px-2 py-2" style={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}>
        <span className="text-[9px] font-bold text-white/40 truncate">{label}</span>
      </div>
      <div className="flex-1 flex items-center gap-1 px-1 py-1.5 overflow-x-auto scrollbar-thin" style={{ minHeight: 48 }}>
        {children}
      </div>
    </div>
  );
}

function EmptyTrack({ label }) {
  return (
    <div className="flex-1 rounded-lg flex items-center justify-center" style={{ border: "1px dashed rgba(255,255,255,0.06)", minHeight: 40 }}>
      <p className="text-[9px] text-white/20">{label}</p>
    </div>
  );
}

function EffectSlider({ label, value, min, max, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-white/50">{label}</span>
        <span className="text-[10px] font-mono text-white/40">{value}</span>
      </div>
      <div className="relative">
        <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full" style={{ width: `${((value - min) / (max - min)) * 100}%`, background: "#7c3aed" }} />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full" style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 6px)`, background: "#a855f7", boxShadow: "0 0 6px rgba(124,58,237,0.6)" }} />
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: "100%" }} />
      </div>
    </div>
  );
}