import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Clock, CheckCircle2, AlertCircle, X, Lock } from "lucide-react";
import TicketConversation from "@/components/admin/TicketConversation";

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

  const updateStatus = async (ticket, status) => {
    try {
      await base44.entities.SupportTicket.update(ticket.id, { status, is_locked: status === "closed" });
      toast.success("Statut mis à jour");
      onRefresh();
    } catch { toast.error("Erreur"); }
  };

  const filtered = statusFilter === "all" ? tickets : tickets.filter(t => t.status === statusFilter);

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

      {/* Status filters */}
      <div className="flex gap-1 px-4 py-2 overflow-x-auto no-scrollbar" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
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

                  {/* Status buttons */}
                  <div className="flex gap-1.5 flex-wrap mt-3">
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
    </div>
  );
}