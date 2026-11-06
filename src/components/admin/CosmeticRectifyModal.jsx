import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, ArrowLeftRight, Coins, Trash2, AlertTriangle } from "lucide-react";

const MODE_TITLES = {
  replace: "Remplacer le cosmétique",
  remove: "Retirer le cosmétique",
  compensate: "Créditer un dédommagement",
};

const inputCls = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-[#a855f7]";

export default function CosmeticRectifyModal({ mode, owners, items, currentItem, onClose, onDone }) {
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const owner = owners[0];
  const isBulk = owners.length > 1;
  const trixAmount = Math.max(0, Math.round(Number(amount) || 0));
  const alternatives = items.filter((i) => i.id !== currentItem?.id);

  const submit = async () => {
    if (mode === "replace" && !targetId) return toast.error("Choisis l'article de remplacement");
    if (mode === "compensate" && trixAmount <= 0) return toast.error("Indique un montant en Trix");

    setSaving(true);
    const payload =
      mode === "compensate"
        ? { action: "compensate", user_email: owner.user_email, amount_trix: trixAmount, reason }
        : {
            action: mode,
            ownership_ids: owners.map((o) => o.id),
            compensate_trix: trixAmount,
            reason,
            ...(mode === "replace" ? { to_item_id: targetId, from_item_id: currentItem?.id } : {}),
          };

    try {
      const res = await base44.functions.invoke("cosmeticAdmin", payload);
      const data = res?.data || {};
      if (data.error) {
        toast.error(data.error);
        setSaving(false);
        return;
      }

      if (mode === "replace") {
        toast.success(
          isBulk
            ? `${data.updated} propriétaire(s) migré(s)${data.compensated ? ` · ${data.compensated} dédommagé(s)` : ""}`
            : "Article remplacé"
        );
      } else if (mode === "remove") {
        toast.success(
          `Article retiré${data.compensated ? ` · ${data.compensated} dédommagé(s)` : ""}`
        );
      } else {
        toast.success(`${data.amount} Trix crédités à ${owner.user_email}`);
      }
      onDone();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors de l'opération");
      setSaving(false);
    }
  };

  const Icon = mode === "replace" ? ArrowLeftRight : mode === "remove" ? Trash2 : Coins;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 p-5 space-y-4"
        style={{ background: "#13101a" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
            <Icon className="w-4 h-4 text-[#a855f7]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-white">{MODE_TITLES[mode]}</h3>
            <p className="text-[11px] text-white/40">
              {mode === "compensate"
                ? owner.user_email
                : isBulk
                ? `${owners.length} propriétaire(s) · ${currentItem?.name || "article"}`
                : `${owner.user_email} · ${currentItem?.name || "article"}`}
            </p>
          </div>
        </div>

        {mode === "replace" && (
          <div>
            <label className="text-[10px] font-bold uppercase text-white/40">Nouvel article</label>
            <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className={`${inputCls} mt-1`}>
              <option value="">Sélectionner…</option>
              {alternatives.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-white/30 mt-1.5">
              Le visuel et les réglages d'affichage sont copiés depuis le nouvel article. Si un joueur le possède déjà, les quantités sont cumulées.
            </p>
          </div>
        )}

        {mode === "remove" && (
          <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.08)" }}>
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-red-300/80">
              L'article sera retiré de l'inventaire {isBulk ? `de ${owners.length} joueurs` : "du joueur"}. Un dédommagement en Trix est recommandé.
            </p>
          </div>
        )}

        <div>
          <label className="text-[10px] font-bold uppercase text-white/40">
            {mode === "compensate" ? "Montant du dédommagement (Trix)" : "Dédommagement en Trix (optionnel)"}
          </label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className={`${inputCls} mt-1`}
          />
          {trixAmount > 0 && (
            <p className="text-[10px] text-amber-300/70 mt-1">
              {trixAmount} Trix ≈ {(trixAmount / 100).toFixed(2).replace(".", ",")}€
              {mode !== "compensate" ? " par propriétaire" : ""}
            </p>
          )}
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase text-white/40">Motif (optionnel)</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex : refonte majeure du cosmétique"
            className={`${inputCls} mt-1`}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/10 py-2 text-xs font-bold text-white/60 hover:bg-white/5"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 rounded-lg py-2 text-xs font-black text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: mode === "remove" ? "#dc2626" : "#a855f7" }}
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}