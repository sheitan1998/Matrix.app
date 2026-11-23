import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Paperclip, X, FileText } from "lucide-react";
import AiVoiceInput from "./AiVoiceInput";
import AiAttachmentImage from "./AiAttachmentImage";
import { ACCEPT_ATTRIBUTE, MAX_ATTACHMENTS, isImageAttachment } from "@/lib/aiFiles";

export default function AiComposer({
  value,
  onChange,
  onSend,
  sending,
  disabled,
  attachments = [],
  uploading = false,
  onAddFiles,
  onRemoveAttachment,
}) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [sendSignal, setSendSignal] = useState(0);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(140, el.scrollHeight)}px`;
  }, [value]);

  const canSend = !sending && !disabled && !uploading && (value.trim() || attachments.length > 0);

  const handleSend = () => {
    if (!canSend) return;
    setSendSignal((count) => count + 1);
    onSend();
  };

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length) onAddFiles?.(files);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="px-3 sm:px-6 pt-3 pb-20 md:pb-4"
      style={{
        background: "linear-gradient(180deg, rgba(11,6,20,0.6) 0%, rgba(11,6,20,0.98) 60%)",
        borderTop: "1px solid rgba(138,79,255,0.12)",
      }}
    >
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {attachments.map((file, index) => (
            <span
              key={`${file.url}-${index}`}
              className="flex items-center gap-1.5 max-w-[220px] rounded-lg pl-2 pr-1 py-1 text-[10px] font-bold text-white/80"
              style={{ background: "rgba(138,79,255,0.15)", border: "1px solid rgba(138,79,255,0.35)" }}
            >
              {isImageAttachment(file) ? (
                <AiAttachmentImage file={file} imgClassName="w-7 h-7 rounded object-cover shrink-0" />
              ) : (
                <FileText className="w-3 h-3 shrink-0" style={{ color: "#c4b5fd" }} />
              )}
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemoveAttachment?.(index)}
                disabled={sending}
                className="w-4 h-4 rounded flex items-center justify-center text-white/50 hover:text-white"
                aria-label={`Retirer ${file.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div
        className="flex items-end gap-2 rounded-2xl px-3 py-2"
        style={{ background: "rgba(20,12,34,0.9)", border: "1px solid rgba(138,79,255,0.25)" }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={4000}
          placeholder="Demande à Matrix AI, décris une image à générer, colle un lien ou joins un fichier..."
          className="flex-1 bg-transparent text-[12px] text-white placeholder:text-white/30 outline-none resize-none py-1.5 max-h-36 scrollbar-thin"
          disabled={sending}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          className="hidden"
          onChange={handleFiles}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || uploading || attachments.length >= MAX_ATTACHMENTS}
          aria-label="Joindre un fichier"
          title="Joindre un fichier (image, PDF, texte, code, données)"
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition disabled:opacity-40 tap-sm"
          style={{ background: "rgba(138,79,255,0.1)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(138,79,255,0.2)" }}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
        </button>
        <AiVoiceInput
          value={value}
          onChange={onChange}
          disabled={sending || disabled}
          onListeningChange={setListening}
          sendSignal={sendSignal}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition disabled:opacity-40 tap-sm"
          style={{
            background: "linear-gradient(135deg, #8a4fff, #6d28d9)",
            color: "#fff",
            boxShadow: "0 0 14px rgba(138,79,255,0.35)",
          }}
          aria-label="Envoyer le message"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
        </button>
      </div>
      {listening ? (
        <p
          className="mt-1.5 flex items-center justify-center gap-1.5 text-[9px] font-bold"
          style={{ color: "#f87171" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Écoute en cours — le texte s'ajoute au fur et à mesure, rien n'est envoyé automatiquement.
        </p>
      ) : (
        <p className="mt-1.5 text-center text-[9px] text-white/25">
          Matrix AI peut se tromper sur des informations externes. Les données Matrix proviennent de la base en direct.
        </p>
      )}
    </div>
  );
}