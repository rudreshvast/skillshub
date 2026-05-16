from datetime import date, datetime
from pydantic import BaseModel, EmailStr, field_validator


class EmployeeCreate(BaseModel):
    name: str
    employee_id: str
    email: EmailStr
    dob: date
    date_of_joining: date
    designation: str
    department: str
    location: str
    work_mode: str
    seniority: str = "mid"

    @field_validator("work_mode")
    @classmethod
    def validate_work_mode(cls, v: str) -> str:
        valid_modes = ["remote", "hybrid", "onsite"]
        if v.lower() not in valid_modes:
            raise ValueError(f"work_mode must be one of {valid_modes}")
        return v.lower()

    @field_validator("seniority")
    @classmethod
    def validate_seniority(cls, v: str) -> str:
        valid_levels = ["junior", "mid", "senior", "lead", "principal"]
        if v.lower() not in valid_levels:
            raise ValueError(f"seniority must be one of {valid_levels}")
        return v.lower()


class EmployeeResponse(BaseModel):
    id: int
    user_id: int
    employee_id: str
    name: str
    dob: date
    date_of_joining: date
    designation: str
    department: str
    location: str
    work_mode: str
    seniority: str
    profile_complete: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ImportError(BaseModel):
    row: int
    email: str
    reason: str


class BulkImportResponse(BaseModel):
    total: int
    success: int
    failed: int
    created: list[EmployeeResponse]
    errors: list[ImportError]


class SkillItem(BaseModel):
    id: int
    skill_name: str
    category: str
    proficiency: str
    years: int | None
    is_inferred: bool
    confidence_score: float | None

    model_config = {"from_attributes": True}


class ProjectItem(BaseModel):
    id: int
    name: str
    role: str | None
    duration: str | None
    domain: str | None
    technologies: list[str] | None

    model_config = {"from_attributes": True}


class CertificationItem(BaseModel):
    id: int
    name: str
    issuer: str | None
    issued_on: date | None

    model_config = {"from_attributes": True}


class EmployeeListItem(BaseModel):
    id: int
    name: str
    designation: str
    department: str
    location: str
    work_mode: str
    seniority: str
    years_of_experience: int | None
    profile_complete: bool
    domain_expertise: list[str] | None
    top_skills: list[str]
    current_allocation_percentage: int = 0

    model_config = {"from_attributes": True}


class EmployeeFullProfile(BaseModel):
    id: int
    name: str
    designation: str
    department: str
    location: str
    work_mode: str
    seniority: str
    years_of_experience: int | None
    summary: str | None
    domain_expertise: list[str] | None
    profile_complete: bool
    date_of_joining: date | None
    employee_id: str
    skills: list[SkillItem]
    projects: list[ProjectItem]
    certifications: list[CertificationItem]

    model_config = {"from_attributes": True}


class EmployeeListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    employees: list[EmployeeListItem]


class FilterOptions(BaseModel):
    departments: list[str]
    locations: list[str]
    work_modes: list[str]
    seniorities: list[str]
    skills: list[str]
