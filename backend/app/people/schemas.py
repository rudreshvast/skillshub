from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional


class SkillSummary(BaseModel):
    skill_name: str
    category: str
    proficiency: str
    years: int
    is_inferred: bool

    model_config = ConfigDict(from_attributes=True)


class CertificationSummary(BaseModel):
    name: str
    issuer: str
    issued_on: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectSummary(BaseModel):
    name: str
    role: str
    duration: str
    domain: str
    technologies: list[str]

    model_config = ConfigDict(from_attributes=True)


class EmployeeCard(BaseModel):
    id: int
    employee_id: str
    name: str
    designation: str
    department: str
    location: str
    work_mode: str
    seniority: str
    years_of_experience: Optional[int] = None
    domain_expertise: list[str] = []
    profile_complete: bool
    top_skills: list[SkillSummary] = []

    model_config = ConfigDict(from_attributes=True)


class EmployeePublicProfile(BaseModel):
    id: int
    employee_id: str
    name: str
    designation: str
    department: str
    location: str
    work_mode: str
    seniority: str
    years_of_experience: Optional[int] = None
    domain_expertise: list[str] = []
    summary: Optional[str] = None
    profile_complete: bool
    date_of_joining: Optional[date] = None
    skills: list[SkillSummary] = []
    projects: list[ProjectSummary] = []
    certifications: list[CertificationSummary] = []

    model_config = ConfigDict(from_attributes=True)


class PeopleListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    employees: list[EmployeeCard]


class PeopleFilterOptions(BaseModel):
    departments: list[str]
    locations: list[str]
    designations: list[str]
    seniorities: list[str]
    skills: list[str]


class SkillBrowseEntry(BaseModel):
    employee_id_num: int
    employee_id: str
    name: str
    designation: str
    department: str
    location: str
    seniority: str
    proficiency: str
    years: int


class SkillBrowseResponse(BaseModel):
    skill_name: str
    total: int
    expert: list[SkillBrowseEntry]
    intermediate: list[SkillBrowseEntry]
    novice: list[SkillBrowseEntry]
