export interface ProjectCard {
  id: number;
  name: string;
  client?: string;
  domain?: string;
  tech_stack?: string[];
  status: 'active' | 'completed' | 'paused';
  start_date?: string;
  end_date?: string;
  team_size: number;
}

export interface AllocationMember {
  id: number;
  project_id: number;
  employee_id: number;
  allocation_percentage: number;
  role_in_project: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  employee_name: string;
  employee_designation: string;
  employee_department: string;
  employee_seniority: string;
}

export interface ProjectDetail extends ProjectCard {
  description?: string;
  links?: Record<string, string>;
  created_by?: number;
  current_team: AllocationMember[];
  past_team: AllocationMember[];
  innovations?: Innovation[];
  shortcomings?: Shortcoming[];
}

export interface BenchPoolEmployee {
  employee_id: number;
  name: string;
  designation: string;
  department: string;
  seniority: string;
  days_on_bench: number;
}

export interface Innovation {
  id: number;
  project_id: number;
  title: string;
  content: string;
  created_by: number;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Shortcoming {
  id: number;
  project_id: number;
  title: string;
  content: string;
  linked_skill?: string;
  created_by: number;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}
