export interface SkillSummary {
  skill_name: string
  category: string
  proficiency: 'novice' | 'intermediate' | 'expert'
  years?: number
  is_inferred: boolean
  confidence_score?: number | null
}

export interface CertificationSummary {
  name: string
  issuer: string
  issued_on: string | null
}

export interface ProjectSummary {
  name: string
  role: string
  duration: string
  domain: string
  technologies: string[]
}

export interface EmployeeCard {
  id: number
  employee_id: string
  name: string
  designation: string
  department: string
  location: string
  work_mode: string
  seniority: string
  years_of_experience: number | null
  domain_expertise: string[]
  profile_complete: boolean
  top_skills: SkillSummary[]
}

export interface EmployeePublicProfile extends EmployeeCard {
  summary: string | null
  date_of_joining: string | null
  skills: SkillSummary[]
  projects: ProjectSummary[]
  certifications: CertificationSummary[]
}

export interface PeopleListResponse {
  total: number
  page: number
  page_size: number
  employees: EmployeeCard[]
}

export interface PeopleFilterOptions {
  departments: string[]
  locations: string[]
  designations: string[]
  seniorities: string[]
  skills: string[]
}

export interface SkillBrowseEntry {
  employee_id_num: number
  employee_id: string
  name: string
  designation: string
  department: string
  location: string
  seniority: string
  proficiency: string
  years: number
}

export interface SkillBrowseResponse {
  skill_name: string
  total: number
  expert: SkillBrowseEntry[]
  intermediate: SkillBrowseEntry[]
  novice: SkillBrowseEntry[]
}

export interface ActiveFilters {
  department: string
  designation: string
  location: string
  seniority: string
  skill: string
  search: string
}
