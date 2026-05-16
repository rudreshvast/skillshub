"use client";

import Sidebar from "./sidebar";
import TopBar from "./top-bar";
import { useUIStore } from "@/app/context/ui";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div style={{ backgroundColor: "#f5f0eb", minHeight: "100vh" }}>
      {/* Top Bar */}
      <TopBar />

      {/* Main Layout */}
      <div style={{ display: "flex", paddingTop: "48px" }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main
          className="flex-1 overflow-auto lg:block"
          style={{
            marginLeft: sidebarCollapsed ? "80px" : "240px",
            transition: "margin-left 0.3s ease",
          }}
        >
          <div style={{ padding: "24px 28px" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
