import {
  LayoutDashboard,
  Sparkles,
  Users,
  UsersRound,
  TrendingDown,
  BarChart3,
  UserPlus,
  ClipboardList,
  Briefcase,
  UserMinus,
  FileUp,
  User,
  Calendar,
  Settings,
  Users2,
  BookOpen,
} from "lucide-react";
import { NavSection } from "@/app/types/navigation";

export const navStructure: NavSection[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["all"],
      },
    ],
  },
  {
    label: "Discover",
    items: [
      {
        label: "AI Search",
        href: "/hr/search",
        icon: Sparkles,
        roles: ["management"],
        badge: { type: "ai" },
        description: "Natural language search",
      },
      {
        label: "Team Builder",
        href: "/hr/team-builder",
        icon: UsersRound,
        roles: ["management"],
        badge: { type: "ai" },
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        label: "People Explorer",
        href: "/people",
        icon: Users2,
        roles: ["all"],
        description: "Browse colleagues & skills",
      },
      {
        label: "Employee Directory",
        href: "/hr/employees",
        icon: Users,
        roles: ["management"],
      },
      {
        label: "Import Employees",
        href: "/hr/import",
        icon: UserPlus,
        roles: ["management"],
      },
      {
        label: "Review Queue",
        href: "/hr/review-queue",
        icon: ClipboardList,
        roles: ["management"],
        badge: { type: "count", value: 0 },
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Skill Gap Analysis",
        href: "/skill-gap",
        icon: TrendingDown,
        roles: ["all"],
        badge: { type: "ai" },
      },
      {
        label: "Skills Analytics",
        href: "/hr/analytics",
        icon: BarChart3,
        roles: ["management"],
      },
    ],
  },
  {
    label: "Projects",
    items: [
      {
        label: "All Projects",
        href: "/projects",
        icon: Briefcase,
        roles: ["all"],
      },
      {
        label: "Bench Pool",
        href: "/bench",
        icon: UserMinus,
        roles: ["management", "project_access"],
        badge: { type: "count", value: 0 },
      },
    ],
  },
  {
    label: "My Profile",
    items: [
      {
        label: "Upload Resume",
        href: "/employee/resume",
        icon: FileUp,
        roles: ["employee"],
      },
      {
        label: "My Profile",
        href: "/employee/profile",
        icon: User,
        roles: ["employee"],
      },
      {
        label: "My Projects",
        href: "/employee/projects",
        icon: Calendar,
        roles: ["employee"],
      },
    ],
  },
  {
    label: "Knowledge",
    items: [
      {
        label: "Blog & Articles",
        href: "/blog",
        icon: BookOpen,
        roles: ["all"],
        description: "Tech articles, guides, and recommended reads",
      },
      {
        label: "My Articles",
        href: "/blog/my-articles",
        icon: BookOpen,
        roles: ["all"],
      },
      {
        label: "Blog Moderation",
        href: "/hr/blog-moderation",
        icon: BookOpen,
        roles: ["management"],
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["all"],
      },
    ],
  },
];
