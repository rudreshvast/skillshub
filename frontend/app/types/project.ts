export interface AllocationMember {
  id: number
  project_id: number
  employee_id: number
  employee_name: string
  employee_designation: string
  employee_department: string
  employee_seniority: string
  allocation_percentage: number
  role_in_project: string
  start_date: string | null
  end_date: string | null
  notes: string | null
}

export interface AllocationCreate {
  employee_id: number
  allocation_percentage: number
  role_in_project: string
  start_date?: string | null
  end_date?: string | null
  notes?: string | null
}

export interface AllocationUpdate {
  allocation_percentage?: number
  role_in_project?: string
  start_date?: string | null
  end_date?: string | null
  notes?: string | null
}

export interface BenchEmployee {
  id: number
  name: string
  designation: string
  department: string
  location: string
  seniority: string
  current_allocation_percentage: number
}

export interface ProjectListItem {
  id: number
  name: string
  status: string
}
