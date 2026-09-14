import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import ProspecteursSidebar from "@/components/prospecteurs/ProspecteursSidebar";
import PlayerSearch from "@/components/prospecteurs/PlayerSearch";
import CreateAdModal from "@/components/prospecteurs/CreateAdModal";

export default function RechercheJoueur() {
  const { checkUserAuth } = useAuth();
  const [user, setUser] = useState(null);
  const [trixBalance, setTrixBalance] = useState(0);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
      setTrixBalance(me.trix_balance || 0);

      await base44.functions.invoke("serverSearch", { action: "cleanupExpired" }).catch(() => {});

      const allAds = await base44.entities.ServerAd.list("-created_date", 100);
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

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setAds((prev) => prev.filter((a) => !a.expires_at || new Date(a.expires_at).getTime() > now));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const sortedAds = [...ads].sort((a, b) => {
    const aScore = (a.votes || 0) + (a.boosts || 0) * 2;
    const bScore = (b.votes || 0) + (b.boosts || 0) * 2;
    if (a.is_boosted && !b.is_boosted) return -1;
    if (!a.is_boosted && b.is_boosted) return 1;
    return bScore - aScore;
  });

  const playerAds = sortedAds.filter((a) => a.type === "player");

  const handleBoost = (adId, newBoosts, newBalance) => {
    setAds((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, boosts: newBoosts, is_boosted: true } : a))
    );
    setTrixBalance(newBalance);
    checkUserAuth();
  };

  const handleDeleteAd = (adId) => {
    setAds((prev) => prev.filter((a) => a.id !== adId));
  };

  const handleEditAd = (ad) => {
    setEditingAd(ad);
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
        type: "player",
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
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(/media/tuto-gaming/3215bd138_Gemini_Generated_Image_fjt2ptfjt2ptfjt2.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          zIndex: 0,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,28,0.55) 0%, rgba(18,9,28,0.4) 50%, rgba(18,9,28,0.7) 100%)",
          zIndex: 1,
        }}
      />

      <ProspecteursHeader user={user} trixBalance={trixBalance} />

      <div className="relative z-10 flex max-w-7xl mx-auto pb-12">
        <ProspecteursSidebar active="players" />

        <div className="flex-1 px-4 sm:px-6 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition mb-5 tap-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">Retour au Hub</span>
          </Link>

          <PlayerSearch
            players={playerAds}
            loading={loading}
            currentUser={user}
            onDelete={handleDeleteAd}
            onBoost={handleBoost}
            onEdit={handleEditAd}
            trixBalance={trixBalance}
            onPostClick={() => { setEditingAd(null); setShowCreateModal(true); }}
          />
        </div>
      </div>

      {showCreateModal && (
        <CreateAdModal
          initialType="player"
          editAd={editingAd}
          onClose={() => { setShowCreateModal(false); setEditingAd(null); }}
          onSubmit={editingAd ? handleUpdateAd : handleCreateAd}
        />
      )}
    </div>
  );
}