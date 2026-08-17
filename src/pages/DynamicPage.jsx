import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, FileQuestion } from "lucide-react";
import BlockRenderer from "@/components/tuto-gaming/BlockRenderer";

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get("preview") === "true";

    base44.entities.DynamicPage.filter({ slug }).then(async (pages) => {
      if (!pages || pages.length === 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const p = pages[0];

      // If draft, only allow admin preview
      if (p.status !== "published") {
        let isAdmin = false;
        try {
          const user = await base44.auth.me();
          isAdmin = user?.role === "admin";
        } catch {
          isAdmin = false;
        }
        if (!isAdmin || !isPreview) {
          setNotFound(true);
          setLoading(false);
          return;
        }
      }

      setPage(p);
      // Set SEO
      document.title = p.seo_title || `${p.title} — Matrix`;
      setLoading(false);
    }).catch(() => {
      setNotFound(true);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0a0a0a" }}>
        <FileQuestion className="w-12 h-12 text-white/10" />
        <p className="text-sm text-white/40">Page introuvable</p>
        <Link to="/" className="text-xs font-bold text-[#a855f7] hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  const bgClass = page.background_type === "cosmic"
    ? "radial-gradient(ellipse at top, rgba(168,85,247,0.08), transparent 60%)"
    : page.background_type === "grid"
    ? "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)"
    : "none";

  return (
    <div className="min-h-screen relative" style={{ background: "#0a0a0a" }}>
      {page.background_type !== "default" && (
        <div className="fixed inset-0 pointer-events-none" style={{ background: bgClass, backgroundSize: page.background_type === "grid" ? "40px 40px" : undefined }} />
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20">
        {/* Preview banner */}
        {page.status === "draft" && (
          <div className="mb-6 p-3 rounded-lg flex items-center gap-2" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)" }}>
            <span className="text-[10px] font-bold text-yellow-400 uppercase">Mode aperçu — Cette page est un brouillon non publié</span>
          </div>
        )}

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">{page.title}</h1>
          {page.description && (
            <p className="text-sm text-white/50 mt-2 leading-relaxed">{page.description}</p>
          )}
        </div>

        {/* Blocks */}
        <BlockRenderer gameSlug="dynamic" pageKey={page.slug} />
      </div>
    </div>
  );
}