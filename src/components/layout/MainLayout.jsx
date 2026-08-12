import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import BottomTabs from "./BottomTabs";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 pt-16 pb-20 md:pt-0 md:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomTabs />
    </div>
  );
}