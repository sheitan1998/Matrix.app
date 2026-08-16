import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Shield, Users, Ticket, AlertTriangle, FileText, FolderTree, ArrowUpDown } from "lucide-react";
import HeaderActions from "@/components/layout/HeaderActions";
import AdminUserList from "@/components/admin/AdminUserList";
import AdminTicketList from "@/components/admin/AdminTicketList";
import AddWikiItemForm from "@/components/admin/AddWikiItemForm";
import WikiItemList from "@/components/admin/WikiItemList";
import CategoryManager from "@/components/admin/CategoryManager";
import ReorderManager from "@/components/admin/ReorderManager";

export default function AdminPanel() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState("tickets");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const loadData = async () => {
    try {
      const [allUsers, allTickets] = await Promise.all([
        base44.entities.User.list("-created_date", 200),
        base44.entities.SupportTicket.list("-created_date", 200),
      ]);
      setUsers(allUsers);
      setTickets(allTickets);
    } catch {
      /* silent */
    }
    setLoading(false);
  };

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setAuthChecked(true);
      if (u?.role !== "admin") {
        nav("/");
      } else {
        loadData();
      }
    }).catch(() => { setAuthChecked(true); nav("/"); });
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    if (user?.role !== "admin") return;
    const unsubUsers = base44.entities.User.subscribe(() => loadData());
    const unsubTickets = base44.entities.SupportTicket.subscribe(() => loadData());
    return () => { unsubUsers(); unsubTickets(); };
  }, [user?.role]);

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a050f" }}>
        <div className="w-9 h-9 border-4 border-white/10 rounded-full animate-spin" style={{ borderTopColor: "#a855f7" }} />
      </div>
    );
  }

  if (user?.role !== "admin") return null;

  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;
  const bannedUsers = users.filter(u => u.is_banned).length;
  const mutedUsers = users.filter(u => u.is_muted).length;

  const tabs = [
    { id: "tickets", label: "Support & Tickets", icon: Ticket },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "wiki", label: "Contenu Wiki", icon: FileText },
    { id: "categories", label: "Catégories", icon: FolderTree },
    { id: "reorder", label: "Ordre & Réorganisation", icon: ArrowUpDown },
  ];

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden" style={{ backgroundColor: "#0a050f" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(168,85,247,0.08), transparent 60%)" }} />

      <div className="relative z-10 min-h-screen flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <button onClick={() => nav("/")} className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:opacity-80 tap-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <ArrowLeft className="w-4 h-4 text-white/60" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)", border: "1.5px solid rgba(168,85,247,0.4)" }}>
                <Shield className="w-4 h-4" style={{ color: "#a855f7" }} />
              </div>
              <div>
                <h1 className="text-lg font-black text-white">Panel Admin</h1>
                <p className="text-[10px] text-white/40">Gestion centralisée</p>
              </div>
            </div>
          </div>
          <HeaderActions />
        </header>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Users className="w-4 h-4 mb-1.5" style={{ color: "#3b82f6" }} />
            <p className="text-[10px] text-white/40 uppercase">Utilisateurs</p>
            <p className="text-xl font-black text-white">{users.length}</p>
          </div>
          <div className="p-3 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <AlertTriangle className="w-4 h-4 mb-1.5" style={{ color: "#f59e0b" }} />
            <p className="text-[10px] text-white/40 uppercase">Mutés</p>
            <p className="text-xl font-black text-white">{mutedUsers}</p>
          </div>
          <div className="p-3 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <AlertTriangle className="w-4 h-4 mb-1.5" style={{ color: "#ef4444" }} />
            <p className="text-[10px] text-white/40 uppercase">Bannis</p>
            <p className="text-xl font-black text-white">{bannedUsers}</p>
          </div>
          <div className="p-3 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
            <Ticket className="w-4 h-4 mb-1.5" style={{ color: "#a855f7" }} />
            <p className="text-[10px] text-white/40 uppercase">Tickets ouverts</p>
            <p className="text-xl font-black text-white">{openTickets}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap tap-sm ${tab === t.id ? "text-white" : "text-white/40 hover:text-white/60"}`}
                style={tab === t.id ? { background: "rgba(168,85,247,0.15)" } : { background: "rgba(255,255,255,0.03)" }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
                {t.id === "tickets" && openTickets > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: "#a855f7" }}>{openTickets}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {tab === "tickets" && <AdminTicketList tickets={tickets} onRefresh={loadData} />}
        {tab === "users" && <AdminUserList users={users} onRefresh={loadData} />}
        {tab === "wiki" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(15,10,25,0.6)" }}>
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-4">Ajouter un élément</h3>
              <AddWikiItemForm onSaved={() => setTab("wiki")} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-3">Éléments existants</h3>
              <WikiItemList />
            </div>
          </div>
        )}
        {tab === "categories" && <CategoryManager />}
        {tab === "reorder" && <ReorderManager />}
      </div>
    </div>
  );
}