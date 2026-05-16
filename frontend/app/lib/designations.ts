export const DEPARTMENTS = [
  "Management",
  "Development",
  "Quality Assurance",
  "Design",
  "DevOps",
] as const

export type Department = (typeof DEPARTMENTS)[number]

export const DEPARTMENT_DESIGNATIONS: Record<Department, string[]> = {
  Management: ["CTO", "CFO", "Delivery Head", "Project Manager"],
  Development: ["Architect", "Developer"],
  "Quality Assurance": ["QA Analyst"],
  Design: ["UI/UX Designer"],
  DevOps: ["DevOps Engineer"],
}

export const DESIGNATION_DEPARTMENT: Record<string, Department> = Object.entries(
  DEPARTMENT_DESIGNATIONS
).reduce(
  (acc, [dept, designations]) => {
    designations.forEach((d) => {
      acc[d] = dept as Department
    })
    return acc
  },
  {} as Record<string, Department>
)

export function getDepartmentForDesignation(designation: string): Department | undefined {
  return DESIGNATION_DEPARTMENT[designation]
}
