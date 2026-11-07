import React, { useEffect, useMemo, useState } from "react";
import { X, FolderPlus, FilePlus2, Upload, Folder, FolderOpen, Trash2, Download, FileText, FileImage, Save, ArrowLeft } from "lucide-react";

const iconFor = (file) => (file.type?.startsWith("image/") ? FileImage : FileText);

const formatSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
};

export default function FileManager({ onClose, user }) {
  const storageKey = `matrix_files_${user?.email || "guest"}`;
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { folders: [{ id: "root", name: "Mes documents" }], files: [] };
  });
  const [folderId, setFolderId] = useState("root");
  const [openFile, setOpenFile] = useState(null);
  const [draft, setDraft] = useState("");
  const [newFolder, setNewFolder] = useState("");

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  }, [state, storageKey]);

  const folder = state.folders.find((f) => f.id === folderId) || state.folders[0];
  const files = useMemo(() => state.files.filter((f) => f.folderId === folderId), [state.files, folderId]);

  const addFolder = () => {
    const name = newFolder.trim();
    if (!name) return;
    setState((s) => ({ ...s, folders: [...s.folders, { id: `f_${Date.now()}`, name }] }));
    setNewFolder("");
  };

  const removeFolder = (id) => {
    if (id === "root") return;
    setState((s) => ({
      folders: s.folders.filter((f) => f.id !== id),
      files: s.files.filter((f) => f.folderId !== id),
    }));
    if (folderId === id) setFolderId("root");
  };

  const addFile = (name = "Nouveau document.txt", content = "", type = "text/plain") => {
    const file = { id: `d_${Date.now()}`, name, folderId, content, type, size: content.length, updated: Date.now() };
    setState((s) => ({ ...s, files: [...s.files, file] }));
    setOpenFile(file);
    setDraft(content);
  };

  const onImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Fichier trop volumineux (2 Mo max)."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const isImage = file.type.startsWith("image/");
      const entry = {
        id: `d_${Date.now()}`,
        name: file.name,
        folderId,
        content: reader.result,
        type: file.type || "text/plain",
        size: file.size,
        updated: Date.now(),
      };
      setState((s) => ({ ...s, files: [...s.files, entry] }));
      if (!isImage) { setOpenFile(entry); setDraft(String(reader.result)); }
    };
    if (file.type.startsWith("image/")) reader.readAsDataURL(file);
    else reader.readAsText(file);
    e.target.value = "";
  };

  const saveDraft = () => {
    if (!openFile) return;
    setState((s) => ({
      ...s,
      files: s.files.map((f) => f.id === openFile.id ? { ...f, content: draft, size: draft.length, updated: Date.now() } : f),
    }));
    setOpenFile({ ...openFile, content: draft });
  };

  const removeFile = (id) => {
    setState((s) => ({ ...s, files: s.files.filter((f) => f.id !== id) }));
    if (openFile?.id === id) setOpenFile(null);
  };

  const download = (file) => {
    const a = document.createElement("a");
    a.href = file.type?.startsWith("image/") ? file.content : URL.createObjectURL(new Blob([file.content], { type: file.type || "text/plain" }));
    a.download = file.name;
    a.click();
    if (!file.type?.startsWith("image/")) URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.4)", boxShadow: "0 0 12px rgba(168,85,247,0.3)" }}>
            <Folder className="h-4 w-4 text-[#a855f7]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Gestionnaire de Fichiers</h2>
            <p className="text-[10px] text-white/40">Dossiers locaux et documents</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => addFile()} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white/70 hover:text-white" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <FilePlus2 className="h-3 w-3" /> Fichier
          </button>
          <label className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-white/70 hover:text-white" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Upload className="h-3 w-3" /> Importer
            <input type="file" className="hidden" onChange={onImport} />
          </label>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[190px_1fr]">
        <div className="flex min-h-0 flex-col gap-2 rounded-xl p-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.18)" }}>
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">Dossiers</p>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto scrollbar-thin">
            {state.folders.map((f) => {
              const count = state.files.filter((x) => x.folderId === f.id).length;
              const active = f.id === folderId;
              return (
                <div key={f.id} className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5" style={{
                  background: active ? "rgba(168,85,247,0.18)" : "transparent",
                  border: `1px solid ${active ? "rgba(168,85,247,0.45)" : "transparent"}`,
                }}>
                  <button onClick={() => { setFolderId(f.id); setOpenFile(null); }} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                    {active ? <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[#c084fc]" /> : <Folder className="h-3.5 w-3.5 shrink-0 text-white/35" />}
                    <span className="truncate text-[11px]" style={{ color: active ? "#f3e8ff" : "rgba(255,255,255,0.55)" }}>{f.name}</span>
                    <span className="ml-auto shrink-0 text-[9px] text-white/25">{count}</span>
                  </button>
                  {f.id !== "root" && (
                    <button onClick={() => removeFolder(f.id)} className="opacity-0 transition group-hover:opacity-100">
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1">
            <input
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFolder()}
              placeholder="Nouveau dossier"
              className="h-7 min-w-0 flex-1 rounded-md bg-black/30 px-2 text-[10px] text-white outline-none"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <button onClick={addFolder} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#c084fc]" style={{ background: "rgba(168,85,247,0.16)", border: "1px solid rgba(168,85,247,0.35)" }}>
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.18)" }}>
          {openFile ? (
            <div className="flex min-h-0 flex-1 flex-col p-2">
              <div className="mb-2 flex items-center gap-2">
                <button onClick={() => setOpenFile(null)} className="flex h-6 w-6 items-center justify-center rounded-md text-white/50 hover:text-white" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <p className="truncate text-[11px] font-bold text-white">{openFile.name}</p>
                <button onClick={saveDraft} className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-[#c084fc] tap-sm" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.35)" }}>
                  <Save className="h-3 w-3" /> Enregistrer
                </button>
              </div>
              {openFile.type?.startsWith("image/") ? (
                <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-lg bg-black/30 p-2">
                  <img src={openFile.content} alt={openFile.name} className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="min-h-0 flex-1 resize-none rounded-lg bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-white outline-none focus:border-[#a855f7]"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                />
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">{folder?.name}</p>
                <span className="text-[9px] text-white/25">{files.length} élément(s)</span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
                {files.length === 0 ? (
                  <p className="py-10 text-center text-[11px] text-white/25">Ce dossier est vide.</p>
                ) : files.map((file) => {
                  const Icon = iconFor(file);
                  return (
                    <div key={file.id} className="group flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <Icon className="h-4 w-4 shrink-0" style={{ color: file.type?.startsWith("image/") ? "#22d3ee" : "#a855f7" }} />
                      <button onClick={() => { setOpenFile(file); setDraft(file.type?.startsWith("image/") ? "" : file.content); }} className="min-w-0 flex-1 text-left">
                        <p className="truncate text-[11px] text-white/80">{file.name}</p>
                        <p className="text-[9px] text-white/25">{formatSize(file.size)} · {new Date(file.updated).toLocaleDateString("fr-FR")}</p>
                      </button>
                      <button onClick={() => download(file)} className="text-white/30 hover:text-white"><Download className="h-3.5 w-3.5" /></button>
                      <button onClick={() => removeFile(file.id)} className="text-white/30 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}