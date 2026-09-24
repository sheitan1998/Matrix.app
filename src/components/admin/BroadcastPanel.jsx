import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Megaphone, Send, Lock, Loader2, CheckCircle } from "lucide-react";

export default function BroadcastPanel() {
  const [content, setContent] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("sendBroadcastMessage", {
        content: content.trim(),
        is_read_only: isReadOnly,
      });
      setResult(res?.data || res);
      setContent("");
    } catch (e) {
      setError(e?.message || "Erreur lors de l'envoi du broadcast");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Megaphone className="w-4 h-4" style={{ color: "#a855f7" }} />
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Annonce globale</h3>
        </div>
        <p className="text-[10px] text-white/40 mb-4">
          Envoie un message broadcast à tous les utilisateurs inscrits. Le message arrive dans leur messagerie sous le profil de l'Équipe Matrix.
        </p>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Saisis ton annonce ici..."
          rows={6}
          className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder:text-white/30 outline-none text-sm resize-none"
        />

        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <button
            type="button"
            onClick={() => setIsReadOnly(!isReadOnly)}
            className={`w-9 h-5 rounded-full transition relative shrink-0 ${isReadOnly ? "bg-purple-600" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isReadOnly ? "left-[18px]" : "left-0.5"}`} />
          </button>
          <span className="text-xs text-white/60 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Lecture seule (les utilisateurs ne peuvent pas répondre)
          </span>
        </label>

        {error && (
          <p className="text-xs text-red-400 mt-3">{error}</p>
        )}
        {result?.success && (
          <div className="flex items-center gap-2 mt-3 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <p className="text-xs">Annonce envoyée à {result.recipients} utilisateur(s).</p>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 2px 12px rgba(124,58,237,0.3)" }}
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Envoyer l'annonce
            </>
          )}
        </button>
      </div>
    </div>
  );
}