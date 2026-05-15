export interface ParsedQuery {
  required_skills: string[];
  preferred_skills: string[];
  required_seniority: string | null;
  min_years_experience: number | null;
  domain_preference: string | null;
  location: string | null;
  work_mode: string | null;
  department: string | null;
  needs_mentor: boolean;
  role_hint: string | null;
}

export interface SkillMatch {
  skill_name: string;
  proficiency: string;
  years: number | null;
  is_required: boolean;
  is_inferred: boolean;
}

export interface CandidateResult {
  employee_id: number;
  name: string;
  designation: string;
  department: string;
  location: string;
  work_mode: string;
  seniority: string;
  years_of_experience: number | null;
  domain_expertise: string[];
  profile_complete: boolean;
  match_score: number;
  skill_score: number;
  seniority_score: number;
  domain_score: number;
  matched_skills: SkillMatch[];
  missing_required_skills: string[];
  explanation: string;
}

export interface SearchRequest {
  query: string;
}

export interface SearchResponse {
  query: string;
  parsed_query: ParsedQuery;
  total_found: number;
  candidates: CandidateResult[];
  search_note: string | null;
}
