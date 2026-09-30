import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Flag, Trash2, Ban, AlertCircle, CheckCircle, XCircle, Eye, User } from "lucide-react";
import { toast } from "sonner";
import UserProfilePopup from "@/components/profile/UserProfilePopup";

const REASON_LABELS = {
  nudity: "Nudité / Contenu sexuel",
  violence: "Violence",
  hate_speech: "Discours haineux",
  harassment: "Harcèlement",
  spam: "Spam",
  illegal: "Contenu illégal",
  other: "Autre",
};

const REASON_COLORS = {
  nudity: "#ec4899",
  violence: "#ef4444",
  hate_speech: "#f97316",
  harassment: "#f59e0b",
  spam: "#3b82f6",
  illegal: "#dc2626",
  other: "#a855f7",
};

const STATUS_LABELS = {
  pending: "En attente",
  reviewing: "En cours d'examen",
  actioned: "Traité",
  dismissed: "Ignoré",
};

const ACTION_LABELS = {
  none: "Aucune action",
  content_removed: "Contenu supprimé",
  user_warned: "Utilisateur averti",
  user_banned: "Utilisateur banni",
  user_muted: "Utilisateur muté",
};

export default function ContentModerationPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selectedReport, setSelectedReport] = useState(null);
  const [profileUserId, setProfileUserId] = useState(null);

  const loadReports = async () => {
    try {
      const query = filter === "all" ? {} : { status: filter };
      const data = await base44.entities.ContentReport.filter(query, "-created_date", 100);
      setReports(data || []);
    } catch {
      toast.error("Erreur lors du chargement des signalements");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, [filter]);

  const updateReport = async (reportId, updates) => {
    try {
      await base44.entities.ContentReport.update(reportId, updates);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, ...updates } : r));
      if (selectedReport?.id === reportId) {
        setSelectedReport(prev => ({ ...prev, ...updates }));
      }
      toast.success("Signalement mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteContent = async (report) => {
    const entityType = mapContentTypeToEntity(report.content_type);
    if (!entityType) {
      toast.error("Type de contenu non supprimable automatiquement");
      return;
    }
    try {
      await base44.entities[entityType].delete(report.content_id);
      await updateReport(report.id, {
        status: "actioned",
        action_taken: "content_removed",
        resolved_at: new Date().toISOString(),
        admin_notes: (report.admin_notes || "") + "\n[Auto] Contenu supprimé.",
      });
      toast.success("Contenu supprimé et signalement traité");
    } catch {
      toast.error("Impossible de supprimer ce contenu (peut être déjà supprimé)");
    }
  };

  const banUser = async (report) => {
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "searchUser", email: report.author_email });
      const userId = res?.data?.user?.id;
      if (!userId) {
        toast.error("Utilisateur introuvable");
        return;
      }
      await base44.entities.User.update(userId, { is_banned: true });
      await updateReport(report.id, {
        status: "actioned",
        action_taken: "user_banned",
        resolved_at: new Date().toISOString(),
      });
      toast.success("Utilisateur banni");
    } catch {
      toast.error("Erreur lors du bannissement");
    }
  };

  const muteUser = async (report) => {
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "searchUser", email: report.author_email });
      const userId = res?.data?.user?.id;
      if (!userId) {
        toast.error("Utilisateur introuvable");
        return;
      }
      await base44.entities.User.update(userId, { is_muted: true });
      await updateReport(report.id, {
        status: "actioned",
        action_taken: "user_muted",
        resolved_at: new Date().toISOString(),
      });
      toast.success("Utilisateur muté");
    } catch {
      toast.error("Erreur lors du muting");
    }
  };

  const pendingCount = reports.filter(r => r.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-tight">Modération de contenu</h2>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: "#ef4444" }}>{pendingCount}</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["pending", "reviewing", "actioned", "dismissed", "all"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filter === s ? "text-white" : "text-white/40 hover:text-white/60"}`}
            style={filter === s ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.03)", border: "1px solid transparent" }}
          >
            {STATUS_LABELS[s] || "Tous"}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-white/10 rounded-full animate-spin" style={{ borderTopColor: "#a855f7" }} />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-8 h-8 text-green-400/30 mx-auto mb-2" />
          <p className="text-sm text-white/40">Aucun signalement dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map(report => (
            <div
              key={report.id}
              className="rounded-2xl p-4"
              style={{ background: "rgba(15,10,25,0.6)", border: `1px solid ${report.status === "pending" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: REASON_COLORS[report.reason] || "#a855f7" }}>
                      {REASON_LABELS[report.reason] || report.reason}
                    </span>
                    <span className="text-[10px] text-white/30">{report.content_type?.replace(/_/g, " ")}</span>
                    <span className="text-[10px] text-white/30">•</span>
                    <span className="text-[10px] text-white/30">{new Date(report.created_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-xs text-white/60 mb-1">
                    Signalé par <span className="text-white/80 font-bold">{report.reporter_name || report.reporter_email?.split("@")[0]}</span>
                  </p>
                  {report.content_preview && (
                    <div className="mt-2 p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.3)" }}>
                      {report.content_preview.startsWith("http") ? (
                        <img src={report.content_preview} alt="Aperçu" className="max-h-32 rounded-lg" />
                      ) : (
                        <p className="text-xs text-white/50 italic">"{report.content_preview}"</p>
                      )}
                    </div>
                  )}
                  {report.description && (
                    <p className="text-[11px] text-white/40 mt-1">{report.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {report.author_email && (
                      <button
                        onClick={() => setProfileUserId(report.author_email)}
                        className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        <User className="w-3 h-3" /> Auteur: {report.author_name || report.author_email.split("@")[0]}
                      </button>
                    )}
                    <span className="text-[10px] text-white/20">•</span>
                    <span className="text-[10px] text-white/40">Statut: {STATUS_LABELS[report.status]}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {report.status !== "actioned" && report.status !== "dismissed" && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => deleteContent(report)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-red-400 transition hover:bg-red-500/10 flex items-center gap-1"
                    style={{ border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <Trash2 className="w-3 h-3" /> Supprimer le contenu
                  </button>
                  <button
                    onClick={() => muteUser(report)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-yellow-400 transition hover:bg-yellow-500/10"
                    style={{ border: "1px solid rgba(245,158,11,0.2)" }}
                  >
                    <AlertCircle className="w-3 h-3" /> Muter l'utilisateur
                  </button>
                  <button
                    onClick={() => banUser(report)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-red-400 transition hover:bg-red-500/10"
                    style={{ border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <Ban className="w-3 h-3" /> Bannir
                  </button>
                  <button
                    onClick={() => updateReport(report.id, { status: "dismissed", resolved_at: new Date().toISOString() })}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white/40 transition hover:text-white/60"
                  >
                    <XCircle className="w-3 h-3" /> Ignorer
                  </button>
                </div>
              )}
              {report.action_taken && report.action_taken !== "none" && (
                <div className="mt-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] text-green-400 font-bold">{ACTION_LABELS[report.action_taken]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {profileUserId && (
        <UserProfilePopup
          userEmail={profileUserId}
          open={!!profileUserId}
          onClose={() => setProfileUserId(null)}
        />
      )}
    </div>
  );
}

function mapContentTypeToEntity(contentType) {
  const map = {
    post: "Post",
    server_message: "ServerMessage",
    direct_message: "DirectMessage",
    short: "Short",
    video: "Video",
    comment: "Comment",
    listing: "Listing",
    fortnite_map: "FortniteMap",
  };
  return map[contentType] || null;
}