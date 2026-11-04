"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";

export default function AppShell({ user, admin, children }) {
  const pathname = usePathname();
  const isExplore = pathname === "/explore";

  // The sidebar state lives here so the page panels can use it too.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div
      style={{
        "--sidebar-width": sidebarCollapsed ? "76px" : "250px",
      }}
      className="relative flex h-dvh flex-col overflow-hidden bg-canvas lg:flex-row"
    >
      <AppSidebar
        user={user}
        admin={admin}
        overlay={isExplore}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="h-full min-h-0 w-full">{children}</div>
      </main>
    </div>
  );
}
