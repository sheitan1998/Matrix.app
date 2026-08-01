import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Calendar, Sparkles, ArrowLeft } from "lucide-react";
import { useState } from "react";
import TwitchProfileMenu from "./TwitchProfileMenu";

export default function TwitchTopbar({ activeTab = "suivis", onTabChange }) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/twitch/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center gap-3 px-4 h-14 bg-[#0e0e10] border-b border-[#2a2a3e]">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center tap-sm transition-colors shrink-0"
        aria-label="Retour"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* Logo */}
      <Link to="/twitch" className="font-bold text-lg tracking-tight text-white shrink-0 hidden sm:block">
        MATRIX
      </Link>

      {/* Tabs: Suivis / Parcourir */}
      <div className="flex items-center gap-1 ml-2">
        <button
          onClick={() => onTabChange?.("suivis")}
          className={`px-3 py-1 text-sm font-semibold transition-colors relative tap-sm ${
            activeTab === "suivis" ? "text-white" : "text-[#a0a0b0] hover:text-white"
          }`}
        >
          Suivis
          {activeTab === "suivis" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
          )}
        </button>
        <button
          onClick={() => onTabChange?.("parcourir")}
          className={`px-3 py-1 text-sm font-semibold transition-colors relative tap-sm ${
            activeTab === "parcourir" ? "text-white" : "text-[#a0a0b0] hover:text-white"
          }`}
        >
          Parcourir
          {activeTab === "parcourir" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
          )}
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Rechercher dans la galaxie..."
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#1f1f2e] text-sm text-white placeholder:text-[#a0a0b0] border border-transparent focus:border-[#db2777] focus:outline-none transition-colors"
          />
        </div>
      </form>

      {/* Right side icons */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center tap-sm transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5 text-[#a0a0b0]" />
        </button>
        <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center tap-sm transition-colors hidden sm:flex" aria-label="Calendrier">
          <Calendar className="w-5 h-5 text-[#a0a0b0]" />
        </button>
        <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center tap-sm transition-colors hidden sm:flex" aria-label="Sparkles">
          <Sparkles className="w-5 h-5 text-[#a0a0b0]" />
        </button>
        <button className="h-8 px-3 rounded-full bg-[#db2777] hover:bg-[#db2777]/80 text-white text-xs font-semibold transition-colors tap-sm hidden md:block">
          1 mois sans pub
        </button>

        {/* Twitch profile menu */}
        <TwitchProfileMenu />
      </div>
    </header>
  );
}