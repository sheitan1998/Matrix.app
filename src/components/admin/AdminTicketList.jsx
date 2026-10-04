import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Clock, CheckCircle2, AlertCircle, X, Lock, Trash2, Palette, Check, XCircle, ExternalLink, Zap, Star } from "lucide-react";
import TicketConversation from "@/components/admin/TicketConversation";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";

const STATUS_CONFIG = {
  open: { label: "Ouvert", color: "#3b82f6", icon: AlertCircle },
  in_progress: { label: "En cours", color: "#f59e0b", icon: Clock },
  resolved: { label: "Résolu", color: "#22C55E", icon: CheckCircle2 },
  closed: { label: "Fermé", color: "#6b7280", icon: X },
};

const CATEGORY_LABELS = {
  bug: "Bug / Technique",
  account: "Compte / Profil",
  payment: "Paiement / Boutique",
  harassment: "Harcèlement",
  creator_request: "Statut Créateur",
  affiliate_partner: "Affilié / Partenaire",
  other: "Autre",
};

const CREATOR_CATEGORY_LABELS = {
  mods: "Mods de jeux / Véhicules",
  fortnite_maps: "Créateur de maps Fortnite",
  design: "Design / Cosmétiques",
  other: "Autre",
};

const STATUS_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "open", label: "Ouverts" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Résolus" },
  { value: "closed", label: "Fermés" },
];

export default function AdminTicketList({ tickets, user, onRefresh }) {
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [creatorFilterOnly, setCreatorFilterOnly] = useState(false);
  const [affiliateFilterOnly, setAffiliateFilterOnly] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [rejectingTicket, setRejectingTicket] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const updateStatus = async (ticket, status) => {
    try {
      await base44.functions.invoke("ticketSystem", { action: "updateStatus", ticket_id: ticket.id, status });
      toast.success("Statut mis à jour");
      onRefresh();
    } catch { toast.error("Erreur"); }
  };

  // Runs an approve/reject action, surfaces the real server error, then refreshes the list
  const runAction = async (payload, successMsg) => {
    setActionLoading(true);
    try {
      const res = await base44.functions.invoke("ticketSystem", payload);
      if (!res?.data?.success) throw new Error(res?.data?.error || "Action échouée");
      toast.success(successMsg);
      setExpanded(null);
      await onRefresh();
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || "Erreur");
    }
    setActionLoading(false);
  };

  const approveCreator = (ticket) =>
    runAction({ action: "approveCreatorRequest", ticket_id: ticket.id }, "Statut Créateur accordé !");

  const approveAffiliate = (ticket) =>
    runAction(
      { action: "approveAffiliateRequest", ticket_id: ticket.id },
      `Statut ${ticket.program_type === "partner" ? "Partenaire" : "Affilié"} accordé !`
    );

  const confirmReject = async () => {
    if (!rejectingTicket) return;
    await runAction(
      { action: "rejectCreatorRequest", ticket_id: rejectingTicket.id, reason: rejectReason.trim() },
      "Demande refusée"
    );
    setRejectingTicket(null);
    setRejectReason("");
  };

  const confirmDelete = async () => {
    if (!deletingTicket) return;
    try {
      await base44.functions.invoke("ticketSystem", { action: "deleteTicket", ticket_id: deletingTicket.id });
      toast.success("Ticket supprimé définitivement");
      setExpanded(null);
      onRefresh();
    } catch { toast.error("Erreur lors de la suppression"); }
    setDeletingTicket(null);
  };

  const filtered = tickets
    .filter(t => statusFilter === "all" || t.status === statusFilter)
    .filter(t => !creatorFilterOnly || t.category === "creator_request")
    .filter(t => !affiliateFilterOnly || t.category === "affiliate_partner");

  const sorted = [...filtered].sort((a, b) => {
    const order = { open: 0, in_progress: 1, resolved: 2, closed: 3 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return new Date(b.created_date) - new Date(a.created_date);
  });

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
      <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-sm font-black text-white">Tickets de Support ({tickets.length})</h3>
        <p className="text-[10px] text-white/40 mt-0.5">Messagerie interne · pièces jointes · verrouillage</p>
      </div>

      {/* Status + creator filters */}
      <div className="flex gap-1 px-4 py-2 overflow-x-auto no-scrollbar items-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition whitespace-nowrap tap-sm ${statusFilter === f.value ? "text-white" : "text-white/40 hover:text-white/60"}`}
            style={statusFilter === f.value ? { background: "rgba(168,85,247,0.15)" } : { background: "rgba(255,255,255,0.03)" }}
          >
            {f.label}
          </button>
        ))}
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button
          onClick={() => setCreatorFilterOnly(prev => !prev)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition whitespace-nowrap tap-sm flex items-center gap-1 ${creatorFilterOnly ? "text-white" : "text-white/40 hover:text-white/60"}`}
          style={creatorFilterOnly ? { background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)" } : { background: "rgba(255,255,255,0.03)", border: "1px solid transparent" }}
        >
          <Palette className="w-3 h-3" /> Créateur
        </button>
        <button
          onClick={() => setAffiliateFilterOnly(prev => !prev)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition whitespace-nowrap tap-sm flex items-center gap-1 ${affiliateFilterOnly ? "text-white" : "text-white/40 hover:text-white/60"}`}
          style={affiliateFilterOnly ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.4)" } : { background: "rgba(255,255,255,0.03)", border: "1px solid transparent" }}
        >
          <Zap className="w-3 h-3" /> Affilié / Partenaire
        </button>
      </div>

      <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
        {sorted.map(ticket => {
          const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
          const isOpen = expanded === ticket.id;
          const isLocked = ticket.is_locked || ticket.status === "closed";
          return (
            <div key={ticket.id} className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              <button
                onClick={() => setExpanded(isOpen ? null : ticket.id)}
                className="w-full flex items-start gap-3 p-3 text-left hover:bg-white/[0.02] transition"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  {ticket.user_avatar ? <img src={ticket.user_avatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-secondary text-white">{ticket.user_name?.[0]?.toUpperCase() || "U"}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white truncate">{ticket.subject}</p>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0" style={{ background: `${cfg.color}20`, color: cfg.color }}>
                      <cfg.icon className="w-2.5 h-2.5 inline mr-0.5" />{cfg.label}
                    </span>
                    {isLocked && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: "rgba(107,114,128,0.2)", color: "#9ca3af" }}><Lock className="w-2.5 h-2.5 inline mr-0.5" />Verrouillé</span>}
                    {ticket.priority === "urgent" && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}>URGENT</span>}
                  </div>
                  <p className="text-[10px] text-white/40 truncate">{ticket.user_name} · {CATEGORY_LABELS[ticket.category] || ticket.category}</p>
                </div>
              </button>

              {isOpen && (
                <div className="px-3 pb-4">
                  <TicketConversation ticket={ticket} user={user} isAdmin={true} onRefresh={onRefresh} />

                  {/* Affiliate/Partner request details */}
                  {ticket.category === "affiliate_partner" && (
                    <div className="mt-3 p-3 rounded-xl space-y-2" style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)" }}>
                      <div className="flex items-center gap-1.5">
                        {ticket.program_type === "partner" ? <Star className="w-3.5 h-3.5 text-purple-400" /> : <Zap className="w-3.5 h-3.5 text-purple-400" />}
                        <p className="text-xs font-black text-purple-400">Candidature {ticket.program_type === "partner" ? "Partenaire" : "Affilié"}</p>
                      </div>
                      {ticket.portfolio_links && ticket.portfolio_links.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-white/40 mb-0.5">Liens / Portfolio</p>
                          <div className="space-y-1">
                            {ticket.portfolio_links.map((link, i) => (
                              <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition">
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{link}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {ticket.creator_description && (
                        <div>
                          <p className="text-[10px] font-bold text-white/40 mb-0.5">Motivation</p>
                          <p className="text-xs text-white/80 whitespace-pre-wrap">{ticket.creator_description}</p>
                        </div>
                      )}

                      {/* Approve / Reject buttons — only if not already closed */}
                      {!isLocked && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => approveAffiliate(ticket)}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-1.5"
                            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
                          >
                            <Check className="w-3.5 h-3.5" /> Accepter
                          </button>
                          <button
                            onClick={() => { setRejectingTicket(ticket); setRejectReason(""); }}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-lg text-xs font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-40 flex items-center justify-center gap-1.5"
                            style={{ border: "1px solid rgba(239,68,68,0.4)" }}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Creator request details */}
                  {ticket.category === "creator_request" && (
                    <div className="mt-3 p-3 rounded-xl space-y-2" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
                      <div className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-green-400" />
                        <p className="text-xs font-black text-green-400">Demande de statut Créateur</p>
                      </div>
                      {ticket.creator_category && (
                        <div>
                          <p className="text-[10px] font-bold text-white/40 mb-0.5">Catégorie</p>
                          <p className="text-xs text-white/80">{CREATOR_CATEGORY_LABELS[ticket.creator_category] || ticket.creator_category}</p>
                        </div>
                      )}
                      {ticket.portfolio_links && ticket.portfolio_links.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-white/40 mb-0.5">Liens / Portfolio</p>
                          <div className="space-y-1">
                            {ticket.portfolio_links.map((link, i) => (
                              <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition">
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{link}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {ticket.creator_description && (
                        <div>
                          <p className="text-[10px] font-bold text-white/40 mb-0.5">Description</p>
                          <p className="text-xs text-white/80 whitespace-pre-wrap">{ticket.creator_description}</p>
                        </div>
                      )}

                      {/* Approve / Reject buttons — only if not already closed */}
                      {!isLocked && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => approveCreator(ticket)}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-1.5"
                            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                          >
                            <Check className="w-3.5 h-3.5" /> Accepter
                          </button>
                          <button
                            onClick={() => { setRejectingTicket(ticket); setRejectReason(""); }}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-lg text-xs font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-40 flex items-center justify-center gap-1.5"
                            style={{ border: "1px solid rgba(239,68,68,0.4)" }}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status buttons */}
                  <div className="flex gap-1.5 flex-wrap mt-3 items-center">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => updateStatus(ticket, key)}
                        disabled={ticket.status === key}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition disabled:opacity-30"
                        style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                      >
                        {cfg.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setDeletingTicket(ticket)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-red-400 transition hover:bg-red-500/10 flex items-center gap-1 ml-auto"
                      style={{ border: "1px solid rgba(239,68,68,0.3)" }}
                    >
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/30">Aucun ticket dans cette catégorie</p>
          </div>
        )}
      </div>

      {deletingTicket && (
        <ConfirmDeleteModal
          title={deletingTicket.subject}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingTicket(null)}
        />
      )}

      {rejectingTicket && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={() => setRejectingTicket(null)}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "#13101a", border: "1px solid rgba(239,68,68,0.3)" }} onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" /> Refuser la demande {rejectingTicket.category === "affiliate_partner" ? "Affilié / Partenaire" : "Créateur"}
              </h3>
              <p className="text-[10px] text-white/40 mt-0.5">{rejectingTicket.user_name} — {rejectingTicket.subject}</p>
            </div>
            <div className="p-5">
              <label className="text-xs font-bold text-white/60 mb-1.5 block">Motif du refus (optionnel)</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Expliquez pourquoi la demande est refusée..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/30 outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
              <p className="text-[10px] text-white/30 mt-1 text-right">{rejectReason.length}/500</p>
            </div>
            <div className="px-5 py-4 flex gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={() => setRejectingTicket(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white transition" style={{ background: "rgba(255,255,255,0.05)" }}>
                Annuler
              </button>
              <button
                onClick={confirmReject}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
              >
                {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}