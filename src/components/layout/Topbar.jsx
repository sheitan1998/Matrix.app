import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Upload, Crown, Coins, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { formatTrix } from "@/lib/format";

export default function Topbar() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-background/85 backdrop-blur-xl border-b border-border">
      <div className="h-full flex items-center gap-4 px-4 lg:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="relative w-9 h-9 rounded-lg gradient-matrix flex items-center justify-center shadow-glow">
            <span className="font-mono font-black text-background text-lg">M</span>
          </div>
          <span className="hidden sm:block font-black text-xl tracking-tight">
            MATRIX
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
          {user && (
            <Link
              to="/trix-store"
              className="hidden md:flex items-center gap-1.5 px-3 h-9 rounded-full bg-secondary hover:bg-secondary/80 transition border border-border"
            >
              <Coins className="w-4 h-4 text-trix" />
              <span className="font-mono text-sm font-semibold">
                {formatTrix(user.trix_balance || 0)}
              </span>
            </Link>
          )}

          {user?.is_premium ? (
            <div className="hidden md:flex items-center gap-1.5 px-3 h-9 rounded-full gradient-premium">
              <Crown className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-bold">PREMIUM</span>
            </div>
          ) : (
            <Link to="/premium" className="hidden md:block">
              <Button variant="outline" size="sm" className="h-9 rounded-full border-premium/40 text-premium hover:bg-premium/10 hover:text-premium">
                <Crown className="w-4 h-4 mr-1.5" />
                Premium
              </Button>
            </Link>
          )}

          <Link to="/upload">
            <Button size="icon" variant="ghost" className="rounded-full">
              <Upload className="w-5 h-5" />
            </Button>
          </Link>
          <Button size="icon" variant="ghost" className="rounded-full">
            <Bell className="w-5 h-5" />
          </Button>

          <Link to="/profile">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm ml-1">
              {user?.full_name?.[0]?.toUpperCase() || "?"}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}