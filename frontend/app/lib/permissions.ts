import type { User } from "@/app/context/auth"
import { DEPARTMENT_DESIGNATIONS } from "@/app/lib/designations"

const MANAGEMENT_DESIGNATIONS = DEPARTMENT_DESIGNATIONS["Management"]
const PROJECT_DESIGNATIONS = ["Project Manager", "Delivery Head", "CTO", "CFO"]
const RECOMMENDED_AUTHOR_DESIGNATIONS = ["CTO", "Architect", "Delivery Head"]

export function isHROrManagement(user: User | null): boolean {
  if (!user) return false
  if (user.role === "hr") return true
  return user.designation != null && MANAGEMENT_DESIGNATIONS.includes(user.designation)
}

export function canManageProjects(user: User | null): boolean {
  if (!user) return false
  if (user.role === "hr") return true
  return user.designation != null && PROJECT_DESIGNATIONS.includes(user.designation)
}

export function canPostRecommended(user: User | null): boolean {
  if (!user) return false
  return user.designation != null && RECOMMENDED_AUTHOR_DESIGNATIONS.includes(user.designation)
}

export function canWriteArticles(user: User | null): boolean {
  return user !== null
}

export function isManagement(user: User | null): boolean {
  if (!user) return false
  return user.designation != null && MANAGEMENT_DESIGNATIONS.includes(user.designation)
}

export function getAccessLevel(user: User | null): string {
  if (!user) return "Guest"

  if (user.role === "hr") return "HR Administrator"
  if (user.designation === "CTO") return "CTO"
  if (user.designation === "CFO") return "CFO"
  if (user.designation === "Delivery Head") return "Delivery Head"
  if (user.designation === "Project Manager") return "Project Manager"
  if (user.designation === "Architect") return "Architect"

  return "Employee"
}
