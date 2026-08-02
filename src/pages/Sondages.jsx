import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Home, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import SondageCard from "@/components/sondages/SondageCard";
import CreateSondageModal from "@/components/sondages/CreateSondageModal";

export default function Sondages() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.role === "admin";

  const { data: sondages = [] } = useQuery({
    queryKey: ["sondages"],
    queryFn: () => base44.entities.Sondage.list("-created_date", 50),
  });

  const { data: allVotes = [] } = useQuery({
    queryKey: ["sondage-votes"],
    queryFn: () => base44.entities.SondageVote.list("-created_date", 500),
  });

  const { data: allReactions = [] } = useQuery({
    queryKey: ["sondage-reactions"],
    queryFn: () => base44.entities.SondageReaction.list("-created_date", 500),
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ["sondage-comments"],
    queryFn: () => base44.entities.SondageComment.list("-created_date", 500),
  });

  const handleVote = async (sondageId, choiceId) => {
    const existing = allVotes.find(v => v.sondage_id === sondageId && v.user_email === user.email);
    if (existing) {
      toast.error("Vous avez déjà voté pour ce sondage");
      return;
    }
    try {
      await base44.entities.SondageVote.create({
        sondage_id: sondageId,
        choice_id: choiceId,
        user_email: user.email,
      });
      qc.invalidateQueries({ queryKey: ["sondage-votes"] });
      toast.success("Vote enregistré !");
    } catch {
      toast.error("Erreur lors du vote");
    }
  };

  const handleReaction = async (sondageId, emoji) => {
    const existing = allReactions.find(r => r.sondage_id === sondageId && r.user_email === user.email && r.emoji === emoji);
    try {
      if (existing) {
        await base44.entities.SondageReaction.delete(existing.id);
      } else {
        await base44.entities.SondageReaction.create({
          sondage_id: sondageId,
          user_email: user.email,
          emoji,
        });
      }
      qc.invalidateQueries({ queryKey: ["sondage-reactions"] });
    } catch {
      toast.error("Erreur");
    }
  };

  const handleComment = async (sondageId, content) => {
    try {
      await base44.entities.SondageComment.create({
        sondage_id: sondageId,
        author_email: user.email,
        author_name: user.full_name || user.pseudo || user.email.split("@")[0],
        author_avatar: user.avatar_url || "",
        content,
      });
      qc.invalidateQueries({ queryKey: ["sondage-comments"] });
      toast.success("Commentaire ajouté");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await base44.entities.SondageComment.delete(commentId);
      qc.invalidateQueries({ queryKey: ["sondage-comments"] });
    } catch {
      toast.error("Erreur");
    }
  };

  const handleCreate = async (data) => {
    try {
      await base44.entities.Sondage.create({
        ...data,
        created_by_name: user.full_name || user.pseudo || user.email.split("@")[0],
        created_by_email: user.email,
      });
      qc.invalidateQueries({ queryKey: ["sondages"] });
      toast.success("Sondage créé !");
      setShowCreate(false);
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await base44.entities.Sondage.update(id, data);
      qc.invalidateQueries({ queryKey: ["sondages"] });
      toast.success("Sondage modifié !");
      setEditing(null);
      setShowCreate(false);
    } catch {
      toast.error("Erreur");
    }
  };

  const handleClose = async (id) => {
    try {
      await base44.entities.Sondage.update(id, { status: "closed" });
      qc.invalidateQueries({ queryKey: ["sondages"] });
      toast.success("Sondage fermé");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleReopen = async (id) => {
    try {
      await base44.entities.Sondage.update(id, { status: "active" });
      qc.invalidateQueries({ queryKey: ["sondages"] });
      toast.success("Sondage rouvert");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce sondage ? Cette action est irréversible.")) return;
    try {
      await base44.entities.Sondage.delete(id);
      qc.invalidateQueries({ queryKey: ["sondages"] });
      toast.success("Sondage supprimé");
    } catch {
      toast.error("Erreur");
    }
  };

  const activeSondages = sondages.filter(s => s.status !== "closed");
  const closedSondages = sondages.filter(s => s.status === "closed");

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden" style={{ backgroundColor: "#0a050f" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(168,85,247,0.08), transparent 60%)" }} />

      <div className="relative z-10 min-h-screen flex flex-col px-4 sm:px-6 lg:px-10 py-4 max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <button onClick={() => nav("/")} className="flex items-center gap-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">MATRIX</h1>
          </button>
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
                <span className="text-[10px] font-bold text-white">{user?.full_name?.[0]?.toUpperCase() || "U"}</span>
              </div>
              <span className="text-xs font-bold text-white/80">{user?.pseudo || user?.full_name || user?.email?.split("@")[0]}</span>
            </div>
          )}
        </header>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          <Link to="/" className="flex items-center gap-1 text-white/50 hover:text-white transition">
            <Home className="w-3.5 h-3.5" /> Accueil
          </Link>
          <span className="text-white/30">›</span>
          <span className="text-white font-semibold">Sondages</span>
        </div>

        {/* Title + Create */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
              <BarChart3 className="w-5 h-5" style={{ color: "#a855f7" }} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Sondages</h2>
              <p className="text-xs text-white/40">Participez et donnez votre avis</p>
            </div>
          </div>
          {isAdmin && (
            <button onClick={() => { setEditing(null); setShowCreate(true); }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
              <Plus className="w-4 h-4" /> Créer
            </button>
          )}
        </div>

        {/* Non-admin notice */}
        {!isAdmin && user && (
          <div className="mb-4 px-4 py-2.5 rounded-xl text-xs text-white/60" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            💡 Seuls les administrateurs peuvent créer des sondages. Vous pouvez voter, réagir et commenter.
          </div>
        )}

        {/* Sondages list */}
        {sondages.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
            <p className="text-white/40 text-sm">{isAdmin ? "Aucun sondage. Créez le premier !" : "Aucun sondage disponible pour le moment."}</p>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {activeSondages.length > 0 && (
              <>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Sondages actifs</p>
                {activeSondages.map(s => (
                  <SondageCard key={s.id} sondage={s} user={user} votes={allVotes} reactions={allReactions} comments={allComments} isAdmin={isAdmin}
                    onVote={handleVote} onReaction={handleReaction} onComment={handleComment} onDeleteComment={handleDeleteComment}
                    onEdit={(sondage) => { setEditing(sondage); setShowCreate(true); }} onClose={handleClose} onReopen={handleReopen} onDelete={handleDelete} />
                ))}
              </>
            )}
            {closedSondages.length > 0 && (
              <>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest pt-4">Sondages fermés</p>
                {closedSondages.map(s => (
                  <SondageCard key={s.id} sondage={s} user={user} votes={allVotes} reactions={allReactions} comments={allComments} isAdmin={isAdmin}
                    onVote={handleVote} onReaction={handleReaction} onComment={handleComment} onDeleteComment={handleDeleteComment}
                    onEdit={(sondage) => { setEditing(sondage); setShowCreate(true); }} onClose={handleClose} onReopen={handleReopen} onDelete={handleDelete} />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateSondageModal
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSubmit={editing ? (data) => handleUpdate(editing.id, data) : handleCreate}
          editing={editing}
        />
      )}
    </div>
  );
}