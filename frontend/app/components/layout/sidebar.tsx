"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/app/context/auth";
import { useUIStore } from "@/app/context/ui";
import api from "@/app/lib/api";
import {
  LayoutDashboard,
  Sparkles,
  Users,
  BadgeCheck,
  Inbox,
  BarChart2,
  UsersRound,
  TrendingUp,
  Upload,
  Tag,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  special?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, closeSidebar, sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.role !== "hr") return;

    const fetchPendingCount = async () => {
      try {
        const response = await api.get("/resume/review-queue");
        setPendingCount(response.data.length || 0);
      } catch (error) {
        console.error("Failed to fetch pending count:", error);
      }
    };

    fetchPendingCount();

    // Only fetch once on mount
    const timer = setTimeout(fetchPendingCount, 30000); // Refetch every 30 seconds
    return () => clearTimeout(timer);
  }, [user?.role]);

  const navSections: NavSection[] = [
    {
      title: "Main",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard size={16} />,
        },
        {
          label: "AI Search",
          href: "/ai-search",
          icon: <Sparkles size={16} />,
          special: true,
        },
      ],
    },
    {
      title: "People",
      items: [
        {
          label: "Employee Directory",
          href: "/hr/employees",
          icon: <Users size={16} />,
        },
        {
          label: "Profiles",
          href: "/profiles",
          icon: <BadgeCheck size={16} />,
        },
        {
          label: "Review Queue",
          href: "/hr/review-queue",
          icon: <Inbox size={16} />,
          badge: pendingCount,
        },
      ],
    },
    {
      title: "Intelligence",
      items: [
        {
          label: "Skills Analytics",
          href: "/skills-analytics",
          icon: <BarChart2 size={16} />,
        },
        {
          label: "Team Builder",
          href: "/team-builder",
          icon: <UsersRound size={16} />,
        },
        {
          label: "Skill Gap Analysis",
          href: "/skill-gap",
          icon: <TrendingUp size={16} />,
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          label: "Import Resumes",
          href: "/hr/import",
          icon: <Upload size={16} />,
        },
        {
          label: "Skills Taxonomy",
          href: "/taxonomy",
          icon: <Tag size={16} />,
        },
      ],
    },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleNavItemClick = () => {
    closeSidebar();
  };

  const NavItem = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);

    if (item.special) {
      if (sidebarCollapsed) {
        return (
          <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
            <Link
              href={item.href}
              onClick={handleNavItemClick}
              title={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                margin: "1px 8px",
                borderRadius: "6px",
                backgroundColor: "#fff7ed",
                color: "#9a3412",
                textDecoration: "none",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#ffedd5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fff7ed";
              }}
            >
              <Sparkles size={16} />
            </Link>
          </div>
        );
      }

      return (
        <Link
          href={item.href}
          onClick={handleNavItemClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            margin: "1px 8px",
            borderRadius: "6px",
            backgroundColor: "#fff7ed",
            color: "#9a3412",
            fontWeight: "500",
            fontSize: "13px",
            textDecoration: "none",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#ffedd5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fff7ed";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={16} />
            <span>{item.label}</span>
          </div>
          <ChevronRight size={14} style={{ color: "#c2682a", opacity: 0.6 }} />
        </Link>
      );
    }

    if (sidebarCollapsed) {
      return (
        <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
          <Link
            href={item.href}
            onClick={handleNavItemClick}
            title={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              margin: "1px 8px",
              borderRadius: "6px",
              backgroundColor: active ? "#fff7ed" : "transparent",
              color: active ? "#c2682a" : "#78716c",
              textDecoration: "none",
              position: "relative",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = "#f5f0eb";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            {item.icon}
            {item.badge !== undefined && item.badge > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  backgroundColor: "#c2682a",
                  color: "white",
                  fontSize: "8px",
                  fontWeight: "700",
                  borderRadius: "9999px",
                  padding: "1px 4px",
                  minWidth: "16px",
                  textAlign: "center",
                }}
              >
                {item.badge}
              </span>
            )}
          </Link>
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        onClick={handleNavItemClick}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          margin: "1px 8px",
          borderRadius: "6px",
          backgroundColor: active ? "#fff7ed" : "transparent",
          color: active ? "#7c2d12" : "#78716c",
          fontWeight: active ? "600" : "400",
          fontSize: "13px",
          textDecoration: "none",
          position: "relative",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = "#f5f0eb";
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        {active && (
          <span
            style={{
              position: "absolute",
              left: "0px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "3px",
              height: "16px",
              backgroundColor: "#c2682a",
              borderRadius: "0px",
            }}
          />
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: active ? "#c2682a" : "inherit" }}>
            {item.icon}
          </span>
          <span>{item.label}</span>
        </div>

        {item.badge !== undefined && item.badge > 0 && (
          <span
            style={{
              marginLeft: "auto",
              backgroundColor: "#c2682a",
              color: "white",
              fontSize: "10px",
              fontWeight: "700",
              borderRadius: "9999px",
              padding: "2px 8px",
            }}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Spacer for navbar + expand button (when collapsed) */}
      <div
        style={{
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingRight: sidebarCollapsed ? "0" : "12px",
        }}
      >
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebarCollapse}
            title="Expand sidebar"
            style={{
              padding: "8px 6px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#78716c",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f0eb";
              e.currentTarget.style.color = "#7c2d12";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#78716c";
            }}
          >
            <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
          </button>
        )}
      </div>

      {/* Navigation sections */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: sidebarCollapsed ? "8px 4px" : "16px 8px",
          scrollbarWidth: "thin",
          scrollbarColor: "#a8a29e transparent",
        }}
      >
        {navSections.map((section) => (
          <div key={section.title} style={{ marginBottom: "24px" }}>
            {!sidebarCollapsed && (
              <h3
                style={{
                  padding: "0 12px",
                  marginBottom: "12px",
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#b8b0a6",
                }}
              >
                {section.title}
              </h3>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: sidebarCollapsed ? "4px" : "0",
              }}
            >
              {section.items.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section (pinned) */}
      <div style={{ borderTop: "1px solid #e5e0d8", padding: "12px 8px" }}>
        {!sidebarCollapsed && (
          <>
            <Link
              href="/settings"
              onClick={handleNavItemClick}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "6px",
                color: "#78716c",
                fontSize: "13px",
                fontWeight: "500",
                textDecoration: "none",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f0eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Settings size={16} />
              <span>Settings</span>
            </Link>

            <button
              onClick={() => {
                logout();
                closeSidebar();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "6px",
                color: "#78716c",
                fontSize: "13px",
                fontWeight: "500",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f0eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>

            <div style={{ height: "8px" }} />
          </>
        )}

        {/* Collapse button - visible only when expanded */}
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebarCollapse}
            title="Collapse sidebar"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "6px",
              backgroundColor: "#faf8f5",
              color: "#7c2d12",
              fontSize: "13px",
              fontWeight: "600",
              border: "1px solid #d4cec4",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f0eb";
              e.currentTarget.style.borderColor = "#c2682a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#faf8f5";
              e.currentTarget.style.borderColor = "#d4cec4";
            }}
          >
            <ChevronRight size={16} />
            <span>Collapse</span>
          </button>
        )}
      </div>

      <style>{`
        div::-webkit-scrollbar {
          width: 4px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: #a8a29e;
          border-radius: 2px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #78716c;
        }
        div::-webkit-scrollbar-button {
          width: 0;
          height: 0;
          display: none;
        }
      `}</style>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:flex lg:flex-col lg:z-40"
        style={{
          width: sidebarCollapsed ? "80px" : "240px",
          backgroundColor: "#faf8f5",
          borderRight: "1px solid #e5e0d8",
          transition: "width 0.3s ease",
        }}
      >
        {sidebarContent}
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 lg:hidden z-30"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className="fixed left-0 top-0 h-screen w-60 lg:hidden z-40 flex flex-col transition-transform duration-300"
        style={{
          backgroundColor: "#faf8f5",
          borderRight: "1px solid #e5e0d8",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {sidebarContent}
      </div>
    </>
  );
}
