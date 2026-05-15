from typing import Optional
from pydantic import BaseModel


class ParsedQuery(BaseModel):
    required_skills: list[str]
    preferred_skills: list[str]
    required_seniority: Optional[str] = None
    min_years_experience: Optional[int] = None
    domain_preference: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    department: Optional[str] = None
    needs_mentor: bool = False
    role_hint: Optional[str] = None


class SkillMatch(BaseModel):
    skill_name: str
    proficiency: str
    years: Optional[int] = None
    is_required: bool
    is_inferred: bool


class CandidateResult(BaseModel):
    employee_id: int
    name: str
    designation: str
    department: str
    location: str
    work_mode: str
    seniority: str
    years_of_experience: Optional[int] = None
    domain_expertise: list[str]
    profile_complete: bool
    match_score: float
    skill_score: float
    seniority_score: float
    domain_score: float
    matched_skills: list[SkillMatch]
    missing_required_skills: list[str]
    explanation: str


class SearchRequest(BaseModel):
    query: str


class SearchResponse(BaseModel):
    query: str
    parsed_query: ParsedQuery
    total_found: int
    candidates: list[CandidateResult]
    search_note: Optional[str] = None
