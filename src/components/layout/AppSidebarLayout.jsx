import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomTabs from "./BottomTabs";

export default function AppSidebarLayout() {
  return (
    <div className="min-h-screen bg-transparent text-foreground flex">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        <Outlet />
      </main>
      <BottomTabs />
    </div>
  );
}