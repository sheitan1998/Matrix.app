import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Trophy, Server as ServerIcon } from "lucide-react";
import { toast } from "sonner";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import ProspecteursSidebar from "@/components/prospecteurs/ProspecteursSidebar";
import ServerDirectoryCard from "@/components/prospecteurs/ServerDirectoryCard";
import ServerSearchBar from "@/components/prospecteurs/ServerSearchBar";
import LatestServerBanner from "@/components/prospecteurs/LatestServerBanner";
import ServerRankingBlock from "@/components/prospecteurs/ServerRankingBlock";
import CreateAdModal from "@/components/prospecteurs/CreateAdModal";
import { fetchAllServers, sortByScore, slugify, detectServerType } from "@/lib/serverDirectory";
import { serverMatchesCategory } from "@/lib/serverCategories";
import { serverHasTag, serverTags } from "@/lib/serverTags";
import usePageSEO from "@/hooks/usePageSEO";
import SeoBreadcrumbs from "@/components/seo/SeoBreadcrumbs";
import SeoContentBlock from "@/components/seo/SeoContentBlock";
import { serverPath, guideLinksFor } from "@/lib/serverSeo";
import { SITE_URL } from "@/lib/seoRoutes";

export default function CategoryServers() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [servers, setServers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("votes_month");
  const [tagFilter, setTagFilter] = useState("");
  const [editingAd, setEditingAd] = useState(null);

  // SEO : métadonnées propres à la catégorie réellement chargée.
  usePageSEO({
    title: category
      ? `Serveurs ${category.name} — classement Best Serveur | Matrix Hub`
      : "Serveurs par catégorie — Best Serveur | Matrix Hub",
    description: category
      ? `Annuaire des serveurs ${category.name} classés par votes sur Matrix Hub : descriptions, liens d'invitation, nombre de membres et recrutement de joueurs.`
      : "Parcourez les serveurs de jeu par catégorie sur Matrix Hub : classements, descriptions et liens d'invitation.",
    path: `/best-serveurs/category/${slug}`,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      base44.auth.me().then(setUser).catch(() => setUser(null));

      const cats = await base44.entities.ServerCategory.filter({ slug }, "sort_order", 1);
      const cat = cats[0] || null;
      setCategory(cat);
      if (!cat) { setLoading(false); return; }

      // Unified: fetch all server ads, then keep those owning this category (multi-catégories incluses)
      const list = await fetchAllServers();
      setServers((list || []).filter((server) => serverMatchesCategory(server, { slug, name: cat.name })));
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  const top5 = useMemo(() => sortByScore(servers).slice(0, 5), [servers]);

  const visibleServers = useMemo(() => {
    let arr = servers;
    if (tagFilter) {
      arr = arr.filter((s) => serverHasTag(s, tagFilter));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter((s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q) ||
        serverTags(s).some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (sortBy === "newest") return [...arr].sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
    if (sortBy === "votes_month") return sortByScore(arr);
    return [...arr].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  }, [servers, search, sortBy, tagFilter]);

  const handleVote = (adId, data) => {
    setServers((prev) => prev.map((s) => (s.id === adId ? {
      ...s,
      votes: data.votes ?? s.votes,
      votes_month: data.votes_month ?? s.votes_month,
      clicks: data.clicks ?? s.clicks,
      clicks_month: data.clicks_month ?? s.clicks_month,
    } : s)));
  };

  const handleUpdateAd = async (data) => {
    if (!editingAd) return;
    try {
      const payload = {
        ...data,
        slug: slugify(data.title),
        server_type: detectServerType(data.discord_link),
      };
      const res = await base44.functions.invoke("serverSearch", {
        action: "updateAd",
        serverAdId: editingAd.id,
        data: payload,
      });
      if (res.data?.error) {
        toast.error(res.data.error);
        return;
      }
      const updated = res.data?.ad || { ...editingAd, ...payload };
      setServers((prev) =>
        prev
          .map((s) => (s.id === editingAd.id ? { ...s, ...updated } : s))
          .filter((s) => serverMatchesCategory(s, { slug, name: category?.name }))
      );
      setEditingAd(null);
      toast.success("Serveur modifié !");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors de la modification");
    }
  };

  if (!loading && !category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#12091c" }}>
        <ServerIcon className="w-12 h-12 text-white/20" />
        <p className="text-sm text-white/50">Catégorie introuvable</p>
        <Link to="/best-serveurs" className="h-9 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5" style={{ background: "rgba(138,79,255,0.15)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}>
          <ArrowLeft className="w-4 h-4" /> Retour à l'annuaire
        </Link>
      </div>
    );
  }

  const accentColor = "#a855f7";

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.85) 0%, rgba(26,14,46,0.82) 40%, rgba(18,9,28,0.88) 100%)" }}>
      <ProspecteursHeader user={user} trixBalance={user?.trix_balance || 0} />
      <div className="relative z-10 flex w-full pb-12 pr-2 sm:pr-4">
        <ProspecteursSidebar active="servers" />
        <div className="flex-1 px-4 sm:px-6 py-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            <button onClick={() => navigate("/best-serveurs")} className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold">Retour aux catégories</span>
            </button>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-xs font-bold text-white">{category?.name || "..."}</span>
          </div>
          <SeoBreadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Best Serveur", href: "/best-serveurs" },
              { label: category?.name || "Catégorie" },
            ]}
          />

          {/* Category banner */}
          <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden mb-5">
            {category?.image_url ? (
              <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accentColor}15, rgba(18,9,28,0.8))` }} />
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.3) 0%, rgba(18,9,28,0.9) 100%)" }} />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded uppercase mb-1" style={{ background: `${accentColor}25`, color: accentColor }}>
                  <ServerIcon className="w-2.5 h-2.5" /> Serveurs
                </span>
                <h1 className="text-lg sm:text-2xl font-black text-white">{category?.name}</h1>
                <span className="text-[10px] text-white/40">{servers.length} serveur{servers.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          {/* Top 5 of this category (same universe only) */}
          <div className="mb-5">
            <ServerRankingBlock
              title={`Top 5 ${category?.name || ""}`}
              icon={Trophy}
              servers={top5}
              accentColor={accentColor}
              loading={loading}
              emptyText="Aucun serveur classé dans cette catégorie pour le moment"
            />
          </div>

          {/* Full list */}
          <div className="rounded-2xl p-4 sm:p-5" style={{ background: "rgba(18,9,28,0.6)", border: `1px solid ${accentColor}30` }}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-black tracking-wider uppercase text-white">Tous les serveurs — {category?.name}</h2>
              <span className="text-[9px] text-white/40 ml-auto">{visibleServers.length} serveur{visibleServers.length !== 1 ? "s" : ""}</span>
            </div>
            <LatestServerBanner servers={servers} className="mb-3" />
            <div className="mb-4">
              <ServerSearchBar
                search={search}
                onSearchChange={setSearch}
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultCount={visibleServers.length}
                activeTag={tagFilter}
                onClearTag={() => setTagFilter("")}
              />
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
                ))}
              </div>
            ) : visibleServers.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: "rgba(18,9,28,0.4)", border: "1px dashed rgba(138,79,255,0.15)" }}>
                <ServerIcon className="w-8 h-8 mx-auto mb-2 text-white/20" />
                <p className="text-xs text-white/40">Aucun serveur dans cette catégorie</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleServers.map((server, i) => (
                  <ServerDirectoryCard
                    key={server.id}
                    server={server}
                    rank={i + 1}
                    onVote={handleVote}
                    onDelete={(id) => setServers((prev) => prev.filter((s) => s.id !== id))}
                    onEdit={setEditingAd}
                    onCategoryClick={(categorySlug) => {
                      if (categorySlug && categorySlug !== slug) navigate(`/best-serveurs/category/${categorySlug}`);
                    }}
                    onTagClick={(tag) => navigate(`/best-serveurs?view=list&tag=${encodeURIComponent(tag)}`)}
                    currentUser={user}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {!loading && category && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <SeoContentBlock
            eyebrow="Best Serveur"
            title={`Serveurs ${category.name} : comment choisir sa communauté`}
            intro={`Cette page rassemble ${servers.length > 0 ? `les ${servers.length} serveur${servers.length > 1 ? "s" : ""}` : "les serveurs"} de la catégorie ${category.name} référencés sur Matrix Hub. Le classement suit les votes : plus une communauté ${category.name} est soutenue, plus elle remonte dans la liste.`}
            faq={[
              { question: `Comment trouver un bon serveur ${category.name} ?`, answer: `Regardez d'abord le Top 5 ${category.name}, puis ouvrez les fiches pour lire la description, les jeux concernés et les étiquettes. Vous pouvez aussi filtrer par étiquette ou chercher un mot-clé dans la liste.` },
              { question: `Comment ajouter mon serveur dans la catégorie ${category.name} ?`, answer: `Depuis l'annuaire Best Serveur, cliquez sur Publier un serveur et choisissez ${category.name} parmi vos catégories (trois au maximum). La fiche apparaît ici dès sa publication.` },
            ]}
            links={[
              { href: "/best-serveurs", label: "Tous les serveurs Best Serveur" },
              { href: "/best-creator", label: "Best Creator" },
              ...guideLinksFor(category.name, slug),
              { href: "/tuto-gaming", label: "Guides et tutoriels gaming" },
            ]}
            itemList={top5.filter((s) => s.title && (s.slug || s.id)).map((s) => ({ name: s.title, url: SITE_URL + serverPath(s) }))}
          />
        </div>
      )}

      {editingAd && (
        <CreateAdModal
          initialType="server"
          editAd={editingAd}
          onClose={() => setEditingAd(null)}
          onSubmit={handleUpdateAd}
        />
      )}
    </div>
  );
}