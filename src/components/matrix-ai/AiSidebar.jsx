import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MessageSquare, Trash2, Plus, X, Sparkles, Plug } from "lucide-react";

function relativeDate(value) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export default function AiSidebar({
  conversations = [],
  activeId,
  onSelect,
  onNew,
  onDelete,
  loading,
  mobileOpen,
  onCloseMobile,
  guest = false,
  onLogin,
  onOpenConnectors,
}) {
  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Fermer l'historique"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}
      <aside
        className={`${mobileOpen ? "fixed inset-y-0 left-0 z-50 flex" : "hidden"} md:flex flex-col w-72 shrink-0 h-full`}
        style={{
          background: "linear-gradient(180deg, rgba(15,8,26,0.98) 0%, rgba(11,6,20,0.98) 100%)",
          borderRight: "1px solid rgba(138,79,255,0.18)",
        }}
      >
        <div className="flex items-center justify-between px-3 pt-4 pb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
            Discussions
          </span>
          <button
            onClick={onCloseMobile}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white tap-sm"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={onNew}
            className="w-full h-10 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #8a4fff, #6d28d9)",
              color: "#fff",
              boxShadow: "0 0 18px rgba(138,79,255,0.35)",
            }}
          >
            <Plus className="w-4 h-4" /> Nouvelle discussion
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-1">
          {loading ? (
            <div className="space-y-2 px-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "rgba(138,79,255,0.06)" }} />
              ))}
            </div>
          ) : guest ? (
            <div className="px-3 py-6 space-y-3">
              <p className="text-[11px] text-white/30 leading-relaxed">
                Connecte-toi pour retrouver tes discussions : elles sont privées et liées à ton compte.
              </p>
              <button
                onClick={onLogin}
                className="w-full h-9 rounded-lg text-[11px] font-black text-white tap-sm"
                style={{ background: "rgba(138,79,255,0.25)", border: "1px solid rgba(138,79,255,0.4)" }}
              >
                Se connecter
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-3 py-6 text-[11px] text-white/30 leading-relaxed">
              Aucune discussion pour le moment. Lance-toi avec un prompt rapide.
            </p>
          ) : (
            conversations.map((conversation) => {
              const active = conversation.id === activeId;
              return (
                <div
                  key={conversation.id}
                  className="group flex items-center gap-1 rounded-lg transition"
                  style={
                    active
                      ? { background: "rgba(138,79,255,0.18)", border: "1px solid rgba(138,79,255,0.35)" }
                      : { background: "transparent", border: "1px solid transparent" }
                  }
                >
                  <button
                    onClick={() => onSelect(conversation)}
                    className="flex-1 min-w-0 text-left px-2.5 py-2 flex items-start gap-2 tap-sm"
                  >
                    <MessageSquare
                      className="w-3.5 h-3.5 mt-0.5 shrink-0"
                      style={{ color: active ? "#c4b5fd" : "rgba(255,255,255,0.3)" }}
                    />
                    <span className="min-w-0">
                      <span
                        className={`block text-[11px] font-bold truncate ${active ? "text-white" : "text-white/70"}`}
                      >
                        {conversation.title}
                      </span>
                      <span className="block text-[9px] text-white/30 mt-0.5">
                        {relativeDate(conversation.last_message_at || conversation.updated_date)}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => onDelete(conversation)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-7 h-7 mr-1 rounded-md flex items-center justify-center text-white/30 hover:text-red-400 transition tap-sm"
                    aria-label={`Supprimer ${conversation.title}`}
                    title="Supprimer la discussion"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="px-3 pb-4 pt-2 space-y-1.5" style={{ borderTop: "1px solid rgba(138,79,255,0.12)" }}>
          {!guest && (
            <button
              onClick={onOpenConnectors}
              className="w-full h-9 rounded-lg text-[11px] font-black text-white flex items-center justify-center gap-2 transition hover:brightness-125 tap-sm"
              style={{ background: "rgba(138,79,255,0.18)", border: "1px solid rgba(138,79,255,0.4)" }}
            >
              <Plug className="w-3.5 h-3.5" style={{ color: "#c4b5fd" }} /> Connecteurs
            </button>
          )}
          <Link
            to="/best-serveurs"
            className="flex items-center justify-between px-2 py-2 rounded-lg text-[10px] font-bold text-white/50 hover:text-white transition tap-sm"
          >
            <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Best Serveur</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
          <Link
            to="/best-creator"
            className="flex items-center justify-between px-2 py-2 rounded-lg text-[10px] font-bold text-white/50 hover:text-white transition tap-sm"
          >
            <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Best Creator</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </aside>
    </>
  );
}