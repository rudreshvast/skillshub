import { LucideIcon } from "lucide-react"

export type NavRole = "hr" | "employee" | "management" | "project_access" | "all"

export interface NavBadge {
  type: "ai" | "count"
  value?: number
}

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: NavRole[]
  badge?: NavBadge
  description?: string
}

export interface NavSection {
  label: string
  items: NavItem[]
}
