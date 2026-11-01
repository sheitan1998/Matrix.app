import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import BottomTabs from "./BottomTabs";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isFullscreen = pathname.startsWith("/watch/") || pathname.startsWith("/live/");

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <Topbar />
      <div className="flex">
        {!isFullscreen && <Sidebar />}
        <main className={isFullscreen ? "flex-1 min-w-0" : "flex-1 min-w-0 pb-16 md:pb-0"}>
          <Outlet />
        </main>
      </div>
      {!isFullscreen && <BottomTabs />}
    </div>
  );
}