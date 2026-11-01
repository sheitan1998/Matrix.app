import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { TwitchAuthProvider } from "@/context/TwitchAuthContext";
import { TwitchMiniPlayerProvider } from "@/context/TwitchMiniPlayerContext";
import TwitchTopbar from "./TwitchTopbar";
import Sidebar from "@/components/layout/Sidebar";

export default function TwitchLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "suivis";

  const handleTabChange = (tab) => {
    navigate(`/twitch?tab=${tab}`);
  };

  return (
    <TwitchAuthProvider>
      <TwitchMiniPlayerProvider>
        <div className="min-h-screen bg-transparent text-white flex flex-col">
          <TwitchTopbar activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </TwitchMiniPlayerProvider>
    </TwitchAuthProvider>
  );
}