import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Upload, Bell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { formatTrix } from "@/lib/format";
import YouTubeChannelProfile from "@/components/youtube/YouTubeChannelProfile";

const ROOT_ROUTES = ["/stream", "/trending", "/shorts", "/"];

export default function Topbar() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = ROOT_ROUTES.includes(location.pathname);
  const showBack = !isRoot;

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/85 backdrop-blur-xl border-b border-border">
      <div className="h-full flex items-center gap-4 px-4 lg:px-6">
        {/* Back button (all viewports, non-root routes) */}
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary transition shrink-0 select-none"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <span className="font-black text-xl tracking-tight">
            <span className="text-premium">M</span>ATRIX
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher sur MATRIX..."
              className="pl-11 h-11 bg-secondary/60 border-border rounded-full focus-visible:ring-primary/40"
            />
          </div>
        </form>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/upload">
            <Button size="icon" variant="ghost" className="rounded-full">
              <Upload className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/notifications">
            <Button size="icon" variant="ghost" className="rounded-full">
              <Bell className="w-5 h-5" />
            </Button>
          </Link>

          <YouTubeChannelProfile />
        </div>
      </div>
    </header>
  );
}