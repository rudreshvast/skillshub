export interface EmployeeSkill {
  id: number
  skill_name: string
  category: string
  proficiency: string
  years: number
  is_inferred: boolean
  confidence_score: number | null
}

export interface EmployeeProject {
  id: number
  name: string
  role: string | null
  duration: string | null
  domain: string | null
  technologies: string[] | null
}

export interface EmployeeCertification {
  id: number
  name: string
  issuer: string | null
  issued_on: string | null
}

export interface EmployeeListItem {
  id: number
  name: string
  designation: string
  department: string
  location: string
  work_mode: string
  seniority: string
  years_of_experience: number | null
  profile_complete: boolean
  domain_expertise: string[] | null
  top_skills: string[]
}

export interface EmployeeFullProfile {
  id: number
  name: string
  designation: string
  department: string
  location: string
  work_mode: string
  seniority: string
  years_of_experience: number | null
  summary: string | null
  domain_expertise: string[] | null
  profile_complete: boolean
  date_of_joining: string | null
  employee_id: string
  skills: EmployeeSkill[]
  projects: EmployeeProject[]
  certifications: EmployeeCertification[]
}

export interface EmployeeListResponse {
  total: number
  page: number
  page_size: number
  employees: EmployeeListItem[]
}

export interface FilterOptions {
  departments: string[]
  locations: string[]
  work_modes: string[]
  seniorities: string[]
  skills: string[]
}
