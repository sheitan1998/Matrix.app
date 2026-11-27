import React, { useState, useEffect, useMemo } from "react";
import { fetchAllServers, detectServerType, slugify } from "@/lib/serverDirectory";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Server as ServerIcon, Trophy, Bell } from "lucide-react";
import { toast } from "sonner";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import ProspecteursSidebar from "@/components/prospecteurs/ProspecteursSidebar";
import CategoryGrid from "@/components/prospecteurs/CategoryGrid";
import ServerSearchBar from "@/components/prospecteurs/ServerSearchBar";
import ServerDirectoryCard from "@/components/prospecteurs/ServerDirectoryCard";
import CreateAdModal from "@/components/prospecteurs/CreateAdModal";
import Top10Modal from "@/components/prospecteurs/Top10Modal";
import MyServersModal from "@/components/prospecteurs/MyServersModal";
import ServerReminderModal from "@/components/prospecteurs/ServerReminderModal";
import VoteAutoSetupModal from "@/components/prospecteurs/VoteAutoSetupModal";
import { List as ListIcon } from "lucide-react";
import usePageSEO from "@/hooks/usePageSEO";
import SeoContentBlock from "@/components/seo/SeoContentBlock";
import SeoBreadcrumbs from "@/components/seo/SeoBreadcrumbs";
import { serverHasTag, serverTags } from "@/lib/serverTags";
import { serverPath } from "@/lib/serverSeo";
import { SITE_URL } from "@/lib/seoRoutes";
import AuthModal from "@/components/landing/AuthModal";
import { setPendingAuthAction, clearPendingAuthAction, consumePendingAuthAction } from "@/lib/pendingAuthAction";


export default function Prospecteurs() {
  usePageSEO({
    title: "Annuaire de serveurs Discord et Nexus gaming | Matrix Hub",
    description: "Trouvez un serveur Discord gaming, une communauté Nexus ou des coéquipiers : catégories, étiquettes, votes mensuels et fiches détaillées de chaque serveur.",
    path: "/best-serveurs"
  });
  const navigate = useNavigate();
  // Deep links: /best-serveurs?view=list&category=<slug>&tag=<tag>&q=<search>
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const [view, setView] = useState(() =>
  urlParams.get("view") === "list" || urlParams.get("tag") ? "list" : "categories"
  );
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(() => urlParams.get("q") || "");
  const [sortBy, setSortBy] = useState("votes_month");
  const [tagFilter, setTagFilter] = useState(() => urlParams.get("tag") || "");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("server");
  const [createServerType, setCreateServerType] = useState("nexus");
  const [editingAd, setEditingAd] = useState(null);
  const [showTop10, setShowTop10] = useState(false);
  const [showMyServers, setShowMyServers] = useState(false);
  const [myServersCount, setMyServersCount] = useState(0);
  const [showReminder, setShowReminder] = useState(false);
  const [showVoteAutoSetup, setShowVoteAutoSetup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setAuthChecked(true));
    base44.entities.ServerCategory.list("sort_order", 200).then((cats) => setCategories(cats || []));
  }, []);

  // Count current user's servers (for "Mes Serveurs" button visibility)
  useEffect(() => {
    if (!user) {setMyServersCount(0);return;}
    const loadCount = async () => {
      try {
        const all = await fetchAllServers();
        const count = (all || []).filter(
          (s) => s.author_email === user.email
        ).length;
        setMyServersCount(count);
      } catch {/* silent */}
    };
    loadCount();
  }, [user]);

  // Unified fetch: all server ads (Nexus + Discord) in one list
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAllServers().
    then((list) => {if (active) setAds(list || []);}).
    finally(() => {if (active) setLoading(false);});
    return () => {active = false;};
  }, []);

  const typedServers = ads;

  // Filter by tag (clic sur une étiquette)
  const tagFiltered = useMemo(() => {
    if (!tagFilter) return typedServers;
    return typedServers.filter((s) => serverHasTag(s, tagFilter));
  }, [typedServers, tagFilter]);

  // Filter by search (nom, description, jeu et étiquettes)
  const searchFiltered = useMemo(() => {
    if (!search.trim()) return tagFiltered;
    const q = search.trim().toLowerCase();
    return tagFiltered.filter((s) =>
    (s.title || "").toLowerCase().includes(q) ||
    (s.description || "").toLowerCase().includes(q) ||
    (s.game || "").toLowerCase().includes(q) ||
    serverTags(s).some((tag) => tag.toLowerCase().includes(q))
    );
  }, [tagFiltered, search]);

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
      counts[cat.slug] = typedServers.filter((s) =>
      s.category_slug === cat.slug ||
      s.category === cat.name ||
      Array.isArray(s.category_slugs) && s.category_slugs.includes(cat.slug) ||
      Array.isArray(s.categories) && s.categories.includes(cat.name)
      ).length;
    }
    return counts;
  }, [typedServers, categories]);

  // All categories shown in unified view
  const tabCategories = useMemo(() => categories, [categories]);

  // Meilleurs serveurs réellement chargés, pour les données structurées ItemList
  const topServersSeo = useMemo(
    () =>
    [...typedServers].
    filter((s) => s.title && (s.slug || s.id)).
    sort((a, b) => (b.votes_month || 0) + (b.boosts || 0) * 2 - ((a.votes_month || 0) + (a.boosts || 0) * 2)).
    slice(0, 10).
    map((s) => ({ name: s.title, url: SITE_URL + serverPath(s) })),
    [typedServers]
  );

  // Switch to the global server list view (optionally filtered by tag)
  const openServerList = ({ tag = "", query = "" } = {}) => {
    setTagFilter(tag);
    setSearch(query);
    setView("list");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // A category keeps its own page and ranking
  const openCategory = (categorySlug) => {
    if (categorySlug) {
      navigate(`/best-serveurs/category/${categorySlug}`);
      return;
    }
    openServerList();
  };

  const backToCategories = () => {
    setView("categories");
    setSearch("");
    setTagFilter("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
  const belongsToTab = (ad) => ad.type === "server";

  const handleUpdateAd = async (data) => {
    if (!editingAd) return;
    try {
      const payload = withUniverse({ ...data, slug: slugify(data.title) });
      const res = await base44.functions.invoke("serverSearch", {
        action: "updateAd",
        serverAdId: editingAd.id,
        data: payload
      });
      if (res.data?.error) {
        toast.error(res.data.error);
        return;
      }
      const updated = res.data?.ad || { ...editingAd, ...payload };
      setAds((prev) =>
      prev.map((a) => a.id === editingAd.id ? { ...a, ...updated } : a).filter(belongsToTab)
      );
      setShowCreateModal(false);
      setEditingAd(null);
      toast.success("Serveur modifié !");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors de la modification");
    }
  };

  const handleCreateAd = async (data) => {
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "createAd",
        data: { ...withUniverse(data), slug: slugify(data.title) }
      });
      if (res.data?.error) {
        toast.error(res.data.error);
        return;
      }
      const newAd = res.data?.ad;
      if (!newAd) {
        toast.error("Erreur lors de la création");
        return;
      }
      setAds((prev) => belongsToTab(newAd) ? [newAd, ...prev] : prev);
      setShowCreateModal(false);
      toast.success("Serveur publié !");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors de la création");
    }
  };

  const openCreateModal = () => {
    if (!user) {
      toast.info("Connecte-toi pour publier un serveur");
      setPendingAuthAction("publish");
      setShowAuth(true);
      return;
    }
    setCreateType("server");
    setCreateServerType("nexus");
    setEditingAd(null);
    setShowCreateModal(true);
  };

  // Lien direct depuis la fiche serveur : /best-serveurs?publish=1
  const [publishHandled, setPublishHandled] = useState(false);
  useEffect(() => {
    if (publishHandled || urlParams.get("publish") !== "1") return;
    if (user === null && !authChecked) return;
    setPublishHandled(true);
    window.history.replaceState({}, "", window.location.pathname);
    openCreateModal();
  }, [user, authChecked, publishHandled]);

  // Reprend l'action demandée avant la connexion (pop-up ou retour OAuth)
  useEffect(() => {
    if (!user) return;
    setShowAuth(false);
    if (consumePendingAuthAction() === "publish") openCreateModal();
  }, [user]);

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
        <ProspecteursSidebar active="servers" user={user} onConfigureVoteAuto={() => setShowVoteAutoSetup(true)} />

        <div className="flex-1 px-4 sm:px-6 py-5">
          <SeoBreadcrumbs
            items={[
            { label: "Accueil", href: "/" },
            { label: "Best Serveur" }]
            } />
          
          {/* Back + Publish */}
          <div className="flex items-center justify-between mb-5">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm">
              
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold">Retour au Hub</span>
            </Link>
            <div className="flex items-center gap-2">
              {user && myServersCount > 0 &&
              <button
                onClick={() => setShowMyServers(true)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition hover:opacity-90 tap-sm"
                style={{ background: "rgba(138,79,255,0.12)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.25)" }}>
                  <ListIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Mes serveurs</span>
                  <span className="sm:hidden">Mes serveurs</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-black" style={{ background: "rgba(138,79,255,0.2)" }}>{myServersCount}</span>
                </button>
              }
              <button
                onClick={() => openCreateModal()}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-white transition hover:opacity-90 tap-sm"
                style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", boxShadow: "0 0 12px rgba(168,85,247,0.25)" }}>
                
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Publier un serveur</span>
                <span className="sm:hidden">Publier</span>
              </button>
            </div>
          </div>

          {/* Unified header + actions */}
          <div className="flex items-center gap-2 mb-5">
            <div
              className="flex-1 h-10 px-5 rounded-xl flex items-center gap-2"
              style={{
                background: "rgba(168,85,247,0.10)",
                border: "1px solid rgba(168,85,247,0.25)"
              }}>
              
              <ServerIcon className="w-4 h-4" style={{ color: "#a855f7" }} />
              <h1 className="text-xs font-black tracking-wider uppercase text-white">Vos serveurs</h1>
              <span className="text-[9px] text-white/40 ml-1">· Nexus & Discord réunis</span>
            </div>
            <button
              onClick={() => view === "list" ? backToCategories() : openServerList()}
              className="h-10 px-3 sm:px-4 rounded-xl text-xs font-black tracking-wider uppercase transition flex items-center justify-center gap-1.5 tap-sm"
              style={view === "list" ?
              { background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.16)" } :
              { background: "rgba(168,85,247,0.18)", color: "#e9d5ff", border: "1px solid rgba(168,85,247,0.45)", boxShadow: "0 0 14px rgba(168,85,247,0.22)" }}
              title={view === "list" ? "Revenir à la grille des catégories" : "Afficher la liste complète des serveurs"}>
              
              {view === "list" ? <ArrowLeft className="w-4 h-4" /> : <ListIcon className="w-4 h-4" />}
              <span className="hidden sm:inline">{view === "list" ? "Retour aux catégories" : "Tous les serveurs"}</span>
              <span className="sm:hidden">{view === "list" ? "Catégories" : "Serveurs"}</span>
            </button>
            







            
            <button
              onClick={() => setShowTop10(true)}
              className="h-10 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition flex items-center justify-center gap-1.5 tap-sm"
              style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
              
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Voir le classement</span>
              <span className="sm:hidden">Classement</span>
            </button>
          </div>

          {/* Category grid — default view */}
          {view === "categories" &&
          <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-black tracking-wider uppercase text-white">
                  Catégories
                </h2>
                <span className="text-[9px] text-white/40 ml-auto">
                  {tabCategories.length} catégorie{tabCategories.length !== 1 ? "s" : ""}
                </span>
              </div>
              <CategoryGrid
              categories={tabCategories}
              selectedSlug={null}
              onSelect={openCategory}
              serverCounts={serverCounts}
              loading={loading} />
              
            </div>
          }

          {/* Server list view */}
          {view === "list" &&
          <div className="mb-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <button
                onClick={backToCategories}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[10px] font-bold text-white transition hover:opacity-90 tap-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Retour aux catégories
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div
                className="h-9 px-4 rounded-xl flex items-center gap-2"
                style={{ background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.25)" }}>
                  
                  <ListIcon className="w-4 h-4" style={{ color: "#a855f7" }} />
                  <h2 className="text-xs font-black tracking-wider uppercase text-white">Tous les serveurs</h2>
                </div>
                <span className="text-[9px] text-white/40 ml-auto">
                  {sortedServers.length} serveur{sortedServers.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="mb-4">
                <ServerSearchBar
                search={search}
                onSearchChange={setSearch}
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultCount={sortedServers.length}
                activeTag={tagFilter}
                onClearTag={() => setTagFilter("")} />
              
              </div>

              {loading ?
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) =>
              <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
              )}
                </div> :
            sortedServers.length === 0 ?
            <div className="rounded-xl p-8 text-center" style={{ background: "rgba(18,9,28,0.4)", border: "1px dashed rgba(138,79,255,0.15)" }}>
                  <ServerIcon className="w-8 h-8 mx-auto mb-2 text-white/20" />
                  <p className="text-xs text-white/40">Aucun serveur pour le moment</p>
                  <button
                onClick={backToCategories}
                className="mt-3 h-8 px-3 rounded-lg text-[10px] font-bold text-white tap-sm"
                style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.4)" }}>
                    
                    Revenir aux catégories
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
                onCategoryClick={openCategory}
                onTagClick={(tag) => openServerList({ tag })}
                currentUser={user} />

              )}
                </div>
            }
            </div>
          }
          















































          

          <SeoContentBlock
            eyebrow="Best Serveur"
            title="Trouvez le serveur de jeu idéal sur Matrix Hub"
            intro="Best Serveur est l'annuaire communautaire des serveurs de jeu francophones. Chaque serveur dispose d'une fiche publique avec sa description, son thème, son nombre de membres, ses votes et ses liens utiles. Les joueurs votent chaque mois pour faire remonter les communautés les plus actives, tandis que les propriétaires publient et gèrent leurs annonces, suivent leurs statistiques et recrutent de nouveaux membres."
            sections={[
            { title: "Serveurs Nexus", text: "Créez un serveur interne avec salons textuels et vocaux, rôles personnalisés, emojis et thèmes visuels, sans quitter la plateforme." },
            { title: "Serveurs Discord", text: "Découvrez des serveurs Discord francophones par jeu, ambiance ou taille de communauté, avec un lien d'invitation vérifié." },
            { title: "Votes et classement", text: "Votez une fois toutes les 2 heures par serveur préféré et consultez le classement mensuel des communautés les plus soutenues." },
            { title: "Recrutement de joueurs", text: "Publiez une annonce de recrutement ou une recherche de coéquipiers pour trouver des joueurs partageant votre style de jeu." },
            { title: "Catégories de jeux", text: "Parcourez les serveurs par catégorie : FPS, RPG, survie, sandbox, simulation, course et bien d'autres univers." },
            { title: "Boosts et visibilité", text: "Mettez en avant votre serveur grâce aux boosts et gagnez en visibilité auprès de la communauté Matrix Hub." }]
            }
            faq={[
            { question: "Comment trouver un serveur Discord gaming ?", answer: "Parcourez l'annuaire Best Serveur : les catégories regroupent les serveurs par jeu et par thème, et les étiquettes comme #Chill ou #Communauté filtrent la liste. Chaque fiche indique la description, les votes et le lien d'invitation du serveur." },
            { question: "Comment publier mon serveur sur Matrix Hub ?", answer: "Créez un compte, cliquez sur Publier un serveur puis renseignez le nom, la description, jusqu'à trois catégories, cinq étiquettes et votre lien d'invitation. La publication est gratuite et la fiche est immédiatement visible dans l'annuaire." },
            { question: "Le vote pour un serveur est-il gratuit ?", answer: "Oui. Chaque visiteur peut voter une fois toutes les 2 heures par serveur préféré, sans paiement. Les votes du mois alimentent le classement et sont remis à zéro au début de chaque mois." },
            { question: "Quelle différence entre un serveur Nexus et un serveur Discord ?", answer: "Un serveur Nexus est hébergé directement dans Matrix Hub avec ses salons textuels et vocaux. Un serveur Discord renvoie vers une communauté Discord externe via son lien d'invitation." },
            { question: "Comment mon serveur progresse dans le classement ?", answer: "Le classement combine les votes du mois et les boosts reçus. Plus votre communauté vote régulièrement, plus votre fiche remonte dans l'annuaire et dans les pages de catégorie." }]
            }
            links={[
            { href: "/best-creator", label: "Best Creator : le classement des créateurs" },
            { href: "/nexus", label: "Nexus : serveurs et salons vocaux" },
            { href: "/tuto-gaming", label: "Guides et tutoriels gaming" },
            { href: "/farming", label: "Farming Simulator 25" },
            { href: "/minecraft", label: "Minecraft" },
            { href: "/dofus", label: "Guides Dofus" },
            { href: "/rocket-league", label: "Rocket League" },
            { href: "/fortnite-maps", label: "Codes de maps Fortnite" },
            { href: "/gta-6", label: "GTA VI" },
            { href: "/about", label: "À propos de Matrix Hub" }]
            }
            itemList={topServersSeo} />
          
        </div>
      </div>

      {showTop10 &&
      <Top10Modal servers={ads} loading={loading} onClose={() => setShowTop10(false)} />
      }

      {showCreateModal &&
      <CreateAdModal
        initialType={createType}
        initialServerType={createServerType}
        editAd={editingAd}
        onClose={() => {setShowCreateModal(false);setEditingAd(null);}}
        onSubmit={editingAd ? handleUpdateAd : handleCreateAd} />

      }

      {showMyServers && user &&
      <MyServersModal
        user={user}
        onClose={() => setShowMyServers(false)}
        onEdit={(ad) => {
          setShowMyServers(false);
          setEditingAd(ad);
          setCreateType(ad.type || "server");
          setCreateServerType(ad.server_type || "nexus");
          setShowCreateModal(true);
        }} />

      }

      {showReminder &&
      <ServerReminderModal user={user} onClose={() => setShowReminder(false)} />
      }

      {showVoteAutoSetup && user &&
      <VoteAutoSetupModal user={user} onClose={() => setShowVoteAutoSetup(false)} />
      }
      <AuthModal
        open={showAuth}
        onClose={() => { setShowAuth(false); clearPendingAuthAction(); }}
        redirectTo={window.location.pathname + window.location.search}
      />
    </div>);

}