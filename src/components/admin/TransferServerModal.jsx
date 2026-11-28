import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { ArrowRightLeft, X } from "lucide-react";

export default function TransferServerModal({ server, onClose, onTransferred }) {
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!target.trim() || busy) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "adminTransferAd",
        serverAdId: server.id,
        target: target.trim(),
      });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`« ${server.title} » est maintenant attribuée à ${res.data.owner.name} (${res.data.owner.email}).`);
      onTransferred(res.data.ad);
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Transfert impossible");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-4 space-y-3"
        style={{ background: "#12101c", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-green-400" /> Transférer la propriété
          </h3>
          <button type="button" onClick={onClose} className="text-white/40"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-[11px] text-white/50">
          « {server.title} » — propriétaire actuel : {server.author_email}. Votes, clics, visuels et description sont conservés.
        </p>
        <input
          autoFocus
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="E-mail ou pseudo de l'utilisateur Matrix"
          className="w-full h-10 px-3 rounded-lg text-xs text-white placeholder:text-white/25 outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
        <button
          type="submit"
          disabled={busy || !target.trim()}
          className="w-full h-10 rounded-lg text-xs font-bold text-white disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
        >
          {busy ? "Transfert..." : "Confirmer le transfert"}
        </button>
      </form>
    </div>
  );
}
