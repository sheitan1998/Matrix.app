import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import ProspecteursSidebar from "@/components/prospecteurs/ProspecteursSidebar";
import TopServers from "@/components/prospecteurs/TopServers";
import ServerCardGrid from "@/components/prospecteurs/ServerCardGrid";
import CreateAdModal from "@/components/prospecteurs/CreateAdModal";

export default function Prospecteurs() {
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("server");
  const [createServerType, setCreateServerType] = useState("nexus");
  const [editingAd, setEditingAd] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);

      const allAds = await base44.entities.ServerAd.list("-created_date", 200);
      setAds(allAds);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sort: boosted first, then by (votes + boosts) descending
  const sortedAds = [...ads].sort((a, b) => {
    const aScore = (a.votes || 0) + (a.boosts || 0) * 2;
    const bScore = (b.votes || 0) + (b.boosts || 0) * 2;
    if (a.is_boosted && !b.is_boosted) return -1;
    if (!a.is_boosted && b.is_boosted) return 1;
    return bScore - aScore;
  });

  const serverAds = sortedAds.filter((a) => !a.type || a.type === "server");
  const playerAds = sortedAds.filter((a) => a.type === "player");
  const nexusServers = serverAds.filter(s => s.server_type !== "discord");
  const discordServers = serverAds.filter(s => s.server_type === "discord");

  const handleVote = (adId, newVotes) => {
    setAds((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, votes: newVotes } : a))
    );
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

  const handleUpdateAd = async (data) => {
    if (!editingAd) return;
    try {
      const updated = await base44.entities.ServerAd.update(editingAd.id, data);
      setAds((prev) => prev.map((a) => (a.id === editingAd.id ? { ...a, ...updated } : a)));
      setShowCreateModal(false);
      setEditingAd(null);
      toast.success("Annonce modifiée !");
    } catch {
      toast.error("Erreur lors de la modification");
    }
  };

  const handleCreateAd = async (data) => {
    try {
      const newAd = await base44.entities.ServerAd.create({
        ...data,
        author_email: user.email,
        author_name: user.full_name || user.email.split("@")[0],
        author_avatar: user.avatar_url || "",
      });
      setAds((prev) => [newAd, ...prev]);
      setShowCreateModal(false);
      toast.success("Annonce publiée !");
    } catch {
      toast.error("Erreur lors de la création de l'annonce");
    }
  };

  const openCreateModal = (serverType = "nexus") => {
    setCreateType("server");
    setCreateServerType(serverType);
    setEditingAd(null);
    setShowCreateModal(true);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background:
          "linear-gradient(180deg, rgba(18,9,28,0.85) 0%, rgba(26,14,46,0.82) 40%, rgba(18,9,28,0.88) 100%)",
      }}
    >
      {/* Background image */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(https://media.base44.com/images/public/69e14a987a927963a9924d5a/3215bd138_Gemini_Generated_Image_fjt2ptfjt2ptfjt2.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          zIndex: 0,
        }}
      />
      {/* Dark overlay for readability */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,28,0.55) 0%, rgba(18,9,28,0.4) 50%, rgba(18,9,28,0.7) 100%)",
          zIndex: 1,
        }}
      />

      <ProspecteursHeader user={user} trixBalance={user?.trix_balance || 0} />

      <div className="relative z-10 flex max-w-7xl mx-auto pb-12">
        <ProspecteursSidebar active="servers" />

        <div className="flex-1 px-4 sm:px-6 py-5">
          {/* Back to Hub */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition mb-5 tap-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">Retour au Hub</span>
          </Link>

          {/* Upper section: Top Nexus + Top Discord rankings */}
          <div className="grid lg:grid-cols-2 gap-5 mb-6">
            <TopServers
              servers={nexusServers}
              loading={loading}
              type="nexus"
              onCreateClick={() => openCreateModal("nexus")}
              onVote={handleVote}
              onDelete={handleDeleteAd}
              onEdit={handleEditAd}
              currentUser={user}
            />
            <TopServers
              servers={discordServers}
              loading={loading}
              type="discord"
              onCreateClick={() => openCreateModal("discord")}
              onVote={handleVote}
              onDelete={handleDeleteAd}
              onEdit={handleEditAd}
              currentUser={user}
            />
          </div>

          {/* Lower section: separate scrollable panels for Nexus and Discord */}
          <div className="grid lg:grid-cols-2 gap-5">
            <ServerCardGrid
              servers={nexusServers}
              loading={loading}
              type="nexus"
              onVote={handleVote}
              onDelete={handleDeleteAd}
              onEdit={handleEditAd}
              currentUser={user}
              onCreateClick={() => openCreateModal("nexus")}
            />
            <ServerCardGrid
              servers={discordServers}
              loading={loading}
              type="discord"
              onVote={handleVote}
              onDelete={handleDeleteAd}
              onEdit={handleEditAd}
              currentUser={user}
              onCreateClick={() => openCreateModal("discord")}
            />
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateAdModal
          initialType={createType}
          initialServerType={createServerType}
          editAd={editingAd}
          onClose={() => { setShowCreateModal(false); setEditingAd(null); }}
          onSubmit={editingAd ? handleUpdateAd : handleCreateAd}
        />
      )}
    </div>
  );
}