import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Search, Users, Eye, ThumbsUp, Package, Map as MapIcon, Loader2 } from "lucide-react";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import ProspecteursSidebar from "@/components/prospecteurs/ProspecteursSidebar";

export default function CreatorSearch() {
  const [user, setUser] = useState(null);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
      const res = await base44.functions.invoke("serverSearch", { action: "searchCreators" });
      setCreators(res?.data?.users || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = query.trim()
    ? creators.filter((c) => (c.pseudo || "").toLowerCase().includes(query.trim().toLowerCase()))
    : creators;

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.85) 0%, rgba(26,14,46,0.82) 40%, rgba(18,9,28,0.88) 100%)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "url(/media/tuto-gaming/3215bd138_Gemini_Generated_Image_fjt2ptfjt2ptfjt2.png)", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", zIndex: 0 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.55) 0%, rgba(18,9,28,0.4) 50%, rgba(18,9,28,0.7) 100%)", zIndex: 1 }} />

      <ProspecteursHeader user={user} trixBalance={user?.trix_balance || 0} />

      <div className="relative z-10 flex max-w-7xl mx-auto pb-12">
        <ProspecteursSidebar active="creators" />

        <div className="flex-1 px-4 sm:px-6 py-5">
          <Link to="/" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition mb-5 tap-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">Retour au Hub</span>
          </Link>

          <div className="rounded-2xl p-4 sm:p-5" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.25)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4" style={{ color: "#8a4fff" }} />
              <h2 className="text-xs font-black tracking-wider uppercase text-white">Créateurs & Utilisateurs</h2>
              <span className="text-[9px] text-white/40 ml-auto">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un créateur ou un utilisateur..."
                className="w-full h-10 pl-9 pr-3 rounded-xl text-sm text-white placeholder:text-white/30 outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(138,79,255,0.2)" }}
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-white/40">Aucun créateur trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
                {filtered.map((c) => (
                  <Link
                    key={c.id}
                    to={`/profil-createur/${encodeURIComponent(c.email)}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition hover:bg-white/5"
                    style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.1)" }}
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-sm font-black text-white" style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}>
                      {c.avatar_url ? <img src={c.avatar_url} alt="" className="w-full h-full object-cover" /> : (c.pseudo?.[0]?.toUpperCase() || "?")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{c.pseudo}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {(c.mod_count > 0 || c.map_count > 0) ? (
                          <>
                            {c.mod_count > 0 && <span className="text-[9px] text-green-400 flex items-center gap-0.5"><Package className="w-2.5 h-2.5" />{c.mod_count}</span>}
                            {c.map_count > 0 && <span className="text-[9px] text-purple-400 flex items-center gap-0.5"><MapIcon className="w-2.5 h-2.5" />{c.map_count}</span>}
                            <span className="text-[9px] text-white/40 flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{c.total_views}</span>
                            <span className="text-[9px] text-white/40 flex items-center gap-0.5"><ThumbsUp className="w-2.5 h-2.5" />{c.total_likes}</span>
                          </>
                        ) : (
                          <span className="text-[9px] text-white/30">Utilisateur</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}