import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import TopServers from "@/components/prospecteurs/TopServers";
import PlayerSearch from "@/components/prospecteurs/PlayerSearch";
import ServerCardGrid from "@/components/prospecteurs/ServerCardGrid";
import CreateAdModal from "@/components/prospecteurs/CreateAdModal";

export default function Prospecteurs() {
  const { checkUserAuth } = useAuth();
  const [user, setUser] = useState(null);
  const [trixBalance, setTrixBalance] = useState(0);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("server");

  const fetchData = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);

      setTrixBalance(me.trix_balance || 0);

      // Cleanup expired ads from database
      await base44.functions.invoke("serverSearch", { action: "cleanupExpired" }).catch(() => {});

      const allAds = await base44.entities.ServerAd.list("-created_date", 100);
      // Filter out expired ads (1 hour lifetime)
      const now = Date.now();
      const activeAds = allAds.filter((a) => !a.expires_at || new Date(a.expires_at).getTime() > now);
      setAds(activeAds);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Periodic check to remove expired ads from view
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setAds((prev) => prev.filter((a) => !a.expires_at || new Date(a.expires_at).getTime() > now));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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
  const topServers = serverAds.slice(0, 10);

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
    checkUserAuth();
  };

  const handleDeleteAd = (adId) => {
    setAds((prev) => prev.filter((a) => a.id !== adId));
  };

  const handleCreateAd = async (data) => {
    try {
      const newAd = await base44.entities.ServerAd.create({
        ...data,
        author_email: user.email,
        author_name: user.full_name || user.email.split("@")[0],
        author_avatar: user.avatar_url || "",
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
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
            onCreateClick={() => { setCreateType("server"); setShowCreateModal(true); }}
          />
          <PlayerSearch
            players={playerAds}
            loading={loading}
            currentUser={user}
            onDelete={handleDeleteAd}
            onBoost={handleBoost}
            trixBalance={trixBalance}
            onPostClick={() => { setCreateType("player"); setShowCreateModal(true); }}
          />
        </div>

        {/* Lower section: server cards grid */}
        <ServerCardGrid
          servers={serverAds}
          loading={loading}
          onVote={handleVote}
          onBoost={handleBoost}
          onDelete={handleDeleteAd}
          currentUser={user}
          trixBalance={trixBalance}
        />
      </div>

      {showCreateModal && (
        <CreateAdModal
          initialType={createType}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAd}
        />
      )}
    </div>
  );
}