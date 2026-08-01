import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import TopServers from "@/components/prospecteurs/TopServers";
import PlayerSearch from "@/components/prospecteurs/PlayerSearch";
import ServerCardGrid from "@/components/prospecteurs/ServerCardGrid";
import CreateAdModal from "@/components/prospecteurs/CreateAdModal";

export default function Prospecteurs() {
  const [user, setUser] = useState(null);
  const [trixBalance, setTrixBalance] = useState(0);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);

      const progressRecords = await base44.entities.UserProgress.filter({
        user_email: me.email,
      });
      if (progressRecords.length > 0) {
        setTrixBalance(progressRecords[0].coins || 0);
      }

      const allAds = await base44.entities.ServerAd.list("-created_date", 100);
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

  const topServers = sortedAds.slice(0, 10);

  const handleVote = (adId, newVotes) => {
    setAds((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, votes: newVotes } : a))
    );
  };

  const handleBoost = (adId, newBoosts, newBalance) => {
    setAds((prev) =>
      prev.map((a) =>
        a.id === adId
          ? { ...a, boosts: newBoosts, is_boosted: true }
          : a
      )
    );
    setTrixBalance(newBalance);
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

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: "linear-gradient(180deg, #12091c 0%, #1a0e2e 40%, #12091c 100%)",
      }}
    >
      {/* Background circuit lines */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(138, 79, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(138, 79, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <ProspecteursHeader user={user} trixBalance={trixBalance} />

      <div className="relative z-10 px-4 sm:px-6 lg:px-10 py-5 max-w-7xl mx-auto pb-12">
        {/* Back to Hub */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition mb-5 tap-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour au Hub</span>
        </Link>

        {/* Upper section: two columns */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-5 mb-6">
          <TopServers
            servers={topServers}
            loading={loading}
            onCreateClick={() => setShowCreateModal(true)}
          />
          <PlayerSearch onPostClick={() => setShowCreateModal(true)} />
        </div>

        {/* Lower section: server cards grid */}
        <ServerCardGrid
          servers={sortedAds}
          loading={loading}
          onVote={handleVote}
          onBoost={handleBoost}
          trixBalance={trixBalance}
        />
      </div>

      {showCreateModal && (
        <CreateAdModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAd}
        />
      )}
    </div>
  );
}