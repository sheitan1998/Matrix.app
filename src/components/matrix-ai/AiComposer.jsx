import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import AiVoiceInput from "./AiVoiceInput";

export default function AiComposer({ value, onChange, onSend, sending, disabled }) {
  const textareaRef = useRef(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(140, el.scrollHeight)}px`;
  }, [value]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!sending && value.trim()) onSend();
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
          placeholder="Demande à Matrix AI : serveurs, créateurs, annonces, idées de contenu..."
          className="flex-1 bg-transparent text-[12px] text-white placeholder:text-white/30 outline-none resize-none py-1.5 max-h-36 scrollbar-thin"
          disabled={sending}
        />
        <AiVoiceInput
          value={value}
          onChange={onChange}
          disabled={sending || disabled}
          onListeningChange={setListening}
        />
        <button
          onClick={onSend}
          disabled={sending || disabled || !value.trim()}
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