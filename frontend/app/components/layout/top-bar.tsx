"use client";

import { useAuthStore } from "@/app/context/auth";
import { useUIStore } from "@/app/context/ui";
import { Bell, ChevronDown, Search, Menu, X, Brain } from "lucide-react";
import { useState } from "react";

export default function TopBar() {
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        width: "100%",
        height: "48px",
        backgroundColor: "#292524",
        borderBottom: "1px solid rgba(229, 224, 216, 0.2)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%", paddingLeft: "24px", paddingRight: "24px" }}>
        {/* Left: Hamburger + Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
      

          {/* Logo mark */}
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "#c2682a",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Brain size={16} style={{ color: "white" }} />
          </div>

          {/* Wordmark */}
          <span
            className="hidden sm:inline"
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "white",
            }}
          >
            Skills
            <span style={{ color: "#fed7aa" }}>Hub</span>
          </span>
        </div>

        {/* Center: Search bar (hidden on mobile) */}
        <div
          className="hidden lg:flex flex-1 mx-6"
          style={{ maxWidth: "320px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "6px",
              backgroundColor: "rgba(255,255,255,0.07)",
              width: "100%",
            }}
          >
            <Search size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
            <input
              type="text"
              placeholder="Search people, skills, projects…"
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "12px",
                color: "white",
                flex: 1,
                fontWeight: "500",
              }}
              className="placeholder-white/30"
            />
          </div>
        </div>

        {/* Right: Notifications, Divider, User */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "24px" }}>
          {/* Notification button */}
          <button
            style={{
              position: "relative",
              padding: "8px",
              color: "rgba(255,255,255,0.4)",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderRadius: "6px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.4)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Bell size={18} />
            <div
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#c2682a",
              }}
            />
          </button>

          {/* Vertical divider */}
          <div
            style={{
              width: "1px",
              height: "24px",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          />

          {/* User menu */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 8px",
                color: "rgba(255,255,255,0.7)",
                background: "none",
                border: "none",
                cursor: "pointer",
                borderRadius: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {/* Avatar circle */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "white",
                  backgroundColor: "#c2682a",
                }}
              >
                {getInitials(user?.name || "U")}
              </div>

              <div className="hidden sm:flex flex-col items-start">
                <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.9)" }}>
                  {user?.name}
                </span>
                <span style={{ fontSize: "10px", color: "#fed7aa", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {user?.role === "hr" ? "HR Manager" : "Employee"}
                </span>
              </div>

              <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: "absolute",
                  right: "0",
                  marginTop: "4px",
                  width: "192px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(28,25,23,0.07)",
                  backgroundColor: "#fffcf8",
                  padding: "8px 0",
                  zIndex: 50,
                }}
              >
                <button
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 16px",
                    fontSize: "14px",
                    color: "#9a3412",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff7ed";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
