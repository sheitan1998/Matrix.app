import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Ticket, ChevronDown, Plus, Loader2, Lock } from "lucide-react";
import TicketConversation from "@/components/admin/TicketConversation";
import SupportTicketModal from "@/components/profile/SupportTicketModal";

const STATUS_CONFIG = {
  open: { label: "Ouvert", color: "#3b82f6" },
  in_progress: { label: "En cours", color: "#f59e0b" },
  resolved: { label: "Résolu", color: "#22C55E" },
  closed: { label: "Fermé", color: "#6b7280" },
};

export default function UserTicketList({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!user?.email) return;
    try {
      const data = await base44.entities.SupportTicket.filter(
        { user_email: user.email },
        "-created_date",
        50
      );
      setTickets(data);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Real-time: refresh ticket list when SupportTicket changes
  useEffect(() => {
    const unsub = base44.entities.SupportTicket.subscribe(() => fetchTickets());
    return unsub;
  }, [fetchTickets]);

  // Real-time: refresh when new ticket messages arrive
  useEffect(() => {
    const unsub = base44.entities.TicketMessage.subscribe(() => {
      fetchTickets();
    });
    return unsub;
  }, [fetchTickets]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white">Mes tickets ({tickets.length})</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm"
          style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Nouveau
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
      ) : tickets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 py-8 text-center">
          <Ticket className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/30">Aucun ticket. Créez-en un pour contacter le support.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => {
            const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            const isLocked = ticket.is_locked || ticket.status === "closed";
            const isOpen = expanded === ticket.id;
            return (
              <div key={ticket.id} className="rounded-lg border border-white/5 overflow-hidden" style={{ background: "#1a1a1a" }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : ticket.id)}
                  className="w-full flex items-start gap-3 p-3 text-left hover:bg-white/[0.02] transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-white truncate">{ticket.subject}</p>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0" style={{ background: `${cfg.color}20`, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      {isLocked && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: "rgba(107,114,128,0.2)", color: "#9ca3af" }}><Lock className="w-2.5 h-2.5 inline mr-0.5" />Verrouillé</span>}
                    </div>
                    <p className="text-[10px] text-white/40 truncate mt-0.5">{new Date(ticket.created_date).toLocaleString()}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-3 pb-3">
                    <TicketConversation ticket={ticket} user={user} isAdmin={false} onRefresh={fetchTickets} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <SupportTicketModal user={user} onClose={() => { setShowCreate(false); fetchTickets(); }} />
      )}
    </div>
  );
}