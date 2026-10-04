import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Play, Eye, Heart, Trophy, Zap, Coins, Award, UserPlus, ArrowLeft } from "lucide-react";
import { formatViews, formatTrix, formatTimeAgo } from "@/lib/format";

export default function CreatorProfile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("shorts");

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    base44.functions.invoke("publicProfile", { pseudo: username })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.error || "Créateur introuvable");
        setLoading(false);
      });
  }, [username]);

  // SEO: update document title and meta tags
  useEffect(() => {
    if (data?.creator) {
      const c = data.creator;
      const fullName = c.pseudo || "Créateur";
      document.title = `${fullName} — Créateur MATRIX`;
      setMeta("description", `${c.bio || `Profil de ${fullName} sur MATRIX`}. Niveau ${c.level}, ${c.badge_count} badges, ${formatTrix(c.total_trix_received)} TRIX reçus.`);
      setMeta("og:title", `${fullName} — Créateur MATRIX`);
      setMeta("og:description", c.bio || `Découvrez le profil de ${fullName} sur MATRIX`);
      setMeta("og:type", "profile");
      if (c.avatar_url) setMeta("og:image", c.avatar_url);
    }
    return () => {
      document.title = "MATRIX";
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6">
        <h1 className="text-2xl font-black mb-2">Créateur introuvable</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link to="/" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>
      </div>
    );
  }

  const { creator, shorts = [], videos = [] } = data;
  const fullName = creator.pseudo || "Créateur";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--premium) / 0.1))" }}>
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-12">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-background bg-secondary shrink-0">
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-muted-foreground">
                {creator.pseudo?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {creator.pseudo}
            </h1>
            {creator.bio && (
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{creator.bio}</p>
            )}
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-glow hover:opacity-90 transition whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" /> Rejoindre MATRIX
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Zap} label="Niveau" value={creator.level} color="hsl(var(--primary))" />
          <StatCard icon={Award} label="Badges" value={creator.badge_count} color="hsl(var(--premium))" />
          <StatCard icon={Coins} label="TRIX reçus" value={formatTrix(creator.total_trix_received)} color="hsl(var(--trix-gold))" />
          <StatCard icon={Play} label="Vidéos" value={shorts.length + videos.length} color="hsl(var(--live))" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-border">
          <TabButton active={tab === "shorts"} onClick={() => setTab("shorts")} label={`Shorts (${shorts.length})`} />
          <TabButton active={tab === "videos"} onClick={() => setTab("videos")} label={`Vidéos (${videos.length})`} />
        </div>

        {/* Content grid */}
        {tab === "shorts" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {shorts.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-12">Aucun Short publié</p>
            ) : (
              shorts.map((s) => (
                <Link key={s.id} to={`/shorts`} className="group block">
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-secondary">
                    {s.thumbnail_url ? (
                      <img src={s.thumbnail_url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Play className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-xs font-bold text-white truncate">{s.title}</p>
                      <p className="text-[10px] text-white/60 flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5" /> {formatViews(s.views)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {tab === "videos" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {videos.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-12">Aucune vidéo publiée</p>
            ) : (
              videos.map((v) => (
                <Link key={v.id} to={`/watch/${v.id}`} className="group block">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
                    {v.thumbnail_url ? (
                      <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Play className="w-10 h-10" />
                      </div>
                    )}
                    {v.duration && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                        {v.duration}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-bold truncate">{v.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatViews(v.views)}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatViews(v.likes)}</span>
                      <span>{formatTimeAgo(v.created_date)}</span>
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* CTA footer */}
        <div className="mt-12 p-6 rounded-2xl text-center" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--premium) / 0.05))", border: "1px solid hsl(var(--border))" }}>
          <h2 className="text-lg font-black mb-1">Rejoins la communauté MATRIX</h2>
          <p className="text-sm text-muted-foreground mb-4">Crée ton compte gratuitement et découvre le streaming, les Shorts, le casino Nexus et plus encore.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-glow hover:opacity-90 transition"
          >
            <UserPlus className="w-4 h-4" /> Créer mon compte
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <Icon className="w-5 h-5 mb-2" style={{ color }} />
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-lg font-black mt-0.5">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 font-bold text-sm whitespace-nowrap transition ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
    >
      {label}
      {active && <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary" />}
    </button>
  );
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  // Also set og: equivalent
  if (name === "description") {
    setMeta("og:description", content);
  }
}