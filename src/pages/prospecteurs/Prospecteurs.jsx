import React, { useState, useEffect, useMemo } from "react";
import { fetchUniverseServers, detectServerType, slugify } from "@/lib/serverDirectory";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Server as ServerIcon, MessageCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import ProspecteursSidebar from "@/components/prospecteurs/ProspecteursSidebar";
import CategoryGrid from "@/components/prospecteurs/CategoryGrid";
import ServerSearchBar from "@/components/prospecteurs/ServerSearchBar";
import ServerDirectoryCard from "@/components/prospecteurs/ServerDirectoryCard";
import CreateAdModal from "@/components/prospecteurs/CreateAdModal";
import Top10Modal from "@/components/prospecteurs/Top10Modal";
import MyServersModal from "@/components/prospecteurs/MyServersModal";
import { List as ListIcon } from "lucide-react";

const TABS = [
{ id: "nexus", label: "Serveurs Nexus", icon: ServerIcon, color: "#22c55e" },
{ id: "discord", label: "Serveurs Discord", icon: MessageCircle, color: "#5865F2" }];


export default function Prospecteurs() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("nexus");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("votes_month");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("server");
  const [createServerType, setCreateServerType] = useState("nexus");
  const [editingAd, setEditingAd] = useState(null);
  const [showTop10, setShowTop10] = useState(false);
  const [showMyServers, setShowMyServers] = useState(false);
  const [myServersCount, setMyServersCount] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    base44.entities.ServerCategory.list("sort_order", 200).then((cats) => setCategories(cats || []));
  }, []);

  // Count current user's servers (for "Mes Serveurs" button visibility)
  useEffect(() => {
    if (!user) { setMyServersCount(0); return; }
    const loadCount = async () => {
      try {
        const [nexus, discord] = await Promise.all([
          fetchUniverseServers("nexus"),
          fetchUniverseServers("discord"),
        ]);
        const count = [...(nexus || []), ...(discord || [])].filter(
          (s) => s.author_email === user.email
        ).length;
        setMyServersCount(count);
      } catch { /* silent */ }
    };
    loadCount();
  }, [user]);

  // Strict isolation: only the active universe's servers are fetched from the database
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchUniverseServers(activeTab).
    then((list) => {if (active) setAds(list || []);}).
    finally(() => {if (active) setLoading(false);});
    return () => {active = false;};
  }, [activeTab]);

  const typedServers = ads;

  // Filter by category
  const categoryFiltered = useMemo(() => {
    if (!selectedCategory) return typedServers;
    return typedServers.filter((s) => {
      if (s.category_slug === selectedCategory) return true;
      const catSlug = (s.category || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      return catSlug === selectedCategory;
    });
  }, [typedServers, selectedCategory]);

  // Filter by search
  const searchFiltered = useMemo(() => {
    if (!search.trim()) return categoryFiltered;
    const q = search.trim().toLowerCase();
    return categoryFiltered.filter((s) =>
    (s.title || "").toLowerCase().includes(q) ||
    (s.description || "").toLowerCase().includes(q) ||
    (s.game || "").toLowerCase().includes(q)
    );
  }, [categoryFiltered, search]);

  // Sort
  const sortedServers = useMemo(() => {
    const arr = [...searchFiltered];
    if (sortBy === "votes_month") {
      arr.sort((a, b) => (b.votes_month || 0) + (b.boosts || 0) * 2 - ((a.votes_month || 0) + (a.boosts || 0) * 2));
    } else if (sortBy === "newest") {
      arr.sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
    } else {
      // general ranking
      arr.sort((a, b) => (b.votes || 0) + (b.boosts || 0) * 2 - ((a.votes || 0) + (a.boosts || 0) * 2));
    }
    return arr;
  }, [searchFiltered, sortBy]);

  // Category server counts
  const serverCounts = useMemo(() => {
    const counts = { all: typedServers.length };
    for (const cat of categories) {
      counts[cat.slug] = typedServers.filter((s) => s.category_slug === cat.slug || s.category === cat.name).length;
    }
    return counts;
  }, [typedServers, categories]);

  // Filtered categories for current tab
  const tabCategories = useMemo(() => {
    return categories.filter((c) => c.type === activeTab || c.type === "both");
  }, [categories, activeTab]);

  const handleVote = (adId, data) => {
    setAds((prev) => prev.map((a) => a.id === adId ? {
      ...a,
      votes: data.votes ?? a.votes,
      votes_month: data.votes_month ?? a.votes_month,
      clicks: data.clicks ?? a.clicks,
      clicks_month: data.clicks_month ?? a.clicks_month
    } : a));
  };

  const handleDeleteAd = (adId) => {
    setAds((prev) => prev.filter((a) => a.id !== adId));
  };

  const handleEditAd = (ad) => {
    setEditingAd(ad);
    setCreateType(ad.type || "server");
    setCreateServerType(ad.server_type || "nexus");
    setShowCreateModal(true);
  };

  // Server universe is always derived from the invite link (Discord invite = Discord, else Nexus)
  const withUniverse = (data) =>
  data.type === "server" ? { ...data, server_type: detectServerType(data.discord_link) } : data;
  const belongsToTab = (ad) => ad.type === "server" && ad.server_type === activeTab;

  const handleUpdateAd = async (data) => {
    if (!editingAd) return;
    try {
      const payload = withUniverse({ ...data, slug: slugify(data.title) });
      await base44.entities.ServerAd.update(editingAd.id, payload);
      setAds((prev) =>
      prev.map((a) => a.id === editingAd.id ? { ...a, ...payload } : a).filter(belongsToTab)
      );
      setShowCreateModal(false);
      setEditingAd(null);
      toast.success("Serveur modifié !");
    } catch {
      toast.error("Erreur lors de la modification");
    }
  };

  const handleCreateAd = async (data) => {
    try {
      const newAd = await base44.entities.ServerAd.create({
        ...withUniverse(data),
        slug: slugify(data.title),
        author_email: user.email,
        author_name: user.full_name || user.email.split("@")[0],
        author_avatar: user.avatar_url || "",
        api_key: crypto.randomUUID()
      });
      setAds((prev) => belongsToTab(newAd) ? [newAd, ...prev] : prev);
      setShowCreateModal(false);
      toast.success("Serveur publié !");
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const openCreateModal = (serverType = "nexus") => {
    if (!user) {
      toast.info("Connecte-toi pour publier un serveur");
      navigate("/login?returnTo=" + encodeURIComponent(window.location.pathname));
      return;
    }
    setCreateType("server");
    setCreateServerType(serverType);
    setEditingAd(null);
    setShowCreateModal(true);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedCategory(null);
    setSearch("");
  };

  const activeTabConfig = TABS.find((t) => t.id === activeTab);

  return (
    <div
      className="min-h-screen relative"
      style={{
        background:
        "linear-gradient(180deg, rgba(18,9,28,0.85) 0%, rgba(26,14,46,0.82) 40%, rgba(18,9,28,0.88) 100%)"
      }}>
      
      {/* Background image */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
          "url(/media/tuto-gaming/3215bd138_Gemini_Generated_Image_fjt2ptfjt2ptfjt2.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          zIndex: 0
        }} />
      
      {/* Dark overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
          "linear-gradient(180deg, rgba(18,9,28,0.55) 0%, rgba(18,9,28,0.4) 50%, rgba(18,9,28,0.7) 100%)",
          zIndex: 1
        }} />
      

      <ProspecteursHeader user={user} trixBalance={user?.trix_balance || 0} />

      <div className="relative z-10 flex max-w-7xl mx-auto pb-12">
        <ProspecteursSidebar active="servers" user={user} />

        <div className="flex-1 px-4 sm:px-6 py-5">
          {/* Back + Publish */}
          <div className="flex items-center justify-between mb-5">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm">
              
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold">Retour au Hub</span>
            </Link>
            <div className="flex items-center gap-2">
              {user && myServersCount > 0 && (
                <button
                  onClick={() => setShowMyServers(true)}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition hover:opacity-90 tap-sm"
                  style={{ background: "rgba(138,79,255,0.12)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.25)" }}>
                  <ListIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Mes serveurs</span>
                  <span className="sm:hidden">Mes serveurs</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-black" style={{ background: "rgba(138,79,255,0.2)" }}>{myServersCount}</span>
                </button>
              )}
              <button
                onClick={() => openCreateModal(activeTab)}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-white transition hover:opacity-90 tap-sm"
                style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", boxShadow: "0 0 12px rgba(168,85,247,0.25)" }}>
                
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Publier un serveur</span>
                <span className="sm:hidden">Publier</span>
              </button>
            </div>
          </div>

          {/* Tabs: Nexus / Discord */}
          <div className="flex gap-2 mb-5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className="flex-1 sm:flex-none h-10 px-5 rounded-xl text-xs font-black tracking-wider uppercase transition flex items-center justify-center gap-2 tap-sm"
                  style={
                  isActive ?
                  {
                    background: `${tab.color}20`,
                    color: tab.color,
                    border: `1px solid ${tab.color}50`,
                    boxShadow: `0 0 12px ${tab.color}20`
                  } :
                  {
                    background: "rgba(18,9,28,0.6)",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(138,79,255,0.1)"
                  }
                  }>
                  
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>);

            })}
            <button
              onClick={() => setShowTop10(true)}
              className="h-10 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition flex items-center justify-center gap-1.5 tap-sm ml-auto"
              style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
              
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Voir le classement</span>
              <span className="sm:hidden">Classement</span>
            </button>
          </div>

          {/* Category grid */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-black tracking-wider uppercase text-white">
                Catégories {activeTabConfig?.label}
              </h2>
              <span className="text-[9px] text-white/40 ml-auto">
                {tabCategories.length} catégorie{tabCategories.length !== 1 ? "s" : ""}
              </span>
            </div>
            <CategoryGrid
              categories={tabCategories}
              selectedSlug={selectedCategory}
              onSelect={(slug) => {
                if (slug) {
                  navigate(`/prospecteurs/category/${slug}?type=${activeTab}`);
                } else {
                  setSelectedCategory(null);
                }
              }}
              serverCounts={serverCounts}
              loading={loading} />
            
          </div>

          {/* Server list with search + sort */}
          <div
            className="rounded-2xl p-4 sm:p-5 hidden"
            style={{
              background: "rgba(18,9,28,0.6)",
              border: `1px solid ${activeTabConfig?.color}30`
            }}>
            
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-black tracking-wider uppercase text-white">
                {selectedCategory ?
                `Serveurs ${activeTabConfig?.label} - ${categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}` :
                `Tous les serveurs ${activeTabConfig?.label}`}
              </h2>
              <span className="text-[9px] text-white/40 ml-auto">
                {sortedServers.length} serveur{sortedServers.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Search + Sort bar */}
            <div className="mb-4">
              <ServerSearchBar
                search={search}
                onSearchChange={setSearch}
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultCount={sortedServers.length} />
              
            </div>

            {/* Server grid */}
            {loading ?
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) =>
              <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
              )}
              </div> :
            sortedServers.length === 0 ?
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: "rgba(18,9,28,0.4)", border: "1px dashed rgba(138,79,255,0.15)" }}>
              
                <ServerIcon className="w-8 h-8 mx-auto mb-2 text-white/20" />
                <p className="text-xs text-white/40">Aucun serveur trouvé</p>
                <button
                onClick={() => openCreateModal(activeTab)}
                className="mt-3 h-8 px-4 rounded-lg text-[10px] font-bold transition flex items-center gap-1 mx-auto tap-sm"
                style={{ background: "rgba(138,79,255,0.15)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}>
                
                  <Plus className="w-3 h-3" />
                  Publier le premier serveur
                </button>
              </div> :

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedServers.map((server, i) =>
              <ServerDirectoryCard
                key={server.id}
                server={server}
                rank={i + 1}
                onVote={handleVote}
                onDelete={handleDeleteAd}
                onEdit={handleEditAd}
                currentUser={user} />

              )}
              </div>
            }
          </div>
        </div>
      </div>

      {showTop10 &&
      <Top10Modal activeTab={activeTab} servers={ads} loading={loading} onClose={() => setShowTop10(false)} />
      }

      {showCreateModal &&
      <CreateAdModal
        initialType={createType}
        initialServerType={createServerType}
        editAd={editingAd}
        onClose={() => {setShowCreateModal(false);setEditingAd(null);}}
        onSubmit={editingAd ? handleUpdateAd : handleCreateAd} />

      }

      {showMyServers && user && (
        <MyServersModal
          user={user}
          onClose={() => setShowMyServers(false)}
          onEdit={(ad) => {
            setShowMyServers(false);
            setEditingAd(ad);
            setCreateType(ad.type || "server");
            setCreateServerType(ad.server_type || "nexus");
            setShowCreateModal(true);
          }}
        />
      )}
    </div>);

}