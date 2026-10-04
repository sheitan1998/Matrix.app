import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Shield, Users, Ticket, AlertTriangle, FileCode, ShoppingBag, BarChart3, Download, Megaphone, Dices, Gamepad2, Flag, Sticker, Star } from "lucide-react";
import HeaderActions from "@/components/layout/HeaderActions";
import AdminUserList from "@/components/admin/AdminUserList";
import AdminTicketList from "@/components/admin/AdminTicketList";
import DynamicPageManager from "@/components/admin/DynamicPageManager";
import CosmeticItemForm from "@/components/admin/CosmeticItemForm";
import CosmeticItemList from "@/components/admin/CosmeticItemList";
import CosmeticSalesDashboard from "@/components/admin/CosmeticSalesDashboard";
import GithubDownloadsDashboard from "@/components/admin/GithubDownloadsDashboard";
import BroadcastPanel from "@/components/admin/BroadcastPanel";
import CasinoManager from "@/components/admin/CasinoManager";
import TutoGamingManager from "@/components/admin/TutoGamingManager";
import ContentModerationPanel from "@/components/admin/ContentModerationPanel";
import StickerManager from "@/components/admin/StickerManager";
import AffiliationManager from "@/components/admin/AffiliationManager";

export default function AdminPanel() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState("tickets");
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [shopRefresh, setShopRefresh] = useState(0);

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

  // Realtime subscriptions — debounced so a burst of events only triggers one reload
  const reloadTimer = useRef(null);
  const debouncedReload = () => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current);
    reloadTimer.current = setTimeout(() => loadData(), 1500);
  };

  useEffect(() => {
    if (user?.role !== "admin") return;
    const unsubUsers = base44.entities.User.subscribe(debouncedReload);
    const unsubTickets = base44.entities.SupportTicket.subscribe(debouncedReload);
    return () => {
      unsubUsers();
      unsubTickets();
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
    };
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
    { id: "tickets", label: "Support & Tickets", icon: Ticket, section: "Général" },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "casino", label: "Gestion du Casino", icon: Dices, section: "Casino & Mini-jeux" },
    { id: "tuto", label: "Tuto & Entraide Gaming", icon: Gamepad2, section: "Guides & Tutoriels" },
    { id: "shop", label: "Boutique", icon: ShoppingBag, section: "Système" },
    { id: "downloads", label: "Téléchargements", icon: Download },
    { id: "dashboard", label: "Statistiques", icon: BarChart3 },
    { id: "pages", label: "Pages Dynamiques", icon: FileCode },
    { id: "moderation", label: "Modération", icon: Flag, section: "Modération & Sécurité" },
    { id: "stickers", label: "Stickers", icon: Sticker },
    { id: "affiliates", label: "Affiliés & Partenaires", icon: Star, section: "Créateurs" },
    { id: "broadcast", label: "Annonces", icon: Megaphone },
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

        {/* Layout: vertical tabs + content */}
        <div className="flex gap-4">
          {/* Vertical tabs sidebar */}
          <div className="w-44 sm:w-48 shrink-0 space-y-1">
            {tabs.map((t, idx) => {
              const Icon = t.icon;
              const showSectionHeader = (idx === 0 && t.section) || (idx > 0 && t.section && tabs[idx - 1]?.section !== t.section);
              return (
                <React.Fragment key={t.id}>
                  {showSectionHeader && (
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20 px-3 pt-3 pb-1">{t.section}</p>
                  )}
                  <button
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${tab === t.id ? "text-white" : "text-white/40 hover:text-white/60"}`}
                    style={tab === t.id ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.03)", border: "1px solid transparent" }}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t.label}</span>
                    {t.id === "tickets" && openTickets > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: "#a855f7" }}>{openTickets}</span>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
        {tab === "tickets" && <AdminTicketList tickets={tickets} user={user} onRefresh={loadData} />}
        {tab === "users" && <AdminUserList users={users} onRefresh={loadData} />}
        {tab === "casino" && <CasinoManager />}
        {tab === "tuto" && <TutoGamingManager />}
        {tab === "pages" && <DynamicPageManager />}
        {tab === "shop" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 p-5" style={{ background: "rgba(15,10,25,0.6)" }}>
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">Ajouter un cosmétique</h3>
              <p className="text-[10px] text-white/40 mb-4">Le produit et le prix Stripe sont créés automatiquement à la soumission.</p>
              <CosmeticItemForm onSaved={() => setShopRefresh(r => r + 1)} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-3">Cosmétiques existants</h3>
              <CosmeticItemList refreshKey={shopRefresh} />
            </div>
          </div>
        )}
        {tab === "dashboard" && <CosmeticSalesDashboard />}
        {tab === "downloads" && <GithubDownloadsDashboard />}
        {tab === "broadcast" && <BroadcastPanel />}
        {tab === "moderation" && <ContentModerationPanel />}
        {tab === "stickers" && <StickerManager />}
        {tab === "affiliates" && <AffiliationManager />}
          </div>
        </div>
      </div>
    </div>
  );
}