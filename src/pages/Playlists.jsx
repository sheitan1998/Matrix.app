import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Play, Pause, Search, X, Trash2, Music, ListMusic, ArrowLeft, Check, Edit3, SkipForward, SkipBack } from "lucide-react";
import { toast } from "sonner";
import SpaceBackground from "@/components/SpaceBackground";

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #8b5cf6, #6d28d9)",
  "linear-gradient(135deg, #3b82f6, #1e40af)",
  "linear-gradient(135deg, #22c55e, #15803d)",
  "linear-gradient(135deg, #f59e0b, #d97706)",
  "linear-gradient(135deg, #ec4899, #be185d)",
  "linear-gradient(135deg, #06b6d4, #0e7490)",
];

export default function Playlists() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => base44.entities.Playlist.list("-created_date", 50),
  });

  const { data: publicPlaylists = [] } = useQuery({
    queryKey: ["public-playlists"],
    queryFn: () => base44.entities.Playlist.filter({ is_public: true }, "-created_date", 20),
  });

  const searchMusic = useCallback(async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=25&country=FR`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      toast.error("Erreur de recherche musicale");
      setSearchResults([]);
    }
    setSearching(false);
  }, []);

  const createPlaylist = async (name, description, isPublic) => {
    const cover = COVER_GRADIENTS[Math.floor(Math.random() * COVER_GRADIENTS.length)];
    await base44.entities.Playlist.create({
      name, description,
      owner_email: user.email,
      owner_name: user.full_name,
      cover_url: null,
      cover_gradient: cover,
      tracks: [],
      is_public: isPublic,
      track_count: 0,
    });
    qc.invalidateQueries({ queryKey: ["playlists"] });
    setShowCreate(false);
    toast.success("Playlist créée !");
  };

  const deletePlaylist = async (id) => {
    if (!window.confirm("Supprimer cette playlist ?")) return;
    await base44.entities.Playlist.delete(id);
    qc.invalidateQueries({ queryKey: ["playlists"] });
    setEditingPlaylist(null);
    toast.success("Playlist supprimée");
  };

  const addTrack = async (playlist, track) => {
    const newTrack = {
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      preview_url: track.previewUrl,
      artwork_url: track.artworkUrl100?.replace("100x100", "300x300"),
      duration_ms: track.trackTimeMillis,
      itunes_id: track.trackId,
    };
    const updated = [...(playlist.tracks || []), newTrack];
    await base44.entities.Playlist.update(playlist.id, { tracks: updated, track_count: updated.length });
    qc.invalidateQueries({ queryKey: ["playlists"] });
    toast.success(`Ajouté à "${playlist.name}"`);
  };

  const removeTrack = async (playlist, idx) => {
    const updated = playlist.tracks.filter((_, i) => i !== idx);
    await base44.entities.Playlist.update(playlist.id, { tracks: updated, track_count: updated.length });
    qc.invalidateQueries({ queryKey: ["playlists"] });
  };

  const playTrack = (track, playlist) => {
    if (nowPlaying?.preview_url === track.preview_url) {
      if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
      else { audioRef.current?.play(); setIsPlaying(true); }
    } else {
      setNowPlaying({ ...track, playlist_name: playlist?.name });
      setIsPlaying(true);
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const playNext = useCallback(() => {
    if (!nowPlaying || !editingPlaylist) return;
    const tracks = editingPlaylist.tracks || [];
    const idx = tracks.findIndex(t => t.preview_url === nowPlaying.preview_url);
    const next = tracks[idx + 1];
    if (next) { setNowPlaying({ ...next, playlist_name: editingPlaylist.name }); setIsPlaying(true); setTimeout(() => audioRef.current?.play(), 100); }
  }, [nowPlaying, editingPlaylist]);

  const playPrev = useCallback(() => {
    if (!nowPlaying || !editingPlaylist) return;
    const tracks = editingPlaylist.tracks || [];
    const idx = tracks.findIndex(t => t.preview_url === nowPlaying.preview_url);
    const prev = tracks[idx - 1];
    if (prev) { setNowPlaying({ ...prev, playlist_name: editingPlaylist.name }); setIsPlaying(true); setTimeout(() => audioRef.current?.play(), 100); }
  }, [nowPlaying, editingPlaylist]);

  useEffect(() => {
    if (!audioRef.current) return;
    const onEnd = () => playNext();
    audioRef.current.addEventListener("ended", onEnd);
    return () => audioRef.current?.removeEventListener("ended", onEnd);
  }, [playNext]);

  const myPlaylists = playlists.filter(p => p.owner_email === user?.email);
  const otherPlaylists = playlists.filter(p => p.owner_email !== user?.email);

  return (
    <SpaceBackground overlay={0.6}>
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 backdrop-blur-xl" style={{ background: "rgba(10,10,12,0.85)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition"><ArrowLeft className="w-5 h-5 text-white" /></button>
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-purple-400" />
            <span className="font-black text-white">Playlists</span>
          </div>
          <button onClick={() => setShowCreate(true)} className="ml-auto flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
            <Plus className="w-4 h-4" /> Créer
          </button>
        </div>

        <div className="px-4 lg:px-6 py-6 max-w-5xl mx-auto space-y-8 pb-32">
          {/* My playlists */}
          <section>
            <h3 className="text-lg font-black text-white mb-4">Mes playlists</h3>
            {isLoading ? (
              <p className="text-sm text-white/40">Chargement...</p>
            ) : myPlaylists.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(18,18,20,0.6)", border: "1px dashed rgba(139,92,246,0.3)" }}>
                <Music className="w-10 h-10 text-purple-400/50 mx-auto mb-3" />
                <p className="text-sm text-white/50 mb-4">Aucune playlist. Crée ta première playlist !</p>
                <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                  <Plus className="w-4 h-4" /> Créer une playlist
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {myPlaylists.map((p, i) => (
                  <PlaylistCard key={p.id} playlist={p} onOpen={() => setEditingPlaylist(p)} />
                ))}
              </div>
            )}
          </section>

          {/* Public playlists */}
          {otherPlaylists.length > 0 && (
            <section>
              <h3 className="text-lg font-black text-white mb-4">Playlists de la communauté</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {otherPlaylists.map((p) => (
                  <PlaylistCard key={p.id} playlist={p} onOpen={() => setEditingPlaylist(p)} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Create modal */}
        {showCreate && (
          <CreatePlaylistModal onClose={() => setShowCreate(false)} onCreate={createPlaylist} />
        )}

        {/* Playlist detail / edit modal */}
        <AnimatePresence>
          {editingPlaylist && (
            <PlaylistDetail
              playlist={editingPlaylist}
              onClose={() => { setEditingPlaylist(null); setNowPlaying(null); setIsPlaying(false); }}
              onAddTrack={(track) => addTrack(editingPlaylist, track)}
              onRemoveTrack={(idx) => removeTrack(editingPlaylist, idx)}
              onDelete={() => deletePlaylist(editingPlaylist.id)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              searching={searching}
              onSearch={searchMusic}
              nowPlaying={nowPlaying}
              isPlaying={isPlaying}
              onPlayTrack={(track) => playTrack(track, editingPlaylist)}
            />
          )}
        </AnimatePresence>

        {/* Now playing bar */}
        {nowPlaying && (
          <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 backdrop-blur-xl" style={{ background: "rgba(10,10,12,0.95)", borderTop: "1px solid rgba(139,92,246,0.2)" }}>
            <div className="max-w-5xl mx-auto flex items-center gap-3">
              {nowPlaying.artwork_url && <img src={nowPlaying.artwork_url} className="w-12 h-12 rounded-lg object-cover" alt="" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{nowPlaying.title}</p>
                <p className="text-xs text-white/50 truncate">{nowPlaying.artist}</p>
              </div>
              <button onClick={playPrev} className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white transition"><SkipBack className="w-4 h-4" /></button>
              <button onClick={() => playTrack(nowPlaying, editingPlaylist)} className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button onClick={playNext} className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white transition"><SkipForward className="w-4 h-4" /></button>
              <button onClick={() => { setNowPlaying(null); setIsPlaying(false); audioRef.current?.pause(); }} className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white transition"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        <audio ref={audioRef} src={nowPlaying?.preview_url} />
      </div>
    </SpaceBackground>
  );
}

function PlaylistCard({ playlist, onOpen }) {
  const cover = playlist.cover_gradient || "linear-gradient(135deg, #8b5cf6, #6d28d9)";
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className="rounded-2xl overflow-hidden cursor-pointer group"
      style={{ background: "rgba(18,18,20,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="relative aspect-square">
        {playlist.cover_url ? (
          <img src={playlist.cover_url} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: cover }}>
            <ListMusic className="w-10 h-10 text-white/60" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.9)", boxShadow: "0 0 20px rgba(139,92,246,0.5)" }}>
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-white truncate">{playlist.name}</p>
        <p className="text-[10px] text-white/40 mt-0.5">{playlist.track_count || 0} titres</p>
      </div>
    </motion.div>
  );
}

function CreatePlaylistModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl p-6 space-y-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-black text-lg text-white">Nouvelle playlist</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom de la playlist" autoFocus
          className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-white placeholder:text-muted-foreground outline-none text-sm" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optionnel)" rows={2}
          className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-white placeholder:text-muted-foreground outline-none text-sm resize-none" />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="w-4 h-4 accent-purple-500" />
          <span className="text-sm text-white/70">Playlist publique</span>
        </label>
        <button onClick={() => onCreate(name.trim(), desc.trim(), isPublic)} disabled={!name.trim()}
          className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
          Créer
        </button>
      </div>
    </div>
  );
}

function PlaylistDetail({ playlist, onClose, onAddTrack, onRemoveTrack, onDelete, searchQuery, setSearchQuery, searchResults, searching, onSearch, nowPlaying, isPlaying, onPlayTrack }) {
  const [tab, setTab] = useState("tracks");
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(playlist.name);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => onSearch(q), 400);
    setSearchTimeout(t);
  };

  const saveName = async () => {
    await base44.entities.Playlist.update(playlist.id, { name: name.trim() });
    playlist.name = name.trim();
    setEditName(false);
    toast.success("Renommé");
  };

  const formatDuration = (ms) => {
    const sec = Math.floor(ms / 1000);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }} onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
        className="w-full max-w-2xl h-[85vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 flex items-center gap-4 shrink-0" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
            {playlist.cover_url ? <img src={playlist.cover_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center" style={{ background: playlist.cover_gradient || "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}><ListMusic className="w-6 h-6 text-white/60" /></div>}
          </div>
          <div className="flex-1 min-w-0">
            {editName ? (
              <div className="flex gap-2">
                <input value={name} onChange={e => setName(e.target.value)} className="flex-1 px-2 py-1 rounded-lg bg-secondary border border-border text-white text-sm outline-none" />
                <button onClick={saveName} className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"><Check className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg text-white truncate">{playlist.name}</h2>
                <button onClick={() => setEditName(true)} className="text-white/40 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
              </div>
            )}
            <p className="text-xs text-white/40">{playlist.track_count || 0} titres · {playlist.is_public ? "🌍 Publique" : "🔒 Privée"}</p>
          </div>
          <button onClick={onDelete} className="w-9 h-9 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/10 transition"><Trash2 className="w-4 h-4" /></button>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 shrink-0">
          <button onClick={() => setTab("tracks")} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${tab === "tracks" ? "bg-secondary text-white" : "text-white/40"}`}>Titres ({playlist.tracks?.length || 0})</button>
          <button onClick={() => setTab("search")} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${tab === "search" ? "bg-secondary text-white" : "text-white/40"}`}>Rechercher</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {tab === "tracks" && (
            <div className="p-3 space-y-1">
              {(playlist.tracks || []).length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-white/40">Aucun titre. Cherche de la musique dans l'onglet "Rechercher".</p>
                </div>
              ) : (
                (playlist.tracks || []).map((track, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition group">
                    <button onClick={() => onPlayTrack(track)} className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
                      {track.artwork_url ? <img src={track.artwork_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-secondary flex items-center justify-center"><Music className="w-4 h-4 text-white/30" /></div>}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        {nowPlaying?.preview_url === track.preview_url && isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${nowPlaying?.preview_url === track.preview_url ? "text-purple-400" : "text-white"}`}>{track.title}</p>
                      <p className="text-[10px] text-white/40 truncate">{track.artist}</p>
                    </div>
                    {track.duration_ms && <span className="text-[10px] text-white/30 font-mono">{formatDuration(track.duration_ms)}</span>}
                    <button onClick={() => onRemoveTrack(idx)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "search" && (
            <div className="p-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="Rechercher un titre, un artiste..." autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-white placeholder:text-white/30 outline-none text-sm" />
              </div>
              {searching && <p className="text-xs text-white/40 text-center py-4">Recherche...</p>}
              {!searching && searchResults.map((track) => (
                <div key={track.trackId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition group">
                  {track.artworkUrl100 && <img src={track.artworkUrl100} className="w-10 h-10 rounded-lg object-cover" alt="" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{track.trackName}</p>
                    <p className="text-[10px] text-white/40 truncate">{track.artistName}</p>
                  </div>
                  <span className="text-[10px] text-white/30">{formatDuration(track.trackTimeMillis)}</span>
                  <button onClick={() => onAddTrack(track)} className="w-7 h-7 rounded-full flex items-center justify-center text-white bg-purple-600 hover:bg-purple-500 transition shrink-0"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {!searching && searchQuery && searchResults.length === 0 && (
                <p className="text-xs text-white/40 text-center py-4">Aucun résultat</p>
              )}
              {!searching && !searchQuery && (
                <p className="text-xs text-white/40 text-center py-8">Tape quelque chose pour chercher de la musique 🎵</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}