import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Send, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";

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
  other: "Autre",
};

export default function AdminTicketList({ tickets, onRefresh }) {
  const [expanded, setExpanded] = useState(null);
  const [response, setResponse] = useState({});
  const [loading, setLoading] = useState(null);

  const updateStatus = async (ticket, status) => {
    setLoading(`status_${ticket.id}`);
    try {
      await base44.entities.SupportTicket.update(ticket.id, { status });
      toast.success("Statut mis à jour");
      onRefresh();
    } catch { toast.error("Erreur"); }
    setLoading(null);
  };

  const sendResponse = async (ticket) => {
    const msg = response[ticket.id]?.trim();
    if (!msg) { toast.error("Entrez une réponse"); return; }
    setLoading(`resp_${ticket.id}`);
    try {
      await base44.entities.SupportTicket.update(ticket.id, {
        admin_response: msg,
        status: "resolved",
        responded_at: new Date().toISOString(),
      });
      toast.success("Réponse envoyée");
      setResponse(s => ({ ...s, [ticket.id]: "" }));
      onRefresh();
    } catch { toast.error("Erreur"); }
    setLoading(null);
  };

  const sorted = [...tickets].sort((a, b) => {
    const order = { open: 0, in_progress: 1, resolved: 2, closed: 3 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return new Date(b.created_date) - new Date(a.created_date);
  });

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
      <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-sm font-black text-white">Tickets de Support ({tickets.length})</h3>
        <p className="text-[10px] text-white/40 mt-0.5">Messages des utilisateurs nécessitant une assistance</p>
      </div>

      <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
        {sorted.map(ticket => {
          const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
          const isOpen = expanded === ticket.id;
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
                    {ticket.priority === "urgent" && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}>URGENT</span>}
                  </div>
                  <p className="text-[10px] text-white/40 truncate">{ticket.user_name} · {CATEGORY_LABELS[ticket.category] || ticket.category}</p>
                </div>
              </button>

              {isOpen && (
                <div className="px-3 pb-4 space-y-3">
                  {/* User message */}
                  <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] font-bold text-white/40 mb-1">Message de l'utilisateur:</p>
                    <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
                  </div>

                  {/* Admin response (if any) */}
                  {ticket.admin_response && (
                    <div className="p-3 rounded-xl" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
                      <p className="text-[10px] font-bold text-green-400/60 mb-1">Réponse admin:</p>
                      <p className="text-xs text-white/80 whitespace-pre-wrap">{ticket.admin_response}</p>
                    </div>
                  )}

                  {/* Status buttons */}
                  <div className="flex gap-1.5 flex-wrap">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => updateStatus(ticket, key)}
                        disabled={loading === `status_${ticket.id}` || ticket.status === key}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition disabled:opacity-30"
                        style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>

                  {/* Admin response input */}
                  {ticket.status !== "closed" && (
                    <div>
                      <textarea
                        value={response[ticket.id] || ""}
                        onChange={e => setResponse(s => ({ ...s, [ticket.id]: e.target.value }))}
                        placeholder="Tapez votre réponse à l'utilisateur..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder:text-white/30 outline-none resize-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                      />
                      <button
                        onClick={() => sendResponse(ticket)}
                        disabled={loading === `resp_${ticket.id}`}
                        className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
                      >
                        {loading === `resp_${ticket.id}` ? "..." : <Send className="w-3 h-3" />}
                        Envoyer et résoudre
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/30">Aucun ticket de support</p>
          </div>
        )}
      </div>
    </div>
  );
}