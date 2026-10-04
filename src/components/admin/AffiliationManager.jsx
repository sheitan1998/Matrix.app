import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, X, Star, Zap, Ban, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_COLOR = { affiliate: "#3b82f6", partner: "#FFD700", revoked: "#ef4444" };

export default function AffiliationManager() {
  const qc = useQueryClient();
  const [processing, setProcessing] = useState(null);

  const { data: tickets = [] } = useQuery({
    queryKey: ["program-tickets"],
    queryFn: () => base44.entities.SupportTicket.filter({ program_type: { $in: ["affiliate", "partner"] } }, "-created_date", 100),
  });
  const { data: affiliations = [] } = useQuery({
    queryKey: ["all-affiliations"],
    queryFn: () => base44.entities.Affiliation.filter({}, "-approved_at", 200),
  });

  const pendingTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress");

  const approve = async (ticket) => {
    setProcessing(ticket.id);
    try {
      const existing = affiliations.find((a) => a.user_email === ticket.user_email);
      if (existing) {
        await base44.entities.Affiliation.update(existing.id, {
          status: ticket.program_type,
          motivation: ticket.message,
          portfolio_links: ticket.portfolio_links || [],
          approved_at: new Date().toISOString(),
          partner_since: ticket.program_type === "partner" ? new Date().toISOString() : existing.partner_since,
          trix_per_month: ticket.program_type === "partner" ? 1000 : 0,
          ticket_id: ticket.id,
        });
      } else {
        await base44.entities.Affiliation.create({
          user_email: ticket.user_email,
          user_name: ticket.user_name,
          user_avatar: ticket.user_avatar || "",
          status: ticket.program_type,
          motivation: ticket.message,
          portfolio_links: ticket.portfolio_links || [],
          approved_at: new Date().toISOString(),
          partner_since: ticket.program_type === "partner" ? new Date().toISOString() : null,
          trix_per_month: ticket.program_type === "partner" ? 1000 : 0,
          ticket_id: ticket.id,
        });
      }
      await base44.entities.SupportTicket.update(ticket.id, {
        status: "resolved",
        admin_response: `Candidature approuvée — statut ${ticket.program_type === "partner" ? "Partenaire" : "Affilié"} accordé.`,
        responded_at: new Date().toISOString(),
      });
      toast.success(`${ticket.program_type === "partner" ? "Partenaire" : "Affilié"} approuvé !`);
      qc.invalidateQueries({ queryKey: ["program-tickets"] });
      qc.invalidateQueries({ queryKey: ["all-affiliations"] });
    } catch (err) { toast.error(err?.message || "Erreur"); }
    setProcessing(null);
  };

  const refuse = async (ticket) => {
    setProcessing(ticket.id);
    try {
      await base44.entities.SupportTicket.update(ticket.id, {
        status: "closed",
        admin_response: "Candidature refusée.",
        responded_at: new Date().toISOString(),
      });
      toast.success("Candidature refusée");
      qc.invalidateQueries({ queryKey: ["program-tickets"] });
    } catch (err) { toast.error(err?.message || "Erreur"); }
    setProcessing(null);
  };

  const revoke = async (aff) => {
    if (!window.confirm(`Retirer le statut de ${aff.user_name || aff.user_email} ?`)) return;
    try {
      await base44.entities.Affiliation.update(aff.id, { status: "revoked" });
      toast.success("Statut retiré");
      qc.invalidateQueries({ queryKey: ["all-affiliations"] });
    } catch (err) { toast.error(err?.message || "Erreur"); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-white">Candidatures en attente</h2>
        <p className="text-xs text-white/40">Candidatures Affiliés & Partenaires soumises via les tickets</p>
      </div>

      {pendingTickets.length === 0 ? (
        <div className="text-center py-10 text-white/30 text-sm">Aucune candidature en attente</div>
      ) : (
        <div className="space-y-3">
          {pendingTickets.map((t) => (
            <div key={t.id} className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white" style={{ background: (STATUS_COLOR[t.program_type] || "#888") + "22", color: STATUS_COLOR[t.program_type] }}>
                  {t.program_type === "partner" ? <Star className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white text-sm">{t.user_name || t.user_email}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: STATUS_COLOR[t.program_type] + "22", color: STATUS_COLOR[t.program_type] }}>
                      {t.program_type === "partner" ? "Partenaire" : "Affilié"}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-0.5">{t.user_email}</p>
                </div>
                <span className="text-[9px] text-white/30 flex items-center gap-0.5 shrink-0"><Clock className="w-2.5 h-2.5" />{new Date(t.created_date).toLocaleDateString("fr-FR")}</span>
              </div>
              {t.message && <p className="text-xs text-white/70 mt-2 p-2 rounded-lg bg-white/5">{t.message}</p>}
              {t.creator_description && <p className="text-[11px] text-white/50 mt-1">Contenus : {t.creator_description}</p>}
              {t.portfolio_links?.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {t.portfolio_links.map((l, i) => (
                    <a key={i} href={l} target="_blank" rel="noreferrer" className="text-[10px] text-purple-400 hover:underline flex items-center gap-0.5">
                      <ExternalLink className="w-2.5 h-2.5" /> Lien {i + 1}
                    </a>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button onClick={() => approve(t)} disabled={processing === t.id}
                  className="flex-1 h-9 rounded-xl text-xs font-bold text-black flex items-center justify-center gap-1 transition hover:opacity-90 disabled:opacity-50" style={{ background: "#22c55e" }}>
                  {processing === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Approuver
                </button>
                <button onClick={() => refuse(t)} disabled={processing === t.id}
                  className="flex-1 h-9 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 transition hover:opacity-90 disabled:opacity-50" style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <X className="w-3.5 h-3.5" /> Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-lg font-black text-white mt-6">Affiliés & Partenaires actifs</h2>
        <p className="text-xs text-white/40 mb-3">{affiliations.length} enregistrement(s)</p>
        {affiliations.length === 0 ? (
          <div className="text-center py-6 text-white/30 text-sm">Aucun affilié enregistré</div>
        ) : (
          <div className="space-y-2">
            {affiliations.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: (STATUS_COLOR[a.status] || "#888") + "22" }}>
                  {a.status === "partner" ? <Star className="w-4 h-4" style={{ color: STATUS_COLOR[a.status] }} /> : a.status === "affiliate" ? <Zap className="w-4 h-4" style={{ color: STATUS_COLOR[a.status] }} /> : <Ban className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{a.user_name || a.user_email}</p>
                  <p className="text-[10px] text-white/40">
                    {a.status === "partner" && `💎 ${a.trix_per_month || 1000} TRIX/mois · `}
                    {a.status === "partner" && a.last_trix_payout_at ? `Dernier versement ${new Date(a.last_trix_payout_at).toLocaleDateString("fr-FR")}` : `Approuvé le ${a.approved_at ? new Date(a.approved_at).toLocaleDateString("fr-FR") : "?"}`}
                  </p>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0" style={{ background: STATUS_COLOR[a.status] + "22", color: STATUS_COLOR[a.status] }}>
                  {a.status}
                </span>
                {a.status !== "revoked" && (
                  <button onClick={() => revoke(a)} className="text-white/30 hover:text-red-400 transition shrink-0 tap-sm" title="Retirer le statut">
                    <Ban className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}